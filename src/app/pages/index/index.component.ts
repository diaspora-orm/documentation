import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

/*declare function require(name: string): any;
import { DiasporaStatic } from '@diaspora/diaspora';
const Diaspora: DiasporaStatic = require('@diaspora/diaspora/dist/es5/diaspora.standalone.min.js');*/
// import { Diaspora } from '@diaspora/diaspora';
// const D = (require as any)('@diaspora/diaspora/dist/umd/diaspora.standalone.min.js');

import { IOAreaComponent } from './ioarea.component';

@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	@ViewChild(IOAreaComponent) private IOArea?: ElementRef<IOAreaComponent>;
	@ViewChild('storeStatus') private store?: ElementRef<HTMLTableElement>;

	private adapter = {
		store: {
			ToDo: {
				items: [
					{id: 1, title: 'Do the docs', status: true},
				],
			},
		},
	};

	private get storeContent() {
		return this.adapter.store.ToDo.items;
	}

	ngOnInit() {
	}
}
