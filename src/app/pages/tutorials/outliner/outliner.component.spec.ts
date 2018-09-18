import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlinerComponent } from './outliner.component';
import { RouterTestingModule } from '@angular/router/testing';

describe( 'OutlinerComponent', () => {
	let component: OutlinerComponent;
	let fixture: ComponentFixture<OutlinerComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ OutlinerComponent ],
			imports: [ RouterTestingModule ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( OutlinerComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
