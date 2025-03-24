import { Component } from '@angular/core';
import { ResultValidationService } from '../result-validation.service';
import { MessageService } from '../../message.service';
import { Timing } from '../timing';
import { Result } from '../result';
import { ResultCalculator } from '../result-calculator';
import { FileDownloader } from '../../file-downloader';
import { ReferenceTimeResultCalculator } from '../result-calculator-with-reference-time';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css'],
  imports: [CommonModule],
})
export class EvaluationComponent {
  constructor(
    private validator: ResultValidationService,
    private messageService: MessageService,
  ) {}

  categories: string[] = [];
  results: { [category: string]: Result[] } = {};

  private calculator: ResultCalculator = new ResultCalculator();
  private eBikeCalculator: ReferenceTimeResultCalculator =
    new ReferenceTimeResultCalculator();

  calculate(): void {
    if (!this.validateFiles()) return;
    const refTimeValue = (<HTMLInputElement>(
      document.getElementById('refTimeEbike')
    ))?.value;
    if (!this.validateRefTime(refTimeValue)) return;

    const [startFile, finishFile] = this.getStartAndFinishFile();
    const refTimeMs = this._getRefTimeMs(refTimeValue);
    Promise.all([startFile[0].text(), finishFile[0].text()]).then(
      (fileContents: string[]) => {
        const starts = JSON.parse(fileContents[0]);
        const finishes = JSON.parse(fileContents[1]);
        if (starts.length != finishes.length) {
          this.messageService.add('Start und Ziel file sind nicht gleich lang');
          return;
        }

        if (!this.validator.validate(starts, finishes)) return;

        const timings = this.calculator.mapStartToFinish(starts, finishes);
        this.categories = this.getUniqueCategories(timings);
        for (const category of this.categories) {
          if (category === 'E-Bike') {
            this.results[category] =
              this.eBikeCalculator.calculateAndSortToReferenceTime(
                timings.filter((t) => t.category === category),
                refTimeMs,
              );
          } else {
            this.results[category] = this.calculator.calculateRankAndSort(
              timings.filter((t) => t.category === category),
            );
          }
          this.exportResults(category, this.results[category]);
        }
      },
    );
  }

  private _getRefTimeMs(fieldValue: string): number {
    const refTime = fieldValue ?? '00:00:00.0';
    const refTimeInMs = Date.parse('1970-01-01T' + refTime + 'Z');
    return refTimeInMs;
  }

  private exportResults(title: string, results: Result[]): void {
    const fileName = `Resultate_${title}_${Date.now()}`;
    FileDownloader.exportAsJson(results, fileName + '.json');
    FileDownloader.exportAsCsv(results, fileName + '.csv');
  }

  private validateRefTime(refTimeValue: string): boolean {
    // validate format of refTime to be HH:mm:ss.s
    if (/^(\d{2}):(\d{2}):(\d{2})(\.\d)?$/.test(refTimeValue)) {
      return true;
    }
    this.messageService.add(
      'Ungültiges Format für die Referenzzeit. Erwartet wird HH:mm:ss.s',
    );
    return false;
  }

  private validateFiles(): boolean {
    if (!(<HTMLInputElement>document.getElementById('start-file'))?.value) {
      this.messageService.add('Start file fehlt!');
      return false;
    }
    if (!(<HTMLInputElement>document.getElementById('finish-file'))?.value) {
      this.messageService.add('Ziel file fehlt!');
      return false;
    }
    return true;
  }

  private getStartAndFinishFile(): [FileList, FileList] {
    const startFile = (<HTMLInputElement>document.getElementById('start-file'))
      ?.files;
    const finishFile = (<HTMLInputElement>(
      document.getElementById('finish-file')
    ))?.files;
    if (!startFile) throw Error('Start file not found');
    if (!finishFile) throw Error('Finish file not found');
    return [startFile, finishFile];
  }

  private getUniqueCategories(timings: Timing[]): string[] {
    return timings
      .map((t) => t.category)
      .filter((category, i, categories) => categories.indexOf(category) == i);
  }
}
