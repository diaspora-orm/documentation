import { ISymbolDef } from './../../api-doc/api-doc.service';
import { apiDocAttributes } from './../../../types/models';
import { ApiDocService } from '../../api-doc/api-doc.service';
import { TestBed, inject, async } from '@angular/core/testing';

import { ApiDocRepositoryService } from './api-doc-repository.service';
import { Diaspora, Model } from '@diaspora/diaspora';
import { SymbolKind } from '../../../types/typedoc/typedoc';
import * as _ from 'lodash';

function *UidGen(){
	let i = 0;
	while ( true ){
		yield i++;
	}
}

interface ISmbl{
	name: string;
	canonicalPath: string;
	ancestor?: number;
	identifier?: number;
	exported?: boolean;
}
interface IChildNode{
	item: ISmbl;
	children?: IChildNode[];
}
const mapItems = ( node: IChildNode ) => {
	node.item.identifier = _.isNumber( node.item.identifier ) ? node.item.identifier : entityIdGen.next().value;
	node.item.exported = node.item.exported || false;
	if ( node.children ){
		node.children = node.children.map( child => {
			child.item.ancestor = node.item.identifier;
			return mapItems( child );
		} );
	}
	return node;
};

const entityIdGen = UidGen();
const items: any = mapItems( {
	item: {
		name: '@diaspora/diaspora',
		canonicalPath: '@diaspora/diaspora',
		exported: true,
	},
	children: [
		{
			item: {
				name: 'QueryLanguage',
				canonicalPath: '@diaspora/diaspora:QueryLanguage',
				exported: true,
			},
			children: [
				{
					item: {
						name: 'Raw',
						canonicalPath: '@diaspora/diaspora:QueryLanguage:Raw',
						exported: true,
					},
					children: [
						{
							item: {
								name: 'IQueryOptions',
								canonicalPath: '@diaspora/diaspora:QueryLanguage:Raw#IQueryOptions',
								exported: true,
							},
						},
						{
							item: {
								name: 'SearchQuery',
								canonicalPath: '@diaspora/diaspora:QueryLanguage:Raw#SearchQuery',
								exported: true,
							},
						},
					],
				},
				{
					item: {
						name: 'IQueryOptions',
						canonicalPath: '@diaspora/diaspora:QueryLanguage#IQueryOptions',
						exported: true,
					},
				},
				{
					item: {
						name: 'SelectQueryOrCondition',
						canonicalPath: '@diaspora/diaspora:QueryLanguage#SelectQueryOrCondition',
						exported: true,
					},
				},
			],
		},
		{
			item: {
				name: 'FieldDescriptor',
				canonicalPath: '@diaspora/diaspora:FieldDescriptor',
				exported: true,
			},
			children: [
				{
					item: {
						name: 'IBaseFieldDescriptor',
						canonicalPath: '@diaspora/diaspora:FieldDescriptor#IBaseFieldDescriptor',
						exported: true,
					},
				},
				{
					item: {
						name: 'IPrimitiveFieldDescriptor',
						canonicalPath: '@diaspora/diaspora:FieldDescriptor#IPrimitiveFieldDescriptor',
						exported: false,
					},
				},
			],
		},
		{
			item: {
				name: 'messageRequired',
				canonicalPath: '@diaspora/diaspora.messageRequired',
				exported: false,
			},
		},
		{
			item: {
				name: 'foo',
				canonicalPath: '@diaspora/diaspora.foo',
				exported: true,
			},
		},
	],
} );


const modelIdGen = UidGen();
class MockApiDocService{
	public readonly ApiDoc: Model<ISymbolDef>;
	public constructor(){
		const idAdapter = modelIdGen.next().value;
		Diaspora.createNamedDataSource( 'test' + idAdapter, 'inMemory' );
		this.ApiDoc = Diaspora.declareModel( 'test' + idAdapter, {
			sources: 'test' + idAdapter,
			attributes: apiDocAttributes,
		} );
	}
	
	public async initTestData(){
		return this.ApiDoc.insertMany( this.flattenSymbols( items, [] ) );
	}

