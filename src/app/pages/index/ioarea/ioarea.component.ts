import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as _ from 'lodash';

import { Diaspora, Entity, Set, DiasporaStatic, Model, Adapter } from '@diaspora/diaspora';


// tslint:disable-next-line:no-eval
const AsyncFunction = eval( 'Object.getPrototypeOf( async function(){} ).constructor' );
export interface ICodeLineDisplayed {
	code?: string;
	text: string;
	type: ECommandType;
}
export interface ICodeLineExecuted {
	code: string;
}
export type ICodeLine = ICodeLineDisplayed | ICodeLineExecuted;
const isCodeLineDisplayed = ( code: any ): code is ICodeLineDisplayed => code &&
	typeof code.text === 'string' &&
	typeof code.type === 'string' &&
	( typeof code.code === 'undefined' || typeof code.code === 'string' );

export enum ECommandType {
	SETUP = 'setup',
	ENTITY = 'entity',
	UPDATE = 'update',
	DELETE = 'delete',
	FIND = 'find',
}

export interface IRepl{
	command: string;
	response: string;
	errored: boolean;
}

const isCodeLineExecuted = ( item: ICodeLine ): item is ICodeLineExecuted => !_.isNil( item.code )  && _.isNil( ( item as any ).text );


@Component( {
	selector: 'app-ioarea',
	templateUrl: './ioarea.component.html',
	styleUrls: ['./ioarea.component.scss'],
} )
export class IOAreaComponent {
	private context = new Map<string, any>();

	public history: IRepl[] = [];

	public liveCodingText: string | null = null;
	public lines: ICodeLine[] = [];
	private resetInstruction: ICodeLineExecuted = {
		code: '',
	};
	private currentLineIndex = 0;
	private playing = true;

