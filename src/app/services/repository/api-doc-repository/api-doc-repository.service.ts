import { ITreeData } from './api-doc-repository.service';
import { ApiDocService, ISymbolDef } from './../../api-doc/api-doc.service';
import { Injectable } from '@angular/core';
import { Model, Entity, Set, QueryLanguage } from '@diaspora/diaspora';
import * as _ from 'lodash';

export interface ISymbolAndChildren{
	currentSymbol: ISymbolDef;
	children: ISymbolDef[];
}
export interface ITreeData{
	item: ISymbolDef;
	children?: ITreeData[];
}
interface ITreeCache{
	[key: string]: ITreeData;
}

export interface IGetCurrentSymbolChildrenOpts{
	currentSymbol?: Entity<ISymbolDef>;
	children?: Set<ISymbolDef>;
}

export interface IBreadcrumbItem{
	label: string;
	canonicalPath: string;
	symbol: ISymbolDef;
}

const recomposeArr = ( set: Set<ISymbolDef>, descendingTree?: ITreeData ) => {
	const chainable = set.toChainable( Set.ETransformationMode.ATTRIBUTES );
	return ( descendingTree ?
			chainable.reject( item => item.identifier === descendingTree.item.identifier )
				.map( item => ( { item } ) )
				.union( [descendingTree] ) :
			chainable.map( item => ( { item } ) ) )
		.compact<ITreeData>()
		.sortBy( 'item.kind', x => x.item.name.toLowerCase() )
		.value();
};


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
			return _.assign( query, {exported: true} );
		} else {
			return query;
		}
	}
	private static getQuery( id: number | string ){
		const key = _.isNumber( id ) ? 'identifier' : 'canonicalPath';
		return { [key]: id };
	}
	private makeIdQuery( id: number | string ){
		return this.maybeAddExportedQuery( ApiDocRepositoryService.getQuery( id ) );
	}

	private async getTreeNode(
		idOrItem: string | number,
		descendingTree?: ITreeData,
		treeCache: ITreeCache = {}
	): Promise<[ITreeData | undefined, ITreeCache]> {

		// Load the cache
		if ( treeCache[idOrItem] ){
			const cacheItem = treeCache[idOrItem];
			if ( !cacheItem.children ) {
				cacheItem.children = recomposeArr( await this.ApiDoc.findMany( this.makeIdQuery( idOrItem ) ), descendingTree );
			}
			return [undefined, treeCache];
		}

		// Query
		const symbolAndChildren = await this._getSymbolAndChildren( idOrItem );

		if ( !symbolAndChildren.currentSymbol.attributes ){
			throw new Error( `Symbol ${idOrItem} not found` );
		}

		const filteredChildren: ITreeData[] = recomposeArr( symbolAndChildren.children, descendingTree );
		const currentSymbolAttrs = symbolAndChildren.currentSymbol.attributes;
		
		const searchRes = {
			item: currentSymbolAttrs,
			children: filteredChildren,
		};
		treeCache[currentSymbolAttrs.identifier] = searchRes;
		treeCache[currentSymbolAttrs.canonicalPath] = searchRes;
		if ( typeof currentSymbolAttrs.ancestor !== 'number' ){
			return [searchRes, treeCache];
		} else {
			return this.getTreeNode( currentSymbolAttrs.ancestor, searchRes );
		}
	}
	
	public async getTreeData( canonicalPaths: Array<string | number> ){
		let tree: ITreeData | undefined = undefined;
		const cache = {} as ITreeCache;
		for ( let path of canonicalPaths ){
			const descentRes = await this.getTreeNode( path, undefined, cache );
			if ( descentRes[0] ){
				tree = descentRes[0];
			}
		}
		return tree;
	}
	
	public async getSymbolAndChildren( id: string | number ): Promise<ISymbolAndChildren>{
		const symbolAndChildren = await this._getSymbolAndChildren( id );
		if ( !symbolAndChildren.currentSymbol.attributes ){
			throw new Error( 'Missing data!' );
		}
		return {
			currentSymbol: symbolAndChildren.currentSymbol.attributes,
			children: symbolAndChildren.children.toChainable( Set.ETransformationMode.ATTRIBUTES ).value(),
		};
	}

	private async _getSymbolAndChildren( id: string | number, opts?: IGetCurrentSymbolChildrenOpts ) {
		const currentSymbol = opts && opts.currentSymbol ? opts.currentSymbol : await this.ApiDoc.find( this.makeIdQuery( id ) );
		if ( !currentSymbol ){
			throw new Error( `Symbol ${id} not found` );
		}
		if ( !currentSymbol.attributes ){
			throw new Error( 'Symbol attributes should be an object' );
		}
		const children = opts && opts.children ? opts.children : await this.ApiDoc.findMany( this.maybeAddExportedQuery( {ancestor: currentSymbol.attributes.identifier} ) );
		return { currentSymbol, children };
	}

	private static isSymbolInPath( symbol: ISymbolDef, path: string ){
		const symbolName = symbol.canonicalPath;
		if ( path.startsWith( symbolName ) ) {
			const charAfter = path[symbol.canonicalPath.length];
			if ( typeof charAfter === 'undefined' || charAfter.match( /(^\W|^$)/ ) ) {
				return true;
			}
		}
		return false;
	}

	private getBreadcrumbByPath( id: string, treeData: ITreeData ): IBreadcrumbItem[] | undefined{
		if ( treeData.item.canonicalPath === id ){
			return [{ label: treeData.item.name, canonicalPath: treeData.item.canonicalPath, symbol: treeData.item }];
		} else if ( ApiDocRepositoryService.isSymbolInPath( treeData.item, id ) && treeData.children ){
			const childTreeData = _.find( treeData.children, ( child: ITreeData ) => ApiDocRepositoryService.isSymbolInPath( child.item, id ) );
			if ( childTreeData ){
				const childBreadcrumb = this.getBreadcrumbByPath( id, childTreeData );
				if ( childBreadcrumb ){
					return [
						{ label: treeData.item.name, canonicalPath: treeData.item.canonicalPath, symbol: treeData.item },
						...childBreadcrumb,
					];
				} else {
					return undefined;
				}
			}
		}
	}

	public async getBreadcrumb( id: string | number, treeData?: ITreeData ){
		const defaultedTreeData = treeData || await this.getTreeData( [id] );
		
		if ( !defaultedTreeData ){
			throw new Error( 'Target not found' );
		}
		
		if ( typeof id === 'number' ){
			throw new Error( 'Not implemented' );
		}
		return this.getBreadcrumbByPath( id, defaultedTreeData );
	}
}
