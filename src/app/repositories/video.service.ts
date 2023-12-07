import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export type Video = {
  ID: number,
  title: string,
  video_name: string,
  climber_id: number,
  climber_name: string,
  date: string,
  attempt: number,
  url: string,
  start: number,
  end: number,
  time: number,
  frames: number,
  side: string,
  skeletons: string,
  trans_matrixes: string
};

export type VideoBasic = {
  ID: number,
  title: string,
  video_name: string,
  climber_name: string,
  climber_id: number,
  date: string,
  attempt: number,
  time: number,
};

export type VideoInfo = {
  ID: number,
  title: string,
  video_name: string,
  climber_id: number,
  climber_name: string,
  date: string,
  attempt: number,
  url: string,
  start: number,
  end: number,
  time: number,
  frames: number,
  side: string
};

export type KNNResult = {
  ID: number,
  dist: number,
  title: string,
  climber_id: number,
  climber_name: string,
  attempt: number,
  time: number,
  date: Date,
  video_path: string,
}

export type ChardDataResult = {
  delay_data: any;
  result: any [];
  local_adv: number [];
  indc_diff: number [];
  speed_diff: number [];
  min_y: number;
  max_y: number
}

export type ChardDataResults = ChardDataResult[]

export type Climber = {
  ID: number;
  name: string
}


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private _http: HttpClient) { }

  get( id: number ):Observable<Video> {
    return this._http.get<Video>(`${environment.api}videos/${id}`);
  }

  getAll(  ):Observable<Video[]> {
    return this._http.get<Video[]>(`${environment.api}videos`);
  }

  getAllBasic(  ):Observable<VideoBasic[]> {
    return this._http.get<VideoBasic[]>(`${environment.api}videosBasic`);
  }

  getInfo( id: number ):Observable<VideoInfo> {
    return this._http.get<VideoInfo>(`${environment.api}videoInfo/${id}`);
  }

  getKNN( id: number ):Observable<KNNResult[]> {
    return this._http.get<KNNResult[]>(`${environment.api}knn/${id}`);
  }

  getChartData ( l_id: number, r_id: number):Observable<ChardDataResults> {
    return this._http.get<ChardDataResults>(`${environment.api}chartData/${l_id}/${r_id}`);
  }

  getClimbersWithVideo(  ):Observable<Climber[]> {
    return this._http.get<Climber[]>(`${environment.api}climbersAll`);
  }

  getAllDates(  ):Observable<object[]> {
    return this._http.get<object[]>(`${environment.api}datesAll`);
  }


}
