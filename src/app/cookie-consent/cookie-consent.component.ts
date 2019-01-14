import { VersionManagerService } from './../services/version-manager/version-manager.service';
import { GoogleAnalyticsService } from './../services/google-analytics/google-analytics.service';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, EventEmitter, Output, Input, HostBinding } from '@angular/core';
import { trigger, state, style, animate, transition, AnimationTriggerMetadata } from '@angular/animations';

import * as _ from 'lodash';

export type CookieLawPosition = 'top' | 'bottom';
export type CookieLawAnimation = 'topIn' | 'bottomIn' | 'topOut' | 'bottomOut';
export const translateInOut: AnimationTriggerMetadata =
trigger( 'transition', [
	state( '*', style( { transform: 'translateY(0)' } ) ),
	state( 'void', style( { transform: 'translateY(0)' } ) ),
	
	state( 'bottomOut', style( { transform: 'translateY(100%)' } ) ),
	state( 'topOut', style( { transform: 'translateY(-100%)' } ) ),
	
	transition( 'void => topIn', [
		style( { transform: 'translateY(-100%)' } ),
		animate( '1000ms ease-in-out' ),
	] ),
	
	transition( 'void => bottomIn', [
		style( { transform: 'translateY(100%)' } ),
		animate( '1000ms ease-in-out' ),
	] ),
	
	transition( 'bottomIn => bottomOut', animate( '1000ms ease-out' ) ),
	transition( 'topIn => topOut', animate( '1000ms ease-out' ) ),
] );

export interface IConsent{
	apiDoc: boolean;
	tracking: boolean;
}
@Component( {
	selector: 'app-cookie-consent',
	templateUrl: './cookie-consent.component.html',
	styleUrls: ['./cookie-consent.component.scss'],
	animations: [translateInOut],
	providers: [GoogleAnalyticsService],
} )
export class CookieConsentComponent implements AfterViewInit {
	public showDetails = false;
	@ViewChild( 'details' ) public details?: ElementRef<HTMLDivElement>;
	public detailsHeight?:number;
	
	public hasAccepted = new EventEmitter<IConsent>();
	
	@HostBinding( 'class.cookie-law' )
	public cookieLawClass: boolean;
	
	@Output()
	public isSeen = new EventEmitter<boolean>();
	
	public get detailsMargin(){
		return this.detailsHeight && !this.showDetails ? ( -this.detailsHeight ) + 'px' : undefined;
	}
	
	public get acceptLabel(){
		return _.every( this.consentMatrice ) ? 'Accept all' : 'Save';
	}
	
	public consentMatrice: IConsent;
	
	@Input()
	public get position() { return this._position; }
	public set position( value: CookieLawPosition ) {
		this._position = ( value !== null && `${value}` !== 'false' && ( `${value}` === 'top' || `${value}` === 'bottom' ) ) ? value : 'bottom';
	}
	private _position: CookieLawPosition;
	
	public transition: CookieLawAnimation;
	
	
	
	public constructor(
		private versionManager: VersionManagerService,
		private googleAnalytics: GoogleAnalyticsService
	) {
		this.consentMatrice = {
			apiDoc: this.versionManager.cookieAccepted,
			tracking: this.googleAnalytics.cookieAccepted,
		};
		this._position =  'bottom';
		if ( _.every( _.values( this.consentMatrice ), v => !v ) ){
			this.transition = 'bottomIn';
			this.consentMatrice = {
				apiDoc: true,
				tracking: true,
			};
		} else {
			this.transition = 'bottomOut';
		}
		this.cookieLawClass = true;
	}
	
	
	public applyPreferences(){
		console.log( 'Apply preferences', this.consentMatrice );
		this.hasAccepted.emit( this.consentMatrice );
		this.dismiss();
	}
	
	public afterDismissAnimation( evt: any ): void {
		if ( evt.toState === 'topOut' ||
		evt.toState === 'bottomOut' ) {
			this.isSeen.emit( true );
		}
	}
	
	public dismiss(): void {
		this.transition = this.position === 'top' ? 'topOut' : 'bottomOut';
	}
	
	
	public ngAfterViewInit() {
		window.setTimeout( () => this.detailsHeight = this.details ? this.details.nativeElement.offsetHeight : undefined );
		this.hasAccepted.subscribe( ( accepted: IConsent ) => {
			this.googleAnalytics.cookieAccepted = accepted.tracking;
			this.versionManager.cookieAccepted = accepted.apiDoc;
		} );
	}
}