	private static symbolNames = new Map<Function, {name: string; apiDoc: string}>( [
		[DiasporaStatic, {name: 'Diaspora', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FDiasporaStatic'}],
		[Adapter.DataAccessLayer, {name: 'DataAccessLayer', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FAdapter%2FDataAccessLayer'}],
		[Entity, {name: 'Entity', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FEntity'}],
		[Set, {name: 'Set', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FSet'}],
		[Model, {name: 'Model', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FModel'}],
		[Adapter.Base.AAdapter, {name: 'AAdapter', apiDoc: '/api?symbolPath=@diaspora%2Fdiaspora%2FAdapter%2FBase%2FAAdapter'}],
	] );

	private async evalInContext( js: string ) {
		const [, varDeclaration, instruction] = js.match( /^(?:\s*(?:(?:const|var|let)\s+|this\.)([\w_]+)\s*=)?\s*((?:.|[\r\n])*)$/ );

		const instructionWithReturn = `return ${instruction}`;
		const fct = new AsyncFunction( ...this.context.keys(), instructionWithReturn );
		const retVal = await fct( ...this.context.values() );

		if ( retVal instanceof Error ){
			throw retVal;
		}
		if ( varDeclaration ){
			this.context.set( varDeclaration, retVal );
		}
		return retVal;
	}

	public static unmangleType( content: any ): {name: string; apiDoc?: string}{
		const symbolNamesIterable = IOAreaComponent.symbolNames.entries();
		for ( let [ctor, unmangleInfos] of symbolNamesIterable ) {
			if ( content.constructor == ctor ){
				return unmangleInfos;
			} else if ( content == ctor ){
				return {name: unmangleInfos.name + '.Ctor', apiDoc: unmangleInfos.apiDoc};
			} else if ( typeof ctor === 'function' && content instanceof ctor ){
				return unmangleInfos;
			}
		}
		return {name:content.constructor.name};
	}

	private getPointClass( code: ICodeLineDisplayed, index: number ) {
		return {
			['type-' + code.type]: true,
			active: index === this.currentLineIndex,
		};
	}

	public constructor( private http: HttpClient ) {
		// Make the HTTP request:
		this.http.get( '/assets/content/demo.json' )
		.subscribe( ( cnt: any ) => {
			this.lines = cnt as ICodeLine[];
			const lastInstruction = _.last( this.lines );
			if ( !lastInstruction || isCodeLineDisplayed( lastInstruction ) ) {
				throw new Error( 'Invalid reset code line' );
			}
			this.resetInstruction = lastInstruction;
			this.playLoop();
		} );
		( window as any ).Diaspora = Diaspora;
	}

	public ngOnInit() {
	}

	private async setFrame( frameNumber: number ) {
		const frameDiff = frameNumber - this.currentLineIndex;
		if ( frameDiff > 0 ) { // Going forward
			for ( let i = 0; i < frameDiff; i++ ) {
				const newCodeLine = this.lines[this.currentLineIndex];
				if ( newCodeLine ) {
					await this.doAction( newCodeLine as any );
				}
				this.currentLineIndex++;
			}
		} else if ( frameDiff < 0 ) { // Going backward
			await this.reset();
			await this.setFrame( frameNumber );
		} else if ( this.playing ) { // Replay
			await this.doAction( this.lines[this.currentLineIndex] as any );
		}
		this.playing = false;
	}

	private async eval( command: string ): Promise<{error: false; return: any} | {error: true; return: Error}> {
		try {
			return {
				error: false,
				return: await this.evalInContext( command ),
			};
		} catch ( e ) {
			console.error( 'Error in eval:', e );
			return {
				error: true,
				return: e,
			};
		}
	}

	private async reset(){
		await this.doAction( this.resetInstruction );
		this.currentLineIndex = -1;
		this.history = [];
		this.context = new Map<string, any>();
	}

	private isCodeLineExecuted = isCodeLineExecuted;


	private static stringifySub( item: any, depth: number ){
		const lines = IOAreaComponent.stringifyOutput( item, depth + 1 )
		.split( '\n' );
		return lines
			// Add an indent level to each line
			.map( ( s, index ) => index > 0 && index < lines.length - 1 ? `\t${s}` : s )
			.join( '\n' );
	}

	private static stringifyOutput( content: any, depth: number = 0 ): string {

		if ( _.isObject( content ) ) {
			if ( depth > 2 ) {
				return '<span class="t-o">[object]</span>';
			}
			if ( !_.isPlainObject( content ) ) {
				const unmangled = IOAreaComponent.unmangleType( content );
				const tag = unmangled.apiDoc ? 'a' : 'span';
				return `<${tag} class="t-c" ${unmangled.apiDoc ? `href="${unmangled.apiDoc}" target="_blank"` : ''}>${unmangled.name}</${tag}>(${IOAreaComponent.stringifySub( _.assign( {}, content ), depth )})`;
			} else {
				console.log( content );
				const str = _.chain( content )
					.toPairs()
					.filter( ( [key] ) => key[0] !== '_' )
					.map( ( [key, value] ) => `<span class="t-k">${key}</span>: ${IOAreaComponent.stringifySub( value, depth )}` )
					.join( ',\n' )
					.value();
				console.log( {content, str} );
				return str.length > 0 ? `{\n${str}\n}` : '{}';
			}
		} else if ( _.isUndefined( content ) ) {
			return '<span class="t-u">undefined</span>';
		} else if ( _.isNull( content ) ) {
			return '<span class="t-n">null</span>';
		} else {
			return JSON.stringify( content );
		}
	}



	private async doAction( codeLine: ICodeLineDisplayed ): Promise<false>;
	private async doAction( codeLine: ICodeLineExecuted ): Promise<true>;
	private async doAction( codeLine: ICodeLine ) {
		if ( isCodeLineExecuted( codeLine ) ) {
			const result = await this.eval( codeLine.code );
			return false;
		} else {
			const result = await this.eval( codeLine.code || codeLine.text );
			this.history.push( {
				command: codeLine.text,
				response: IOAreaComponent.stringifyOutput( result.return ),
				errored: result.error,
			} );
			this.history = this.history.slice( -4 );
			return true;
		}
	}

	private async playLoop() {
		while ( this.playing ) {
			const currentLine = this.lines[this.currentLineIndex];
			if ( !currentLine ) {
				return;
			}
			if ( isCodeLineExecuted( currentLine ) ) {
				await this.doAction( currentLine );
				this.currentLineIndex++;
			} else {
				await this.writeTextToLive( currentLine.text );
				if ( !this.playing ) {
					this.liveCodingText = null;
					return;
				}
				await new Promise( resolve => setTimeout( resolve, 500 ) );
				if ( !this.playing ) {
					this.liveCodingText = null;
					return;
				}

				this.liveCodingText = null;
				await this.doAction( currentLine );
				await new Promise( resolve => setTimeout( resolve, 1000 ) );
				if ( !this.playing ) {
					return;
				}

				this.currentLineIndex++;
			}
			if ( this.currentLineIndex === this.lines.length ) {
				this.history = [];
				this.currentLineIndex = 0;
			}
		}
	}

	private async writeTextToLive( text: string ) {
		this.liveCodingText = null;
		const textLength = text.length;
		let i = 0;
		return new Promise( resolve => {
			const loopInterval = setInterval( () => {
				if ( i === textLength || !this.playing ) {
					clearInterval( loopInterval );
					return resolve( true );
				}
				i++;
				this.liveCodingText = text.substr( 0, i );
			},                                50 );
		} );
	}
}
