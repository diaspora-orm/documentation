import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Entity, Set } from '@diaspora/diaspora';

import { ApiDocService, SymbolKind, symbolLabel } from '../../services/api-doc/api-doc.service';
import { PairsPipe } from '../../pipes/pairs/pairs.pipe';

@Component({
	selector: 'app-api',
	templateUrl: './api.component.html',
	styleUrls: ['./api.component.scss'],
	providers: [PairsPipe],
})
export class ApiComponent implements OnInit, AfterViewInit, AfterContentInit {
	@ViewChild('breadcrumb') breadcrumb?: ElementRef<HTMLElement>;
	@ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

	private currentItems?: {[kind: string]: Symbol[]};
	private searchedItems?: Symbol[];

	private isInitialized = false;
	private breadcrumbData: Entity[] | string = [];

	public SymbolKind = SymbolKind;
	public SymbolLabel = _.values(symbolLabel);

	private _searchedString?: string;
	private get searchedString() {
		return this._searchedString;
	}
	private set seachedString(str: string) {
		if (str === '') {
			this._searchedString = undefined;
			this.searchedItems = undefined;
		} else {
			this._searchedString = str;
			this.ApiDoc.ApiDoc.findMany({name: str}).then(searchResults => {
				this.searchedItems = searchResults.toChainable(Set.ETransformationMode.ATTRIBUTES).value() as any[];
			});
		}
	}

	private _currentSymbolId = 0;
	private get currentSymbolId() {
		return this._currentSymbolId;
	}
	private set currentSymbolId(value: number) {
		this._currentSymbolId = value;
		this.setSearch(value);
	}

	private get isSearchMode() {
		return typeof this.searchedString !== 'undefined';
	}

	constructor(private route: ActivatedRoute, private ApiDoc: ApiDocService, private pairs: PairsPipe) {
	}

	private async onSearchBarChange(event: KeyboardEvent) {
		if (!event.target || !(event.target instanceof HTMLInputElement)) {
			return;
		}
		this.seachedString = event.target.value.trim();
	}

	private async setSearch(containerId: number | null) {
		console.log('setting search', containerId);
		const [items, breadcrumb] = await Promise.all([
			this.ApiDoc.ApiDoc.findMany({ancestor: containerId}),

			new Promise<any>(async (resolve, reject) => {
				const breadcrumbItems: Entity[] = [];

				while (containerId !== null) {
					const container = await this.ApiDoc.ApiDoc.find({identifier: containerId});
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
		this.currentItems = items.toChainable(Set.ETransformationMode.ATTRIBUTES)
		.groupBy('kind')
		.reduce((acc, symbols: any[]) => {
			const firstItem = _.first(symbols);
			if (firstItem) {
				const kindStr = SymbolKind[firstItem.kind];
				acc[kindStr] = symbols;
			}
			return acc;
		}, {} as {[kind: string]: Symbol[]}).value();
		this.breadcrumbData = breadcrumb;
	}

	ngOnInit() {
		// Make the HTTP request:
		this.ApiDoc.loadJsonFile('/assets/content/api/0-3-0.json')
		.then(() => {
			this.isInitialized = true;
			this.route
			.queryParams
			.subscribe((params: any) => {
				const symbolId = params.symbolId ? parseInt(params.symbolId, 10) : 0;
				this.currentSymbolId = symbolId;
				console.log('Reseting prompt');
				if (this.searchInput) {
					this.searchInput.nativeElement.value = '';
				}
				this.seachedString = '';
			});
		});
	}

	ngAfterViewInit() {
	}

	ngAfterContentInit() {
	}
}
