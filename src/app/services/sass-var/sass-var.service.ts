import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root',
} )
export class SassVarService {
	
	public constructor() { }
	
	public getNumeric( propName: string, targetElement?: HTMLElement ){
		return parseInt( this.getString( propName, targetElement ).replace( /^\W*([0-9.]+).*?$/, '$1' ) );
	}

	public getString( propName: string, targetElement: HTMLElement = document.body ){
		return window.getComputedStyle( targetElement ).getPropertyValue( '--' + propName ).trim();
	}
}
