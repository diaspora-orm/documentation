import { ITreeData } from './../../../../services/repository/api-doc-repository/api-doc-repository.service';
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
	@Input() public children?: ITreeData[];	
	@Input() public item?: ISymbolDef;
	@Input() public parent?: ISymbolDef;

	public get linkTarget(){
		if ( !this.item ){
			return;
		}
		const kind = this.item.kind;

		const isCategory = kind === SymbolKind.Root ||
			kind === SymbolKind.Module ||
			kind === SymbolKind.Namespace ||
			kind === SymbolKind.Class ||
			kind === SymbolKind.Interface;
		if ( isCategory ){
			return {symbolPath: this.item.canonicalPath};
		} else if ( this.parent ){
			return {
				symbolPath: this.parent.canonicalPath,
				see: this.item.name,
			};
		} else {
			throw new Error( 'No displayable item' );
		}
	}
	
	public constructor( private apiDoc: ApiDocService ) {}
	
	public get kindClass(): string {
		return this.apiDoc.kindClass( this.item );
	}
	private static isDisplayable( symbol: ISymbolDef ){
		return symbol.kind === SymbolKind.Root ||
			symbol.kind === SymbolKind.Module ||
			symbol.kind === SymbolKind.Namespace ||
			symbol.kind === SymbolKind.Class;
	}

	public ngOnInit() {
	}
}
