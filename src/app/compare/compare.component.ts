import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChardDataResults, VideoInfo, VideoService } from '../repositories/video.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js/auto';
import { UtilsService } from '../utils.service';
Chart.register(...registerables);

const w_min = 50;
const w_max = 335;

// colours
const speed_diff_colour = 'rgb(153, 138, 72)';
const speed_diff_colour_overlay = 'rgb(153, 138, 72, 0.5)';

const indc_diff_colour = 'rgb(96, 122, 244)';
const indc_diff_colour_overlay = 'rgb(96, 122, 244, 0.5)';

const left_foot_colour = 'rgb(68, 138, 235)';
const right_foot_colour = 'rgb(36, 220, 249)';
const left_hand_colour = 'rgb(71, 116, 75)';
const right_hand_colour = 'rgb(67, 186, 142)';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.less']
})
export class CompareComponent implements OnInit, AfterViewInit{
  private _l_attempt !: VideoInfo;
  private _r_attempt !: VideoInfo;


  private _chart_data !: ChardDataResults;

  chart : any = [];
  video1!: any;
  video2!: any;

  page_1: number = 1;
  climberID_1: number = -1;
  date_1: string = this.utils.ALL_RECORDS;
  page_2: number = 1;
  climberID_2: number = -1;
  date_2: string = this.utils.ALL_RECORDS;
  isRunningComparison: boolean = false;

  // Returns a Promise that resolves after "ms" Milliseconds
  async timer(ms: number | undefined) {
    return new Promise(res => setTimeout(res, ms))
  }

  // setup block
  public data = {
    datasets: []
  };

  constructor(
    private _videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router,
    public utils: UtilsService
    //private location: Location
  ) {
    this.page_1 = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.climberID_1 = Number(this.route.snapshot.queryParamMap.get('climberID')) || -1;
    this.date_1 = (this.route.snapshot.queryParamMap.get('date')) ? String(this.route.snapshot.queryParamMap.get('date')) : this.utils.ALL_RECORDS;

    this.page_2 = Number(this.route.snapshot.queryParamMap.get('page_2')) || 1;
    this.climberID_2 = Number(this.route.snapshot.queryParamMap.get('climberID_2')) || -1;
    this.date_2 = (this.route.snapshot.queryParamMap.get('date_2')) ? String(this.route.snapshot.queryParamMap.get('date_2')) : this.utils.ALL_RECORDS;
  }

  ngAfterViewInit(): void {
    this.video1 = document.getElementById("video_left");
    this.video2 = document.getElementById("video_right");
  	//this.video1.controls = false;
    //this.video2.controls = false;
	  // https://www.w3schools.com/tags/av_prop_playbackrate.asp
	  // slowed videos
	  this.video1.playbackRate = 0.5;
    this.video2.playbackRate = 0.5;

    // muted videos
    this.video1.muted = true;
    this.video2.muted = true;

    // drawing plugin
    const drawing = {
      id: 'drawing',
      afterDraw: (chart: any, args: any, options: any) => {
        const { ctx } = chart;
        ctx.save();
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
      }
    };

    this.chart = new Chart('canvas', {
      type: 'bubble',
      data: this.data as any,
      plugins: [drawing],
      options: {
          // set height and width for chart - https://stackoverflow.com/questions/41953158/set-height-of-chart-in-chart-js
          responsive: true,
          maintainAspectRatio: false,

          animation: false, // https://www.chartjs.org/docs/latest/configuration/animations.html
          plugins: {
              legend: {
                display: false  // https://www.chartjs.org/docs/latest/configuration/legend.html
              }
          }
      }}
    )
  }

  ngOnInit(): void {
    let l_id = Number(this.route.snapshot.paramMap.get('l_id'));
    let r_id = Number(this.route.snapshot.paramMap.get('r_id'));
    console.log("l_id: " + l_id + " r_id: " + r_id);

    this._videoService.getInfo(l_id).subscribe({
      next: video => this._l_attempt = video
    });
    this._videoService.getInfo(r_id).subscribe({
      next: video => this._r_attempt = video
    });

    this._videoService.getChartData(l_id, r_id).subscribe({
      next: data => {
        this._chart_data = data;
        console.log(data)
      }
    });
  };

