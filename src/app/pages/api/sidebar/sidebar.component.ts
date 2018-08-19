import { Component, OnInit, HostListener, HostBinding } from '@angular/core';

@Component( {
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
} )
export class SidebarComponent implements OnInit {
	private header: HTMLElement | null = null;
	private logoLink: HTMLElement | null = null;

	private searchOnlyExported = true;

	@HostBinding( 'style.flex-basis' )
	public width?: string;

	public constructor() { }

	public ngOnInit() {
		this.header = document.querySelector<HTMLElement>( '#header' );
		if ( this.header ){
			this.logoLink = this.header.querySelector<HTMLElement>( '#logoLink' );
			this.resize();
		}
	}

	@HostListener( 'document:scroll' )
	@HostListener( 'window:resize' )
	private resize( timeout = true ){
		if ( !this.header || !this.logoLink ){
			this.width = undefined;
			return;
		}
		this.width = `${( this.logoLink.clientWidth * 4 / 6 ) + ( this.logoLink.getBoundingClientRect().left )}px`;
		if ( timeout ){
			setTimeout( () => {
				this.resize( false );
			},          500 );
		}
	}
}
