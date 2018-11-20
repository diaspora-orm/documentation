import { ConverterOptions } from 'ngx-showdown';
import * as showdown from 'showdown' ;

import * as _ from 'lodash';

const AUTO_BLANK_ABSOLUTE_URI = true;

function absolute( base:string, relative:string ) {
	const stack = base.split( '/' );
	const parts = relative.split( '/' );
	stack.pop(); // remove current file name (or empty string)
	// (omit if "base" is the current folder without trailing slash)
	for ( var i=0; i < parts.length; i++ ) {
		if ( parts[i] == '.' ) {
			continue;
		}
		if ( parts[i] == '..' ) {
			stack.pop();
		}
		else {
			stack.push( parts[i] );
		}
	}
	return stack.join( '/' );
}

showdown.extension( 'targetlink', () => ( {
	type: 'lang',
	regex: /\[((?:\[[^\]]*?]|[^\[\]])*?)]\([ \t]*?<?!?(.*?(?:\(!?.*?\).*?)?)>?[ \t]*?((['"])(.*?)\4[ \t]*?)?\)/g,
	replace(
		wholematch: string,
		linkText: string,
		url: string,
		a: any,
		b: any,
		title: string,
		index: number,
		allText: string
	) {
		// Avoid transformations of images
		const prevChar = allText[index - 1];
		if ( prevChar === '!' ){
			return wholematch;
		}

		const attrs = {} as Dictionary<string>;
		const isAbsolute = url.startsWith( '/' ) || url.startsWith( 'http' );

		if ( isAbsolute && AUTO_BLANK_ABSOLUTE_URI ){
			attrs.target = '_blank';
		} else if ( url.startsWith( '!' ) ){
			attrs.target = '_blank';
			url = url.slice( 1 );
		}

		if ( url.startsWith( '#' ) ){
			attrs.href = `${ window.location.pathname }${ url }`;
		} else if ( url.startsWith( '.' ) ){
			attrs.href = absolute( window.location.pathname, url );
		} else if ( !isAbsolute ){
			attrs.href = `${ window.location.pathname }/${ url }`;
		} else{
			attrs.href = url;
		}

		const buttonTagMatch = linkText.match( /^\[(.*)\]$/ );
		if ( buttonTagMatch ){
			attrs['class'] = 'button';
			linkText = buttonTagMatch[1];
		}

		if ( typeof title != 'undefined' && title !== '' && title !== null ) {
			title = title.replace( /"/g, '&quot;' );
			attrs.title = title;
		}

		const attrsStr = _.chain( attrs )
			.toPairs()
			.map( ( [ key, value ] ) => `${key}="${value.replace( /"/g, '&quot;' )}"` )
			.join( ' ' )
			.value();
		return `<a ${attrsStr}>${linkText}</a>`;
	},
} ) );

export class MyConverterOptions extends ConverterOptions{
	public constructor(){
		super( { extensions: [
			'targetlink',
		] } );
	}
}
