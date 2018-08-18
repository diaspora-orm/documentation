import { ICookieDependentService } from './../../ICookieDependentService';
import { environment } from './../../../environments/environment';
/// <reference types="@types/google.analytics"/>

import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Injectable()
export class GoogleAnalyticsService implements ICookieDependentService {
	private deleteCookie( name: string ) {
		document.cookie = `${name}=; Path=/; Domain=${window.location.hostname}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
	}
	public get cookieAccepted(){
		return document.cookie.match( /^(.*;)?\s*_ga\s*=\s*[^;]+(.*)?$/ ) !== null;
	}
	public set cookieAccepted( enabled: boolean ){
		if ( enabled ){
			console.info( 'Enabling Google Analytics' );
			this.loadTrackingCode();
			this.router.events.subscribe( event => {
				try {
					if ( typeof ga === 'function' ) {
						if ( event instanceof NavigationEnd ) {
							ga( 'set', 'page', event.urlAfterRedirects );
							ga( 'send', 'pageview' );
							console.log( '%%% Google Analytics page view event %%%' );
						}
					} else {
						console.error( 'Missing Google Analytics script!' );
					}
				} catch ( e ) {
					console.log( e );
				}
			} );
		} else {
			console.info( 'Removing cookies' );
			document.cookie = '_ga=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			document.cookie = '_gid=;Path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
	}
	
	public constructor( public router: Router ) {}
	
	
	/**
	 * Emit google analytics event
	 * Fire event example:
	 * this.emitEvent("testCategory", "testAction", "testLabel", 10);
	 */
	public emitEvent(
		eventCategory: string,
		eventAction: string,
		eventLabel?: string,
		eventValue?: number
	) {
		if ( typeof ga === 'function' ) {
			ga( 'send', 'event', {
				eventCategory: eventCategory,
				eventLabel: eventLabel,
				eventAction: eventAction,
				eventValue: eventValue,
			} );
		}
	}
	
	private loadTrackingCode() {
		try {
			const script = document.createElement( 'script' );
			script.innerHTML = `
			  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	  
			  ga('create', '${environment.googleAnalyticsKey}', 'auto');
			`;
			document.head.appendChild( script );
		} catch ( ex ) {
			console.error( 'Error appending google analytics' );
			console.error( ex );
		}
	}
}
