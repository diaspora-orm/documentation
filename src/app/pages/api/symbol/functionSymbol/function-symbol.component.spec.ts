import { ApiDocService } from './../../../../services/api-doc/api-doc.service';
import { NgxMdComponent } from 'ngx-md';
import { TypeComponent } from './../type/type.component';
import { CallSignatureComponent } from './callSignature/call-signature.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionSymbolComponent } from './function-symbol.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe( 'FunctionSymbolComponent', () => {
	let component: FunctionSymbolComponent;
	let fixture: ComponentFixture<FunctionSymbolComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule ],
			declarations: [ FunctionSymbolComponent, CallSignatureComponent, TypeComponent, NgxMdComponent ],
			providers: [ ApiDocService ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( FunctionSymbolComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
