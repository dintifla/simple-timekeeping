import css from "./styles/styles.css";

let _entries = [];
let _measurementLocation;

function createTableRow(rowNumber, table, numberPlateValue, nameValue) {
  const tableRow = table.insertRow();
  const numberPlate = tableRow.insertCell();
  numberPlate.innerText = numberPlateValue;
  tableRow.appendChild(numberPlate);
  const name = document.createElement("td");
  name.className = "name-field";
  name.innerText = nameValue;
  tableRow.appendChild(name);
  return tableRow;
}

function createButton(rowNumber, tableRow, label) {
  let button = document.getElementById(`button-${rowNumber}`);
  if (!button) {
    button = document.createElement("button");
    button.id = `button-${rowNumber}`;
    button.onclick = function () {
      const rowNumber = parseInt(this.id.match(/\d+/g)[0]);
      addTimestamp(rowNumber);
    };
    button.innerText = `${label} ${rowNumber + 1}`;
    const tableData = tableRow.insertCell();
    tableData.appendChild(button);
    return button;
  }
}

function createDisplay(rowNumber, tableRow) {
  let display = document.getElementById(`timestamp-${rowNumber}`);

  if (!display) {
    display = document.createElement("input");
    display.setAttribute("type", "text");
    display.id = `timestamp-${rowNumber}`;
    display.onchange = function () {
      try {
        const rowNumber = parseInt(this.id.match(/\d+/g)[0]);
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

function parseTime(t) {
  const d = new Date();
  const time = t.match(/(\d{1,2})(?:[:|.](\d{1,2}))?(?:[:|.](\d{1,2}))?/);
  d.setHours(parseInt(time[1]));
  d.setMinutes(parseInt(time[2]) || 0);
  d.setSeconds(parseInt(time[3]) || 0);
  d.setMilliseconds(0);
  return d;
}

function addTimestamp(rowNumber) {
  const display = document.getElementById(`timestamp-${rowNumber}`);
  const timestamp = roundTo100Ms(new Date());
  _entries[rowNumber].time = timestamp;
  display.value = formatDateToTimeString(timestamp);
  saveEntries();
}

function roundTo100Ms(timestamp) {
  timestamp.setMilliseconds(
    Math.round(timestamp.getMilliseconds() / 100) * 100
  );
  return timestamp;
}

function saveEntries() {
  localStorage.setItem(
    `measurement-${_measurementLocation}`,
    JSON.stringify(_entries)
  );
}

function clearEntries() {
  _entries = [];
  localStorage.removeItem(`measurement-${_measurementLocation}`);
}

function loadFromStorage() {
  _measurementLocation = document.getElementById(
    "select-measurement-location"
  ).value;
  load(JSON.parse(localStorage.getItem(`measurement-${_measurementLocation}`)));
}

function loadFromFile() {
  _measurementLocation = document.getElementById(
    "select-measurement-location"
  ).value;
  clearEntries();
  Array.from(document.getElementById("load-file").files)[0]
    .text()
    .then((text) => {
      load(JSON.parse(text));
      saveEntries();
    });
}

function load(entries) {
  if (!validate(entries)) return;

  entries.forEach((e) => delete e.isSpare);
  _entries = entries;
  if (!_entries) return;

  const container = document.getElementById("container");
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
    if (_entries[i].time) {
      display.value = formatDateToTimeString(Date.parse(_entries[i].time));
    }
  }
  container.appendChild(table);
}

function addHeader(table) {
  const headerRow = table.createTHead().insertRow();
  for (let header of ["Nr.", "Name", "", "Zeit"]) {
    const cell = headerRow.insertCell();
    cell.innerText = header;
  }
}

function validate(entries) {
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
  container.innerHTML = "";
  document.getElementById("load-file").value = "";
}
function exportMeasurements() {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(_entries)
  )}`;
  const dlAnchorElem = document.getElementById("downloadAnchorElem");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute(
    "download",
    `${_measurementLocation}_${Date.now()}.json`
  );
  dlAnchorElem.click();
}

function formatDateToTimeString(date) {
  const dateOptions = {
    timeZone: "Europe/Zurich",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };

  const dateFormatter = new Intl.DateTimeFormat("de-CH", dateOptions);
  return dateFormatter.format(date);
}

function showSnackbar(text) {
  const snackbar = document.getElementById("snackbar");
  snackbar.innerText = text;

  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}

window.loadFromStorage = loadFromStorage;
window.loadFromFile = loadFromFile;
window.reset = reset;
window.exportMeasurements = exportMeasurements;
