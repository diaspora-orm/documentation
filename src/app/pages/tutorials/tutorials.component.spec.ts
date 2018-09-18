import { MatSidenavModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './../../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsComponent } from './tutorials.component';
import { ShowdownDirective } from 'ngx-showdown';
import { RouterTestingModule } from '@angular/router/testing';

describe( 'TutorialsComponent', () => {
	let component: TutorialsComponent;
	let fixture: ComponentFixture<TutorialsComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ TutorialsComponent, ShowdownDirective ],
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule, MatSidenavModule ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( TutorialsComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
