import { msToTime } from "./helpers/time";
import { Participant } from "./participant";
import { Result } from "./result";
import { Timing } from "./timing";

export function calculateRankAndSort(timings: Timing[]): Result[] {
  const results: Result[] = timings.map((t: Timing) => {
    return {
      rank: 1,
      numberPlate: t.numberPlate,
      name: t.name,
      startTime: t.startTime,
      finishTime: t.finishTime,
      result: calculateDifference(t),
      delay: "---",
    };
  });
  sortByTime(results);
  let rank: number | "-" = 1;
  for (let i = 0; i < results.length; ++i) {
    rank = i + 1;
    if (i !== 0) {
      results[i].delay = getDelayToPreviousAndFirst(
        results[0].result,
        results[i].result,
        results[i - 1].result
      );

      const hasSameTime: boolean =
        (results[i].result as number) - (results[i - 1].result as number) < 100;
      if (hasSameTime) {
        rank = results[i - 1].rank;
        results[i].delay = results[i - 1].delay;
      }
      switch (results[i].result) {
        case "DNS":
        case "DNF":
          results[i].rank = "-";
          break;
        default:
          results[i].rank = rank;
      }
    }
  }
  results.forEach((x: Result) => {
    x.startTime = formatTimestampValue(x.startTime);
    x.finishTime = formatTimestampValue(x.finishTime);
    x.result =
      typeof x.result !== "number" || isNaN(x.result)
        ? x.result
        : msToTime(x.result);
  });
  return results;
}

function calculateDifference(timing: Timing): string | number {
  if (timing.startTime === "---") return "DNS";
  if (timing.finishTime === "---") return "DNF";
  return Date.parse(timing.finishTime) - Date.parse(timing.startTime);
}

function formatTimestampValue(value: Date | string): string {
  if (!value) return "---";
  return typeof value === "string" ? value : value.toString();
}

export function mapStartToFinish(
  starts: Participant[],
  finishes: Participant[]
): Timing[] {
  return starts
    .filter((s) => {
      const isUnusedSpare = s.isSpare === true && s.name === "" && !s.time;
      return !isUnusedSpare;
    })
    .map((s) => {
      const res: Timing = {
        numberPlate: s.numberPlate,
        category: s.category,
        name: s.name,
        startTime: (s.time as string) || "---",
        finishTime:
          (finishes.find((f) => f.numberPlate == s.numberPlate)
            ?.time as string) || "---",
      };
      return res;
    });
}

function getDelayToPreviousAndFirst(
  firstTime: number | string,
  currentTime: number | string,
  previousTime: number | string
): string {
  if (
    typeof firstTime !== "number" ||
    isNaN(firstTime) ||
    typeof previousTime !== "number" ||
    isNaN(previousTime) ||
    typeof currentTime !== "number" ||
    isNaN(currentTime)
  )
    return "---";

  const toFirst = currentTime - firstTime;
  const toPrevious = currentTime - previousTime;
  if (typeof currentTime === "number" && !isNaN(currentTime)) {
    return `+${msToTime(toFirst)} (+${msToTime(toPrevious)})`;
  }
  return "---";
}

/**
 * 1. smallest time
 * 2. DNF
 * 3. DNS
 */
function sortByTime(results: Result[]) {
  results.sort((a, b) => {
    if (a.result == "DNS" && b.result == "DNF") return 1;
    if (a.result == "DNF" && b.result == "DNS") return -1;
    if (!isNaN(a.result as number) && isNaN(b.result as number)) return -1;
    if (isNaN(a.result as number) && !isNaN(b.result as number)) return 1;
    if (a.result === b.result) return 0;
    return (a.result as number) < (b.result as number) ? -1 : 1;
  });
}
