import { HttpClientModule } from '@angular/common/http';
import { ApiDocService } from './../../services/api-doc/api-doc.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ShowdownDirective } from 'ngx-showdown';
import { ApiComponent } from './api.component';
import { LazyRenderModule } from 'angular-lazy-render';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Pipe, Input } from '@angular/core';

@Component( { selector: 'app-symbol', template: '<p>Mock symbol</p>' } )
class MockSymbolComponent {
	@Input() public symbol: any;
	@Input() public currentDef: any;
}

@Component( { selector: 'app-function-symbol', template: '<p>Mock function symbol</p>' } )
class MockFunctionSymbolComponent {
	@Input() public symbol: any;
	@Input() public currentDef: any;
}

@Component( { selector: 'app-sidebar', template: '<p>Mock sidebar</p>' } )
class MockSidebarComponent {}

@Component( { selector: 'app-type', template: '<p>Mock type</p>' } )
class MockTypeComponent {}

@Pipe( { name: 'pairs' } )
class MockPairsPipe {}

describe( 'ApiComponent', () => {
	let component: ApiComponent;
	let fixture: ComponentFixture<ApiComponent>;
	
	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			imports: [ LazyRenderModule, RouterTestingModule.withRoutes( [] ), HttpClientModule ],
			declarations: [
				ApiComponent,
				MockSymbolComponent,
				MockFunctionSymbolComponent,
				MockSidebarComponent,
				MockPairsPipe,
				MockTypeComponent,
				ShowdownDirective,
			],
			providers: [ ApiDocService ],
		} )
		.compileComponents();
	} ) );
	
	beforeEach( () => {
		fixture = TestBed.createComponent( ApiComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );
	
	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
