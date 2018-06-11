import { Injectable } from '@angular/core';

import { Diaspora, Model, Entities } from '@diaspora/diaspora';

@Injectable({
	providedIn: 'root'
})
export class ApiDocService {
	private readonly _ApiDoc: Model;

	public get ApiDoc() {
		return this._ApiDoc;
	}

	constructor() {
		(window as any).Diaspora = Diaspora;
		Diaspora.createNamedDataSource('memory', 'inMemory');
		this._ApiDoc = Diaspora.declareModel('ApiDoc', {
			sources: 'memory',
			attributes: {
				exported: 'boolean',
				kind: 'integer',
				name: 'string',
				identifier: 'integer',
				summary: 'string',
				source: {
					type: 'object',
					/*
					attributes: {
						file: 'string',
						line: 'number',
					},
					*/
				},
				ancestor: 'number',
				hasChildren: 'boolean',
				signature: 'object',
			},
		});
	}
}
