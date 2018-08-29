import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';

import { VersionManagerService } from './../../services/version-manager/version-manager.service';
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

	public get latestVersion(){
		return this.VersionManagerService.latest;
	}

	public constructor( private VersionManagerService: VersionManagerService ){}

	public ngOnInit() {
	}
}
