import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {NgxPaginationModule} from 'ngx-pagination';  // how to https://www.youtube.com/watch?v=22lIbA53It4
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideosComponent } from './videos/videos.component';
import { DetailVideoComponent } from './detail-video/detail-video.component';
import { CompareComponent } from './compare/compare.component';
import { HttpClientModule } from '@angular/common/http';
import { ClimberFilterPipe } from './climber-filter.pipe';
import { DateFilterPipe } from './date-filter.pipe'

@NgModule({
  declarations: [
    AppComponent,
    VideosComponent,
    DetailVideoComponent,
    CompareComponent,
    ClimberFilterPipe,
    DateFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
