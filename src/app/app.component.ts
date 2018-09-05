import { HeadSizerService } from './services/head-sizer/head-sizer.service';
import { Subject } from 'rxjs';
import { environment } from './../environments/environment';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
} )
export class AppComponent {
	private title = 'app';

	public tutorials = environment.tutorials;

	public constructor(
		private el: ElementRef,
		private titleService: Title,
		private headSizer: HeadSizerService
	) {
		this.headSizer.atTopChanged.subscribe( atTop => {
			if ( atTop ) {
				this.el.nativeElement.classList.add( 'attop' );
			} else {
				this.el.nativeElement.classList.remove( 'attop' );
			}
		} );
	}

	public setTitle( newTitle: string ) {
		this.titleService.setTitle( newTitle );
	}
}
