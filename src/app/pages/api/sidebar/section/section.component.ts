import { ApiDocService, ISymbolDef } from './../../../../services/api-doc/api-doc.service';
import { Component, OnInit, Input } from '@angular/core';
import { Set } from '@diaspora/diaspora/dist/types';
import { SymbolKind } from '../../../../types/typedoc/typedoc';

import * as _ from 'lodash';

@Component( {
	selector: 'app-section',
	templateUrl: './section.component.html',
	styleUrls: ['./section.component.scss'],
} )
export class SectionComponent implements OnInit {
	@Input()
	public symbolPath?: string;
	
	@Input()
	public current?: ISymbolDef;
	public children: ISymbolDef[] = [];
	
	public constructor( private apiDoc: ApiDocService ) {}
	
	public get kindClass(): string {
		return this.apiDoc.kindClass( this.current );
	}
	private static isDisplayable( symbol: ISymbolDef ){
		return symbol.kind === SymbolKind.Root ||
			symbol.kind === SymbolKind.Module ||
			symbol.kind === SymbolKind.Namespace ||
			symbol.kind === SymbolKind.Class;
	}

	public async queryData(){
		console.log( 'Section component initializing' );
		if ( !this.current ){
			const currentSymbol = await this.apiDoc.ApiDoc.find( {canonicalPath: this.symbolPath} );
			if ( !currentSymbol || !currentSymbol.attributes ){
				return;
			}
			this.current = currentSymbol.attributes;
		}
		if ( !SectionComponent.isDisplayable( this.current ) ) {
			return;
		}
		const symbolChildren = await this.apiDoc.ApiDoc.findMany( {ancestor: this.current.identifier} );
		this.children = symbolChildren.toChainable( Set.ETransformationMode.ATTRIBUTES )
			.filter( SectionComponent.isDisplayable )
			.sortBy( 'name' )
			.value();
		console.log( {
			path: this.current.canonicalPath,
			displayed: this.children.length,
			children: symbolChildren.length,
		} );
	}

	public ngOnInit() {
		if ( !this.apiDoc.hasModelInitialized ){
			this.apiDoc.modelInitialized.subscribe( () => {
				this.queryData();
			} );
		} else {
			this.queryData();
		}
	}
}
