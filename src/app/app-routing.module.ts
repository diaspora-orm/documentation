import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';


const routes: Routes = [
	{ path: '', component: IndexComponent, data: { title: 'Home' } },
	{ path: 'api', component: ApiComponent, data: { title: 'API' } },
	{ path: 'tutorials/:tutoName', component: TutorialsComponent, data: { title: 'Tutorials' } },
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}
