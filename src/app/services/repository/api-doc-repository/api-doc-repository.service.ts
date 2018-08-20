import { ApiDocService, ISymbolDef } from './../../api-doc/api-doc.service';
import { Injectable } from '@angular/core';
import { Model, Entity, Set, QueryLanguage } from '@diaspora/diaspora';
import { assign } from 'lodash';

export interface ISymbolAndChildren{
	currentSymbol: ISymbolDef;
	children: ISymbolDef[];
}
@Injectable( {
	providedIn: 'root',
} )
export class ApiDocRepositoryService {
	public readonly ApiDoc: Model<ISymbolDef>;
	
	public onlyExported = true;

	public constructor( private apiDoc: ApiDocService ) {
		this.ApiDoc = apiDoc.ApiDoc;
	}

	private maybeAddExportedQuery( query: QueryLanguage.Raw.SearchQuery ){
		if ( this.onlyExported ){
			return assign( query, {exported: true} );
		} else {
			return query;
		}
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
		const currentSymbol = await this.ApiDoc.find( this.maybeAddExportedQuery( {canonicalPath} ) );
		if ( !currentSymbol ){
			throw new Error( 'Current symbol not found' );
		}
		if ( !currentSymbol.attributes ){
			throw new Error( 'Symbol attributes should be an object' );
		}
		const children = await this.ApiDoc.findMany( this.maybeAddExportedQuery( {ancestor: currentSymbol.attributes.identifier} ) );
		return {
			currentSymbol: currentSymbol.attributes,
			children: children.toChainable( Set.ETransformationMode.ATTRIBUTES ).value(),
		};
	}
}
