import { environment } from './../../../environments/environment';
import { ICookieDependentService } from './../../ICookieDependentService';
import { Injectable } from '@angular/core';


const AUTHORIZE_KEY = 'authorizeUsage';

@Injectable( {
	providedIn: 'root',
} )
export class VersionManagerService implements ICookieDependentService {
	public version = environment.docsVersions[0];
	public get cookieAccepted() {
		return localStorage.getItem( AUTHORIZE_KEY ) === '1';
	}
	public set cookieAccepted( allow: boolean ) {
		if ( allow ){
			console.info( 'Enabling LocalStorage for ApiDoc' );
			localStorage.setItem( AUTHORIZE_KEY, '1' );
		} else {
			console.info( 'Disabling LocalStorage for ApiDoc' );
			localStorage.removeItem( AUTHORIZE_KEY );
		}
	}

	public get latest(){
		return this.version;
	}
	
	public constructor() { }
}
