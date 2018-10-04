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
		if ( !section ){
			throw new Error( `Could not find section with fragment "${fragment}"` );
		}
		this.currentSection = section;
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

	public async ngAfterViewInit() {
		await this.awaitTutoContentInitialized();
		this.sidenavContainer.autosize = true;
		const sections = this.getSections();
		const sectionsNewIds = this.resetTutorialContentIds( sections );
		this.currentSections = sectionsNewIds;
		console.log( {sections} );
		setTimeout( () => {
			this.sidenavContainer.autosize = false;
		},          500 );

		// Load fragment 
		this.activatedRoute.fragment.subscribe( fragment => {
			if ( fragment ){
				this.gotoFragment( fragment );
			}
		} );
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
