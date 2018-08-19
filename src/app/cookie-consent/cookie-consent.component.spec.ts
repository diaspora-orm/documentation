import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IndexComponent } from './../pages/index/index.component';
import { routes } from './../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieConsentComponent } from './cookie-consent.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe( 'CookieConsentComponent', () => {
	let component: CookieConsentComponent;
	let fixture: ComponentFixture<CookieConsentComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ FormsModule, RouterTestingModule.withRoutes( [] ), BrowserAnimationsModule ],
			declarations: [ CookieConsentComponent ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( CookieConsentComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
