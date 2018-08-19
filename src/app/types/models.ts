import { EFieldType } from '@diaspora/diaspora';
import { Raw } from '@diaspora/diaspora/dist/types/types/modelDescription';

export const apiDocAttributes: Raw.IAttributesDescription = {
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
	sources: {
		type: EFieldType.ARRAY,
		of: {
			type: EFieldType.OBJECT,
			attributes: {
				file: EFieldType.STRING,
				line: EFieldType.INTEGER,
			},
		},
		required: true,
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
};
