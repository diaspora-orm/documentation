import { ApiDocService, ISymbolDef } from './../../../../services/api-doc/api-doc.service';
import { ParameterTypeDefinition } from './../../../../types/typedoc/typedoc';
import { Component, OnInit, Input } from '@angular/core';

import * as _ from 'lodash';

export interface ITypeError {
	type: 'error';
}
export interface ITypeSymbol {
	type: 'symbol';
	value: ISymbolDef;
	typeArguments?: IType[];
}

export interface ITypeOutSymbol {
	type: 'outSymbol';
	value: string;
	typeArguments?: IType[];
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
	selector: 'app-type',
	templateUrl: './type.component.html',
	styleUrls: ['./type.component.scss'],
} )
export class TypeComponent implements OnInit {
	@Input() public rawType?: ParameterTypeDefinition;
	
	@Input() public type?: IType;

	private static typesCache: {
		[key: string]: ISymbolDef | null;
	} = {};
	
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
				if ( parameter.id ){
					if ( !( parameter.id in TypeComponent.typesCache ) ){
						const typeItem = await this.ApiDoc.ApiDoc.find( {identifier: parameter.id} );
						TypeComponent.typesCache[parameter.id] = typeItem && typeItem.attributes;
					}
					const parameterType = TypeComponent.typesCache[parameter.id];
					return parameterType ? {
						type: 'symbol',
						value: parameterType,
						typeArguments: parameter.typeArguments,
					} as ITypeSymbol : {
						type: 'outSymbol',
						value: parameter.name,
						typeArguments: parameter.typeArguments,
					} as ITypeOutSymbol;
				} else if ( parameter.name ){
					return {
						type: 'outSymbol',
						value: parameter.name,
						typeArguments: parameter.typeArguments,
					} as ITypeOutSymbol;
				} else {
					return {
						type: 'error',
					};
				}

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
				//console.log( this.rawType );
				return {
					type: 'error',
				};
			}
		}
	}
	
	public async ngOnInit() {
		if ( !this.rawType ) {
			return;
		}
		this.type = this.type || await this.normalizeParameterType( this.rawType );
	}
}
