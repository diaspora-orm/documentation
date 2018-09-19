import { MarkdownViewerComponent } from './../markdown-viewer.component';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import * as _ from 'lodash';

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
	selector: 'app-markdown-reader',
	templateUrl: './markdown-reader.component.html',
	styleUrls: ['./markdown-reader.component.scss', '../markdown-viewer.component.scss'],
} )
export class MarkdownReaderComponent extends MarkdownViewerComponent implements OnInit {
	@ViewChild( 'scroller' ) private scroller!: ElementRef<HTMLElement>;
	@ViewChild( 'progress' ) private progress!: ElementRef<HTMLProgressElement>;
	@ViewChild( 'cursor' ) private cursor!: ElementRef<HTMLElement>;
	@ViewChild( 'autoPlayButton' ) private autoPlayButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'playButton' ) private playButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'fullScreenButton' ) private fullScreenButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'muteButton' ) private muteButton!: ElementRef<HTMLButtonElement>;
	@ViewChild( 'presentation' ) private presentation!: ElementRef<HTMLElement>;

	private allowScroll = true;
	private currentSpeechSynthesis: CustomSynthesis | null = null;



	public get target() {
		return this.sectionIndex >= 0 ? this.currentSections[this.sectionIndex] : null;
	}

	private get tutoContainerHeight(){
		return this.scroller.nativeElement.clientHeight;
	}


	public get sectionIndex(){
		return super.getSectionIndex();
	}
	public set sectionIndex( index: number ) {
		if ( index >= this.currentSections.length ) {
			return;
		}
		if ( this.allowScroll ) {
			// Set a timeout before which we won't be able to trigger a second scroll
			this.allowScroll = false;
			setTimeout( () => {
				this.allowScroll = true;
			},          SCROLL_COOLDOWN );

			const scrollDirection = index > this.sectionIndex ? SectionChange.Next : SectionChange.Previous;
			// Do scroll
			super.setSectionIndex( index );
			this.refreshScollAndCursor( this.target, scrollDirection );
			// Update progress infos
			const frac = this.currentSections.length === 0 ? 0 : ( ( index + 1 ) / this.currentSections.length );
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
				this.router.navigate( [], {fragment: this.target.id } );
			}
		}
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

	private refreshScollAndCursor( target: HTMLElement | null, changeDirection: SectionChange ) {
		if ( !target ) {
			return;
		}
		this.currentSections.forEach( element => element.classList.remove( 'active' ) );
		target.classList.add( 'active' );
		const targetMiddle = MarkdownReaderComponent.getVMiddle( target );
		
		this.cursor.nativeElement.style.opacity = '1';
		this.cursor.nativeElement.style.top =  ( targetMiddle - 25 / 2 ) + 'px';
		
		const tutoContentRect = this.scroller.nativeElement.getBoundingClientRect();

		if ( target.clientHeight <= this.tutoContainerHeight ){
			MarkdownReaderComponent.scrollIt( this.scroller.nativeElement, {top: targetMiddle - tutoContentRect.height / 2}, 500 );
		} else {
			if ( changeDirection === SectionChange.Next ){
				MarkdownReaderComponent.scrollIt( this.scroller.nativeElement, {top:target.offsetTop - MARGIN_SCROLL} );
			} else if ( changeDirection === SectionChange.Previous ){
				MarkdownReaderComponent.scrollIt( this.scroller.nativeElement, {top:target.offsetTop + target.clientHeight - this.tutoContainerHeight + MARGIN_SCROLL} );
			}
		}
	}

	public async ngOnInit() {
		this.mute = localStorage.getItem( MUTE_STORAGE_KEY ) === 'yes';
		this.autoPlay = false;

		/*this.markdown.renderer.link = ( href: string, title: string, text: string ) => {
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
		};*/
	}

	public handleScroll( event: MouseWheelEvent | WheelEvent ) {
		const delta = event.type === 'wheel' ?
			- event.deltaY :
			event.wheelDelta / 120;

		if ( this.currentSection && this.currentSection.clientHeight > this.tutoContainerHeight ){
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
		console.log( {sectionIndex: this.sectionIndex, sectionsCount: this.currentSections.length} );
		if ( delta >= SectionChange.Next ) {
			if ( this.sectionIndex > 0 ) {
				this.autoPlay = false;
				this.sectionIndex += SectionChange.Previous;
				return true;
			} else {
				console.warn( 'Can\'t go to previous section' );
			}
		} else if ( delta <= SectionChange.Previous ) {
			if ( this.sectionIndex < this.currentSections.length - 1 ) {
				this.autoPlay = false;
				this.sectionIndex += SectionChange.Next;
				return true;
			} else {
				console.warn( 'Can\'t go to next section' );
			}
		}
		return false;
	}

	public scollProgress( $event: MouseEvent ){
		var x = $event.pageX - this.progress.nativeElement.offsetLeft;
		var percent = x / this.progress.nativeElement.offsetWidth;
		
		this.sectionIndex = Math.floor( ( this.currentSections.length ) * percent );
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
					this.currentSections,
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
					this.currentSections,
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

	private static getVMiddle( element: HTMLElement ) {
		return element.offsetTop +
		( element.offsetHeight / 2 );
	}
}
