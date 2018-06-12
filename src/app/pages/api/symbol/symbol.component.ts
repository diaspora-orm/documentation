import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ApiDocService } from '../../../services/api-doc/api-doc.service';

export enum SymbolKind {
	Module        = 0x0,
	Enum          = 0x4,
	Variable      = 0x20,
	Function      = 0x40,
	Class         = 0x80,
	Interface     = 0x100,
	Constructor   = 0x200,
	Method        = 0x800,
	CallSignature = 0x1000,
	Literal       = 0x200000,
	TypeAlias     = 0x400000,
}
export interface SymbolDef {
	exported: boolean;
	kind: SymbolKind;
	name: string;
	identifier: number;
	summary?: string;
	comment?: string;
	source?: {
		file: string;
		line: number;
		module: boolean;
	};
	ancestor?: number;
	hasChildren: boolean;
}



const symbolClass = {
	[SymbolKind.Module]: 'tsd-kind-module',
	[SymbolKind.Enum]: 'tsd-kind-enum',
	[SymbolKind.Variable]: 'tsd-kind-variable',
	[SymbolKind.Function]: 'tsd-kind-function',
	[SymbolKind.Class]: 'tsd-kind-class',
	[SymbolKind.Interface]: 'tsd-kind-interface',
	[SymbolKind.Constructor]: 'tsd-kind-constructor',
	[SymbolKind.Method]: 'tsd-kind-method',
	[SymbolKind.CallSignature]: '',
	[SymbolKind.Literal]: 'tsd-kind-object-literal',
	[SymbolKind.TypeAlias]: 'tsd-kind-type-alias',
};

export const symbolLabel = {
	[SymbolKind.Module]: 'Module',
	[SymbolKind.Enum]: 'Enumeration',
	[SymbolKind.Variable]: 'Variable',
	[SymbolKind.Function]: 'Function',
	[SymbolKind.Class]: 'Class',
	[SymbolKind.Interface]: 'Interface',
	[SymbolKind.Constructor]: 'Constructor',
	[SymbolKind.Method]: 'Method',
	[SymbolKind.CallSignature]: 'Call signature',
	[SymbolKind.Literal]: 'Literal',
	[SymbolKind.TypeAlias]: 'Type alias',
};





@Component({
	selector: 'app-symbol',
	templateUrl: './symbol.component.html',
	styleUrls: ['./symbol.component.scss']
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
