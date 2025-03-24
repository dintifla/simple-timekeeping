import { Pipe, PipeTransform } from '@angular/core';
import { parseTime } from '../../time';
/*
 * Formats to time of a date
 * Usage:
 *   value | dateToTimeString
 * Example:
 *   {{ Fri Jul 21 2023 09:25:58 GMT+0200 (Central European Summer Time) | dateToTimeString }}
 *   formats to: 09:25:58
 */
@Pipe({
  name: 'dateToTimeString',
})
export class FormatDateToTimeStringPipe implements PipeTransform {
  transform(value: string | Date | undefined): string {
    if (!value) return '';
    if (typeof value === 'string')
      value = this.isTimeOnly(value) ? parseTime(value) : new Date(value);

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Zurich',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };

    const dateFormatter = new Intl.DateTimeFormat('de-CH', dateOptions);
    return dateFormatter.format(value);
  }

  private isTimeOnly(value: string) {
    return value.length === 8;
  }
}
