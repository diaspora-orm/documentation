import { VersionManagerService } from './../../../../../services/version-manager/version-manager.service';
import { Component, OnInit, Input } from '@angular/core';

import { ApiDocService, ISymbolDef } from '../../../../../services/api-doc/api-doc.service';
import { Set } from '@diaspora/diaspora';

@Component( {
	selector: 'app-call-signature',
	templateUrl: './call-signature.component.html',
	styleUrls: ['./call-signature.component.scss'],
} )
export class CallSignatureComponent implements OnInit {
	@Input() public signature?: ISymbolDef;

	public parameters: ISymbolDef[] = [];

	public constructor( private apiDoc: ApiDocService, private versionService: VersionManagerService ) { }

	public async ngOnInit() {
		if ( !this.signature ) {
			return;
		}
		this.parameters = ( await this.apiDoc.ApiDoc.findMany( {ancestor: this.signature.identifier} ) )
		.toChainable( Set.ETransformationMode.ATTRIBUTES )
		.value() as ISymbolDef[];
	}
}
