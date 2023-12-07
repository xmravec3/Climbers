import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'climberFilter'
})
export class ClimberFilterPipe implements PipeTransform {

    transform(videos: any[], climber_ID: number): any[] {
    if (!climber_ID || climber_ID < 0) {
      return videos; // If name is empty or is less than 0, return the original array
    }

    // Filter the videos array based on the id attribute
    return videos.filter(video => video.climber_id.toString() === climber_ID.toString());

  }

}
