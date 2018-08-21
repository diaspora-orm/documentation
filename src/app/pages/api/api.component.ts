import { ApiDocRepositoryService, ITreeData } from './../../services/repository/api-doc-repository/api-doc-repository.service';
import { VersionManagerService } from './../../services/version-manager/version-manager.service';
import { SymbolKind } from './../../types/typedoc/typedoc';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterContentInit, NgZone } from '@angular/core';
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
	providers: [PairsPipe],
} )
export class ApiComponent implements OnInit, AfterViewInit, AfterContentInit {
	@ViewChild( 'breadcrumb' ) public breadcrumb?: ElementRef<HTMLElement>;
	@ViewChild( 'searchInput' ) public searchInput?: ElementRef<HTMLInputElement>;

	public currentDocPage?: {
		item?: ISymbolDef;
		children: {[kind: string]: ISymbolDef[]};
	} | null;// Undefined means no search, null means not found
	public searchedItems?: ISymbolDef[];

	public isInitialized = false;
	public breadcrumbPath: string[] = [];

	public navigation?: ITreeData;

	public SymbolKind = SymbolKind;
	public SymbolLabel = _.values( symbolLabel );

	private _searchedString?: string;
	public get searchedString() {
		return this._searchedString;
	}
	private set seachedString( str: string ) {
		if ( str === '' ) {
			this._searchedString = undefined;
			this.searchedItems = undefined;
		} else {
			this._searchedString = str;
			this.ApiDocRepository.ApiDoc.findMany( str.includes( '/' ) ? {canonicalPath:str} : {name: str} ).then( searchResults => {
				this.searchedItems = searchResults.toChainable( Set.ETransformationMode.ATTRIBUTES ).value() as any[];
			} );
		}
	}

	private currentSymbolId = 0;

	public get isSearchMode() {
		return typeof this.searchedString !== 'undefined';
	}

	public constructor(
		private route: ActivatedRoute,
		private ApiDocRepository: ApiDocRepositoryService,
		private ApiDoc: ApiDocService,
		private pairs: PairsPipe,
		private versionManager: VersionManagerService,
		private zone: NgZone
	) {}

	private async onSearchBarChange( event: KeyboardEvent ) {
		if ( !event.target || !( event.target instanceof HTMLInputElement ) ) {
			return;
		}
		this.seachedString = event.target.value.trim();
	}




	private groupChildren( set: ISymbolDef[] ){
		return _.chain( set )
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
		console.info( 'Setting search:', searchData );
		try{
			const currentDocPage = await this.ApiDocRepository.getSymbolAndChildren( searchData );
			this.breadcrumbPath = currentDocPage.currentSymbol.canonicalPath.split( '/' );
			const navigation = await this.ApiDocRepository.getTreeData( [currentDocPage.currentSymbol.canonicalPath] );
			this.zone.run( () => {
				this.currentDocPage = {
					item:currentDocPage.currentSymbol,
					children: this.groupChildren( currentDocPage.children ),
				};
				this.navigation = navigation;
			} );
		} catch ( err ) {
			console.error( err );
			this.currentDocPage = null;
		}
	}

	public ngOnInit() {
		console.log( 'Reseting prompt' );
		if ( this.searchInput ) {
			this.searchInput.nativeElement.value = '';
		}
		this.seachedString = '';

		// Initialize the data store. On the end of the promise, the data is inserted in the data store.
		this.ApiDoc.loadData()
		.then( () => {
			this.isInitialized = true;
			this.route.queryParams.subscribe( queryParams => {
				console.log( {queryParams} );

				if ( queryParams.symbolId && queryParams.symbolPath ){
					throw new Error();
				} else if ( queryParams.symbolId ){
					const symbolId = parseInt( queryParams.symbolId, 10 );
					this.setSearch( symbolId );
				} else if ( queryParams.symbolPath ){
					this.setSearch( queryParams.symbolPath );
				} else {
					this.setSearch( 0 );
				}
				console.log( 'Reseting prompt' );
				if ( this.searchInput ) {
					this.searchInput.nativeElement.value = '';
				}
				this.seachedString = '';
			} );
		} );
	}

	public ngAfterViewInit() {
	}

	public ngAfterContentInit() {
	}
}
