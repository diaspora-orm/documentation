import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgxMdComponent } from 'ngx-md';


export enum SectionChange {
	Next = 1,
	Previous = -1,
}

@Component({
	selector: 'app-tutorials',
	templateUrl: './tutorials.component.html',
	styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {
	private static supportsSpeechSynthesis = typeof speechSynthesis !== 'undefined';
	private static allowScroll = true;
	private static autoPlay = false;


	@ViewChild(NgxMdComponent) private tutoComponent?: NgxMdComponent;
	@ViewChild('progress') private progress?: ElementRef<HTMLProgressElement>;
	@ViewChild('cursor') private cursor?: ElementRef<HTMLElement>;
	private sections: HTMLElement[];
	private currentUtter: SpeechSynthesisUtterance | null = null;

	private isPlaying = false;
	private sectionIndex = -1;
	private soundEnabled = true;

	constructor(private el: ElementRef) {
		this.sections = [];
	}

	private static getTextFromDomElement(element: HTMLElement) {
		return element.textContent || '';
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

	public ngOnInit() {
		if (this.tutoContent) {
			this.sections = Array
			.from(this.tutoContent.nativeElement.childNodes)
			.filter(element => element instanceof HTMLElement && element.tagName.toLowerCase() === 'section') as HTMLElement[];
		}
	}

	public setFullScreen(fullScreen: boolean) {

	}

	public changeSlide( direction: SectionChange ) {
		console.log('Change slide', direction);
		if ( TutorialsComponent.allowScroll ) {
			window.scrollTo(0, document.body.scrollHeight);
			// Set a timeout before which we won't be able to trigger a second scroll
			TutorialsComponent.allowScroll = false;
			setTimeout(() => {
				TutorialsComponent.allowScroll = true;
			}, 250 );

			const newIndex = this.sectionIndex + direction;

			console.log( `Changing slide from ${ this.sectionIndex } to ${ newIndex }` );
			const target = this.sections[newIndex];
			// Do scroll
			this.refreshScollAndCursor( target );
			// Update progress infos
			const frac = (( newIndex + 1 ) / this.sections.length );
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

			// Call the subclass method
			this.doSlideTransition( newIndex, {
				fullScreen: false,
			});
			// Finalize
			this.sectionIndex = newIndex;

			// Start speech synthesis
			this.speechForElement( target );

			location.hash = target.id;
		}
	}

	private refreshScollAndCursor(target: HTMLElement) {
		this.sections.forEach(element => element.classList.remove( 'active' ));
		target.classList.add( 'active' );
		const targetMiddle = TutorialsComponent.getVMiddle( target );
		if (this.cursor) {
			this.cursor.nativeElement.style.opacity = '1';
			this.cursor.nativeElement.style.top =  (targetMiddle - 25 / 2) + 'px';
		}
		if (this.tutoContent) {
			const tutoContentRect = this.tutoContent.nativeElement.getBoundingClientRect();
			console.log('Scrolling:', {
				old: this.tutoContent.nativeElement.scrollTop,
				new: targetMiddle - tutoContentRect.height / 2
			});
			this.tutoContent.nativeElement.scrollTop = targetMiddle - tutoContentRect.height / 2;
		}
	}

	private handleScroll(event: MouseWheelEvent) {
		event.preventDefault();
		const delta = event.wheelDelta / 120;
		if ( delta >= SectionChange.Next ) {
			if ( this.sectionIndex > 0 ) {
				this.changeSlide(SectionChange.Previous );
				return true;
			} else {
				console.warn( 'Can\'t go to previous section' );
			}
		} else if ( delta <= SectionChange.Previous ) {
			if ( this.sectionIndex < this.sections.length - 1 ) {
				this.changeSlide( SectionChange.Next );
				return true;
			} else {
				console.warn( 'Can\'t go to next section' );
			}
		}
		return false;
	}

	private maybeAutoPlayNext() {
		this.currentUtter = null;
		if ( TutorialsComponent.autoPlay ) {
			setTimeout( () => {
				this.changeSlide(SectionChange.Next);
			}, 1000 );
		}
	}


	private doSlideTransition(
		newIndex: number,
		optionsHash: {
			fullScreen: boolean
		}
	): void {
	}

	private playAudioSection(optionsHash: {
		fullScreen: boolean,
	}): void {
	}






	private speechForElement(element: HTMLElement) {
		if ( this.playAudioSection( {
			fullScreen: false,
		})) {
			// Function call already done
		} else if ( TutorialsComponent.supportsSpeechSynthesis && this.soundEnabled ) {
			speechSynthesis.cancel();
			this.isPlaying = true;
			this.currentUtter = new SpeechSynthesisUtterance( TutorialsComponent.getTextFromDomElement( element ));
			this.currentUtter.voice = TutorialsComponent.getVoice( document.documentElement.lang );
			speechSynthesis.speak( this.currentUtter );
			this.currentUtter.addEventListener( 'end', () => {
				this.isPlaying = false;
				this.maybeAutoPlayNext();
			});
		}
	}
}