	private flattenSymbols( node: IChildNode, previousList: ISmbl[] ){
		previousList.push( node.item );
		if ( node.children ){
			previousList.push( ..._.reduce(
				node.children,
				( acc, child ) => this.flattenSymbols( child, acc ),
				[] as ISmbl[]
			) );
		}
		return previousList as ISymbolDef[];
	}
}

describe( 'ApiDocRepositoryService', () => {
	let apiDocService: MockApiDocService;
	beforeEach( async( async () => {
		TestBed.configureTestingModule( {
			providers: [
				ApiDocRepositoryService,
				{provide: ApiDocService, useClass: MockApiDocService},
			],
		} );
		apiDocService = TestBed.get( ApiDocService );
		await apiDocService.initTestData();
	} ) );
	afterEach( () => {
		delete ( Diaspora as any )._models.test;
		delete ( Diaspora as any )._dataSources.testSource;
	} );
	
	it( 'should be created', inject( [ApiDocRepositoryService], ( service: ApiDocRepositoryService ) => {
		expect( service ).toBeTruthy();
		console.log( {apiDocService, service, model: service.ApiDoc} );
	} ) );
	describe( 'Only exported', () => {
		describe( 'getSymbolAndChildren', () => {
			it( 'Root element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getSymbolAndChildren( '@diaspora/diaspora' ) ).toEqual( {
					currentSymbol: items.item,
					children: [
						items.children[0].item,
						items.children[1].item,
						items.children[3].item,
					],
				} );
			} ) ) );
			it( 'Child element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getSymbolAndChildren( '@diaspora/diaspora:QueryLanguage' ) ).toEqual( {
					currentSymbol: items.children[0].item,
					children: [
						items.children[0].children[0].item,
						items.children[0].children[1].item,
						items.children[0].children[2].item,
					],
				} );
			} ) ) );
			it( 'Reject on not found', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				try {
					await service.getSymbolAndChildren( 'not/found' );
				} catch ( err ) {
					expect( err instanceof Error ).toBeTruthy();
					return;
				}
				throw new Error( 'Promise should not be resolved' );
			} ) ) );
		} );
		describe( 'getTreeData', () => {
			it( 'Root element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getTreeData( [ '@diaspora/diaspora' ] ) ).toEqual( {
					item: items.item,
					children: [
						{ item: items.children[1].item },
						{ item: items.children[3].item },
						{ item: items.children[0].item },
					],
				} );
			} ) ) );
			const tree1 = {
				item: items.item,
				children: [
					{ item: items.children[1].item },
					{ item: items.children[3].item },
					{ item: items.children[0].item, children: [
						{ item: items.children[0].children[1].item },
						{ item: items.children[0].children[0].item, children:[
							{ item: items.children[0].children[0].children[0].item },
							{ item: items.children[0].children[0].children[1].item },
						] },
						{ item: items.children[0].children[2].item },
					] },
				],
			};
			it( 'Children', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getTreeData( [ '@diaspora/diaspora:QueryLanguage:Raw' ] ) ).toEqual( tree1 );
			} ) ) );
			it( 'Root element and children (Same as only children)', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getTreeData( [ '@diaspora/diaspora', '@diaspora/diaspora:QueryLanguage:Raw' ] ) ).toEqual( tree1 );
			} ) ) );
		} );
	} );
	describe( 'Exported & non exported', () => {
		describe( 'getSymbolAndChildren', () => {
			it( 'Root element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				expect( await service.getSymbolAndChildren( '@diaspora/diaspora' ) ).toEqual( {
					currentSymbol: items.item,
					children: [
						items.children[0].item,
						items.children[1].item,
						items.children[2].item,
						items.children[3].item,
					],
				} );
			} ) ) );
			it( 'Child element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				expect( await service.getSymbolAndChildren( '@diaspora/diaspora:QueryLanguage' ) ).toEqual( {
					currentSymbol: items.children[0].item,
					children: [
						items.children[0].children[0].item,
						items.children[0].children[1].item,
						items.children[0].children[2].item,
					],
				} );
			} ) ) );
			it( 'Reject on not found', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				try {
					await service.getSymbolAndChildren( 'not/found' );
				} catch ( err ) {
					expect( err instanceof Error ).toBeTruthy();
					return;
				}
				throw new Error( 'Promise should not be resolved' );
			} ) ) );
		} );
	} );
} );
