import { Component, OnInit, Input } from '@angular/core';

import { ApiDocService, SymbolDef } from '../../../../../services/api-doc/api-doc.service';

@Component({
	selector: 'app-call-signature',
	templateUrl: './call-signature.component.html',
	styleUrls: ['./call-signature.component.scss']
})
export class CallSignatureComponent implements OnInit {
	@Input() protected signature: SymbolDef | undefined;

	private parameters: SymbolDef[] = [];

	constructor(protected ApiDoc: ApiDocService) { }

	async ngOnInit() {
		if (!this.signature) {
			return;
		}
		console.log({signature: this.signature});
		this.parameters = (await this.ApiDoc.ApiDoc.findMany({ancestor: this.signature.identifier}))
		.toChainable
		.map('attributes')
		.compact()
		.value() as SymbolDef[];
	}
}
