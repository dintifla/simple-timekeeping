import { Participant } from "./participant";
import "./styles/styles.css";

let _entries: Participant[] = [];
let _measurementLocation: string;

function createTableRow(
  rowNumber: number,
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
    button = document.createElement("button");
    button.id = `button-${rowNumber}`;
    button.onclick = function (e: Event) {
      const elementId = (e.target as HTMLElement).id;
      const matches = elementId.match(/\d+/g);
      if (!matches || matches.length <= 0)
        throw Error(`Couldn't resolve row number for ${elementId}`);
      const rowNumber = parseInt(matches[0]);
      addTimestamp(rowNumber);
    };
    button.innerText = `${label} ${rowNumber + 1}`;
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
    display = document.createElement("input");
    display.setAttribute("type", "text");
    display.id = `timestamp-${rowNumber}`;
    display.onchange = function (e: Event) {
      try {
        const elementId = (e.target as HTMLElement).id;
        const matches = elementId.match(/\d+/g);
        if (!matches || matches.length <= 0)
          throw Error(`Couldn't resolve row number for ${elementId}`);
        const rowNumber = parseInt(matches[0]);
        if (display.value) _entries[rowNumber].time = parseTime(display.value);
        else delete _entries[rowNumber].time;
        saveEntries();
      } catch (error) {
        delete _entries[rowNumber].time;
        display.value = "";
      }
    };
  }
  const tableData = tableRow.insertCell();
  tableData.appendChild(display);
  return display;
}

function parseTime(t: string): Date {
  const d = new Date();
  const time = t.match(/(\d{1,2})(?:[:|.](\d{1,2}))?(?:[:|.](\d{1,2}))?/);
  if (!time) return d;
  d.setHours(parseInt(time[1]));
  d.setMinutes(parseInt(time[2]) || 0);
  d.setSeconds(parseInt(time[3]) || 0);
  d.setMilliseconds(0);
  return d;
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

function roundTo100Ms(timestamp: Date): Date {
  timestamp.setMilliseconds(
    Math.round(timestamp.getMilliseconds() / 100) * 100
  );
  return timestamp;
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
  if (measurements) load(JSON.parse(measurements));
}

function loadFromFile(): void {
  _measurementLocation = (<HTMLSelectElement>(
    document.getElementById("select-measurement-location")
  )).value;
  clearEntries();
  const fileInput = <HTMLInputElement>document.getElementById("load-file");
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files.item(0);
    if (file)
      file.text().then((text) => {
        load(JSON.parse(text));
        saveEntries();
      });
  }
}

function load(entries: Participant[]) {
  if (!validate(entries)) return;

  entries.forEach((e) => delete e.isSpare);
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
      i,
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
  const headerRow = table.createTHead().insertRow();
  for (let header of ["Nr.", "Name", "", "Zeit"]) {
    const cell = headerRow.insertCell();
    cell.innerText = header;
  }
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
  if (!container) throw Error("Container not found");
  container.innerHTML = "";
  (<HTMLInputElement>document.getElementById("load-file")).value = "";
}
function exportMeasurements() {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(_entries)
  )}`;
  const dlAnchorElem = document.getElementById("downloadAnchorElem");
  if (!dlAnchorElem) throw Error("Download element not found");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute(
    "download",
    `${_measurementLocation}_${Date.now()}.json`
  );
  dlAnchorElem.click();
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

function showSnackbar(text: string) {
  const snackbar = document.getElementById("snackbar");
  if (!snackbar) throw Error("Snackbar not found");
  snackbar.innerText = text;

  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}

(window as any).loadFromStorage = loadFromStorage;
(window as any).loadFromFile = loadFromFile;
(window as any).reset = reset;
(window as any).exportMeasurements = exportMeasurements;
