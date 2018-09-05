import { HeadSizerService } from './../../services/head-sizer/head-sizer.service';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, HostListener } from '@angular/core';
import { NgxMdComponent, NgxMdService } from 'ngx-md';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';
import { OutlinerComponent } from './outliner/outliner.component';
import { MatSidenavContainer } from '@angular/material';
import { AHeaderSizedComponent } from '../../header-sized-component';
import { SassVarService } from '../../services/sass-var/sass-var.service';

interface IScrollDest{
	top?: number;
	left?: number;
}

const  scrollIt = ( target: HTMLElement | Window, destination: IScrollDest, duration = 500 ) => {
	const start = target instanceof HTMLElement ? {
		top: target.scrollTop,
		left: target.scrollLeft,
	} : {
		top: target.scrollY,
		left: target.scrollX,
	};

	const destDefaulted = Object.assign( {}, start, destination );
	const easings = {
		easeInOutExpo: function( pos: number ) {
			if ( pos === 0 ) {
				return 0;
			}
			if ( pos === 1 ) {
				return 1;
			}
			if ( ( pos /= 0.5 ) < 1 ) {
				return 0.5 * Math.pow( 2, 10 * ( pos - 1 ) );
			}
			return 0.5 * ( -Math.pow( 2, -10 * --pos ) + 2 );
		},
	};

	const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

	const outSize = target instanceof HTMLElement ? {
		height: Math.max( target.offsetHeight, target.clientHeight ),
		width: Math.max( target.offsetWidth, target.clientWidth ),
	} : {
		height: target.innerHeight,
		width: target.innerWidth,
	};
	const inSize = target instanceof HTMLElement ? {
		height: target.scrollHeight,
		width: target.scrollWidth,
	} : {
		height: target.document.body.scrollHeight,
		width: target.document.body.scrollWidth,
	};

	const scrollableSize = {
		height: inSize.height - outSize.height,
		width: inSize.width - outSize.width,
	};
	const boundTarget = {
		top: Math.min( scrollableSize.height, destDefaulted.top ),
		left: Math.min( scrollableSize.width, destDefaulted.left ),
	};

	return new Promise( resolve => {
		if ( 'requestAnimationFrame' in window === false ) {
			target.scroll( boundTarget );
			return resolve( false );
		}

		function scroll() {
			const now = 'now' in window.performance ? performance.now() : new Date().getTime();
			const time = Math.min( 1, ( ( now - startTime ) / duration ) );
			const timeFunction = easings.easeInOutExpo( time );
			target.scroll( {
				left: Math.ceil( ( timeFunction * ( boundTarget.left - start.left ) ) + start.left ),
				top: Math.ceil( ( timeFunction * ( boundTarget.top - start.top ) ) + start.top ),
			} );

			if ( timeFunction === 1 ) {
				return resolve( true );
			}

			return requestAnimationFrame( scroll );
		}

		scroll();
	} );
};

const SCROLL_COOLDOWN = 500;

type CustomSynthesisCallback = ( finished: boolean ) => void;
class CustomSynthesis {
	private static supportsSpeechSynthesis = typeof speechSynthesis !== 'undefined';
	private currentUtter: SpeechSynthesisUtterance | null = null;
	private callback?: CustomSynthesisCallback;
	private hasResolved = false;
	private resolveValue?: boolean;

	public constructor( element: HTMLElement | null ) {
		speechSynthesis.cancel();
		this.currentUtter = null;
		if ( CustomSynthesis.supportsSpeechSynthesis ) {
			const text = CustomSynthesis.getTextFromDomElement( element );
			if ( text ) {
				this.currentUtter = new SpeechSynthesisUtterance( text );
				this.currentUtter.voice = CustomSynthesis.getVoice( document.documentElement.lang );
				speechSynthesis.speak( this.currentUtter );
				this.currentUtter.addEventListener( 'end', () => {
					this.currentUtter = null;
					return this.resolve( true );
				} );
			} else {
				this.resolve( true );
			}
		} else {
			this.resolve( false );
		}
	}

