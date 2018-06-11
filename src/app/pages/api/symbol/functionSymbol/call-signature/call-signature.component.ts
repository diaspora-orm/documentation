import { Component, OnInit, Input } from '@angular/core';
import { ApiDocService } from '../../../../../services/api-doc/api-doc.service';
import { SymbolDef } from '../../symbol.component';

@Component({
	selector: 'app-call-signature',
	templateUrl: './call-signature.component.html',
	styleUrls: ['./call-signature.component.scss']
})
export class CallSignatureComponent implements OnInit {
	@Input() protected signature: SymbolDef | undefined;

	private parameters: SymbolDef[] = [];

	constructor(protected ApiDoc: ApiDocService) { }

	ngOnInit() {
		if (!this.signature) {
			return;
		}
		this.ApiDoc.ApiDoc.findMany({ancestor: this.signature.identifier}).then(parameters => {
			console.log({signature: this.signature, parameters});
			this.parameters = parameters.toChainable.map('attributes').compact().value() as SymbolDef[];
		});
	}
}
