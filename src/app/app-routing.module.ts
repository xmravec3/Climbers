import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideosComponent } from './videos/videos.component';
import { DetailVideoComponent } from './detail-video/detail-video.component';
import { CompareComponent } from './compare/compare.component';

const routes: Routes = [
  { path: 'videos', component: VideosComponent },
  { path: '', redirectTo: "videos", pathMatch: 'full' },
  { path: 'video/:id', component: DetailVideoComponent },
  { path: 'compare/l_id/:l_id/r_id/:r_id', component: CompareComponent },
  { path: '**', redirectTo: "videos", pathMatch: 'full' } // ** is for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
