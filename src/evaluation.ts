import { Result } from "./result";
import { showSnackbar } from "./components/snackbar";
import "./styles/styles.css";
import { exportAsCsv, exportAsJson } from "./helpers/fileDownloader";
import { validate } from "./resultValidator";
import { calculateRankAndSort, mapStartToFinish } from "./resultCalculator";
import { Timing } from "./timinig";

function calculate(): void {
  if (!validateFiles()) return;

  const [startFile, finishFile] = getStartAndFinishFile();
  Promise.all(new Array(startFile[0].text(), finishFile[0].text())).then(
    (fileContents: any[]) => {
      const starts = JSON.parse(fileContents[0]);
      const finishes = JSON.parse(fileContents[1]);
      if (starts.length != finishes.length) {
        showSnackbar("Start und finish have have not the same length");
        return;
      }

      if (!validate(starts, finishes)) return;

      const container = getEmptyContainer();

      const timings = mapStartToFinish(starts, finishes);
      for (let category of getUniqueCategories(timings)) {
        const results = calculateRankAndSort(
          timings.filter((t) => t.category === category)
        );
        fillTable(category, results, container);
        exportResults(category, results);
      }
    }
  );

  function getUniqueCategories(timings: Timing[]): string[] {
    return timings
      .map((t) => t.category)
      .filter((category, i, categories) => categories.indexOf(category) == i);
  }

  function getStartAndFinishFile(): [FileList, FileList] {
    const startFile = (<HTMLInputElement>document.getElementById("start-file"))
      ?.files;
    const finishFile = (<HTMLInputElement>(
      document.getElementById("finish-file")
    ))?.files;
    if (!startFile) throw Error("Start file not found");
    if (!finishFile) throw Error("Finish file not found");
    return [startFile, finishFile];
  }

  function getEmptyContainer(): HTMLElement {
    const container = document.getElementById("container");
    if (!container) throw Error("Container not found");
    container.innerHTML = "";
    return container;
  }

  function validateFiles() {
    if (!(<HTMLInputElement>document.getElementById("start-file"))?.value) {
      showSnackbar("Start file missing!");
      return false;
    }
    if (!(<HTMLInputElement>document.getElementById("finish-file"))?.value) {
      showSnackbar("Finish file missing!");
      return false;
    }
    return true;
  }

  function exportResults(title: string, results: Result[]) {
    let fileName = `Results_${title}_${Date.now()}`;
    exportAsJson(results, fileName + ".json");
    exportAsCsv(results, fileName + ".csv");
  }

  function fillTable(title: string, results: Result[], container: HTMLElement) {
    const headers = [
      "Rang",
      "Start number",
      "Category",
      "Name",
      "Start time",
      "Finish time",
      "Race time",
      "Delay",
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
