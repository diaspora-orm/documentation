import { VersionManagerService } from './../../services/version-manager/version-manager.service';
import { SymbolKind } from './../../types/typedoc/typedoc';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Entity, Set } from '@diaspora/diaspora';

import { ApiDocService, symbolLabel, ISymbolDef } from '../../services/api-doc/api-doc.service';
import { PairsPipe } from '../../pipes/pairs/pairs.pipe';

@Component( {
	selector: 'app-api',
	templateUrl: './api.component.html',
	styleUrls: ['./api.component.scss'],
	providers: [PairsPipe, VersionManagerService],
} )
export class ApiComponent implements OnInit, AfterViewInit, AfterContentInit {
	@ViewChild( 'breadcrumb' ) public breadcrumb?: ElementRef<HTMLElement>;
	@ViewChild( 'searchInput' ) public searchInput?: ElementRef<HTMLInputElement>;

	public currentDocPage?: {
		item?: ISymbolDef;
		children: {[kind: string]: ISymbolDef[]};
	} | null;// Undefined means no search, null means not found
	private searchedItems?: ISymbolDef[];

	public isInitialized = false;
	public breadcrumbPath: string[] = [];

	public SymbolKind = SymbolKind;
	public SymbolLabel = _.values( symbolLabel );

	private _searchedString?: string;
	private get searchedString() {
		return this._searchedString;
	}
	private set seachedString( str: string ) {
		if ( str === '' ) {
			this._searchedString = undefined;
			this.searchedItems = undefined;
		} else {
			this._searchedString = str;
			this.ApiDoc.ApiDoc.findMany( str.includes( '/' ) ? {canonicalPath:str} : {name: str} ).then( searchResults => {
				this.searchedItems = searchResults.toChainable( Set.ETransformationMode.ATTRIBUTES ).value() as any[];
			} );
		}
	}

	private currentSymbolId = 0;

	private get isSearchMode() {
		return typeof this.searchedString !== 'undefined';
	}

	public constructor(
		private route: ActivatedRoute,
		private ApiDoc: ApiDocService,
		private pairs: PairsPipe,
		private versionManager: VersionManagerService
	) {}

	private async onSearchBarChange( event: KeyboardEvent ) {
		if ( !event.target || !( event.target instanceof HTMLInputElement ) ) {
			return;
		}
		this.seachedString = event.target.value.trim();
	}




	private async getChildren( id: number ){
		this.currentSymbolId = id;
		const subItems = await this.ApiDoc.ApiDoc.findMany( {ancestor: id, exported: true} );
		return subItems.toChainable( Set.ETransformationMode.ATTRIBUTES )
		.groupBy( 'kind' )
		.reduce(
			( acc, symbols: any[] ) => {
				const firstItem = _.first( symbols );
				if ( firstItem ) {
					const kindStr = SymbolKind[firstItem.kind];
					acc[kindStr] = symbols;
				}
				return acc;
			},
			{} as {[kind: string]: ISymbolDef[]}
		).value();
	}
	private async setSearch( searchData: string | number ) {
		console.log( 'setting search', searchData );

		const idSearchCriterionKey = _.isString( searchData ) ? 'canonicalPath' : 'identifier';
		const idSearchCriterion = {[idSearchCriterionKey]: searchData};
		const thisItem = await this.ApiDoc.ApiDoc.find( idSearchCriterion );
		if ( thisItem && thisItem.attributes ){
			this.breadcrumbPath = thisItem.attributes.canonicalPath.split( '/' );
			this.currentDocPage = {item:thisItem.attributes, children: await this.getChildren( thisItem.attributes.identifier )};
		} else {
			this.currentDocPage = null;
		}
	}

	public ngOnInit() {
		console.log( 'Reseting prompt' );
		if ( this.searchInput ) {
			this.searchInput.nativeElement.value = '';
		}
		this.seachedString = '';

		// Make the HTTP request:
		this.ApiDoc.loadJsonFile( `/assets/content/api/${this.versionManager.version}.json` )
		.then( () => {
			this.isInitialized = true;
			if ( window.location.pathname === '/api' ){
				this.route.queryParams.subscribe( queryParams => {
					console.log( {queryParams} );
					const symbolId = queryParams.symbolId ? parseInt( queryParams.symbolId, 10 ) : 0;
					this.setSearch( symbolId );
					console.log( 'Reseting prompt' );
					if ( this.searchInput ) {
						this.searchInput.nativeElement.value = '';
					}
					this.seachedString = '';
				} );
			} else {
				this.setSearch( window.location.pathname.replace( /^.*?\/api\//, '' ) );
			}
			//this.route.subscribe(params => console.log({params}));
			/*this.route.params.subscribe(data => {
				console.log(data);
			});*/
		} );
	}

	public ngAfterViewInit() {
	}

	public ngAfterContentInit() {
	}
}
