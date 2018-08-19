import { TestBed, inject } from '@angular/core/testing';

import { ApiDocService } from './api-doc.service';
import { HttpClientModule } from '@angular/common/http';

describe( 'ApiDocService', () => {
	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ ApiDocService ],
		} );
	} );
	
	it( 'should be created', inject( [ApiDocService], ( service: ApiDocService ) => {
		expect( service ).toBeTruthy();
	} ) );
} );