	private static getTextFromDomElement( element: HTMLElement | null ) {
		if ( !element ) {
			return element;
		}
		if ( element.tagName.toUpperCase() === 'PRE' &&
		element.childNodes.length === 1 &&
		( element.childNodes[0] as HTMLElement ).tagName.toUpperCase() === 'CODE' ) {
			return ( element.childNodes[0] as HTMLElement ).getAttribute( 'title' );
		}
		return element.textContent;
	}

	private static getVoice( lang?: string ) {
		const defaultedLang = lang || 'en';
		const validVoices = speechSynthesis.getVoices().filter( voice =>
			voice.lang.startsWith( defaultedLang ) );
		return validVoices[0];
	}

	public then( callback: CustomSynthesisCallback ) {
		this.callback = callback;
		if ( this.hasResolved && typeof this.resolveValue !== 'undefined' ) {
			this.callback( this.resolveValue );
		}
		return this;
	}

	public cancel() {
		this.resolve( false );
		speechSynthesis.cancel();
	}

	private resolve( finished: boolean ) {
		if ( !this.hasResolved ) {
			this.hasResolved = true;
			this.resolveValue = finished;
			if ( this.callback ) {
				this.callback( finished );
				return true;
			}
		}
		return false;
	}
}



export enum SectionChange {
	Next = 1,
	Previous = -1,
}
enum VolumeIcons {
	Enabled = 'fa-volume-up',
	Disabled = 'fa-volume-off',
}
enum PlayIcons {
	Enabled = 'fa-step-forward',
	Disabled = 'fa-pause',
}
enum AutoPlayIcons {
	Enabled = 'fa-play',
	Disabled = 'fa-stop',
}

const MUTE_STORAGE_KEY = 'muted';
const MARGIN_SCROLL = 25;

