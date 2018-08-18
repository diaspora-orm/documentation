import { VersionManagerService } from './../../../../services/version-manager/version-manager.service';
import { Component, OnInit } from '@angular/core';

import { Set } from '@diaspora/diaspora';

import { ApiDocService, ISymbolDef } from '../../../../services/api-doc/api-doc.service';
import { SymbolComponent } from '../symbol.component';

@Component( {
	selector: 'app-function-symbol',
	templateUrl: './function-symbol.component.html',
	styleUrls: [
		'./function-symbol.component.scss',
		'../symbol.component.scss',
	],
} )
export class FunctionSymbolComponent extends SymbolComponent implements OnInit {
	public constructor( ApiDoc: ApiDocService, VersionService: VersionManagerService ) {
		super( ApiDoc, VersionService );
	}

	public signatures: ISymbolDef[] = [];

	public ngOnInit() {
		if ( !this.symbol ) {
			return;
		}
		this.ApiDoc.ApiDoc.findMany( {ancestor: this.symbol.identifier} ).then( signatures => {
			this.signatures = signatures.toChainable( Set.ETransformationMode.ATTRIBUTES ).compact().value() as ISymbolDef[];
		} );
	}
}
