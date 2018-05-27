import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgxMdComponent } from 'ngx-md';


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

@Component({
	selector: 'app-tutorials',
	templateUrl: './tutorials.component.html',
	styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {
	private static supportsSpeechSynthesis = typeof speechSynthesis !== 'undefined';
	private allowScroll = true;


	@ViewChild(NgxMdComponent) private tutoComponent?: NgxMdComponent;
	@ViewChild('scroller') private scroller?: ElementRef<HTMLElement>;
	@ViewChild('progress') private progress?: ElementRef<HTMLProgressElement>;
	@ViewChild('cursor') private cursor?: ElementRef<HTMLElement>;
	@ViewChild('autoPlayButton') private autoPlayButton?: ElementRef<HTMLButtonElement>;
	@ViewChild('playButton') private playButton?: ElementRef<HTMLButtonElement>;
	@ViewChild('fullScreenButton') private fullScreenButton?: ElementRef<HTMLButtonElement>;
	@ViewChild('muteButton') private muteButton?: ElementRef<HTMLButtonElement>;
	@ViewChild('presentation') private presentation?: ElementRef<HTMLElement>;
	private sections: HTMLElement[];
	private currentUtter: SpeechSynthesisUtterance | null = null;



	public get target() {
		return this.sectionIndex >= 0 ? this.sections[this.sectionIndex] : null;
	}
	private get tutoContent() {
		return this.tutoComponent ? ((this.tutoComponent as any)._el as ElementRef<HTMLElement>) : null;
	}


	private _sectionIndex = -1;
	public get sectionIndex() {return this._sectionIndex; }
	public set sectionIndex(index: number) {
		console.log('Change slide', index);
		if ( this.allowScroll ) {
			window.scrollTo(0, document.body.scrollHeight);
			// Set a timeout before which we won't be able to trigger a second scroll
			this.allowScroll = false;
			setTimeout(() => {
				this.allowScroll = true;
			}, 250 );

			console.log( `Changing slide from ${ this.sectionIndex } to ${ index }` );

			/*const wasAutoPlaying = this.autoPlay;
			// Prevent autoplay if scrolling back
			if()
			this._autoPlay = false;*/
			// Do scroll
			this._sectionIndex = index;
			// Restore autoplay status
			// this._autoPlay = wasAutoPlaying;

			this.refreshScollAndCursor( this.target );
			// Update progress infos
			const frac = (( index + 1 ) / this.sections.length );
			const percent = Math.round( frac * 1000 ) / 10;
			if (this.progress) {
				this.progress.nativeElement.value = percent;

				const inSpan = this.progress.nativeElement.querySelector('span');
				if (inSpan) {
					const percentWithSymbol = percent + '%';
					inSpan.innerText = percentWithSymbol;
					inSpan.style.width = percentWithSymbol;
				}
			}

			// Start speech synthesis
			if (this.autoPlay) {
				this.isPlaying = true;
			}

			// Finalize
			if (this.target) {
				location.hash = this.target.id;
			}
		}
	}

	private _autoPlay = false;
	public get autoPlay() {return this._autoPlay; }
	public set autoPlay(autoPlay: boolean) {
		if (this.autoPlayButton) {
			const icon = this.autoPlayButton.nativeElement.querySelector('.fa');
			if (icon) {
				const iconClassList = icon.classList;
				iconClassList.remove(autoPlay ? AutoPlayIcons.Enabled : AutoPlayIcons.Disabled );
				iconClassList.add(autoPlay ? AutoPlayIcons.Disabled : AutoPlayIcons.Enabled );
			}
		}
		this._autoPlay = autoPlay;
		this.isPlaying = autoPlay;
	}

	private _isPlaying = false;
	public get isPlaying() {return this._isPlaying; }
	public set isPlaying(isPlaying: boolean) {
		console.log('Setting isPlaying', isPlaying);
		if (this.playButton) {
			const icon = this.playButton.nativeElement.querySelector('.fa');
			if (icon) {
				const iconClassList = icon.classList;
				iconClassList.remove(isPlaying ? PlayIcons.Enabled : PlayIcons.Disabled );
				iconClassList.add(isPlaying ? PlayIcons.Disabled : PlayIcons.Enabled );
			}
		}
		const wasPlaying = this._isPlaying;
		this._isPlaying = isPlaying;
		if ( this.currentUtter && wasPlaying && !this.isPlaying ) {
			speechSynthesis.cancel();
		} else if (this.isPlaying) {
			// If this is our first trigger on index -1, delegate by setting the index @ 0, that will call play again
			if (this.sectionIndex === -1) {
				this.sectionIndex = 0;
			} else {
				// Start speech synthesis
				this.speechForElement( this.target ).then(() => {
					this.isPlaying = false;
				});
			}
		}
	}

	private _fullscreen = false;
	public get fullscreen() {return this._fullscreen; }
	public set fullscreen(fullscreen: boolean) {
		this._fullscreen = fullscreen;
		if ( this.fullScreenButton && this.presentation && this.fullscreen) {
			const requestFullscreen = (this.presentation.nativeElement as any).requestFullscreen ||
			(this.presentation.nativeElement as any).webkitRequestFullscreen ||
			(this.presentation.nativeElement as any).mozRequestFullScreen ||
			(this.presentation.nativeElement as any).msRequestFullscreen;
			if (requestFullscreen) {
				requestFullscreen.call(this.presentation.nativeElement);
			} else {
				console.error('Could not set fullscreen');
			}
		}
		this._fullscreen = false;
	}

	private _mute = true;
	public get mute() {return this._mute; }
	public set mute(mute: boolean) {
		if (this.muteButton) {
			const icon = this.muteButton.nativeElement.querySelector('.fa');
			if (icon) {
				const iconClassList = icon.classList;
				iconClassList.remove(mute ? VolumeIcons.Enabled : VolumeIcons.Disabled );
				iconClassList.add(mute ? VolumeIcons.Disabled : VolumeIcons.Enabled );
			}
		}
		this._mute = mute;
		if ( this.mute ) {
			localStorage.setItem( MUTE_STORAGE_KEY, 'yes' );
		} else {
			localStorage.removeItem( MUTE_STORAGE_KEY );
		}
		if ( this.currentUtter && this.mute ) {
			speechSynthesis.cancel();
		}
	}

	constructor(private el: ElementRef) {
		this.sections = [];
	}

	private static getTextFromDomElement(element: HTMLElement) {
		if (element.tagName.toUpperCase() === 'PRE' &&
			element.childNodes.length === 1 &&
			(element.childNodes[0] as HTMLElement).tagName.toUpperCase() === 'CODE'
		) {
			return (element.childNodes[0] as HTMLElement).getAttribute('title');
		}
		return element.textContent;
	}

	private static getVoice(lang?: string) {
		const defaultedLang = lang || 'en';
		const validVoices = speechSynthesis.getVoices().filter( voice => {
			return voice.lang.startsWith( defaultedLang );
		});
		return validVoices[0];
	}

	private static getVMiddle(element: HTMLElement) {
		return element.offsetTop +
		(element.offsetHeight / 2)/* +
		(element.parentElement ? element.parentElement.scrollTop : 0)*/;
	}

	private static scrollToVPos(target: any, vpos: number, scrollDuration: number) {
		const scrollHeight = window.scrollY;
		const scrollStep = Math.PI / ( scrollDuration / 15 );
		const cosParameter = scrollHeight / 2;
		let scrollCount = 0;
		let scrollMargin;
		const scrollInterval = setInterval( () => {
			if ( target.scrollY !== 0 ) {
				scrollCount = scrollCount + 1;
				scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
				window.scrollTo( 0, ( scrollHeight - scrollMargin ) );
			} else {
				clearInterval(scrollInterval);
			}
		}, 15 );
	}

	public async ngOnInit() {
		if (this.tutoContent) {
			let childNodes = this.tutoContent.nativeElement.childNodes;
			while (childNodes.length === 0) {
				await new Promise(resolve => setTimeout(resolve, 10));
				childNodes = this.tutoContent.nativeElement.childNodes;
			}
			this.sections = Array
			.from(childNodes)
			.filter(element => element instanceof HTMLElement) as HTMLElement[];
		}
		this.mute = localStorage.getItem( MUTE_STORAGE_KEY ) === 'yes';
		this.sectionIndex = -1;
		this.autoPlay = false;
	}

	private refreshScollAndCursor(target: HTMLElement | null) {
		if (!target) {
			return;
		}
		this.sections.forEach(element => element.classList.remove( 'active' ));
		target.classList.add( 'active' );
		const targetMiddle = TutorialsComponent.getVMiddle( target );
		if (this.cursor) {
			this.cursor.nativeElement.style.opacity = '1';
			this.cursor.nativeElement.style.top =  (targetMiddle - 25 / 2) + 'px';
		}
		if (this.scroller) {
			const tutoContentRect = this.scroller.nativeElement.getBoundingClientRect();
			this.scroller.nativeElement.scrollTop = targetMiddle - tutoContentRect.height / 2;
		}
	}

	private handleScroll(event: MouseWheelEvent) {
		event.preventDefault();
		const delta = event.wheelDelta / 120;
		if ( delta >= SectionChange.Next ) {
			if ( this.sectionIndex > 0 ) {
				this.sectionIndex += SectionChange.Previous;
				return true;
			} else {
				console.warn( 'Can\'t go to previous section' );
			}
		} else if ( delta <= SectionChange.Previous ) {
			if ( this.sectionIndex < this.sections.length - 1 ) {
				this.sectionIndex += SectionChange.Next;
				return true;
			} else {
				console.warn( 'Can\'t go to next section' );
			}
		}
		return false;
	}

	private speechForElement(element: HTMLElement | null) {
		speechSynthesis.cancel();
		this.currentUtter = null;
		return new Promise(resolve => {
			if (!element) {
				return resolve();
			}
			if ( TutorialsComponent.supportsSpeechSynthesis && !this._mute ) {
				const text = TutorialsComponent.getTextFromDomElement( element );
				if (text) {
					this.currentUtter = new SpeechSynthesisUtterance( text );
					this.currentUtter.voice = TutorialsComponent.getVoice( document.documentElement.lang );
					speechSynthesis.speak( this.currentUtter );
					return this.currentUtter.addEventListener( 'end', () => {
						this.currentUtter = null;
						if ( this.autoPlay ) {
							setTimeout( () => {
								this.sectionIndex += SectionChange.Next;
							}, 1000 );
						}
						return resolve(true);
					});
				}
			}
			return resolve(false);
		});
	}
}
