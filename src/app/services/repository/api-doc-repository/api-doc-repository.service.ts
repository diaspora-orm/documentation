import { ApiDocService, ISymbolDef } from './../../api-doc/api-doc.service';
import { Injectable } from '@angular/core';
import { Model, Entity, Set } from '@diaspora/diaspora';

export interface ISymbolAndChildren{
	currentSymbol: ISymbolDef;
	children: ISymbolDef[];
}
@Injectable( {
	providedIn: 'root',
} )
export class ApiDocRepositoryService {
	public readonly ApiDoc: Model<ISymbolDef>;
	
	public constructor( private apiDoc: ApiDocService ) {
		this.ApiDoc = apiDoc.ApiDoc;
	}
	
	public async getTreeData( canonicalPath: string ){
		const currentSymbol = await this.ApiDoc.find( {canonicalPath} );
		if ( !currentSymbol ){
			throw new Error( 'Current symbol not found' );
		}
		if ( !currentSymbol.attributes ){
			throw new Error( 'Symbol attributes should be an object' );
		}
		const children = await this.ApiDoc.findMany( {ancestor: currentSymbol.attributes.identifier, exported: true} );
	}
	
	public async getCurrentSymbolAndChildren( canonicalPath: string ): Promise<ISymbolAndChildren> {
		const currentSymbol = await this.ApiDoc.find( {canonicalPath} );
		if ( !currentSymbol ){
			throw new Error( 'Current symbol not found' );
		}
		if ( !currentSymbol.attributes ){
			throw new Error( 'Symbol attributes should be an object' );
		}
		const children = await this.ApiDoc.findMany( {ancestor: currentSymbol.attributes.identifier, exported: true} );
		return {
			currentSymbol: currentSymbol.attributes,
			children: children.toChainable( Set.ETransformationMode.ATTRIBUTES ).value(),
		};
	}
}
