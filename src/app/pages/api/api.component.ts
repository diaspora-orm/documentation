import { HeadSizerService } from './../../services/head-sizer/head-sizer.service';
import { ApiDocRepositoryService, ITreeData, ISymbolAndChildren } from './../../services/repository/api-doc-repository/api-doc-repository.service';
import { VersionManagerService } from './../../services/version-manager/version-manager.service';
import { SymbolKind } from './../../types/typedoc/typedoc';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, AfterContentInit, NgZone, EventEmitter, Output, Input, HostBinding } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';
import { Entity, Set } from '@diaspora/diaspora';

import { ApiDocService, symbolLabel, ISymbolDef } from '../../services/api-doc/api-doc.service';
import { PairsPipe } from '../../pipes/pairs/pairs.pipe';
import { resolve } from 'url';
import { AHeaderSizedComponent } from '../../header-sized-component';


enum ESearchCriterionReady{
	NONE = 0,
	EXPORTED = 0b01,
	SYMBOLID = 0b10,
}

@Component( {
	selector: 'app-api',
	templateUrl: './api.component.html',
	styleUrls: ['./api.component.scss'],
	providers: [PairsPipe],
} )
export class ApiComponent extends AHeaderSizedComponent implements OnInit, AfterViewInit, AfterContentInit {
	@ViewChild( 'breadcrumb' ) public breadcrumb?: ElementRef<HTMLElement>;
	@ViewChild( 'searchInput' ) public searchInput?: ElementRef<HTMLInputElement>;
	
	public currentDocPage?: {
		item?: ISymbolDef;
		children: {[kind: string]: ISymbolDef[]};
	} | null;// Undefined means no search, null means not found
	public searchedItems?: ISymbolDef[];
	
	public hasInitialized = false;
	public isLoading = true;
	
	private searchCriterionSet = ESearchCriterionReady.NONE;
	
	public breadcrumbPath: string[] = [];
	
	// Content of the sidebar
	public navigation?: ITreeData;
	
	// Expose model-related enums
	public SymbolKind = SymbolKind;
	public SymbolLabel = _.values( symbolLabel );
	
	// Current body page status
	// This includes the symbol path/identifier (symbolId) and the search (searchedString)
	// The search promise is also stored here
	private currentSeachOperation?: Promise<ISymbolAndChildren | ITreeData>;

	private _symbolId: string | number = 0;
	private get symbolId() {
		return this._symbolId;
	}
	
	private set symbolId( symbolId: string | number ) {
		this._symbolId = symbolId;
		this.searchCriterionSet |= ESearchCriterionReady.SYMBOLID;
		console.log( 'Ready for SYMBOLID:', this.searchCriterionSet );
		this.doSearchFromCurrentSymbolId();
	}

	public get onlyExported() {
		return this.ApiDocRepository.onlyExported;
	}
	public set onlyExported( val: boolean ) {
		this.ApiDocRepository.onlyExported = val;
		this.searchCriterionSet |= ESearchCriterionReady.EXPORTED;
		console.log( 'Ready for EXPORTED:', this.searchCriterionSet );
		this.doSearchFromCurrentSymbolId();
	}

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
	
	private logoLink!: HTMLElement;
	
	@HostBinding( 'style.padding-left' )
	public docPadLeft = '0px';
	
	
	
	
	private async doSearchFromCurrentSymbolId(){
		if (
			this.currentSeachOperation ||
			this.searchCriterionSet !== ( ESearchCriterionReady.SYMBOLID | ESearchCriterionReady.EXPORTED )
		){
			return;
		}
		this.currentSeachOperation = new Promise( async ( resolve, reject ) => {
			try{
				console.log( 'Triggering search:', this.symbolId );
				this.isLoading = true;
				await new Promise( resolve => setTimeout( resolve, 0 ) );
				
				const [currentDocPage, navigation] = await Promise.all( [
					this.ApiDocRepository.getSymbolAndChildren( this.symbolId ),
					this.ApiDocRepository.getTreeData( [this.symbolId] ),
				] );
				if (
					typeof this.symbolId === 'number' ?
					this.symbolId !== currentDocPage.currentSymbol.identifier :
					this.symbolId !== currentDocPage.currentSymbol.canonicalPath
				){
					console.error( 'Outdated search' );
					return;
				}
				this.breadcrumbPath = currentDocPage.currentSymbol.canonicalPath.split( '/' );
				this.zone.run( () => {
					this.hasInitialized = true;
					this.isLoading = false;
					this.currentSeachOperation = undefined;
					this.currentDocPage = {
						item: currentDocPage.currentSymbol,
						children: this.groupChildren( currentDocPage.children ),
					};
					this.navigation = navigation;
				} );
			} catch ( err ) {
				console.error( err );
				this.currentDocPage = null;
			}
		} );
		return this.currentSeachOperation;
	}
	
	
	private currentSymbolId = 0;
	
	public get isSearchMode() {
		return typeof this.searchedString !== 'undefined';
	}
	
	public constructor(
		private route: ActivatedRoute,
		public ApiDocRepository: ApiDocRepositoryService,
		private ApiDoc: ApiDocService,
		private pairs: PairsPipe,
		private versionManager: VersionManagerService,
		private zone: NgZone,
		headSizer: HeadSizerService
	) {
		super( headSizer );
	}
	
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
	
	public ngOnInit() {
		// Initialize the data store. On the end of the promise, the data is inserted in the data store.
		this.ApiDoc.loadData()
		.then( () => {
			this.route.queryParams.subscribe( queryParams => {
				
				if ( queryParams.symbolId && queryParams.symbolPath ){
					throw new Error();
				} else if ( queryParams.symbolId ){
					this.symbolId = parseInt( queryParams.symbolId, 10 );
				} else if ( queryParams.symbolPath ){
					this.symbolId = queryParams.symbolPath;
				} else {
					this.symbolId = 0;
				}
				console.log( 'Reseting prompt' );
				this.seachedString = '';
			} );
		} );
	}
	
	public ngAfterViewInit() {
	}
	
	public ngAfterContentInit() {
	}
}
