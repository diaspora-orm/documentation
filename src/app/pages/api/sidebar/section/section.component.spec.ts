import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionComponent } from './section.component';
import { HttpClientModule } from '@angular/common/http';

describe( 'SectionComponent', () => {
	let component: SectionComponent;
	let fixture: ComponentFixture<SectionComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ SectionComponent ],
			imports: [HttpClientModule],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( SectionComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
