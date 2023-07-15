import { Participant } from "./participant";
import { showSnackbar } from "./components/snackbar";
import { exportAsJson } from "./helpers/fileDownloader";
import { Configuration } from "./configuration";

let _participants: Participant[] = [];
const _config: Configuration = {
  categories: ["Male", "Female"],
  startIntervalSeconds: 30,
};
const _categories: string[] = _config.categories;

function newParticipantList(): void {
  if (_participants.length > 0) exportParticipants();
  clearParticipants();

  if (_categories.length <= 0) {
    showSnackbar("Configuriere mindestens eine Kategorie");
    throw Error("no categories configured");
  }
  const container = document.getElementById("container");
  if (!container) throw new Error("Container not found");
  container.innerHTML = "";
  const table = document.createElement("table");
  addHeader(table);
  const tableBody = table.createTBody();
  tableBody.id = "participant-table-body";
  container.appendChild(table);
}

function addHeader(table: HTMLTableElement): void {
  const headerRow = document.createElement("tr");
  ["Nr.", "Kategorie", "Name"].forEach((headerText) => {
    const header = document.createElement("th");
    const textNode = document.createTextNode(headerText);
    header.appendChild(textNode);
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);
}

function createParticipantField(): void {
  const table = <HTMLTableSectionElement>(
    document.getElementById("participant-table-body")
  );
  if (!table) throw Error("table not found");
  const rowNumber = _participants.length;
  const row = createTableRow(rowNumber, table);
  const numberPlate = createNumberPlateField(rowNumber, row);
  createCategorySelector(rowNumber, row);
  createNameField(rowNumber, row);

  _participants.push({
    numberPlate: parseInt(numberPlate.innerText),
    category: _categories[0],
    name: "",
  });
  saveParticipants();
}

function createCategorySelector(
  rowNumber: number,
  row: HTMLTableRowElement,
  categoryValue?: string
): HTMLDivElement {
  const cell = row.insertCell();
  const categorySelector = document.createElement("div");
  categorySelector.className = "category-selection";
  for (const category of _categories) {
    const label = document.createElement("label");
    label.innerText = category;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `category-${rowNumber}`;
    input.id = `category-${category}-${rowNumber}`;
    if (categoryValue != undefined) {
      input.checked = category === categoryValue;
    } else {
      input.checked = category === _categories[0];
    }
    input.onchange = function (e: Event) {
      const elementId = (e.target as HTMLElement).id;
      onCategoryChanged(elementId, category, input);
    };
    label.htmlFor = input.id;
    categorySelector.appendChild(label);
    categorySelector.appendChild(input);
  }
  cell.appendChild(categorySelector);
  return categorySelector;
}

function onCategoryChanged(
  elementId: string,
  category: string,
  input: HTMLInputElement
) {
  const matches = elementId.match(/\d+/g);
  if (!matches || matches.length <= 0)
    throw Error(`Couldn't resolve row number for ${elementId}`);
  const rowNumber = parseInt(matches[0]);
  if (input.checked) {
    _participants[rowNumber].category = category;
  }
  saveParticipants();
}

function createNumberPlateField(
  rowNumber: number,
  row: HTMLTableRowElement,
  plateValue?: number
): HTMLDivElement {
  const cell = row.insertCell();
  const numberPlate = document.createElement("div");
  numberPlate.id = `numberplate-${rowNumber}`;
  numberPlate.innerText = (
    plateValue || getNextNumberPlateNumber(_participants)
  ).toString();
  cell.appendChild(numberPlate);
  return numberPlate;
}

function getNextNumberPlateNumber(participants: Participant[]): number {
  return (
    participants.map((p) => p.numberPlate).reduce((a, b) => Math.max(a, b), 0) +
    1
  );
}

function createNameField(
  rowNumber: number,
  row: HTMLTableRowElement,
  nameValue?: string
): HTMLInputElement {
  const cell = row.insertCell();
  const name = document.createElement("input");
  name.setAttribute("type", "text");
  name.id = `participant-name-${rowNumber}`;
  name.onchange = function (e: Event) {
    try {
      const elementId = (e.target as HTMLElement).id;
      const matches = elementId.match(/\d+/g);
      if (!matches || matches.length <= 0)
        throw Error(`Couldn't resolve row number for ${elementId}`);
      const rowNumber = parseInt(matches[0]);
      _participants[rowNumber].name = name.value;
      saveParticipants();
    } catch (error) {
      // ignore
    }
  };
  if (nameValue) name.value = nameValue;
  cell.appendChild(name);
  return name;
}

function createTableRow(
  rowNumber: number,
  table: HTMLTableSectionElement
): HTMLTableRowElement {
  let tableRow = <HTMLTableRowElement>(
    document.getElementById(`container-row-${rowNumber}`)
  );
  if (!tableRow) {
    tableRow = table.insertRow();
    tableRow.id = `container-row-${rowNumber}`;
  }
  return tableRow;
}

function saveParticipants(): void {
  localStorage.setItem("participants", JSON.stringify(_participants));
}

function clearParticipants(): void {
  _participants = [];
  localStorage.removeItem("participants");
}

function loadFromStorage(): void {
  const participants = localStorage.getItem("participants");
  if (participants) {
    load(JSON.parse(participants));
  } else throw Error("Could not load participants from storage");
}

function loadFromFile(): void {
  const fileInput = <HTMLInputElement>document.getElementById("load-file");
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files.item(0);
    if (file)
      file.text().then((text) => {
        load(JSON.parse(text));
        saveParticipants();
      });
  }
}

function load(participants: Participant[]) {
  const participantsWithoutSpare = participants.filter((p) => !p.isSpare);
  if (!validate(participantsWithoutSpare)) return;

  _participants = participantsWithoutSpare;
  if (!_participants) return;

  const container = document.getElementById("container");
  if (!container) throw Error("Container not found");
  container.innerHTML = "";
  const table = document.createElement("table");
  addHeader(table);
  const tableBody = table.createTBody();
  tableBody.id = "participant-table-body";
  container.appendChild(table);
  for (let i = 0; i < _participants.length; i++) {
    const row = createTableRow(i, tableBody);
    createNumberPlateField(i, row, _participants[i].numberPlate);
    createCategorySelector(i, row, _participants[i].category);
    createNameField(i, row, _participants[i].name);
  }
}

function validate(participants: Participant[]) {
  if (!(participants instanceof Array)) {
    console.log("participants is not an array");
    return false;
  }
  if (!participants.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Falsches Datenformat");
    return false;
  }
  return true;
}

function exportParticipants() {
  exportAsJson(getWithSpare(_participants), `Startliste_${Date.now()}.json`);
}

function getWithSpare(participants: Participant[]) {
  const SPARE_COUNT = 20;
  const withSpares = participants.map((p) => p);
  for (let i = 0; i < SPARE_COUNT; ++i) {
    withSpares.push({
      numberPlate: getNextNumberPlateNumber(withSpares),
      category: _categories[0],
      name: "",
      isSpare: true,
    });
  }
  return withSpares;
}

export {
  newParticipantList,
  createParticipantField,
  exportParticipants,
  loadFromStorage,
  loadFromFile,
};
