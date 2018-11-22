import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSidenavContainer } from '@angular/material';
import { ShowdownDirective } from 'ngx-showdown';
import { BehaviorSubject } from 'rxjs';

import * as _ from 'lodash';

import { OutlinerComponent } from './outliner/outliner.component';
import { HeadSizerService } from './../../services/head-sizer/head-sizer.service';
import { AHeaderSizedComponent } from '../../header-sized-component';
import { SassVarService } from '../../services/sass-var/sass-var.service';


const childNodesToHtmlElementArray = <T extends Node>( childNodes: NodeListOf<T> ) => Array.from( childNodes )
	.filter( element => element instanceof HTMLElement &&
		element.innerHTML &&
		!( element instanceof HTMLHRElement )
	) as any[] as HTMLElement[];

@Component( {
	selector: 'app-markdown-viewer',
	templateUrl: './markdown-viewer.component.html',
	styleUrls: ['./markdown-viewer.component.scss'],
} )
export class MarkdownViewerComponent extends AHeaderSizedComponent implements AfterViewInit {
	@ViewChild( MatSidenavContainer ) public sidenavContainer!: MatSidenavContainer;
	@ViewChild( OutlinerComponent ) private outliner!: OutlinerComponent;
	@ViewChild( ShowdownDirective ) private tutoComponent!: ShowdownDirective;

	private contentIdentifier?: string;
	private contentRoot?: string;
	public get contentUrl(){
		if ( typeof this.contentIdentifier !== 'string' || typeof this.contentRoot !== 'string' ){
			return undefined;
		}
		return `/assets/content/${this.contentRoot}/${this.contentIdentifier}.md`;
	}


	private _sectionIndex = -1;
	public get sectionIndex() {return this.getSectionIndex(); }
	public set sectionIndex( index: number ) {
		this.setSectionIndex( index );
	}
	protected setSectionIndex( index: number ){
		if ( index >= this.currentSections.length ) {
			return;
		}

		if ( index === 0 || this.sectionIndex === 0 ){
			this.headSizer.atTopEnabled = index === 0;
		}

		// Do scroll
		this._sectionIndex = index;
	}
	protected getSectionIndex(){
		return this._sectionIndex;
	}


	public sections = new BehaviorSubject<HTMLElement[]>( [] );
	protected get currentSections(){
		return this.sections.value;
	}
	protected set currentSections( sections: HTMLElement[] ){
		this.sections.next( sections );
	}

	public section = new BehaviorSubject<HTMLElement | undefined>( undefined );
	public get currentSection(){
		return this.section.value;
	}
	public set currentSection( section: HTMLElement | undefined ){
		this.section.next( section );
	}
	private get tutoContent() {
		return ( this.tutoComponent as any )._elementRef as ElementRef<HTMLElement>;
	}


	public get footerHeight(){
		return this.sassVar.getNumeric( 'footer-height', this.el.nativeElement );
	}

	public constructor(
		private el: ElementRef<HTMLElement>,
		private activatedRoute: ActivatedRoute,
		//private markdown: ShowdownService,
		protected router: Router,
		private sassVar: SassVarService,
		headSizer: HeadSizerService
	 ) {
		super( headSizer );
		this.activatedRoute.params.subscribe( data => {
			this.contentIdentifier = data.mdUrl;
			if ( this.hasViewInited ){
				while ( this.tutoContent.nativeElement.firstChild ){
					this.tutoContent.nativeElement.removeChild( this.tutoContent.nativeElement.firstChild );
				}
				this.resetMdContent();
			}
		} );
		this.activatedRoute.data.subscribe( data => {
			this.contentRoot = data.root;
		} );
		let skip = true;
		this.section.subscribe( newSection => {
			if ( skip ){
				skip = false;
				return;
			}
			this.sectionIndex = _.indexOf( this.currentSections, newSection );
		} );
	}

	private gotoFragment( fragment: string ){
		// Check if the transition was already done (when scrolling)
		if ( this.section.value && this.section.value.id === fragment ){
			return;
		}

		const section = _.find( this.currentSections, section => section.id === fragment );
		if ( section ){
			this.currentSection = section;
		} else if ( !this.enableTabs( fragment ) ){
			throw new Error( `Could not find section with fragment "${fragment}"` );
		}
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
		return Array
			.from( childNodes )
			.filter( element => element instanceof HTMLElement &&
				element.innerHTML &&
				!( element instanceof HTMLHRElement )
			) as HTMLElement[];
	}

