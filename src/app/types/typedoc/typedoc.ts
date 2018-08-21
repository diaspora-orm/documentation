export enum SymbolKind {
	Root          = 0x0,
	Module        = 0x1,
	Namespace     = 0x2,
	Enum          = 0x4,
	EnumMember    = 0x10,
	Variable      = 0x20,
	Function      = 0x40,
	Class         = 0x80,
	Interface     = 0x100,
	Constructor   = 0x200,
	Property      = 0x400,
	Method        = 0x800,
	CallSignature = 0x1000,
	GetSignature  = 0x40000,
	Literal       = 0x200000,
	TypeAlias     = 0x400000,
}

// Raw TSDoc json file
export interface IComment{
	shortText?: string;
	text?: string;
	tags?: IComment.ITag[];
}
export namespace IComment{
	export interface ITag {
		tag: string;
		text: string;
	}
}




export interface ISource {
	fileName: string;
	line: number;
	character: number;
}

export type ParameterTypeDefinition = {
	type: 'intrinsic';
	name: string;
} | {
	type: 'array';
	elementType: ParameterTypeDefinition;
} | {
	type: 'union';
	types: ParameterTypeDefinition[];
} | {
	type: 'typeParameter';
	name: string;
	constraint?: ParameterTypeDefinition;
} | {
	type: 'reference';
	name: string;
	id?: number;
	typeArguments?: ParameterTypeDefinition[];
};

export interface IFlags{
	isExported?: true;
	isPrivate?: true;
	isProtected?: true;
	isStatic?: true;
}
export interface IGroup{
	title: string;
	kind: SymbolKind;
	children: number[];
}




export interface IDefinition{
	id:number;
	name:string;
	kind:SymbolKind;
	flags: IFlags;
	children?: IDefinition[];
	comment?: IComment;
	groups?: IGroup[];
	sources?: ISource[];
}
export interface IRootDefinition extends IDefinition{
	kind: SymbolKind.Root;
	children: IModuleDefinition[];
}
export interface IModuleDefinition extends IDefinition{
	kind: SymbolKind.Module;
	kindString: string;
	originalName: string;
	children: Array<( IFunctionDefinition | ISymbolDefinition ) & IDecoratorDef>;
}
export interface IFunctionDefinition extends IDefinition{
	kind: SymbolKind.Function;
	kindString?: string;
}
export interface ISymbolDefinition extends IDefinition {
	flags: IFlags;
	kind: SymbolKind;
	kindString: string;
	name: string;
	id: number;
	children?: Array<( IFunctionDefinition | ISymbolDefinition ) & IDecoratorDef>;
	signatures?: ICallSignatureDefinition[];
	parameters?: ISymbolDefinition[];
	typeParameter?: ParameterTypeDefinition[];
	extendedTypes?: ParameterTypeDefinition[];
	extendedBy?: ParameterTypeDefinition[];
	implementedTypes?: ISymbolDefinition[];
	typeArguments?: ParameterTypeDefinition[];
}
export interface ICallSignatureDefinition extends IDefinition{
	type?: ParameterTypeDefinition;
}
export interface IDecoratorDef{
	decorators: Array<{
		name: string;
		type: ParameterTypeDefinition;
		arguments?: {
			options?: string;
			value?: string;
		};
	}>;
}
export type Definition = IRootDefinition | IModuleDefinition | IFunctionDefinition | ( ISymbolDefinition & IDecoratorDef );
