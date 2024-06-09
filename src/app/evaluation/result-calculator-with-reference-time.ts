import { msToTime } from '../time';
import { Result } from './result';
import { ResultCalculator } from './result-calculator';
import { Timing } from './timing';

export class ReferenceTimeResultCalculator extends ResultCalculator {
  constructor() {
    super();
  }

  calculate(timings: Timing[], refTimeMs: number): Result[] {
    const results: Result[] = timings.map((t: Timing) => {
      return {
        rank: 1,
        numberPlate: t.numberPlate,
        name: t.name,
        startTime: t.startTime,
        finishTime: t.finishTime,
        result: this.calculateDifference(t),
        delay: '---',
      };
    });
    this.sortByTimeToRef(results, refTimeMs);
    let rank: number | '-' = 1;
    for (let i = 0; i < results.length; ++i) {
      rank = i + 1;
      results[i].delay = this.getDelayToPreviousAndReference(
        refTimeMs,
        results[i].result,
        i > 0 ? results[i - 1].result : undefined
      );
      if (i !== 0) {
        const hasSameTime: boolean =
          Math.abs(
            (results[i].result as number) - (results[i - 1].result as number)
          ) < 100;
        if (hasSameTime) {
          rank = results[i - 1].rank;
          results[i].delay = results[i - 1].delay;
        }
        switch (results[i].result) {
          case 'DNS':
          case 'DNF':
            results[i].rank = '-';
            break;
          default:
            results[i].rank = rank;
        }
      }
    }
    results.forEach((x: Result) => {
      x.startTime = this.formatTimestampValue(x.startTime);
      x.finishTime = this.formatTimestampValue(x.finishTime);
      x.result =
        typeof x.result !== 'number' || isNaN(x.result)
          ? x.result
          : msToTime(x.result);
    });
    return results;
  }

  private sortByTimeToRef(results: Result[], refTimeMs: number) {
    results.sort((a, b) => {
      if (a.result == 'DNS' && b.result == 'DNF') return 1;
      if (a.result == 'DNF' && b.result == 'DNS') return -1;
      if (!isNaN(a.result as number) && isNaN(b.result as number)) return -1;
      if (isNaN(a.result as number) && !isNaN(b.result as number)) return 1;
      if (a.result === b.result) return 0;
      return Math.abs((a.result as number) - refTimeMs) <
        Math.abs((b.result as number) - refTimeMs)
        ? -1
        : 1;
    });
  }

  private getDelayToPreviousAndReference(
    referenceTime: number | string,
    currentTime: number | string,
    previousTime: number | string | undefined
  ): string {
    if (
      typeof referenceTime !== 'number' ||
      isNaN(referenceTime) ||
      typeof currentTime !== 'number' ||
      isNaN(currentTime)
    )
      return '---';

    const toRef = currentTime - referenceTime;
    const signToFirst = toRef >= 0 ? '+' : '-';
    const result = `${signToFirst}${msToTime(toRef)}`;
    if (typeof previousTime !== 'number' || isNaN(previousTime)) {
      return result + ' (---)';
    }

    const toPrevious = Math.abs(currentTime - previousTime);
    return result + ` (${msToTime(toPrevious)})`;
  }
}
