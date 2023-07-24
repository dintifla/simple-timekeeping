import { Component } from '@angular/core';
import { ResultValidationService } from '../result-validation.service';
import { MessageService } from '../../message.service';
import { Timing } from '../timing';
import { Result } from '../result';
import { ResultCalculator } from '../result-calculator';
import { FileDownloader } from '../../file-downloader';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css'],
})
export class EvaluationComponent {
  constructor(
    private validator: ResultValidationService,
    private messageService: MessageService
  ) {}

  categories: string[] = [];
  results: { [category: string]: Result[] } = {};

  private calculator: ResultCalculator = new ResultCalculator();

  calculate(): void {
    if (!this.validateFiles()) return;

    const [startFile, finishFile] = this.getStartAndFinishFile();
    Promise.all(new Array(startFile[0].text(), finishFile[0].text())).then(
      (fileContents: any[]) => {
        const starts = JSON.parse(fileContents[0]);
        const finishes = JSON.parse(fileContents[1]);
        if (starts.length != finishes.length) {
          this.messageService.add('Start und Ziel file sind nicht gleich lang');
          return;
        }

        if (!this.validator.validate(starts, finishes)) return;

        const timings = this.calculator.mapStartToFinish(starts, finishes);
        this.categories = this.getUniqueCategories(timings);
        for (let category of this.categories) {
          this.results[category] = this.calculator.calculateRankAndSort(
            timings.filter((t) => t.category === category)
          );
          this.exportResults(category, this.results[category]);
        }
      }
    );
  }

  private exportResults(title: string, results: Result[]): void {
    let fileName = `Resultate_${title}_${Date.now()}`;
    FileDownloader.exportAsJson(results, fileName + '.json');
    FileDownloader.exportAsCsv(results, fileName + '.csv');
  }

  private validateFiles(): boolean {
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

