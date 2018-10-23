export interface IRelatedIssue{
	title: string;
	issueId: number;
	issueType: 'pr' | 'issue';
	status: 'finished' | 'doing' | 'todo';
}

export interface IRoadmapItem{
	version: string;

	/**
	 * Should be either the target date itself or a string labeling the target period
	 */
	plannedDate: Date | string;

	title: string;

	description: string;

	related?: IRelatedIssue[];
}

export const content = {
	docsVersions: /* <doc-versions> */['0.3.0-alpha.13']/* </doc-versions> */,
	tutorials: /* <tutorials> */{
		'simple-todo-app': 'Simple ToDo app',
		Darling : 'Le best',
	}, /* </tutorials> */
	guides: /* <guides> */{
		'getting-started': 'Getting started',
		'query-language': 'Query Language',
		'events-in-diaspora' : 'Events in Diaspora',
		'create-an-adapter': 'Create an adapter',
		glossary: 'Glossary',
	}, /* </guides> */
	roadmap: [
		{ version: '0.4.0', plannedDate: new Date( 2018, 11, 1 ), title: 'Advanced query language', description: 'Add more operators to the query language, including boolean operators ($and / &&, $or / ||, $xor / ^^), list checking ($in), case-insensitive text match/search, etc etc...'},
	] as IRoadmapItem[],
};
