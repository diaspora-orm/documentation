import { routes } from './app-routing.module';
import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';

import { Component } from '@angular/core';
import { PairsPipe } from './pipes/pairs/pairs.pipe';


@Component( {
	selector: 'app-cookie-consent',
	template: '<p>Mock cookie consent</p>',
} )
class MockProductEditorComponent {}

describe( 'AppComponent', () => {
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ) ], 
			declarations: [ AppComponent, MockProductEditorComponent, PairsPipe ],do.it
		} ).compileComponents();
	} ) );
	it( 'should create the app', async( () => {
		const fixture = TestBed.createComponent( AppComponent );
		const app = fixture.debugElement.componentInstance;
		expect( app ).toBeTruthy();
	} ) );
	it( "should have as title 'app'", async( () => {
		const fixture = TestBed.createComponent( AppComponent );
		const app = fixture.debugElement.componentInstance;
		expect( app.title ).toEqual( 'app' );
	} ) );
	// it( 'should render title in a h1 tag', async( () => {
	// 	const fixture = TestBed.createComponent( AppComponent );
	// 	fixture.detectChanges();
	// 	const compiled = fixture.debugElement.nativeElement;
	// 	expect( compiled.querySelector( 'h1' ).textContent ).toContain( 'Welcome to documentation!' );
	// } ) );
} );
