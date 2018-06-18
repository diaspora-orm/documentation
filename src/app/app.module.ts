import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgxMdModule } from 'ngx-md';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';
import { AppRoutingModule } from './/app-routing.module';
import { IOAreaComponent } from './pages/index/ioarea/ioarea.component';
import { SymbolComponent } from './pages/api/symbol/symbol.component';
import { FunctionSymbolComponent } from './pages/api/symbol/functionSymbol/function-symbol.component';
import { CallSignatureComponent } from './pages/api/symbol/functionSymbol/callSignature/call-signature.component';
import { ParameterComponent } from './pages/api/symbol/functionSymbol/callSignature/parameter/parameter.component';

@NgModule({
	declarations: [
		AppComponent,
		IndexComponent,
		ApiComponent,
		TutorialsComponent,
		IOAreaComponent,
		SymbolComponent,
		FunctionSymbolComponent,
		CallSignatureComponent,
		ParameterComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		NgxMdModule.forRoot(),
		ClipboardModule,
	],
	providers: [Title],
	bootstrap: [AppComponent]
})
export class AppModule { }
