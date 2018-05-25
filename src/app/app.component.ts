import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private title = 'app';

	constructor(private el: ElementRef) {
		this.doScroll();
	}

	@HostListener('document:scroll')
	doScroll() {
		if (window.scrollY === 0) {
			this.el.nativeElement.classList.add('attop');
		} else {
			this.el.nativeElement.classList.remove('attop');
		}
	}
}
