import { Component, Input, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NgxMdComponent } from 'ngx-md';

export interface IHeadingTree{
	text: string;
	level: number;
	link: string;
	children?: IHeadingTree[];
}

const headingsIterator = ( headings: HTMLHeadingElement[] ) => {
	let i = 0;
	
	return {
		next: () => headings[++i] as HTMLHeadingElement | undefined,
		current: () => headings[i] as HTMLHeadingElement | undefined,
		previous: () => headings[--i] as HTMLHeadingElement | undefined,
	};
};

@Component( {
	selector: 'app-outliner',
	templateUrl: './outliner.component.html',
	styleUrls: ['./outliner.component.scss'],
} )
export class OutlinerComponent {
	public tutoContentSet = new Subject<NgxMdComponent>();
	
	public headingTree: IHeadingTree[] | undefined;
	
	public constructor() {
		this.tutoContentSet.subscribe( this.loadTutoContent.bind( this ) );
	}
	
	private static buildTree(
		iterator: {
			next: () => HTMLHeadingElement | undefined;
			current: () => HTMLHeadingElement | undefined;
			previous: () => HTMLHeadingElement | undefined;
		},
		previousLevel = 0
	){
		const headingTree: IHeadingTree[] = [];
		let headingLevel: number = -1;
		let heading: HTMLHeadingElement | undefined;
		do{
			if ( heading = iterator.next() ){
				headingLevel = parseInt( heading.tagName.slice( 1 ) );
				
				if ( headingLevel > previousLevel ){
					headingTree.push( {
						text: heading.innerText,
						level: headingLevel,
						link: heading.id,
						children: OutlinerComponent.buildTree( iterator, headingLevel ),
					} );
				} else {
					iterator.previous();
				}
			}
		} while ( heading && headingLevel > previousLevel );
		return headingTree.length > 0 ? headingTree : undefined;
	}
	
	private loadTutoContent( tutoContent: NgxMdComponent ){
		const tutoHtmlElement = ( tutoContent as any as {_el: ElementRef<HTMLElement>} )._el.nativeElement;
		
		const headings = tutoHtmlElement.querySelectorAll<HTMLHeadingElement>( 'h1,h2,h3,h4,h5,h6' );
		
		const iterator = headingsIterator( Array.from( headings ) );
		this.headingTree = OutlinerComponent.buildTree( iterator );
	}
	
	public buildHeading( item: IHeadingTree ){
		const headingTag = `h${item.level}`;
		return `<${headingTag}>${item.text}</${headingTag}>`;
	}
}

