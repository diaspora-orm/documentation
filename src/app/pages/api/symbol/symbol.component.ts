import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ApiDocService, symbolClass, ISymbolDef, symbolLabel } from '../../../services/api-doc/api-doc.service';

import * as _ from 'lodash';
import { VersionManagerService } from '../../../services/version-manager/version-manager.service';


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
		if ( !this.symbol ) {
			return '';
		}
		return _.compact( [
			( ( symbolClass as any )[this.symbol.kind] || this.symbol.kind ) as string,
			this.symbol.visibility !== 'public' ? `tsd-is-${this.symbol.visibility}` : undefined,
			_.isNil( this.symbol.inheritedFrom ) ? undefined : 'tsd-is-inherited',
			this.symbol.isClassMember ? 'tsd-parent-kind-class' : undefined,
		] ).join( ' ' );
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

	public constructor( protected ApiDoc: ApiDocService, protected VersionService: VersionManagerService ) { }

	public ngOnInit() {
	}

}
