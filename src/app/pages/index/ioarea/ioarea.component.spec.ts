import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IOAreaComponent } from './ioarea.component';
import { HttpClientModule } from '@angular/common/http';

describe( 'IOAreaComponent', () => {
	let component: IOAreaComponent;
	let fixture: ComponentFixture<IOAreaComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ IOAreaComponent ],
			imports: [ HttpClientModule ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( IOAreaComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
