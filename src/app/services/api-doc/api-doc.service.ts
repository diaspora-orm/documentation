import { VersionManagerService } from './../version-manager/version-manager.service';
import { Definition } from './../../types/typedoc/typedoc';
import { ParameterTypeDefinition, SymbolKind, ISymbolDefinition, IFunctionDefinition, IModuleDefinition, IDefinition, IRootDefinition } from './../../types/typedoc/typedoc';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Diaspora, Model, Entity, EFieldType } from '@diaspora/diaspora';
import * as _ from 'lodash';





export interface ISymbolDef {
	exported: boolean;
	visibility: 'private' | 'protected' | 'public';
	kind: SymbolKind;
	name: string;
	generic: boolean;
	identifier: number;
	summary?: string;
	comment?: string;
	source?: {
		file: string;
		line: number;
		module: boolean;
	};
	isClassMember?: boolean;
	ancestor?: number;
	hasChildren: boolean;
	inheritedFrom?: Object;
	type?: ParameterTypeDefinition;
	typeParameter: ParameterTypeDefinition[] | undefined;
	canonicalPath: string;
}

export const symbolClass = {
	[SymbolKind.Module]: 'tsd-kind-module',
	[SymbolKind.Namespace]: 'tsd-kind-module',
	[SymbolKind.Enum]: 'tsd-kind-enum',
	[SymbolKind.EnumMember]: 'tsd-kind-enum-member',
	[SymbolKind.Variable]: 'tsd-kind-variable',
	[SymbolKind.Function]: 'tsd-kind-function',
	[SymbolKind.Class]: 'tsd-kind-class',
	[SymbolKind.Interface]: 'tsd-kind-interface',
	[SymbolKind.Constructor]: 'tsd-kind-constructor',
	[SymbolKind.Property]: 'tsd-kind-property',
	[SymbolKind.Method]: 'tsd-kind-method',
	[SymbolKind.CallSignature]: '',
	[SymbolKind.GetSignature]: 'tsd-kind-get-signature',
	[SymbolKind.Literal]: 'tsd-kind-object-literal',
	[SymbolKind.TypeAlias]: 'tsd-kind-type-alias',
};

export const symbolLabel = {
	[SymbolKind.Module]: 'Module',
	[SymbolKind.Namespace]: 'Namespace',
	[SymbolKind.Enum]: 'Enumeration',
	[SymbolKind.EnumMember]: 'Enumeration member',
	[SymbolKind.Variable]: 'Variable',
	[SymbolKind.Function]: 'Function',
	[SymbolKind.Class]: 'Class',
	[SymbolKind.Interface]: 'Interface',
	[SymbolKind.Constructor]: 'Constructor',
	[SymbolKind.Property]: 'Property',
	[SymbolKind.Method]: 'Method',
	[SymbolKind.CallSignature]: 'Call signature',
	[SymbolKind.GetSignature]: 'Accessor',
	[SymbolKind.Literal]: 'Literal',
	[SymbolKind.TypeAlias]: 'Type alias',
};




// Utility regex
const LinkRegexp = /{@link\s+(\S+)(?:\s+(.+?))?}/;
const LinkRegexpG = new RegExp( LinkRegexp, 'g' );
const API_DATA_SOURCE_NAME = 'apiStore';


@Injectable( {
	providedIn: 'root',
} )
export class ApiDocService {
	private readonly _ApiDoc: Model<ISymbolDef>;

	public get ApiDoc() {
		return this._ApiDoc;
	}
	public ApiDocVersionName(){
		return 'ApiDoc-' + this.versionManager.version;
	}

	public constructor( private http: HttpClient, private versionManager: VersionManagerService ) {
		( window as any ).Diaspora = Diaspora;
		Diaspora.createNamedDataSource( API_DATA_SOURCE_NAME, versionManager.allowUseLocalStorage ? 'webStorage' : 'inMemory' );
		this._ApiDoc = Diaspora.declareModel<ISymbolDef>( this.ApiDocVersionName(), {
			sources: API_DATA_SOURCE_NAME,
			attributes: {
				exported: EFieldType.BOOLEAN,
				kind: EFieldType.INTEGER,
				name: EFieldType.STRING,
				generic: EFieldType.BOOLEAN,
				identifier: EFieldType.INTEGER,
				visibility:{
					type: EFieldType.STRING,
					enum: ['private', 'protected', 'public'],
					required: true,
				},
				summary: EFieldType.STRING,
				comment: EFieldType.STRING,
				source: {
					type: EFieldType.OBJECT,
					attributes: {
						file: EFieldType.STRING,
						line: EFieldType.INTEGER,
					},
				},
				isClassMember: EFieldType.BOOLEAN,
				inheritedFrom: EFieldType.OBJECT,
				ancestor: EFieldType.INTEGER,
				hasChildren: EFieldType.BOOLEAN,
				signature: EFieldType.OBJECT,
				type: EFieldType.OBJECT,
				typeParameter: EFieldType.ARRAY,
				canonicalPath: {
					type: EFieldType.STRING,
					required: true,
				},
			},
		} );
	}

