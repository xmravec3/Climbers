import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public readonly ALL_RECORDS: string = '----';
  public readonly LEFT_TEXT: string = 'LEFT';
  public readonly RIGHT_TEXT: string = 'RIGHT';
  public readonly UNKNOW_TEXT: string = 'NOT DEFINED';
  public readonly RIGHT_CODE: string = 'r';
  public readonly LEFT_CODE: string = 'l';

  constructor() { }

  getLocalDate(date: string) {
    return new Date(date).toLocaleDateString();
  };

  getLocalDateForFilter(date: string) {
    if (date === this.ALL_RECORDS) return this.ALL_RECORDS;
    return this.getLocalDate(date);
  };

  getSideText(side: string) {
    let sideText:string = this.UNKNOW_TEXT;
    if (side === this.LEFT_CODE) sideText = this.LEFT_TEXT;
    if (side === this.RIGHT_CODE) sideText = this.RIGHT_TEXT;

    return sideText;
  }
}
