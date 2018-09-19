import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ShowdownDirective } from 'ngx-showdown';

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
export class OutlinerComponent implements OnInit {
	@Input() public sections?: BehaviorSubject<HTMLElement[]>;
	
	public headingTree: IHeadingTree[] | undefined;
	
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
	
	private retrieveHeadings( sections: HTMLElement[] ){		
		const headings = sections.filter( section => section instanceof HTMLHeadingElement ) as HTMLHeadingElement[];
		
		const iterator = headingsIterator( headings );
		this.headingTree = OutlinerComponent.buildTree( iterator );
	}
	
	public buildHeading( item: IHeadingTree ){
		const headingTag = `h${item.level}`;
		return `<${headingTag}>${item.text}</${headingTag}>`;
	}

	public ngOnInit(){
		if ( this.sections ){
			this.sections.subscribe( sections => this.retrieveHeadings( sections ) );
		} else {
			console.warn( 'Could not get BehaviorSubject for tutorial sections' );
		}
	}
}

