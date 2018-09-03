import { Component, OnInit, HostListener, HostBinding, Input, EventEmitter, Output } from '@angular/core';

import { ITreeData } from './../../../services/repository/api-doc-repository/api-doc-repository.service';
import { AHeaderSizedComponent } from '../../../header-sized-component';

@Component( {
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
} )
export class SidebarComponent implements OnInit {
	@Input() public treeData?: ITreeData;
	
	private logoLink!: HTMLElement;
	
	
	@HostBinding( 'style.width' )
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

	
	public toggleExported() {
		this.onlyExported = !this.onlyExported;
	}
	
	public ngOnInit() {
		const logoLink = document.querySelector<HTMLElement>( '#logoLink' );
		if ( !logoLink ){
			throw new Error( 'Unable to find the logo link' );
		}
		this.logoLink = logoLink;

		this.onResize();
	}
	
	protected onResize( timeout = true ){
		this.width = `${( this.logoLink.clientWidth * 4 / 6 ) + ( this.logoLink.getBoundingClientRect().left )}px`;
		if ( timeout ){
			setTimeout( () => {
				this.onResize( false );
			},          500 );
		}
	}
}
