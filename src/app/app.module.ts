import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgxMdModule } from 'ngx-md';

import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';
import { AppRoutingModule } from './/app-routing.module';

@NgModule({
	declarations: [
		AppComponent,
		IndexComponent,
		ApiComponent,
		TutorialsComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		NgxMdModule.forRoot(),
	],
	providers: [Title],
	bootstrap: [AppComponent]
})
export class AppModule { }
