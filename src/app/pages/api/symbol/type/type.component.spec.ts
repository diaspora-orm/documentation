import { ApiDocService } from './../../../../services/api-doc/api-doc.service';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './../../../../app-routing.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TypeComponent } from './type.component';

describe( 'TypeComponent', () => {
	let component: TypeComponent;
	let fixture: ComponentFixture<TypeComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ RouterTestingModule.withRoutes( [] ), HttpClientModule ], 
			declarations: [ TypeComponent ],
			providers: [ ApiDocService ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( TypeComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
