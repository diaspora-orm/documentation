import { HttpClientModule } from '@angular/common/http';
import { routes } from './../../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsComponent } from './tutorials.component';
import { NgxMdComponent } from 'ngx-md';
import { RouterTestingModule } from '@angular/router/testing';

describe( 'TutorialsComponent', () => {
	let component: TutorialsComponent;
	let fixture: ComponentFixture<TutorialsComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule ],
			declarations: [ TutorialsComponent, NgxMdComponent ],
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
