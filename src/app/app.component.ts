import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private title = 'app';

	public constructor(private el: ElementRef, private titleService: Title) {
		this.doScroll();
	}

	public setTitle( newTitle: string) {
		this.titleService.setTitle( newTitle );
	}

	@HostListener('document:scroll')
	private doScroll() {
		if (window.scrollY === 0) {
			this.el.nativeElement.classList.add('attop');
		} else {
			this.el.nativeElement.classList.remove('attop');
		}
	}
}
