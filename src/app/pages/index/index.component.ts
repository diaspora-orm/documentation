import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';

/*declare function require(name: string): any;
import { DiasporaStatic } from '@diaspora/diaspora';
const Diaspora: DiasporaStatic = require('@diaspora/diaspora/dist/es5/diaspora.standalone.min.js');*/

import { IOAreaComponent } from './ioarea/ioarea.component';
import { Diaspora } from '@diaspora/diaspora';

@Component( {
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss'],
} )
export class IndexComponent implements OnInit {
	@ViewChild( IOAreaComponent ) private IOArea?: ElementRef<IOAreaComponent>;
	@ViewChild( 'storeStatus' ) private store?: ElementRef<HTMLTableElement>;
	@ViewChild( 'installCmd' ) private installCmd?: ElementRef<HTMLPreElement>;

	public get storeContent() {
		return _.get( Diaspora, 'dataSources.mySource.adapter.store.ToDo.items', false );
	}

	public ngOnInit() {
	}
}
