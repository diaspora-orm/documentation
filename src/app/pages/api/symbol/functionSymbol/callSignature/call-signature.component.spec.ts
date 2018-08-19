import { ApiDocService } from './../../../../../services/api-doc/api-doc.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallSignatureComponent } from './call-signature.component';
import { TypeComponent } from '../../type/type.component';
import { NgxMdComponent } from 'ngx-md';

describe( 'CallSignatureComponent', () => {
	let component: CallSignatureComponent;
	let fixture: ComponentFixture<CallSignatureComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule ],
			declarations: [ CallSignatureComponent, TypeComponent, NgxMdComponent ],
			providers: [ ApiDocService ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( CallSignatureComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
