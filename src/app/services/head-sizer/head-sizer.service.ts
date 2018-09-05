import { SassVarService } from './../sass-var/sass-var.service';
import { BehaviorSubject } from 'rxjs';
import { fromEvent } from 'rxjs';
import { Injectable, Inject } from '@angular/core';

@Injectable( {
	providedIn: 'root',
} )
export class HeadSizerService {
	public constructor(
		private sassVar: SassVarService
	) {
		fromEvent( window, 'scroll' ).subscribe( () => this.refreshAtTop() );
		// this.atTopChanged.subscribe( atTop => console.log( {atTop} ) );
		this.refreshAtTop();
	}

	private refreshAtTop(){
		const newAtTop = window.scrollY === 0;
		if ( newAtTop !== this._atTop ){
			this._realAtTop = newAtTop;
			if ( this.atTopEnabled ){
				this.atTop = this._realAtTop;
			}
		}
	}

	public readonly atTopChanged = new BehaviorSubject( true );
	
	private _realAtTop = true;
	private _atTop = true;
	public set atTop( value: boolean ){
		this._atTop = value;
		if ( this.atTopEnabled ){
			this.atTopChanged.next( value );
		}
	}
	public get atTop(){
		return this._atTop;
	}
	
	private _atTopEnabled = true;
	public set atTopEnabled( enabled: boolean ){
		if ( enabled ){
			this._atTopEnabled = enabled;
			if ( this._realAtTop !== this.atTop ){
				this.atTop = this._realAtTop;
			}
		} else {
			this.atTop = false;
			this._atTopEnabled = enabled;
		}
	}
	public get atTopEnabled(){
		return this._atTopEnabled;
	}



	public get headerHeight(){
		const headerHeightProp = this.atTop ?
			'normal-header-height' :
			'reduced-header-height';
		return this.sassVar.getNumeric( headerHeightProp );
	}
}
