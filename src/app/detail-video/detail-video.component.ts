import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Climber, KNNResult, VideoInfo, VideoService } from '../repositories/video.service';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-detail-video',
  templateUrl: './detail-video.component.html',
  styleUrls: ['./detail-video.component.less']
})
export class DetailVideoComponent {
  private _id !: number;
  private _attempt !: VideoInfo;
  private _similiarVideos !: KNNResult[];
  dates: any[] = [{ date: this.utils.ALL_RECORDS }];

  climbers: Climber[] = [{ID: -1, name: this.utils.ALL_RECORDS}];

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
    //private location: Location
  ) {};

  ngOnInit(): void {
    this._id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(this.id);

    this.climberID_1 = Number(this.route.snapshot.queryParamMap.get('climberID')) || -1;
    this.date_1 = (this.route.snapshot.queryParamMap.get('date')) ? String(this.route.snapshot.queryParamMap.get('date')) : this.utils.ALL_RECORDS;
    this.page_1 = Number(this.route.snapshot.queryParamMap.get('page')) || 1;

    this.climberID_2 = Number(this.route.snapshot.queryParamMap.get('climberID_2')) || -1;
    this.date_2 = (this.route.snapshot.queryParamMap.get('date_2')) ? String(this.route.snapshot.queryParamMap.get('date_2')) : this.utils.ALL_RECORDS;
    this.page_2 = Number(this.route.snapshot.queryParamMap.get('page_2')) || 1

    this.getClimbersWithVideo();
    this.getDatesFromVideos();

    this._videoService.getInfo(this.id).subscribe({
      next: video => this._attempt = video
    })

    this._videoService.getKNN(this.id).subscribe({
      next: videos => this._similiarVideos = videos
    })

  };

  public get id(): number {
    return this._id;
  };

  public get attempt(): VideoInfo {
    return this._attempt;
  };

  public get similiarVideos(): KNNResult[] {
    return this._similiarVideos;
  };

  getDatesFromVideos(): void {
    this._videoService.getAllDates()
      .subscribe(dates => this.dates.push(...dates));
  };

  getClimbersWithVideo(): void {
    this._videoService.getClimbersWithVideo()
      .subscribe(climbers => this.climbers.push(...climbers));
  };

  updatePageNumber(page: number) {
    this.page_2 = page;
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
