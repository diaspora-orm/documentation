import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';

import { SymbolDef, ApiDocService, ParameterTypeDefinition } from '../../../../../../services/api-doc/api-doc.service';

interface ITypeError {
	type: 'error';
}
interface ITypeSymbol {
	type: 'symbol';
	value: SymbolDef;
}
interface ITypeOutSymbol {
	type: 'outSymbol';
	value: string;
}
interface ITypeIntrinsic {
	type: 'intrinsic';
	value: string;
}
interface ITypeTParam {
	type: 'typeParameter';
	value: string;
}

interface ITypeArray {
	type: 'array';
	value: IType;
}
interface ITypeUnion {
	type: 'union';
	value: IType[];
}
type IType = ITypeError | ITypeSymbol | ITypeOutSymbol | ITypeIntrinsic | ITypeTParam | ITypeArray | ITypeUnion;



@Component({
	selector: 'app-parameter',
	templateUrl: './parameter.component.html',
	styleUrls: ['./parameter.component.scss']
})
export class ParameterComponent implements OnInit {
	@Input() protected rawParameter: ParameterTypeDefinition | undefined;

	@Input() private parameter: IType | undefined;

	constructor(protected ApiDoc: ApiDocService) { }

	private async normalizeParameterType(parameter: ParameterTypeDefinition): Promise<IType> {
		switch (parameter.type) {
			case 'intrinsic': {
				return {
					type: 'intrinsic',
					value: parameter.name
				};
			}

			case 'reference': {
				const parameterType = await this.ApiDoc.ApiDoc.find({identifier: parameter.id});
				return parameterType ? {
					type: 'symbol',
					value: parameterType.attributes as SymbolDef
				} : {
					type: 'outSymbol',
					value: parameter.name
				};
			}

			case 'array': {
				const resolvedType = await this.normalizeParameterType(parameter.elementType);
				return resolvedType ? {
					type: 'array',
					value: resolvedType
				} : {
					type: 'error'
				};
			}

			case 'union': {
				const resolvedTypes = await Promise.all(_.map(parameter.types, type => this.normalizeParameterType(type)));
				return {
					type: 'union',
					value: resolvedTypes
				};
			}

			case 'typeParameter': {
				return {
					type: 'typeParameter',
					value: parameter.name,
				};
			}

			default: {
				console.log(this.rawParameter);
				return {
					type: 'error'
				};
			}
		}
	}

	async ngOnInit() {
		if (!this.rawParameter) {
			return;
		}
		this.parameter = await this.normalizeParameterType(this.rawParameter);
	}
}
