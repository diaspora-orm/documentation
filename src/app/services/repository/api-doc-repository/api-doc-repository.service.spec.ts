import { ISymbolDef } from './../../api-doc/api-doc.service';
import { apiDocAttributes } from './../../../types/models';
import { ApiDocService } from '../../api-doc/api-doc.service';
import { TestBed, inject, async } from '@angular/core/testing';

import { ApiDocRepositoryService } from './api-doc-repository.service';
import { Diaspora, Model } from '@diaspora/diaspora';
import { SymbolKind } from '../../../types/typedoc/typedoc';

function *UidGen(){
	let i = 0;
	while ( true ){
		yield i++;
	}
}

const items: any = {
	item: {
		name: 'foo',
		canonicalPath: 'foo',
		identifier: 0,
		exported: true,
	},
	children: [
		{
			item: {
				name: 'bar',
				canonicalPath: 'foo/bar',
				identifier: 1,
				ancestor: 0,
				exported: true,
			},
			children: [
				{
					item: {
						name: 'qwe',
						canonicalPath: 'foo/bar/qwe',
						identifier: 2,
						ancestor: 1,
						exported: false,
					},
				},
				{
					item: {
						name: 'aze',
						canonicalPath: 'foo/bar/aze',
						identifier: 3,
						ancestor: 1,
						exported: true,
					},
				},
			],
		},
		{
			item: {
				name: 'qux',
				canonicalPath: 'foo/qux',
				identifier: 4,
				ancestor: 0,
				exported: true,
			},
		},
		{
			item: {
				name: 'baaz',
				canonicalPath: 'foo/baaz',
				identifier: 5,
				ancestor: 0,
				exported: false,
			},
		},
	],
};


const uidGen = UidGen();
class MockApiDocService{
	public readonly ApiDoc: Model<ISymbolDef>;
	public constructor(){
		const idAdapter = uidGen.next().value;
		Diaspora.createNamedDataSource( 'test' + idAdapter, 'inMemory' );
		this.ApiDoc = Diaspora.declareModel( 'test' + idAdapter, {
			sources: 'test' + idAdapter,
			attributes: apiDocAttributes,
		} );
	}
	
	public async initTestData(){
		return this.ApiDoc.insertMany( [
			items.item,
			items.children[0].item,
			items.children[0].children[0].item,
			items.children[0].children[1].item,
			items.children[1].item,
			items.children[2].item,
		] );
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
		describe( 'getCurrentSymbolAndChildren', () => {
			it( 'Root element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getCurrentSymbolAndChildren( 'foo' ) ).toEqual( {
					currentSymbol: items.item,
					children: [
						items.children[0].item,
						items.children[1].item,
					],
				} );
			} ) ) );
			it( 'Child element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				expect( await service.getCurrentSymbolAndChildren( 'foo/bar' ) ).toEqual( {
					currentSymbol: items.children[0].item,
					children: [
						items.children[0].children[1].item,
					],
				} );
			} ) ) );
			it( 'Reject on not found', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				try {
					await service.getCurrentSymbolAndChildren( 'not/found' );
				} catch ( err ) {
					expect( err instanceof Error ).toBeTruthy();
					return;
				}
				throw new Error( 'Promise should not be resolved' );
			} ) ) );
		} );
} );
	describe( 'Exported & non exported', () => {
		describe( 'getCurrentSymbolAndChildren', () => {
			it( 'Root element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				expect( await service.getCurrentSymbolAndChildren( 'foo' ) ).toEqual( {
					currentSymbol: items.item,
					children: [
						items.children[0].item,
						items.children[1].item,
						items.children[2].item,
					],
				} );
			} ) ) );
			it( 'Child element', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				expect( await service.getCurrentSymbolAndChildren( 'foo/bar' ) ).toEqual( {
					currentSymbol: items.children[0].item,
					children: [
						items.children[0].children[0].item,
						items.children[0].children[1].item,
					],
				} );
			} ) ) );
			it( 'Reject on not found', async( inject( [ApiDocRepositoryService], async ( service: ApiDocRepositoryService ) => {
				service.onlyExported = false;
				try {
					await service.getCurrentSymbolAndChildren( 'not/found' );
				} catch ( err ) {
					expect( err instanceof Error ).toBeTruthy();
					return;
				}
				throw new Error( 'Promise should not be resolved' );
			} ) ) );
		} );
	} );
} );
