import { Injectable } from '@angular/core';

import { Diaspora, Model, Entities } from '@diaspora/diaspora';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';



// Raw TSDoc json file
interface Tag {
	tag: string;
	text: string;
}
interface Source {
	fileName: string;
	line: number;
	character: number;
}

export interface TypeReference{
	type: 'reference'
	name: string;
	id: number
}
export type ParameterTypeDefinition = {
	type: 'intrinsic'
	name: string;
} | {
	type: 'array';
	elementType: ParameterTypeDefinition;
} | {
	type: 'union';
	types: ParameterTypeDefinition[];
} | {
	type: 'typeParameter';
	name: string;
	constraint?: ParameterTypeDefinition;
} | TypeReference;

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
	signatures?: TypeDefinition[] | undefined;
	parameters?: TypeDefinition[] | undefined;
	typeParameter: TypeDefinition[] | undefined;
	extendedTypes: TypeReference[] | undefined;
	extendedBy: TypeReference[] | undefined;
	implementedTypes: TypeDefinition[] | undefined;
	type: ParameterTypeDefinition | undefined;
	typeArguments?: TypeReference[];
}




// Diaspora TSDoc entities
export enum SymbolKind {
	Module        = 0x0,
	Enum          = 0x4,
	Variable      = 0x20,
	Function      = 0x40,
	Class         = 0x80,
	Interface     = 0x100,
	Constructor   = 0x200,
	Method        = 0x800,
	CallSignature = 0x1000,
	Literal       = 0x200000,
	TypeAlias     = 0x400000,
}
export interface SymbolDef {
	exported: boolean;
	kind: SymbolKind;
	name: string;
	identifier: number;
	summary?: string;
	comment?: string;
	source?: {
		file: string;
		line: number;
		module: boolean;
	};
	ancestor?: number;
	hasChildren: boolean;
	type: ParameterTypeDefinition | undefined;
}

export const symbolClass = {
	[SymbolKind.Module]: 'tsd-kind-module',
	[SymbolKind.Enum]: 'tsd-kind-enum',
	[SymbolKind.Variable]: 'tsd-kind-variable',
	[SymbolKind.Function]: 'tsd-kind-function',
	[SymbolKind.Class]: 'tsd-kind-class',
	[SymbolKind.Interface]: 'tsd-kind-interface',
	[SymbolKind.Constructor]: 'tsd-kind-constructor',
	[SymbolKind.Method]: 'tsd-kind-method',
	[SymbolKind.CallSignature]: '',
	[SymbolKind.Literal]: 'tsd-kind-object-literal',
	[SymbolKind.TypeAlias]: 'tsd-kind-type-alias',
};

export const symbolLabel = {
	[SymbolKind.Module]: 'Module',
	[SymbolKind.Enum]: 'Enumeration',
	[SymbolKind.Variable]: 'Variable',
	[SymbolKind.Function]: 'Function',
	[SymbolKind.Class]: 'Class',
	[SymbolKind.Interface]: 'Interface',
	[SymbolKind.Constructor]: 'Constructor',
	[SymbolKind.Method]: 'Method',
	[SymbolKind.CallSignature]: 'Call signature',
	[SymbolKind.Literal]: 'Literal',
	[SymbolKind.TypeAlias]: 'Type alias',
};




// Utility regex
const LinkRegexp = /{@link\s+(\S+)(?:\s+(.+?))?}/;
const LinkRegexpG = new RegExp(LinkRegexp, 'g');


@Injectable({
	providedIn: 'root'
})
export class ApiDocService {
	private readonly _ApiDoc: Model;
	
	public get ApiDoc() {
		return this._ApiDoc;
	}
	
	constructor(private http: HttpClient) {
		(window as any).Diaspora = Diaspora;
		Diaspora.createNamedDataSource('memory', 'inMemory');
		this._ApiDoc = Diaspora.declareModel('ApiDoc', {
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
				signature: 'object',
				type:'object'
			},
		});
	}
	
	public async loadJsonFile(fileUrl: string){
		await this.ApiDoc.deleteMany({});
		
		// Make the HTTP request:
		const data = await this.http
		.get<TypeDefinition>(fileUrl)
		.toPromise();
		
		_.assign(window, {rawData: data, _});
		const items = ApiDocService.flattenTransformSymbols(data);
		const insertedSet = await this.ApiDoc.insertMany(items);
		console.log({rawJson: data, transformed: items, insertedSet: insertedSet});
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
		let summary = _.get(symbol, 'comment.shortText') || _.get(symbol, 'comment.text') as string | null;
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
		const type = symbol.type;
		return {
			exported: symbol.flags.isExported || false,
			kind: symbol.kind,
			name: symbol.name,
			identifier: symbol.id,
			summary: this.getSummary(symbol),
			source: this.getSource(symbol),
			ancestor: ancestorId,
			hasChildren: symbol.children && symbol.children.length > 0,
			type: type
		};
	}
	
	private static flattenTransformSymbols(symbol: TypeDefinition, ancestor?: TypeDefinition): SymbolDef[] {
		if (!symbol) {
			return [];
		}
		return _.chain(symbol.children)
		.concat(symbol.signatures || [])
		.concat(symbol.parameters || [])
		.reduce((acc, item) => {
			return acc.concat(this.flattenTransformSymbols(item, symbol));
		}, [this.transformSymbol(symbol, ancestor)] as SymbolDef[]).orderBy('identifier').value();
	}
}
