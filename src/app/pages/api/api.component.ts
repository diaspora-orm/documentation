import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Entities } from '@diaspora/diaspora';

import { ApiDocService, SymbolKind, symbolLabel } from '../../services/api-doc/api-doc.service';


@Component({
	selector: 'app-api',
	templateUrl: './api.component.html',
	styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit {
	@ViewChild('breadcrumb') breadcrumb?: ElementRef<HTMLElement>;

	private currentItems?: Entities.Set;
	private isInitialized = false;
	private breadcrumbData: Entities.Entity[] | string = [];

	public SymbolKind = SymbolKind;
	public SymbolLabel = _.values(symbolLabel);

	private _currentSymbolId = 0;
	private get currentSymbolId(){
		return this._currentSymbolId;
	}
	private set currentSymbolId(value: number){
		this._currentSymbolId = value;
		this.setSearch(value);
	}

	private get display() {
		if (this.currentItems) {
			return _.map(this.currentItems.entities, 'attributes');
		} else {
			return [];
		}
	}

	private get isSearchMode() {
		return typeof this.breadcrumbData === 'string';
	}

	constructor(private route: ActivatedRoute, private ApiDoc: ApiDocService) {
		// Make the HTTP request:
		this.ApiDoc.loadJsonFile('/assets/content/api/0-3-0.json')
		.then(() => {
			this.isInitialized = true;
			this.route
			.queryParams
			.subscribe((params: any) => {
				const symbolId = params.symbolId ? parseInt(params.symbolId, 10) : 0;
				console.log({symbolId});
				// this.setSearch(0);
				this.currentSymbolId = symbolId;
			});
		});
	}
	
	private async onSearchBarChange(event: KeyboardEvent) {
		if (!event.target || !(event.target instanceof HTMLInputElement)) {
			return;
		}
		const input = event.target.value.trim();
		if (input === '') {
			this.currentSymbolId = this.currentSymbolId;
		} else {
			this.breadcrumbData = `Searching for "${input}"`;
			this.currentItems = await this.ApiDoc.ApiDoc.findMany({name: input});
		}
	}

	private async setSearch(containerId: number | null) {
		const [items, breadcrumb] = await Promise.all([
			this.ApiDoc.ApiDoc.findMany({ancestor: containerId}),
			new Promise<any>(async (resolve, reject) => {
				const breadcrumbItems: Entities.Entity[] = [];

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
		// console.log({items, breadcrumb})
		this.currentItems = items;
		this.breadcrumbData = breadcrumb;
	}

	ngOnInit() {
	}
}
