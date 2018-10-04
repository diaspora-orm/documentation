import { MarkdownReaderComponent } from './pages/markdown-viewer/markdown-reader/markdown-reader.component';
import { environment } from './../environments/environment';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { MarkdownViewerComponent } from './pages/markdown-viewer/markdown-viewer.component';


export const routes: Routes = [
	{ path: '', component: IndexComponent, data: { title: 'Home' } },
	{ path: 'api', component: ApiComponent, data: { title: 'API' }  },
	{ path: 'api/*path', component: ApiComponent, data: { title: 'API' }  },
	{ path: 'tutorials/:mdUrl', component: MarkdownReaderComponent, data: { root: 'tutorials', title: 'Tutorials' } },
	{ path: 'guides/:mdUrl', component: MarkdownViewerComponent, data: { root: 'guides', title: 'Guides' } },
];

@NgModule( {
	imports: [ RouterModule.forRoot(
		routes,
		{ enableTracing: !environment.production && false }
	) ],
	exports: [ RouterModule ],
} )
export class AppRoutingModule {}
