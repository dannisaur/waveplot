import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WaveformComponent } from './waveform/waveform.component';
import { HttpClientModule } from '@angular/common/http';
// import { selection } from 'd3-selection'
// import { transition } from 'd3-transition';

@NgModule({
  declarations: [
    AppComponent,
    WaveformComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule
    // selection, transition
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