  async add() {
    this.isRunningComparison = true;
    // measure time consuption
    let startTime = new Date().getTime();
    const ctx = this.chart.ctx;
    ctx.save();

    // needed references for X legends
    const canvas_firstLegend = document.getElementById('myCanvas') as HTMLCanvasElement;
    const canvas_secondLegend = document.getElementById('myCanvas_2') as HTMLCanvasElement;
    const canvas_delayDataLegend = document.getElementById('myCanvas_3') as HTMLCanvasElement;

    // get 2D drawning contexts for X legends
    const ctx_1 = canvas_firstLegend.getContext('2d')!;
    const ctx_2 = canvas_secondLegend.getContext('2d')!;
    const ctx_3 = canvas_delayDataLegend.getContext('2d')!;

    // const for Y-axis max and min values
    const h_min = this.chart_data[0].min_y;
    const h_max = this.chart_data[0].max_y;

    this.video1.load();
    this.video2.load();
    this.video1.playbackRate = 0.5;
    this.video2.playbackRate = 0.5;
    this.video1.play();
    this.video2.play();

    let data_1 = this.chart_data[0].result[0];
    let data_2 = this.chart_data[0].result[1];

    let left_climber_route = [];
    let right_climber_route = [];

    // print delay data legends
    this.printDelayDataLegend(ctx_3, this.chart_data[0].delay_data);

    const maxLength = Math.max(data_1.length, data_2.length);
    let j,k;
    for (let i = 0; i < maxLength; i++) {
      this.chart.update();
      this.drawDelayDataToChart(ctx);

      (i < data_1.length) ? j=i : j= data_1.length - 1;
      this.drawClimber(ctx, data_1[j], 'orange');
      (i < data_2.length) ? k=i : k= data_2.length - 1;
      this.drawClimber(ctx, data_2[k], 'orange');

      // draw local advantage as triagels
      this.drawTriangles(ctx, [data_1, data_2], j, k);

      // draw line for every climber as route for [6] position
      left_climber_route.push(data_1[j][6]);
      right_climber_route.push(data_2[k][6]);
      this.drawClimbersPaths(ctx, left_climber_route, right_climber_route);

      // Y axis divided into 15 parts and displays colourful advantage
      this.drawYAxisWithLocalAdvantage(ctx, h_min, h_max);

      // X axis for speed difference
      this.drawXAxisWithSpeedDifference(ctx, h_max);

      // X axis for advantage in seconds
      this.drawXAxisWithAdvantageInSeconds(ctx, h_min);

      // get smaller climber with array lenght
      let smallerClimberLenght = data_1;
      if (data_1.length > data_2.length) { smallerClimberLenght = data_2; }

      // needed only 6. position and y value [6][1]
      let coords_y = smallerClimberLenght.map(function(item:any) {
        return item[6][1];
      });
      // draw indc_diff into X-axis
      this.drawInnerData(ctx, this.chart_data[0].indc_diff, coords_y, 360, 1, indc_diff_colour_overlay);
      this.drawInnerData(ctx, this.chart_data[0].speed_diff, coords_y, 360, 10, speed_diff_colour_overlay);

      // draw first legend for X
      ctx_1.font = '15px sans-serif';
      ctx_1.fillStyle = indc_diff_colour;
      ctx_1.fillText('advantage in seconds', 120, 20);
      ctx_1.save();

      // draw second legend for X
      ctx_2.font = '15px sans-serif';
      ctx_2.fillStyle = speed_diff_colour;
      ctx_2.fillText('speed difference', 140, 20);
      ctx_2.save();

      await this.timer(35); // 30
      //this.chart.update();
      if (i == maxLength - 1) { this.isRunningComparison = false; }
    }

    let endTime = new Date().getTime();
    console.log("Add function took " + (endTime - startTime) / 1000 + " s");
  };

  public get l_attempt(): VideoInfo {
    return this._l_attempt;
  };

  public get r_attempt(): VideoInfo {
    return this._r_attempt;
  };

  public get chart_data(): ChardDataResults {
    return this._chart_data;
  };

