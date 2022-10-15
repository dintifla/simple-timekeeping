import { Participant } from "./participant";
import { Result } from "./result";
import { showSnackbar } from "./helpers/snackbar";
import "./styles/styles.css";
import { exportAsCsv, exportAsJson } from "./helpers/fileDownloader";

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
      const startTimeStamps = JSON.parse(fileContents[0]);
      const finishTimeStamps = JSON.parse(fileContents[1]);
      if (startTimeStamps.length != finishTimeStamps.length) {
        showSnackbar("Start und Ziel Datei sind nicht gleich lang");
        return;
      }

      if (!validate(startTimeStamps, finishTimeStamps)) return;

      const container = document.getElementById("container");
      if (!container) throw Error("Container not found");
      container.innerHTML = "";

      const tempResults = calculateDifference(
        startTimeStamps,
        finishTimeStamps
      );
      const allResults: any = {
        male: tempResults.filter((r) => r.category === "M"),
        female: tempResults.filter((r) => r.category === "F"),
      };
      for (let key in allResults) {
        const results: Result[] = allResults[key];
        sortByTime(results);
        let delay: string = "---";
        let rank: number | undefined = 1;
        for (let i = 0; i < results.length; ++i) {
          rank = i + 1;
          if (i !== 0) {
            delay = getDelay(
              results[0].result,
              results[i].result,
              results[i - 1].result
            );

            const hasSameTime: boolean =
              (results[i].result as number) -
                (results[i - 1].result as number) <
              100;
            if (hasSameTime) rank = results[i - 1].rank;
          }

          results[i] = { rank, ...results[i], delay };
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

  function getDelay(
    firstTime: number | string | undefined,
    currentTime: number | string | undefined,
    previousTime: number | string | undefined
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

  function formatTimestampValue(value: number | string): string {
    if (!value) return "---";
    if (typeof value === "number")
      return isNaN(value) ? value.toString() : msToTime(value);
    return value;
  }

  /**
   * Format the given milliseconds to HH:mm:ss.s
   */
  function msToTime(ms: number): string {
    return new Date(ms).toISOString().substring(11, 21);
  }

  function validate(
    startTimeStamps: Participant[],
    finishTimeStamps: Participant[]
  ) {
    if (!(startTimeStamps instanceof Array)) {
      showSnackbar("Start datei ist kein array!");
      return false;
    }

    if (!(finishTimeStamps instanceof Array)) {
      showSnackbar("Ziel datei ist kein array!");
      return false;
    }
    if (!startTimeStamps.every((p) => "numberPlate" in p && "name" in p)) {
      showSnackbar("Startdatei hat falsches format!");
      return false;
    }

    if (!finishTimeStamps.every((p) => "numberPlate" in p && "name" in p)) {
      showSnackbar("Zieldatei hat falsches format!");
      return false;
    }

    if (
      Math.min(
        ...startTimeStamps
          .map((x) => x.time)
          .filter((x): x is string => !!x)
          .map((x) => Date.parse(x))
      ) >
      Math.min(
        ...finishTimeStamps
          .map((x) => x.time)
          .filter((x): x is string => !!x)
          .map((x) => Date.parse(x))
      )
    ) {
      showSnackbar("Start und Ziel Datei sind vertauscht!");
      return false;
    }
    return true;
  }

  function calculateDifference(
    startTimeStamps: Participant[],
    finishTimeStamps: Participant[]
  ): Result[] {
    return zip<Participant, Participant, any>(
      startTimeStamps,
      finishTimeStamps
    ).map((x) => {
      const entry: Result = {
        numberPlate: <number>x[0].numberPlate,
        category: <string>x[0].category,
        name: <string>x[0].name,
        startTime: <number | string>x[0].time,
        finishTime: <number | string>x[1].time,
      };
      if (!entry.startTime) entry.result = "DNS";
      else if (!entry.finishTime) entry.result = "DNF";
      else {
        entry.result =
          Date.parse(entry.finishTime as string) -
          Date.parse(entry.startTime as string);
      }
      return entry;
    });
  }

  function zip<T1, T2, T3>(list1: T1[], list2: T2[]): T3[] {
    return list1.map((e, i) => <T3>[e, list2[i]]);
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