	private enableTabs( ref: string ){

		window.location.hash = ref;
		const matchingTabs = this.tutoContent.nativeElement.querySelectorAll( `.tab[data-ref="${ref}"]` );
		Array.from( matchingTabs )
			.forEach( tab => {
				if ( !tab.parentElement ){
					return;
				}
				const head = tab.parentElement.previousElementSibling;
				if ( !head || !head.classList.contains( 'tabs-head' ) ){
					return;
				}

				// Disable sibling
				const activesTab = tab.parentElement.querySelectorAll( '.tab.active' );
				if ( activesTab && activesTab.length > 0 ){
					Array.from( activesTab ).forEach( active => active.classList.remove( 'active' ) );
				}
				// Enable it
				tab.classList.add( 'active' );

				// Header
				const allHead = head.querySelectorAll( '.button' );
				if ( allHead && allHead.length > 0 ){
					Array.from( allHead ).forEach( head => head.classList.add( 'button-outline' ) );
				}
				const enabledHead = head.querySelector( `[data-ref="${ref}"]` );
				if ( enabledHead ){
					enabledHead.classList.remove( 'button-outline' );
				}
			} );
		return matchingTabs.length > 0;
	}

	private buildTabs(){
		Array.from( this.tutoContent.nativeElement.querySelectorAll( '.tabs' ) ).forEach( tabs => {
			const tabItems = tabs.querySelectorAll( '.tab' );
			const head = document.createElement( 'ul' );

			const tabItemsWithTitle = _.chain( Array.from( tabItems ) )
				.map( tabItem => ( {tabItem, title: tabItem.querySelector( 'h1,h2,h3,h4,h5,h6' )} ) ).value();
			head.innerHTML = tabItemsWithTitle
				.map( tabItemCouple => ( {
					title: tabItemCouple.title && tabItemCouple.title.textContent || '...',
					ref: tabItemCouple.tabItem.getAttribute( 'data-ref' ) || '',
				} ) )
				.map( head => `<li class="button button-outline" data-ref="${head.ref}">${head.title}</li>` )
				.join( '' );

			childNodesToHtmlElementArray( head.childNodes )
				.forEach( headItem => headItem.addEventListener( 'click', () => {
					const ref = headItem.getAttribute( 'data-ref' ) || '';
					this.enableTabs( ref );
				} ) );
			head.classList.add( 'tabs-head' );
			this.tutoContent.nativeElement.insertBefore( head, tabs );

			if ( tabItemsWithTitle[0] ){
				tabItemsWithTitle[0].tabItem.classList.add( 'active' );
			}
		} );
	}

	private hasViewInited = false;
	private fragment = '';
	public async ngAfterViewInit() {
		this.hasViewInited = true;
		this.resetMdContent();

		// Load fragment
		this.activatedRoute.fragment.subscribe( fragment => {
			if ( fragment ){
				this.fragment = fragment;
				this.gotoFragment( fragment );
			}
		} );
	}

	public async resetMdContent(){
		console.log( 'resetMdContent' );

		await this.awaitTutoContentInitialized();
		this.sidenavContainer.autosize = true;

		this.buildTabs();

		const sections = this.getSections();
		const sectionsNewIds = this.resetTutorialContentIds( sections );
		this.currentSections = sectionsNewIds;
		setTimeout( () => {
			this.sidenavContainer.autosize = false;
		},          500 );

		if ( this.fragment ){
			this.gotoFragment( this.fragment );
		}
	}

	private resetTutorialContentIds( sections: HTMLElement[] ){
		const sectionIndexes: number[] = [];
		let notHeadingIndex = 0;
		return sections.map( section => {
			if ( section instanceof HTMLHeadingElement ){
				notHeadingIndex = 0;
				const headingLevel = parseInt( section.tagName.slice( 1 ) ) - 1;
				if ( headingLevel === 0 ){
					return section;
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
			return section;
		} );
	}

	protected static scrollIt( target: HTMLElement | Window, destination: MarkdownViewerComponent.IScrollDest, duration = 500 ){
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
	}
}

export namespace MarkdownViewerComponent{
	export interface IScrollDest{
		top?: number;
		left?: number;
	}
}