@Component( {
	selector: 'app-tutorials',
	templateUrl: './tutorials.component.html',
	styleUrls: ['./tutorials.component.scss'],
} )
export class TutorialsComponent extends AHeaderSizedComponent implements OnInit, AfterViewInit {
	@ViewChild( MatSidenavContainer ) public sidenavContainer!: MatSidenavContainer;
	@ViewChild( OutlinerComponent ) private outliner!: OutlinerComponent;
	@ViewChild( NgxMdComponent ) private tutoComponent!: NgxMdComponent;
	@ViewChild( 'scroller' ) private scroller!: ElementRef<HTMLElement>;
	@ViewChild( 'progress' ) private progress!: ElementRef<HTMLProgressElement>;
	@ViewChild( 'cursor' ) private cursor!: ElementRef<HTMLElement>;
	@ViewChild( 'autoPlayButton' ) private autoPlayButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'playButton' ) private playButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'fullScreenButton' ) private fullScreenButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'muteButton' ) private muteButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'presentation' ) private presentation!: ElementRef<HTMLElement>;
	private sections: HTMLElement[] = [];
	public tutoIdentifier!: string;
	private allowScroll = true;
	private currentSpeechSynthesis: CustomSynthesis | null = null;


	public get target() {
		return this.sectionIndex >= 0 ? this.sections[this.sectionIndex] : null;
	}
	private get tutoContent() {
		return ( this.tutoComponent as any )._el as ElementRef<HTMLElement>;
	}

	private get tutoContainerHeight(){
		return this.scroller.nativeElement.clientHeight;
	}


	private _sectionIndex = -1;
	public get sectionIndex() {return this._sectionIndex; }
	public set sectionIndex( index: number ) {
		if ( index >= this.sections.length ) {
			return;
		}
		if ( this.allowScroll ) {
			// Set a timeout before which we won't be able to trigger a second scroll
			this.allowScroll = false;
			setTimeout( () => {
				this.allowScroll = true;
			},          SCROLL_COOLDOWN );

			if ( index === 0 || this.sectionIndex === 0 ){
				this.headSizer.atTopEnabled = index === 0;
			}

			const scrollDirection = index > this.sectionIndex ? SectionChange.Next : SectionChange.Previous;
			// Do scroll
			this._sectionIndex = index;
			this.refreshScollAndCursor( this.target, scrollDirection );
			// Update progress infos
			const frac = this.sections.length === 0 ? 0 : ( ( index + 1 ) / this.sections.length );
			const percent = Math.round( frac * 1000 ) / 10;
			if ( this.progress ) {
				this.progress.nativeElement.value = percent;

				const inSpan = this.progress.nativeElement.querySelector( 'span' );
				if ( inSpan ) {
					const percentWithSymbol = percent + '%';
					inSpan.innerText = percentWithSymbol;
					inSpan.style.width = percentWithSymbol;
				}
			}

			// Start speech synthesis
			if ( this.autoPlay ) {
				this.isPlaying = true;
			}

			// Finalize
			if ( this.target ) {
				this.router.navigate( [], {fragment: this.target.id} );
			}
		}
	}
	public get currentSection(){
		return this.sections[this.sectionIndex];
	}
	public set currentSection( section: HTMLElement ){
		this.sectionIndex = _.indexOf( this.sections, section );
	}

	private _autoPlay = false;
	public get autoPlay() {return this._autoPlay; }
	public set autoPlay( autoPlay: boolean ) {
		if ( this.autoPlayButton ) {
			const icon = this.autoPlayButton.nativeElement.querySelector( '.fa' );
			if ( icon ) {
				const iconClassList = icon.classList;
				iconClassList.remove( autoPlay ? AutoPlayIcons.Enabled : AutoPlayIcons.Disabled );
				iconClassList.add( autoPlay ? AutoPlayIcons.Disabled : AutoPlayIcons.Enabled );
			}
		}
		this._autoPlay = autoPlay;
		if ( this.autoPlay !== this.isPlaying || !this.autoPlay ) {
			this.isPlaying = this.autoPlay;
		}
	}

	private _isPlaying = false;
	public get isPlaying() {return this._isPlaying; }
	public set isPlaying( isPlaying: boolean ) {
		if ( this.playButton ) {
			const icon = this.playButton.nativeElement.querySelector( '.fa' );
			if ( icon ) {
				const iconClassList = icon.classList;
				iconClassList.remove( isPlaying ? PlayIcons.Enabled : PlayIcons.Disabled );
				iconClassList.add( isPlaying ? PlayIcons.Disabled : PlayIcons.Enabled );
			}
		}
		const wasPlaying = this._isPlaying;
		this._isPlaying = isPlaying;
		if ( this.currentSpeechSynthesis && wasPlaying && !this.isPlaying ) {
			this.currentSpeechSynthesis.cancel();
			this.currentSpeechSynthesis = null;
		} else if ( this.isPlaying ) {
			// If this is our first trigger on index -1, delegate by setting the index @ 0, that will call play again
			if ( this.sectionIndex === -1 ) {
				this.sectionIndex = 0;
			} else if ( !this.mute ) {
				// Start speech synthesis
				this.currentSpeechSynthesis = new CustomSynthesis( this.target ).then( ( finished: boolean ) => {
					this.currentSpeechSynthesis = null;
					this.isPlaying = false;
					setTimeout( () => {
						if ( finished && this.autoPlay ) {
							this.sectionIndex += SectionChange.Next;
						}
					},          1000 );
				} );
			}
		}
	}

	private _fullscreen = false;
	public get fullscreen() {return this._fullscreen; }
	public set fullscreen( fullscreen: boolean ) {
		this._fullscreen = fullscreen;
		if ( this.fullScreenButton && this.presentation && this.fullscreen ) {
			const requestFullscreen = ( this.presentation.nativeElement as any ).requestFullscreen ||
			( this.presentation.nativeElement as any ).webkitRequestFullscreen ||
			( this.presentation.nativeElement as any ).mozRequestFullScreen ||
			( this.presentation.nativeElement as any ).msRequestFullscreen;
			if ( requestFullscreen ) {
				requestFullscreen.call( this.presentation.nativeElement );
			} else {
				console.error( 'Could not set fullscreen' );
			}
		}
		this._fullscreen = false;
	}

	private _mute = true;
	public get mute() {return this._mute; }
	public set mute( mute: boolean ) {
		if ( this.muteButton ) {
			const icon = this.muteButton.nativeElement.querySelector( '.fa' );
			if ( icon ) {
				const iconClassList = icon.classList;
				iconClassList.remove( mute ? VolumeIcons.Enabled : VolumeIcons.Disabled );
				iconClassList.add( mute ? VolumeIcons.Disabled : VolumeIcons.Enabled );
			}
		}
		this._mute = mute;
		if ( this.mute ) {
			localStorage.setItem( MUTE_STORAGE_KEY, 'yes' );
		} else {
			localStorage.removeItem( MUTE_STORAGE_KEY );
		}
		if ( this.currentSpeechSynthesis && this.mute ) {
			this.currentSpeechSynthesis.cancel();
		}
	}

	public get footerHeight(){
		return this.sassVar.getNumeric( 'footer-height', this.el.nativeElement );
	}

	public constructor(
		private el: ElementRef<HTMLElement>,
		private activatedRoute: ActivatedRoute,
		private markdown: NgxMdService,
		private router: Router,
		private sassVar: SassVarService,
		headSizer: HeadSizerService
	 ) {
		super( headSizer );
		this.activatedRoute.params.subscribe( data => {
			this.tutoIdentifier = data.tutoName;
		} );
		this.sections = [];
	}

	private gotoFragment( fragment: string ){
		const section = _.find( this.sections, section => section.id === fragment );
		if ( !section ){
			throw new Error( `Could not find section with fragment "${fragment}"` );
		}
		this.currentSection = section;
	}
	private static getVMiddle( element: HTMLElement ) {
		return element.offsetTop +
		( element.offsetHeight / 2 );
	}

	private async awaitTutoContentInitialized(){
		let childNodes = this.tutoContent.nativeElement.childNodes;
		while ( childNodes.length === 0 ) {
			await new Promise( resolve => setTimeout( resolve, 0 ) );
			childNodes = this.tutoContent.nativeElement.childNodes;
		}
	}
	
	private getSections() {
		const childNodes = this.tutoContent.nativeElement.childNodes;
		this.sections = Array
			.from( childNodes )
			.filter( element => element instanceof HTMLElement && !( element instanceof HTMLHRElement ) ) as HTMLElement[];
	}

	public async ngOnInit() {
		this.mute = localStorage.getItem( MUTE_STORAGE_KEY ) === 'yes';
		this.autoPlay = false;

		this.markdown.renderer.link = ( href: string, title: string, text: string ) => {
			const isBlankTarget = href[0] === '!';
			const attrs = {
				title,
				href: isBlankTarget ? href.slice( 1 ) : href,
				target: isBlankTarget ? '_blank' : undefined,
			};
			const attrsStr = _.chain( attrs )
				.omitBy( _.isNil )
				.toPairs()
				.map( kv => `${kv[0]}="${kv[1]}"` )
				.join( ' ' )
				.value();
			return `<a ${attrsStr}>${text}</a>`;
		};
	}

	public async ngAfterViewInit() {
		await this.awaitTutoContentInitialized();
		this.sidenavContainer.autosize = true;
		this.getSections();
		this.resetTutorialContentIds();
		this.outliner.tutoContentSet.next( this.tutoComponent );
		setTimeout( () => {
			this.sidenavContainer.autosize = false;
		},          500 );

		// Load fragment 
		this.activatedRoute.fragment.subscribe( fragment => {
			this.gotoFragment( fragment );
		} );
	}

	private refreshScollAndCursor( target: HTMLElement | null, changeDirection: SectionChange ) {
		if ( !target ) {
			return;
		}
		this.sections.forEach( element => element.classList.remove( 'active' ) );
		target.classList.add( 'active' );
		const targetMiddle = TutorialsComponent.getVMiddle( target );
		
		this.cursor.nativeElement.style.opacity = '1';
		this.cursor.nativeElement.style.top =  ( targetMiddle - 25 / 2 ) + 'px';
		
		const tutoContentRect = this.scroller.nativeElement.getBoundingClientRect();

		if ( target.clientHeight <= this.tutoContainerHeight ){
			scrollIt( this.scroller.nativeElement, {top: targetMiddle - tutoContentRect.height / 2}, 500 );
		} else {
			if ( changeDirection === SectionChange.Next ){
				scrollIt( this.scroller.nativeElement, {top:target.offsetTop - MARGIN_SCROLL} );
			} else if ( changeDirection === SectionChange.Previous ){
				scrollIt( this.scroller.nativeElement, {top:target.offsetTop + target.clientHeight - this.tutoContainerHeight + MARGIN_SCROLL} );
			}
		}
	}

	public handleScroll( event: MouseWheelEvent | WheelEvent ) {
		const delta = event.type === 'wheel' ?
			- event.deltaY :
			event.wheelDelta / 120;

		if ( this.currentSection.clientHeight > this.tutoContainerHeight ){
			if ( delta >= SectionChange.Next ){ // Going upwards
				// Has space upwards
				if ( this.currentSection.offsetTop <= this.scroller.nativeElement.scrollTop + MARGIN_SCROLL ){
					return true;
				}
			} else if ( delta <= SectionChange.Previous ){ // Going downwards
				// Has space downwards
				if ( this.currentSection.offsetTop + this.currentSection.clientHeight >= this.scroller.nativeElement.scrollTop + this.tutoContainerHeight - MARGIN_SCROLL ){
					return true;
				}
			}
		}
		
		event.preventDefault();
		if ( delta >= SectionChange.Next ) {
			if ( this.sectionIndex > 0 ) {
				this.autoPlay = false;
				this.sectionIndex += SectionChange.Previous;
				return true;
			} else {
				console.warn( 'Can\'t go to previous section' );
			}
		} else if ( delta <= SectionChange.Previous ) {
			if ( this.sectionIndex < this.sections.length - 1 ) {
				this.autoPlay = false;
				this.sectionIndex += SectionChange.Next;
				return true;
			} else {
				console.warn( 'Can\'t go to next section' );
			}
		}
		return false;
	}

	private resetTutorialContentIds(){
		const sectionIndexes: number[] = [];
		let notHeadingIndex = 0;
		this.sections.forEach( section => {
			if ( section instanceof HTMLHeadingElement ){
				notHeadingIndex = 0;
				const headingLevel = parseInt( section.tagName.slice( 1 ) ) - 1;
				if ( headingLevel === 0 ){
					return;
				}
				if ( sectionIndexes.length < headingLevel ){
					sectionIndexes.push( 1 );
				} else if ( sectionIndexes.length > headingLevel ){
					sectionIndexes.pop();
				} else {
					sectionIndexes[sectionIndexes.length - 1]++;
				}

				section.id = `${( sectionIndexes.join( '-' ) )}>${section.innerText}`;
			} else {
				notHeadingIndex++;
				section.id = `${( sectionIndexes.join( '-' ) )}:${notHeadingIndex}`;
			}
		} );
	}

	public scollProgress( $event: MouseEvent ){
		var x = $event.pageX - this.progress.nativeElement.offsetLeft;
		var percent = x / this.progress.nativeElement.offsetWidth;
		
		this.sectionIndex = Math.floor( ( this.sections.length ) * percent );
	}

	@HostListener( 'window:keydown', ['$event'] )
	private scrollKeyboard( $event: KeyboardEvent ){
		switch ( $event.keyCode ){
			case 38:{ // Arrow up
				this.sectionIndex--;
				$event.preventDefault();
				return false;
			}

			case 40:{ // Arrow down
				this.sectionIndex++;
				$event.preventDefault();
				return false;
			}

			case 33:{ // Page up
				const found = _.findLastIndex(
					this.sections,
					section => section instanceof HTMLHeadingElement,
					this.sectionIndex - 1
				);
				if ( found === -1 ){
					throw new Error( 'Could not find previous heading' );
				}
				this.sectionIndex = found;
				$event.preventDefault();
				return false;
			}

			case 34:{ // Page down
				const found = _.findIndex(
					this.sections,
					section => section instanceof HTMLHeadingElement,
					this.sectionIndex + 1
				);
				if ( found === -1 ){
					throw new Error( 'Could not find next heading' );
				}
				this.sectionIndex = found;
				$event.preventDefault();
				return false;
			}
		}
	}
}
