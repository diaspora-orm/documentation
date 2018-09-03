import { Subject } from 'rxjs';
import { environment } from './../environments/environment.dev';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
} )
export class AppComponent {
	private title = 'app';

	public tutorials = environment.tutorials;

	public atTop = new Subject<boolean>();

	private atTopEnabled = true;
	@HostListener( 'atTopEnabled', ['$event'] )
	public setAtTopEnabled( enabled: CustomEvent<boolean> ){
		this.atTopEnabled = enabled.detail;
		if ( this.atTopEnabled ){
			this.doScroll();
		} else {
			this.atTop.next( false );
		}
	}

	public constructor( private el: ElementRef, private titleService: Title ) {
		this.atTop.subscribe( atTop => {
			if ( atTop && !this.atTopEnabled ){
				return;
			}
			if ( atTop ) {
				this.el.nativeElement.classList.add( 'attop' );
			} else {
				this.el.nativeElement.classList.remove( 'attop' );
			}
		} );
		this.doScroll();
	}

	public setTitle( newTitle: string ) {
		this.titleService.setTitle( newTitle );
	}

	@HostListener( 'document:scroll' )
	private doScroll() {
		this.atTop.next( window.scrollY === 0 );
	}
}
