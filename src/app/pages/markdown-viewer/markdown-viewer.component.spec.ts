import { MatSidenavModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './../../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownViewerComponent } from './markdown-viewer.component';
import { ShowdownDirective } from 'ngx-showdown';
import { RouterTestingModule } from '@angular/router/testing';

describe( 'MarkdownViewerComponent', () => {
	let component: MarkdownViewerComponent;
	let fixture: ComponentFixture<MarkdownViewerComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ MarkdownViewerComponent, ShowdownDirective ],
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule, MatSidenavModule ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( MarkdownViewerComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
