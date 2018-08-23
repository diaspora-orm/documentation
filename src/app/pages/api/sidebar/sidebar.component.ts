import { ITreeData } from './../../../services/repository/api-doc-repository/api-doc-repository.service';
import { Component, OnInit, HostListener, HostBinding, Input, EventEmitter, Output } from '@angular/core';

@Component( {
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
} )
export class SidebarComponent implements OnInit {
	@Input() public treeData?: ITreeData;
	
	
	private header: HTMLElement | null = null;
	private logoLink: HTMLElement | null = null;
	
	
	@HostBinding( 'style.flex-basis' )
	public width?: string;

	private _onlyExported = true;

	@Input() public get onlyExported() {
	  return this._onlyExported;
	}
	@Output() public onlyExportedChange = new EventEmitter();
	public set onlyExported( val: boolean ) {
	  this._onlyExported = val;
	  this.onlyExportedChange.emit( this._onlyExported );
	}

	
	public toggleExported( event: MouseEvent ) {
		this.onlyExported = !this.onlyExported;
	}
	
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
