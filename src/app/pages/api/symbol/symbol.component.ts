import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ApiDocService, symbolClass, ISymbolDef, symbolLabel } from '../../../services/api-doc/api-doc.service';

import * as _ from 'lodash';
import { VersionManagerService } from '../../../services/version-manager/version-manager.service';
import { SymbolKind } from '../../../types/typedoc/typedoc';


@Component( {
	selector: 'app-symbol',
	templateUrl: './symbol.component.html',
	styleUrls: ['./symbol.component.scss'],
	providers: [VersionManagerService],
} )
export class SymbolComponent implements OnInit {
	@Input() public symbol!: ISymbolDef;
	@Input() public currentDef!: boolean;
	
	@HostBinding( 'class' )
	public get hostClasses(): string {
		return [
			this.kindClass,
			this.currentDef ? 'current' : undefined,
		].join( ' ' );
	}
	public get kindClass(): string {
		return this.ApiDoc.kindClass( this.symbol );
	}
	public get typeName() {
		if ( !this.symbol ) {
			return '';
		}
		return ( symbolLabel as any )[this.symbol.kind] || this.symbol.kind;
	}
	
	public get source() {
		if ( !this.symbol || !this.symbol.source ) {
			return '';
		}
		if ( this.symbol.source.module ) {
			return this.symbol.source.file;
		} else {
			const baseUrl = `https://github.com/diaspora-orm/diaspora/blob/v${this.VersionService.version}/src/`;
			const fullUrl = `${baseUrl}${this.symbol.source.file}#L${this.symbol.source.line}`;
			return `<a href="${fullUrl}" target="_blank">${this.symbol.source.file} line ${this.symbol.source.line}</a>`;
		}
	}
	public get isTyped(){
		return this.symbol && (
			this.symbol.kind !== SymbolKind.Root &&
			this.symbol.kind !== SymbolKind.Module &&
			this.symbol.kind !== SymbolKind.Namespace &&
			this.symbol.kind !== SymbolKind.Enum
		);
	}
	
	public constructor( protected ApiDoc: ApiDocService, protected VersionService: VersionManagerService ) { }
	
	public ngOnInit() {
	}
	
}