  drawDelayDataToChart(ctx: any) {
    for (const delay_item of this.chart_data[0].delay_data) {
      let colour = 'black';
      if (delay_item.body_part == 'lFoot') { colour = left_foot_colour; };
      if (delay_item.body_part == 'rFoot') { colour = right_foot_colour; };
      if (delay_item.body_part == 'lHand') { colour = left_hand_colour; };
      if (delay_item.body_part == 'rHand') { colour = right_hand_colour; };

      this.drawDelayDataPoint(ctx, delay_item.X, delay_item.Y, delay_item.time * 15, colour);
    }
  };

  drawXAxisWithSpeedDifference(ctx: any, h_max:number) {
    this.drawLineFromToWithColour(ctx, [w_min, h_max], [w_max, h_max], speed_diff_colour);

    for (let i:number = 0; i < 5; i++ ) {
      this.drawLineFromToWithColour(ctx, [360 / 2 + i * 10, h_max + 5], [360 / 2 + i * 10, h_max - 5], speed_diff_colour);
      this.drawLineFromToWithColour(ctx, [360 / 2 + i * (-10), h_max + 5], [360 / 2 + i * (-10), h_max - 5], speed_diff_colour);

      if (i % 2 == 0) {
        ctx.fillStyle = speed_diff_colour;
        ctx.fillText(i.toString(), 360 / 2 + i * 10, h_max + 15);
        ctx.fillText(i.toString(), 360 / 2 - i * 10, h_max + 15);
      }
    };

    ctx.fillStyle = speed_diff_colour;
    ctx.fillText('m/s', w_max - 30, h_max + 15);
  };

  drawXAxisWithAdvantageInSeconds(ctx: any, h_min:number) {
    this.drawLineFromToWithColour(ctx, [w_min, h_min], [w_max, h_min], indc_diff_colour);

    for (let i:number = 0; i < 7; i = i+3 ) {
      this.drawLineFromToWithColour(ctx, [360 / 2 + i * 10, h_min + 5], [360 / 2 + i * 10, h_min - 5], indc_diff_colour);
      this.drawLineFromToWithColour(ctx, [360 / 2 + i * (-10), h_min + 5], [360 / 2 + i * (-10), h_min - 5], indc_diff_colour);

      ctx.fillStyle = indc_diff_colour;
      ctx.fillText((i / 6).toFixed(1), 360 / 2 + i * 10, h_min - 10);
      ctx.fillText((i / 6).toFixed(1), 360 / 2 - i * 10, h_min - 10);
    };

    ctx.fillStyle = indc_diff_colour;
    //ctx.fillText('advantage in seconds', 130, 10);
    ctx.fillText('s', w_max - 15, h_min - 5);
  };

  drawYAxisWithLocalAdvantage(ctx:any, h_min:number, h_max:number) {
    const meter = (h_max - h_min) / 15;

    for (let i = 0; i < 15; i++) {
      this.drawLocalAdvantageFor(ctx, i, h_max, w_min, w_max, meter, this.chart_data[0].local_adv[i]);
    };
    // display missings last vertical lines and text for 15. meter
    this.drawVerticalLineForYAxis(ctx, w_min, h_max - (15 * meter), 'black');
    this.drawVerticalLineForYAxis(ctx, w_max, h_max - (15 * meter), 'black');
    ctx.fillStyle = 'black';
    ctx.fillText('15', w_min - 17, h_max - (15 * meter));
    ctx.fillText('15', w_max + 7, h_max - (15 * meter));
  };

  drawLocalAdvantageFor(ctx: any,i:number,h_max:number,w_min:number,w_max:number,meter:number,local_adv:number) {
    let l_colour = 'black'; // default, no one has an advantage
    let r_colour = 'black';

    if (local_adv == -1) { // left climber has an advantage
      l_colour = 'green';
      r_colour = 'red';
    } else if (local_adv == 1) {  // right climber has an advantage
      l_colour = 'red';
      r_colour = 'green';
    }

    this.drawLineForYAxis(ctx, w_min, h_max - (i * meter), h_max - ((i + 1) * meter), l_colour); // left y-Axis
    this.drawVerticalLineForYAxis(ctx, w_min, h_max - (i * meter), 'black');
    if (i % 5 == 0) {
      ctx.fillStyle = 'black';
      ctx.fillText(i.toString(), w_min - 17, h_max - (i * meter));
      ctx.fillText(i.toString(), w_max + 7, h_max - (i * meter));
    }

    this.drawLineForYAxis(ctx, w_max, h_max - (i * meter), h_max - ((i + 1) * meter), r_colour); // right y-Axis
    this.drawVerticalLineForYAxis(ctx, w_max, h_max - (i * meter), 'black');

    ctx.restore();  // added
  };

