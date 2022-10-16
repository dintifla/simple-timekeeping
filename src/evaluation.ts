import { Participant } from "./participant";
import { Result } from "./result";
import { showSnackbar } from "./helpers/snackbar";
import "./styles/styles.css";
import { exportAsCsv, exportAsJson } from "./helpers/fileDownloader";
import { msToTime } from "./helpers/time";
import { validate } from "./resultValidator";

function calculate(): void {
  if (!validateFiles()) return;

  const startFile = (<HTMLInputElement>document.getElementById("start-file"))
    ?.files;
  const finishFile = (<HTMLInputElement>document.getElementById("finish-file"))
    ?.files;
  if (!startFile) throw Error("Start file not found");
  if (!finishFile) throw Error("Finish file not found");
  Promise.all(new Array(startFile[0].text(), finishFile[0].text())).then(
    (fileContents: any[]) => {
      const starts = JSON.parse(fileContents[0]);
      const finishes = JSON.parse(fileContents[1]);
      if (starts.length != finishes.length) {
        showSnackbar("Start und Ziel Datei sind nicht gleich lang");
        return;
      }

      if (!validate(starts, finishes)) return;

      const container = getEmptyContainer();

      const tempResults = calculateDifference(starts, finishes);
      const allResults: any = {
        male: tempResults.filter((r) => r.category === "M"),
        female: tempResults.filter((r) => r.category === "F"),
      };
      for (let key in allResults) {
        const results: Result[] = allResults[key];
        sortByTime(results);
        let rank: number | undefined = 1;
        for (let i = 0; i < results.length; ++i) {
          rank = i + 1;
          if (i !== 0) {
            results[i].delay = getDelayToPreviousAndFirst(
              results[0].result,
              results[i].result,
              results[i - 1].result
            );

            const hasSameTime: boolean =
              (results[i].result as number) -
                (results[i - 1].result as number) <
              100;
            if (hasSameTime) rank = results[i - 1].rank;
            results[i].rank = rank;
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
        const title = key === "male" ? "Männer" : "Frauen";
        fillTable(title, results, container);
        exportResults(title, results);
      }
    }
  );

  function getEmptyContainer(): HTMLElement {
    const container = document.getElementById("container");
    if (!container) throw Error("Container not found");
    container.innerHTML = "";
    return container;
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

  function formatTimestampValue(value: Date | string): string {
    if (!value) return "---";
    return typeof value === "string" ? value : value.toString();
  }

  function calculateDifference(
    startTimeStamps: Participant[],
    finishTimeStamps: Participant[]
  ): Result[] {
    return mapStartToFinish(startTimeStamps, finishTimeStamps).map((entry) => {
      if (entry.startTime !== "DNS" && entry.finishTime !== "DNF") {
        entry.result =
          Date.parse(entry.finishTime) - Date.parse(entry.startTime);
      }
      return entry;
    });
  }

  function mapStartToFinish(
    starts: Participant[],
    finishes: Participant[]
  ): Result[] {
    return starts.map((s) => {
      const res: Result = {
        rank: 1,
        numberPlate: s.numberPlate,
        category: s.category,
        name: s.name,
        startTime: (s.time as string) || "DNS",
        finishTime:
          (finishes.find((f) => f.numberPlate == s.numberPlate)
            ?.time as string) || "DNF",
        result: "---",
        delay: "---",
      };
      return res;
    });
  }

  function validateFiles() {
    if (!(<HTMLInputElement>document.getElementById("start-file"))?.value) {
      showSnackbar("Startfile fehlt!");
      return false;
    }
    if (!(<HTMLInputElement>document.getElementById("finish-file"))?.value) {
      showSnackbar("Zielfile fehlt!");
      return false;
    }
    return true;
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

  function exportResults(title: string, results: Result[]) {
    let fileName = `Resultate_${title}_${Date.now()}`;
    exportAsJson(results, fileName + ".json");
    exportAsCsv(results, fileName + ".csv");
  }

  function fillTable(title: string, results: Result[], container: HTMLElement) {
    const headers = [
      "Rang",
      "Startnummer",
      "Kategorie",
      "Name",
      "Startzeit",
      "Zielzeit",
      "Rennzeit",
      "Rückstand",
    ];

    const titleContainer = document.createElement("h1");
    titleContainer.innerText = title;
    container.appendChild(titleContainer);

    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    headers.forEach((headerText) => {
      const header = document.createElement("th");
      const textNode = document.createTextNode(headerText);
      header.appendChild(textNode);
      headerRow.appendChild(header);
    });
    table.appendChild(headerRow);
    results.forEach((emp) => {
      const row = document.createElement("tr");
      Object.values(emp).forEach((text) => {
        const cell = document.createElement("td");
        const textNode = document.createTextNode(text);
        cell.appendChild(textNode);
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
    container.appendChild(table);
  }
}

(window as any).calculate = calculate;
