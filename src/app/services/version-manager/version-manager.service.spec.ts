import { TestBed, inject } from '@angular/core/testing';

import { VersionManagerService } from './version-manager.service';

describe( 'VersionManagerService', () => {
	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [VersionManagerService],
		} );
	} );
	
	it( 'should be created', inject( [VersionManagerService], ( service: VersionManagerService ) => {
		expect( service ).toBeTruthy();
	} ) );
} );
