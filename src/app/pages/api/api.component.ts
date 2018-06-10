import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';
import { SymbolKind, SymbolDef } from './symbol/symbol.component';
import { Diaspora, Model, Entities } from '@diaspora/diaspora';
import { ActivatedRoute } from '@angular/router';

interface Tag {
	tag: string;
	text: string;
}
interface Source {
	fileName: string;
	line: number;
	character: number;
}
interface TypeReference {
	type: string;
	name: string;
	id?: number;
}
interface GenericTypeDefinition extends TypeDefinition {
	type: TypeReference;
	typeArguments?: TypeReference[];
}

interface TypeDefinition {
	flags: {
		isExported?: boolean,
	};
	kind: SymbolKind;
	kindString: string;
	name: string;
	id: number;
	children: TypeDefinition[];
	comment?: {
		shortText?: string,
		tags?: Tag[]
	};
	sources: Source[];
	typeParameter: GenericTypeDefinition[];
	extendedTypes: TypeReference[];
	extendedBy: TypeReference[];
	implementedTypes: TypeDefinition[];
}

const LinkRegexp = /{@link\s+(\S+)(?:\s+(.+?))?}/;
const LinkRegexpG = new RegExp(LinkRegexp, 'g');


@Component({
	selector: 'app-api',
	templateUrl: './api.component.html',
	styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit {
	@ViewChild('breadcrumb') breadcrumb?: ElementRef<HTMLElement>;
	
	private ApiDoc: Model;
	private currentItems?: Entities.Set;
	private isInitialized = false;
	private breadcrumbData: any[] = [];
	
	private get display() {
		if (this.currentItems) {
			return _.map(this.currentItems.entities, 'attributes');
		} else {
			return [];
		}
	}
	
	constructor(private http: HttpClient, private route: ActivatedRoute) {
		(window as any).Diaspora = Diaspora;
		Diaspora.createNamedDataSource('memory', 'inMemory');
		this.ApiDoc = Diaspora.declareModel('ApiDoc', {
			sources: 'memory',
			attributes: {
				exported: 'boolean',
				kind: 'integer',
				name: 'string',
				identifier: 'integer',
				summary: 'string',
				source: {
					type: 'object',
					/*
					attributes: {
						file: 'string',
						line: 'number',
					},
					*/
				},
				ancestor: 'number',
				hasChildren: 'boolean',
			},
		});
		
		// Make the HTTP request:
		this.http
		.get<TypeDefinition>('/assets/content/api/0-3-0.json')
		.toPromise()
		.then(async (data) => {
			const items = ApiComponent.flattenTransformSymbols(data);
			const insertedSet = await this.ApiDoc.insertMany(items);
			console.log({rawJson: data, transformed: items, insertedSet: insertedSet});
			this.isInitialized = true;
			this.route
			.queryParams
			.subscribe((params: any) => {
				const symbolId = params.symbolId ? parseInt(params.symbolId, 10) : 0;
				console.log({symbolId});
				// this.setSearch(0);
				this.setSearch(symbolId);
			});
		});
	}
	
	private static getSource(symbol: TypeDefinition) {
		const source = _.get(symbol, 'sources[0]') as Source | undefined;
		if (!source) {
			return;
		}
		
		const moduleMatcher = /^.+\/node_modules\/([^\/]+).*$/;
		const isModule = source.fileName.match(moduleMatcher) ? true : false;
		const sourceFile = isModule ? source.fileName.replace(moduleMatcher, '$1') : source.fileName;
		return {
			file: sourceFile,
			line: source.line,
			module: isModule,
		};
	}
	
	private static getSummary(symbol: TypeDefinition) {
		let summary = _.get(symbol, 'comment.shortText') as string | null;
		if (!summary) {
			return;
		}
		const matches = summary.match(LinkRegexpG);
		if (!matches) {
			return summary;
		}
		_.forEach(matches, match => {
			const subMatch = match.match(LinkRegexp);
			if (subMatch) {
				const linkedSymbol = subMatch[1];
				const linkText = subMatch[2] || linkedSymbol;
				summary = (summary as string).replace(match, `[${linkText}](${linkedSymbol})`);
			}
		});
		return summary;
	}
	
	private static transformSymbol(symbol: TypeDefinition, ancestor?: TypeDefinition): SymbolDef {
		const ancestorId = _.get(ancestor, 'id');
		return {
			exported: symbol.flags.isExported || false,
			kind: symbol.kind,
			name: symbol.name,
			identifier: symbol.id,
			summary: this.getSummary(symbol),
			source: this.getSource(symbol),
			ancestor: ancestorId,
			hasChildren: symbol.children && symbol.children.length > 0
		};
	}
	
	private static flattenTransformSymbols(symbol: TypeDefinition, ancestor?: TypeDefinition): SymbolDef[] {
		return _.chain(symbol.children).reduce((acc, item) => {
			return acc.concat(this.flattenTransformSymbols(item, symbol));
		}, [this.transformSymbol(symbol, ancestor)] as SymbolDef[]).orderBy('identifier').value();
	}
	
	private async setSearch(containerId: number | null) {
		const [items, breadcrumb] = await Promise.all([
			this.ApiDoc.findMany({ancestor: containerId}),
			new Promise<any>(async (resolve, reject) => {
				const breadcrumbItems: Entities.Entity[] = [];
				
				while (containerId !== null) {
					const container = await this.ApiDoc.find({identifier: containerId});
					if (container && container.attributes) {
						breadcrumbItems.unshift(container);
						containerId = container.attributes.ancestor;
					} else {
						containerId = null;
					}
				}
				return resolve(breadcrumbItems);
			}),
		]);
		// console.log({items, breadcrumb})
		this.currentItems = items;
		this.breadcrumbData = breadcrumb;
	}
	
	ngOnInit() {
	}
}