  drawLineForYAxis(ctx: any, w:number, h_min:number, h_max:number, colour:string) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w, h_min);
    ctx.lineTo(w, h_max);
    ctx.stroke();
  };

  drawVerticalLineForYAxis(ctx: any, w:number, h:number, colour:string){
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w-3, h);
    ctx.lineTo(w+3, h);
    ctx.stroke();
  };

  drawDelayDataPoint(ctx:any, x:any, y:any, time:number, colour:string) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, time, 0, Math.PI * 2);
    ctx.fill();
  };

  drawClimber(ctx:any, positions:any, colour:string) {
    const LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [3, 6], [6, 7], [7, 8], [8, 9], [7, 12], [7, 13], [10, 11],
    [11, 12], [13, 14], [14, 15]];
    for (const line of LINES) {
      this.drawLineAsPartOfClimber(ctx, positions[line[0]], positions[line[1]], colour);
    }
  };

  drawLineAsPartOfClimber(ctx:any, beginPosition:any, endPosition:any, colour:string) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beginPosition[0], beginPosition[1]);
    ctx.lineTo(endPosition[0], endPosition[1]);
    ctx.stroke();
  };

  public drawTriangle( ctx: any, x1: number, y1: number, side: string, colour: string = 'black') {
    // ctx.save();
    let move_x = 10;
    let move_y = 5;

    ctx.beginPath();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    if (side === 'left') {
      move_x = move_x * (-1);
    };
    ctx.lineTo(x1 + move_x, y1 + move_y);
    ctx.lineTo(x1 + move_x, y1 - move_y);
    ctx.closePath();
    ctx.stroke();
  };

  drawLineFromToWithColour(ctx:any, startPosition:any, endPosition:any, colour:string) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startPosition[0], startPosition[1]);
    ctx.lineTo(endPosition[0], endPosition[1]);
    ctx.stroke();
  }

  drawTriangles(ctx:any, skeletons:any, j: number, k: number) {
    let leftColourTriangle = 'black';
    let rightColourTriangle = 'black';

    if ((j == skeletons[0].length - 1) || (k == skeletons[1].length - 1)) {
      leftColourTriangle = 'black';
      rightColourTriangle = 'black';
    } else if (skeletons[0][j][6][1] < skeletons[1][k][6][1]) {
      leftColourTriangle = 'green';
      rightColourTriangle = 'red';
    } else {
      leftColourTriangle = 'red';
      rightColourTriangle = 'green';
    }

    // left local advantage
    this.drawTriangle(ctx, w_min, skeletons[0][j][6][1], 'left', leftColourTriangle);
    this.drawLineFromToWithColour(ctx, [skeletons[0][j][6][0], skeletons[0][j][6][1]], [w_min, skeletons[0][j][6][1]], 'grey');

    // right local advantage
    this.drawTriangle(ctx, w_max, skeletons[1][k][6][1], 'right', rightColourTriangle);
    this.drawLineFromToWithColour(ctx, [skeletons[1][k][6][0], skeletons[1][k][6][1]], [w_max, skeletons[1][k][6][1]], 'grey');

    // get difference in meter
    this.getLocalAdvantagesInMeter(skeletons[0][j][6][1], skeletons[1][k][6][1]);
    ctx.fillStyle = 'black';
    ctx.fillText(this.getLocalAdvantagesInMeter(skeletons[0][j][6][1], skeletons[1][k][6][1]), 0, skeletons[0][j][6][1]);

  }

  getLocalAdvantagesInMeter(leftClimber:number, rightClimber:number) {
    let direction = '';
    let pxm = 480 / 15;
    let leftHeightMeter:number = 15 - leftClimber / pxm;
    let righttHeightMeter:number = 15 - rightClimber / pxm;
    let differenceInMeters = Number(leftHeightMeter.toFixed(2)) - Number(righttHeightMeter.toFixed(2));
    if (leftClimber < rightClimber) { direction = '+';}

    return direction + differenceInMeters.toFixed(2);
  }

  drawInnerData(ctx:any, coords_x:any, coords_y:any, width:number, coef:number, colour:string) {
    let points = this.getPointsToInnerGraph(coords_x, coords_y, width, coef);

    // draw polygon
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.strokeStyle = colour;
    ctx.stroke();

    // fill polygon
    ctx.fillStyle = colour;
    ctx.fill();
  }

  getPointsToInnerGraph(coords_x:any, coords_y:any, width:number, coef:number) {
    let result = [];
    let i:number = 0;
    for (const coord_y of coords_y) {
      let x = width / 2 + coords_x[i] * coef;
      result.push([parseInt((x).toString()), parseInt(coord_y)]);
      i = i + 1;
    }
    result.push([parseInt((width / 2).toString()), parseInt(Math.min(...coords_y).toString())]);
    result.push([parseInt((width / 2).toString()), parseInt(Math.max(...coords_y).toString())]);

    return result;
  }

  drawClimbersPaths(ctx:any, left_climber_positions:any, right_climber_positions:any) {
    if (left_climber_positions.length < 2) {
      return;
    }
    for (let i = 0; i < left_climber_positions.length - 1; i++) {
      // left climber path
      ctx.strokeStyle = 'grey';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left_climber_positions[i][0], left_climber_positions[i][1]);
      ctx.lineTo(left_climber_positions[i+1][0], left_climber_positions[i+1][1]);
      ctx.stroke();

      // right climber path
      ctx.strokeStyle = 'grey';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(right_climber_positions[i][0], right_climber_positions[i][1]);
      ctx.lineTo(right_climber_positions[i+1][0], right_climber_positions[i+1][1]);
      ctx.stroke();
    }
  }

  getDelayDataForClimber() {
    return {
      'lFoot': {'time': 0, 'text': 'left foot'},
      'rFoot': {'time': 0, 'text': 'right foot'},
      'lHand': {'time': 0, 'text': 'left hand'},
      'rHand': {'time': 0, 'text': 'right hand'},
    };
  }

  printDelayDataLegend(ctx: any, delay_data:any) {
    let delay_data_left = this.getDelayDataForClimber();
    let delay_data_right = this.getDelayDataForClimber();

    for (let item of delay_data) {
      if (item.position == 0) {
        const bodyPart = item.body_part as keyof typeof delay_data_left;
        delay_data_left[bodyPart].time += item.time;
      }
      if (item.position == 1) {
        const bodyPart = item.body_part as keyof typeof delay_data_right;
        delay_data_right[bodyPart].time += item.time;
      }
    }

    ctx.font = '10px sans-serif';
    ctx.fillStyle = left_foot_colour;
    ctx.fillText(delay_data_left.lFoot.text + ': ' + delay_data_left.lFoot.time.toFixed(2) + ' s', 30, 30);
    ctx.fillText(delay_data_right.lFoot.text + ': ' + delay_data_right.lFoot.time.toFixed(2) + ' s', 200, 30);

    ctx.fillStyle = right_foot_colour;
    ctx.fillText(delay_data_left.rFoot.text + ': ' + delay_data_left.rFoot.time.toFixed(2) + ' s', 30, 60);
    ctx.fillText(delay_data_right.rFoot.text + ': ' + delay_data_right.rFoot.time.toFixed(2) + ' s', 200, 60);

    ctx.fillStyle = left_hand_colour;
    ctx.fillText(delay_data_left.lHand.text + ': ' + delay_data_left.lHand.time.toFixed(2) + ' s', 30, 90);
    ctx.fillText(delay_data_right.lHand.text + ': ' + delay_data_right.lHand.time.toFixed(2) + ' s', 200, 90);

    ctx.fillStyle = right_hand_colour;
    ctx.fillText(delay_data_left.rHand.text + ': ' + delay_data_left.rHand.time.toFixed(2) + ' s', 30, 120);
    ctx.fillText(delay_data_right.rHand.text + ': ' + delay_data_right.rHand.time.toFixed(2) + ' s', 200, 120);

    ctx.save();
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


