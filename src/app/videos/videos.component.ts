import { Component, OnInit } from '@angular/core';
import { Climber, VideoBasic, VideoService } from '../repositories/video.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.less']
})
export class VideosComponent implements OnInit {
  public videos : VideoBasic[] = [];
  climbers: Climber[] = [{ID: -1, name: this.utils.ALL_RECORDS}];
  dates: any[] = [{ date: this.utils.ALL_RECORDS }];

  climberID_1: number = -1;
  date_1: string = this.utils.ALL_RECORDS;
  page_1: number = 1;

  climberID_2: number = -1;
  date_2: string = this.utils.ALL_RECORDS;
  page_2: number = 1;

  constructor(
    private _videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router,
    public utils: UtilsService
  ) {}


  ngOnInit() {
    this.climberID_1 = Number(this.route.snapshot.queryParamMap.get('climberID')) || -1;
    this.date_1 = (this.route.snapshot.queryParamMap.get('date')) ? String(this.route.snapshot.queryParamMap.get('date')) : this.utils.ALL_RECORDS;
    this.page_1 = Number(this.route.snapshot.queryParamMap.get('page')) || 1;

    this.climberID_2 = Number(this.route.snapshot.queryParamMap.get('climberID_2')) || -1;
    this.date_2 = (this.route.snapshot.queryParamMap.get('date_2')) ? String(this.route.snapshot.queryParamMap.get('date_2')) : this.utils.ALL_RECORDS;
    this.page_2 = Number(this.route.snapshot.queryParamMap.get('page_2')) || 1;


    this.getClimbersWithVideo();
    this.getDatesFromVideos();
    this._videoService.getAllBasic().subscribe({
      next: videos => this.videos = videos
    })
  };

  getClimbersWithVideo(): void {
    this._videoService.getClimbersWithVideo()
      .subscribe(climbers => this.climbers.push(...climbers));
  };

  getDatesFromVideos(): void {
    this._videoService.getAllDates()
      .subscribe(dates => this.dates.push(...dates));
  };

  updatePageNumber(page: number) {
    this.page_1 = page;
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.addQueryParams(),
      queryParamsHandling: 'merge',
    });
  }

  addQueryParams() {
    const queryParams: Params = {
      climberID: this.climberID_1 || undefined,
      date: this.date_1 || undefined,
      page: this.page_1 || undefined,
      climberID_2: this.climberID_2 || undefined,
      date_2: this.date_2 || undefined,
      page_2: this.page_2 || undefined,
    };

    return queryParams;
  }

}

