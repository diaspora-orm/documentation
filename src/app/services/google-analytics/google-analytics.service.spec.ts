import { IOAreaComponent } from './../../pages/index/ioarea/ioarea.component';
import { MarkdownViewerComponent } from './../../pages/markdown-viewer/markdown-viewer.component';
import { ApiComponent } from './../../pages/api/api.component';
import { routes } from './../../app-routing.module';
import { TestBed, inject } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';

import { GoogleAnalyticsService } from './google-analytics.service';
import { Router } from '@angular/router';
import { IndexComponent } from '../../pages/index/index.component';

describe( 'GoogleAnalyticsService', () => {
	let router: Router;
	let fixture;
	
	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ) ],
			providers: [ GoogleAnalyticsService ],
		} );
		router = TestBed.get( Router ); 
	} );
	
	it( 'should be created', inject( [GoogleAnalyticsService], ( service: GoogleAnalyticsService ) => {
		expect( service ).toBeTruthy();
	} ) );
} );
