import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { ShowdownModule } from 'ngx-showdown';
import { ClipboardModule } from 'ngx-clipboard';
import { LazyRenderModule } from 'angular-lazy-render';
import { CookieLawModule } from 'angular2-cookie-law';
import { MatSidenavModule } from '@angular/material';

import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';
import { AppRoutingModule } from './/app-routing.module';
import { IOAreaComponent } from './pages/index/ioarea/ioarea.component';
import { SymbolComponent } from './pages/api/symbol/symbol.component';
import { FunctionSymbolComponent } from './pages/api/symbol/functionSymbol/function-symbol.component';
import { CallSignatureComponent } from './pages/api/symbol/functionSymbol/callSignature/call-signature.component';
import { StringifyPipe } from './pipes/stringify/stringify.pipe';
import { ParsePipe } from './pipes/parse/parse.pipe';
import { PairsPipe } from './pipes/pairs/pairs.pipe';
import { KeysPipe } from './pipes/keys/keys.pipe';
import { SidebarComponent } from './pages/api/sidebar/sidebar.component';
import { TypeComponent } from './pages/api/symbol/type/type.component';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { SectionComponent } from './pages/api/sidebar/section/section.component';
import { OutlinerComponent } from './pages/tutorials/outliner/outliner.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule( {
	declarations: [
		AppComponent,
		IndexComponent,
		ApiComponent,
		TutorialsComponent,
		IOAreaComponent,
		SymbolComponent,
		FunctionSymbolComponent,
		CallSignatureComponent,
		StringifyPipe,
		ParsePipe,
		PairsPipe,
		KeysPipe,
		SidebarComponent,
		TypeComponent,
		CookieConsentComponent,
		SectionComponent,
		OutlinerComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		ShowdownModule,
		ClipboardModule,
		LazyRenderModule,
		BrowserAnimationsModule,
		FormsModule,
		MatSidenavModule,
		HttpClientModule,
	],
	providers: [Title],
	bootstrap: [AppComponent],
} )
export class AppModule { }
