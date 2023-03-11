import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GoogleChartsModule } from 'angular-google-charts';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GoogleChartsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
