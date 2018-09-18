import { ApiDocService } from './../../../services/api-doc/api-doc.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolComponent } from './symbol.component';
import { TypeComponent } from './type/type.component';
import { ShowdownDirective } from 'ngx-showdown';
import { HttpClientModule } from '@angular/common/http';

describe( 'SymbolComponent', () => {
	let component: SymbolComponent;
	let fixture: ComponentFixture<SymbolComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule ],
			declarations: [ SymbolComponent, TypeComponent, ShowdownDirective ],
			providers: [ ApiDocService ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( SymbolComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
