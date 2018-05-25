import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IndexComponent } from './pages/index/index.component';
import { ApiComponent } from './pages/api/api.component';
import { TutorialsComponent } from './pages/tutorials/tutorials.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    ApiComponent,
    TutorialsComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
