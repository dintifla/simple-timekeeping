import { Participant } from "./participant";
import { showSnackbar } from "./snackbar";
import "./styles/styles.css";

let _participants: Participant[] = [];
const _categories: any = {
  M: true,
  F: false,
};

function newParticipantList(): void {
  if (_participants.length > 0) exportParticipants();
  clearParticipants();
  const container = document.getElementById("container");
  if (!container) throw new Error("Container not found");
  container.innerHTML = "";
  appendHeader(container);
}

function appendHeader(container: HTMLElement): void {
  const row = document.createElement("div");
  row.className = "container-row";
  container.appendChild(row);
  const numberPlateHeader = document.createElement("div");
  numberPlateHeader.innerText = "Startnummer";
  row.appendChild(numberPlateHeader);
  const categoryHeader = document.createElement("div");
  categoryHeader.innerText = "Geschlecht";
  row.appendChild(categoryHeader);
  const nameHeader = document.createElement("div");
  nameHeader.innerText = "Name";
  row.appendChild(nameHeader);
}

function createParticipantField(): void {
  const container = document.getElementById("container");
  if (!container) throw Error("container not found");
  const rowNumber = _participants.length;
  const row = createContainerRow(rowNumber, container);
  const numberPlate = createNumberPlateField(rowNumber, row);
  createCategorySelector(rowNumber, row);
  createNameField(rowNumber, row);

  _participants.push({
    numberPlate: parseInt(numberPlate.innerText),
    category: "M",
    name: "",
  });
  saveParticipants();
}

function createCategorySelector(
  rowNumber: number,
  row: HTMLElement,
  categoryValue?: string
): HTMLDivElement {
  const categorySelector = document.createElement("div");
  categorySelector.className = "category-selection";
  for (const category in _categories) {
    const label = document.createElement("label");
    label.innerText = category;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `category-${rowNumber}`;
    input.id = `category-${category}-${rowNumber}`;
    if (categoryValue != undefined) {
      input.checked = category === categoryValue;
    } else {
      input.checked = _categories[category];
    }
    input.onchange = function (e: Event) {
      const elementId = (e.target as HTMLElement).id;
      const matches = elementId.match(/\d+/g);
      if (!matches || matches.length <= 0)
        throw Error(`Couldn't resolve row number for ${elementId}`);
      const rowNumber = parseInt(matches[0]);
      if (category === "M") {
        _participants[rowNumber].category = input.checked ? "M" : "F";
      } else if (category === "F") {
        _participants[rowNumber].category = input.checked ? "F" : "M";
      }
      saveParticipants();
    };
    label.htmlFor = input.id;
    categorySelector.appendChild(label);
    categorySelector.appendChild(input);
  }
  row.appendChild(categorySelector);
  return categorySelector;
}

function createNumberPlateField(
  rowNumber: number,
  row: HTMLElement,
  plateValue?: number
): HTMLDivElement {
  const numberPlate = document.createElement("div");
  numberPlate.id = `numberplate-${rowNumber}`;
  numberPlate.innerText = (
    plateValue || getNextNumberPlateNumber(_participants)
  ).toString();
  row.appendChild(numberPlate);
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
  row: HTMLElement,
  nameValue?: string
): HTMLInputElement {
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
  row.appendChild(name);
  return name;
}

function createContainerRow(rowNumber: number, container: HTMLElement) {
  let containerRow = document.getElementById(`container-row-${rowNumber}`);

  if (!containerRow) {
    containerRow = document.createElement("div");
    containerRow.id = `container-row-${rowNumber}`;
    containerRow.classList.add("container-row");
    container.appendChild(containerRow);
  }
  return containerRow;
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
  appendHeader(container);
  for (let i = 0; i < _participants.length; i++) {
    const row = createContainerRow(i, container);
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
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(getWithSpare(_participants))
  )}`;
  const dlAnchorElem = document.getElementById("downloadAnchorElem");
  if (!dlAnchorElem) throw Error("Download element not found");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `startListe_${Date.now()}.json`);
  dlAnchorElem.click();
}

function getWithSpare(participants: Participant[]) {
  const SPARE_COUNT = 20;
  const withSpares = participants.map((p) => p);
  for (let i = 0; i < SPARE_COUNT; ++i) {
    withSpares.push({
      numberPlate: getNextNumberPlateNumber(withSpares),
      category: "M",
      name: "",
      isSpare: true,
    });
  }
  return withSpares;
}

(window as any).newParticipantList = newParticipantList;
(window as any).createParticipantField = createParticipantField;
(window as any).exportParticipants = exportParticipants;
(window as any).loadFromStorage = loadFromStorage;
(window as any).loadFromFile = loadFromFile;