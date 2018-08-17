import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';

import { ISymbolDef, ApiDocService, ParameterTypeDefinition } from '../../../../../../services/api-doc/api-doc.service';

export interface ITypeError {
	type: 'error';
}
export interface ITypeSymbol {
	type: 'symbol';
	value: ISymbolDef;
}
export interface ITypeOutSymbol {
	type: 'outSymbol';
	value: string;
}
export interface ITypeIntrinsic {
	type: 'intrinsic';
	value: string;
}
export interface ITypeTParam {
	type: 'typeParameter';
	value: string;
}

export interface ITypeArray {
	type: 'array';
	value: IType;
}
export interface ITypeUnion {
	type: 'union';
	value: IType[];
}
export type IType = ITypeError | ITypeSymbol | ITypeOutSymbol | ITypeIntrinsic | ITypeTParam | ITypeArray | ITypeUnion;



@Component( {
	selector: 'app-parameter',
	templateUrl: './parameter.component.html',
	styleUrls: ['./parameter.component.scss'],
} )
export class ParameterComponent implements OnInit {
	@Input() protected rawParameter: ParameterTypeDefinition | undefined;

	@Input() public parameter: IType | undefined;

	public constructor( protected ApiDoc: ApiDocService ) { }

	private async normalizeParameterType( parameter: ParameterTypeDefinition ): Promise<IType> {
		switch ( parameter.type ) {
			case 'intrinsic': {
				return {
					type: 'intrinsic',
					value: parameter.name,
				};
			}

			case 'reference': {
				const parameterType = await this.ApiDoc.ApiDoc.find( {identifier: parameter.id} );
				return parameterType ? {
					type: 'symbol',
					value: parameterType.attributes as ISymbolDef,
				} : {
					type: 'outSymbol',
					value: parameter.name,
				};
			}

			case 'array': {
				const resolvedType = await this.normalizeParameterType( parameter.elementType );
				return resolvedType ? {
					type: 'array',
					value: resolvedType,
				} : {
					type: 'error',
				};
			}

			case 'union': {
				const resolvedTypes = await Promise.all( _.map( parameter.types, type => this.normalizeParameterType( type ) ) );
				return {
					type: 'union',
					value: resolvedTypes,
				};
			}

			case 'typeParameter': {
				return {
					type: 'typeParameter',
					value: parameter.name,
				};
			}

			default: {
				console.log( this.rawParameter );
				return {
					type: 'error',
				};
			}
		}
	}

	public async ngOnInit() {
		if ( !this.rawParameter ) {
			return;
		}
		this.parameter = await this.normalizeParameterType( this.rawParameter );
	}
}
