import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownReaderComponent } from './markdown-reader.component';

describe( 'MarkdownReaderComponent', () => {
	let component: MarkdownReaderComponent;
	let fixture: ComponentFixture<MarkdownReaderComponent>;

	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ MarkdownReaderComponent ],
		} )
		.compileComponents();
	} ) );

	beforeEach( () => {
		fixture = TestBed.createComponent( MarkdownReaderComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
