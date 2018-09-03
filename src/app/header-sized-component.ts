import { SassVarService } from './services/sass-var/sass-var.service';
import { HostListener } from '@angular/core';
import { OnInit } from '@angular/core';

export abstract class AHeaderSizedComponent {
	
	private _atTop = true;
	public get atTop(){
		return this._atTop;
	}

	public get headerHeight(){
		const headerHeightProp = this.atTop ?
			'normal-header-height' :
			'reduced-header-height';
		return this.sassVar.getNumeric( headerHeightProp );
	}

	public constructor( protected sassVar: SassVarService ){}
	
	@HostListener( 'document:scroll' )
	@HostListener( 'window:resize' )
	private resize(){
		this._atTop = window.scrollY === 0;
	}
}
