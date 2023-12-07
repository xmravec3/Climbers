import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from './utils.service';

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  constructor(private utilsService: UtilsService) { }

  transform(videos: any[], date: string): any[] {
    if (!date || date == this.utilsService.ALL_RECORDS) {
      return videos; // If date is empty or is equal to utilsService.ALL_RECORDS, return the original array
    }

    // Filter the videos array based on the date
    return videos.filter(video => new Date(video.date).toLocaleDateString() === date);
  }

}


