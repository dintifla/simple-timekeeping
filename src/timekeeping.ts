import { Participant } from "./participant";
import { showSnackbar } from "./components/snackbar";
import { exportAsJson } from "./helpers/fileDownloader";
import { parseTime, roundTo100Ms } from "./helpers/time";
import { Countdown } from "./components/countdown";
import { Configuration, getConfig } from "./configuration";
import { HTMLFactory } from "./htmlFactory";

let _entries: Participant[] = [];
let _measurementLocation: string;
let _countdown: Countdown | undefined = new Countdown();
const _config: Configuration = getConfig();

function render(): HTMLElement {
  const header = document.createElement("h1");
  header.innerText = "Zeitmessung";

  const locationSelect = HTMLFactory.makeSelect(
    "Ort:",
    "select-measurement-location",
    "big-select",
    ["Start", "Ziel"],
    () => reset()
  );

  const startListInput = HTMLFactory.makeJsonFileInput(
    "Startliste laden:",
    "load-file",
    () => loadFromFile()
  );

  const loadButton = HTMLFactory.makeButton("Laden", "big-button", () =>
    loadFromStorage()
  );

  const downloadElement =
    HTMLFactory.makeInvisibleDownloadElement("downloadAnchorElem");

  const exportButton = HTMLFactory.makeButton("Exportieren", "big-button", () =>
    exportMeasurements()
  );

  const container = document.createElement("div");
  container.id = "container";

  const parent = document.createElement("div");
  parent.appendChild(header);
  parent.appendChild(locationSelect);
  parent.appendChild(document.createElement("br"));
  parent.appendChild(startListInput);
  parent.appendChild(loadButton);
  parent.appendChild(downloadElement);
  parent.appendChild(exportButton);
  parent.appendChild(container);

  return parent;
}

function createTableRow(
  table: HTMLTableSectionElement,
  numberPlateValue: number,
  nameValue: string
) {
  const tableRow = table.insertRow();
  const numberPlate = tableRow.insertCell();
  numberPlate.innerText = numberPlateValue.toString();
  tableRow.appendChild(numberPlate);
  const name = document.createElement("td");
  name.className = "name-field";
  name.innerText = nameValue;
  tableRow.appendChild(name);
  return tableRow;
}

function createButton(
  rowNumber: number,
  tableRow: HTMLTableRowElement,
  label: string
) {
  let button = document.getElementById(`button-${rowNumber}`);
  if (!button) {
    button = HTMLFactory.makeButton(
      `${label} ${rowNumber + 1}`,
      "small-button",
      function (e: Event) {
        const elementId = (e.target as HTMLElement).id;
        const matches = elementId.match(/\d+/g);
        if (!matches || matches.length <= 0)
          throw Error(`Couldn't resolve row number for ${elementId}`);
        const rowNumber = parseInt(matches[0]);
        addTimestamp(rowNumber);
        _countdown?.start(_config.startIntervalSeconds);
      },
      `button-${rowNumber}`
    );
    const tableData = tableRow.insertCell();
    tableData.appendChild(button);
    return button;
  }
}

function createDisplay(rowNumber: number, tableRow: HTMLTableRowElement) {
  let display = <HTMLInputElement>(
    document.getElementById(`timestamp-${rowNumber}`)
  );

  if (!display) {
    display = HTMLFactory.makeTextInput(
      `timestamp-${rowNumber}`,
      function (e: Event) {
        try {
          const elementId = (e.target as HTMLElement).id;
          const matches = elementId.match(/\d+/g);
          if (!matches || matches.length <= 0)
            throw Error(`Couldn't resolve row number for ${elementId}`);
          const rowNumber = parseInt(matches[0]);
          if (display.value)
            _entries[rowNumber].time = parseTime(display.value);
          else delete _entries[rowNumber].time;
          saveEntries();
        } catch (error) {
          delete _entries[rowNumber].time;
          display.value = "";
        }
      }
    );
  }
  const tableData = tableRow.insertCell();
  tableData.appendChild(display);
  return display;
}

function addTimestamp(rowNumber: number) {
  const display = <HTMLInputElement>(
    document.getElementById(`timestamp-${rowNumber}`)
  );
  const timestamp = roundTo100Ms(new Date());
  _entries[rowNumber].time = timestamp;
  display.value = formatDateToTimeString(timestamp);
  saveEntries();
}

function saveEntries(): void {
  localStorage.setItem(
    `measurement-${_measurementLocation}`,
    JSON.stringify(_entries)
  );
}

function clearEntries(): void {
  _entries = [];
  localStorage.removeItem(`measurement-${_measurementLocation}`);
}

function loadFromStorage(): void {
  _measurementLocation = (<HTMLSelectElement>(
    document.getElementById("select-measurement-location")
  )).value;
  const measurements = localStorage.getItem(
    `measurement-${_measurementLocation}`
  );
  setCountdown();
  if (measurements) load(JSON.parse(measurements));
}

function loadFromFile(): void {
  _measurementLocation = (<HTMLSelectElement>(
    document.getElementById("select-measurement-location")
  )).value;
  clearEntries();
  setCountdown();
  const fileInput = <HTMLInputElement>document.getElementById("load-file");
  if (fileInput?.files && fileInput.files.length > 0) {
    const file = fileInput.files.item(0);
    if (file)
      file.text().then((text) => {
        load(JSON.parse(text));
        saveEntries();
      });
  }
}

function setCountdown(): void {
  if (
    _measurementLocation.localeCompare("start", undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    _countdown = new Countdown();
  } else {
    resetCountdown();
  }
}

function resetCountdown(): void {
  _countdown?.reset();
  _countdown = undefined;
}

function load(entries: Participant[]) {
  if (!validate(entries)) return;

  _entries = entries;
  if (!_entries) return;

  const container = document.getElementById("container");
  if (!container) throw Error("Container not found");
  container.innerHTML = "";
  const table = document.createElement("table");
  addHeader(table);
  const tableBody = table.createTBody();
  for (let i = 0; i < _entries.length; i++) {
    const tableRow = createTableRow(
      tableBody,
      _entries[i].numberPlate,
      _entries[i].name
    );
    createButton(i, tableRow, _measurementLocation);
    const display = createDisplay(i, tableRow);
    if (_entries[i].time != undefined) {
      display.value = formatDateToTimeString(
        Date.parse(_entries[i].time as string)
      );
    }
  }
  container.appendChild(table);
}

function addHeader(table: HTMLTableElement) {
  const headerRow = document.createElement("tr");
  ["Nr.", "Name", "", "Zeit"].forEach((headerText) => {
    const header = document.createElement("th");
    const textNode = document.createTextNode(headerText);
    header.appendChild(textNode);
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);
}

function validate(entries: Participant[]) {
  if (!(entries instanceof Array)) {
    console.log("participants is not an array");
    return false;
  }
  if (!entries.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Falsches Datenformat");
    return false;
  }
  return true;
}

function reset() {
  _entries = [];
  const container = document.getElementById("container");
  if (container) {
    container.innerHTML = "";
    (<HTMLInputElement>document.getElementById("load-file")).value = "";
  }
}

function exportMeasurements() {
  exportAsJson(_entries, `${_measurementLocation}_${Date.now()}.json`);
}

function formatDateToTimeString(date: number | Date): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Zurich",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  const dateFormatter = new Intl.DateTimeFormat("de-CH", dateOptions);
  return dateFormatter.format(date);
}

export { render, resetCountdown };
