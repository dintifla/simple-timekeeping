import { Result } from "./result";
import { showSnackbar } from "./components/snackbar";
import { exportAsCsv, exportAsJson } from "./helpers/fileDownloader";
import { validate } from "./resultValidator";
import { calculateRankAndSort, mapStartToFinish } from "./resultCalculator";
import { Timing } from "./timing";

function render(): HTMLElement {
  const header = document.createElement("h1");
  header.innerText = "Auswertung";

  const startFileInput = document.createElement("input");
  startFileInput.type = "file";
  startFileInput.id = "start-file";
  startFileInput.accept = ".json";
  const startLabel = document.createElement("label");
  startLabel.innerText = "Startzeiten:";
  startLabel.htmlFor = startFileInput.id;

  const finishInputFile = document.createElement("input");
  finishInputFile.type = "file";
  finishInputFile.id = "finish-file";
  finishInputFile.accept = ".json";
  const finishLabel = document.createElement("label");
  finishLabel.innerText = "Ankunftszeiten:";
  finishLabel.htmlFor = finishInputFile.id;

  const button = document.createElement("button");
  button.className = "big-button";
  button.innerText = "Evaluieren";
  button.onclick = () => calculate();

  const container = document.createElement("div");
  container.id = "container";

  const downloadElement = document.createElement("a");
  downloadElement.id = "downloadAnchorElem";
  downloadElement.style.display = "none";

  const parent = document.createElement("div");
  parent.appendChild(header);
  parent.appendChild(startLabel);
  parent.appendChild(startFileInput);
  parent.appendChild(document.createElement("br"));
  parent.appendChild(finishLabel);
  parent.appendChild(finishInputFile);
  parent.appendChild(document.createElement("br"));
  parent.appendChild(button);
  parent.appendChild(container);
  parent.appendChild(downloadElement);

  return parent;
}

function calculate(): void {
  if (!validateFiles()) return;

  const [startFile, finishFile] = getStartAndFinishFile();
  Promise.all(new Array(startFile[0].text(), finishFile[0].text())).then(
    (fileContents: any[]) => {
      const starts = JSON.parse(fileContents[0]);
      const finishes = JSON.parse(fileContents[1]);
      if (starts.length != finishes.length) {
        showSnackbar("Start und Ziel file sind nicht gleich lang");
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
      showSnackbar("Start file fehlt!");
      return false;
    }
    if (!(<HTMLInputElement>document.getElementById("finish-file"))?.value) {
      showSnackbar("Ziel file fehlt!");
      return false;
    }
    return true;
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
      "Name",
      "Startzeit",
      "Ankunftszeit",
      "Laufzeit",
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

export { render };
