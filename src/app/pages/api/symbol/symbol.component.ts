import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ApiDocService, symbolClass, SymbolDef, symbolLabel } from '../../../services/api-doc/api-doc.service';

import * as _ from 'lodash';



@Component({
	selector: 'app-symbol',
	templateUrl: './symbol.component.html',
	styleUrls: ['./symbol.component.scss'],
})
export class SymbolComponent implements OnInit {
	@Input() protected symbol: SymbolDef | undefined;

	@HostBinding('class')
	get hostClasses(): string {
		return [
			this.kindClass
		].join(' ');
	}
	
	private get kindClass() {
		if (!this.symbol) {
			return '';
		}
		return symbolClass[this.symbol.kind] || this.symbol.kind;
	}
	private get typeName() {
		if (!this.symbol) {
			return '';
		}
		return symbolLabel[this.symbol.kind] || this.symbol.kind;
	}

	private get source() {
		if (!this.symbol || !this.symbol.source) {
			return '';
		}
		if (this.symbol.source.module) {
			return this.symbol.source.file;
		} else {
			const baseUrl = 'https://github.com/diaspora-orm/diaspora/blob/master/src/';
			const fullUrl = `${baseUrl}${this.symbol.source.file}#L${this.symbol.source.line}`;
			return `<a href="${fullUrl}" target="_blank">${this.symbol.source.file} line ${this.symbol.source.line}</a>`;
		}
	}

	constructor(protected ApiDoc: ApiDocService) { }

	ngOnInit() {
	}

}