	private static getSource( symbol: Definition ) {
		if ( symbol.kind === SymbolKind.Root || symbol.kind === SymbolKind.Function || !symbol.sources || symbol.sources.length === 0 ) {
			return;
		}
		const source = symbol.sources[0];

		const moduleMatcher = /^.+\/node_modules\/([^\/]+).*$/;
		const isModule = source.fileName.match( moduleMatcher ) ? true : false;
		const sourceFile = isModule ? source.fileName.replace( moduleMatcher, '$1' ) : source.fileName;
		return {
			file: sourceFile,
			line: source.line,
			module: isModule,
		};
	}

	private static getSummary( symbol: Definition ) {
		if ( symbol.comment ){
			if ( symbol.comment.shortText ){
				return symbol.comment.shortText;
			} else if ( symbol.comment.text ){
				return symbol.comment.text;
			}
		}
		return undefined;
	}
	private static getComment( symbol: Definition ) {
		if ( symbol.comment ){
			return symbol.comment.text || symbol.comment.shortText;
		}
		return undefined;
	}
	private static getVisibility( symbol: Definition ) {
		if ( symbol.flags.isPrivate ){
			return 'private';
		} else if ( symbol.flags.isProtected ){
			return 'protected';
		} else{
			return 'public';
		}
	}

	private static filterMarkdownLink( text?: string ){
		if ( !text ){
			return undefined;
		}
		const matches = text.match( LinkRegexpG );
		if ( !matches ) {
			return text;
		}
		_.forEach( matches, match => {
			const subMatch = match.match( LinkRegexp );
			if ( subMatch ) {
				const linkedSymbol = subMatch[1];
				const linkText = subMatch[2] || linkedSymbol;
				text = ( text as string ).replace( match, `[${linkText}](${linkedSymbol})` );
			}
		} );
		return text;
	}

	private static transformSymbol( symbol: Definition, ancestor?: ISymbolDef ): ISymbolDef {
		const ancestorId = ancestor ? ancestor.identifier : undefined;

		return {
			exported: symbol.flags.isExported || false,
			kind: symbol.kind,
			name: symbol.name,
			identifier: symbol.id,
			visibility: this.getVisibility( symbol ),
			inheritedFrom: ( symbol as any ).inheritedFrom,
			generic: 'typeParameter' in symbol,
			summary: this.filterMarkdownLink( this.getSummary( symbol ) ),
			comment: this.filterMarkdownLink( this.getComment( symbol ) ),
			source: this.getSource( symbol as any ),
			ancestor: ancestorId,
			isClassMember: ancestor && ancestor.kind === SymbolKind.Class,
			hasChildren: symbol.children && symbol.children.length > 0,
			type: ( symbol as any ).type,
			typeParameter: ( symbol as any ).typeParameter,
			canonicalPath: ( ancestor ? ancestor.canonicalPath + '/' : '' ) + symbol.name,
		} as ISymbolDef;
	}

	private static flattenTransformSymbols( symbol: IDefinition, ancestor?: ISymbolDef ): ISymbolDef[] {
		if ( !symbol ) {
			return [];
		}
		return _.chain( symbol.children || [] )
		.concat( ( symbol as any ).signatures || [] )
		.concat( ( symbol as any ).parameters || [] )
		.reduce(
			( acc, item ) => acc.concat( this.flattenTransformSymbols( item, acc[0] ) ),
			[this.transformSymbol( symbol as any, ancestor )]
		).orderBy( 'identifier' ).value();
	}


	private async loadJsonFile( fileUrl: string ) {
		await this.ApiDoc.deleteMany( {} );

		// Make the HTTP request:
		const data = await this.http
		.get<IRootDefinition>( fileUrl )
		.toPromise();

		_.assign( window, {rawData: data, _} );
		const items = ApiDocService.flattenTransformSymbols( data );
		const insertedSet = await this.ApiDoc.insertMany( items );
		console.log( {rawJson: data, transformed: items, insertedSet: insertedSet} );
		return this.ApiDoc;
	}

	public async loadData(){
		const indexItem = localStorage.getItem( this.ApiDocVersionName() );
		if ( this.versionManager.allowUseLocalStorage && indexItem !== null && indexItem.indexOf( ',' ) > -1 ){
			console.info( `Using localStorage data for v${this.versionManager.version}` );
			return this.ApiDoc;
		} else {
			console.info( `Downloading API's JSON for v${this.versionManager.version}` );
			return this.loadJsonFile( `/assets/content/api/${this.versionManager.version}.json` );
		}
	}
}
