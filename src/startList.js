import css from "./styles/styles.css";

let _participants = [];
const _categories = {
  M: true,
  F: false,
};

function newParticipantList() {
  if (_participants.length > 0) exportParticipants();
  clearParticipants();
  const container = document.getElementById("container");
  container.innerHTML = "";
  appendHeader(container);
}

function appendHeader(container) {
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

function createParticipantField() {
  const container = document.getElementById("container");
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

function createCategorySelector(rowNumber, row, categoryValue) {
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
    input.onchange = function () {
      const rowNumber = parseInt(this.id.match(/\d+/g)[0]);
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

function createNumberPlateField(rowNumber, row, plateValue) {
  const numberPlate = document.createElement("div");
  numberPlate.id = `numberplate-${rowNumber}`;
  numberPlate.innerText = plateValue || getNextNumberPlateNumber(_participants);
  row.appendChild(numberPlate);
  return numberPlate;
}

function getNextNumberPlateNumber(participants) {
  return (
    participants.map((p) => p.numberPlate).reduce((a, b) => Math.max(a, b), 0) +
    1
  );
}

function createNameField(rowNumber, row, nameValue) {
  const name = document.createElement("input");
  name.setAttribute("type", "text");
  name.id = `participant-name-${rowNumber}`;
  name.onchange = function () {
    try {
      const rowNumber = parseInt(this.id.match(/\d+/g)[0]);
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

function createContainerRow(rowNumber, container) {
  let containerRow = document.getElementById(`container-row-${rowNumber}`);

  if (!containerRow) {
    containerRow = document.createElement("div");
    containerRow.id = `container-row-${rowNumber}`;
    containerRow.classList.add("container-row");
    container.appendChild(containerRow);
  }
  return containerRow;
}

function saveParticipants() {
  localStorage.setItem("participants", JSON.stringify(_participants));
}

function clearParticipants() {
  _participants = [];
  localStorage.removeItem("participants");
}

function loadFromStorage() {
  load(JSON.parse(localStorage.getItem("participants")));
}

function loadFromFile() {
  Array.from(document.getElementById("load-file").files)[0]
    .text()
    .then((text) => {
      load(JSON.parse(text));
      saveParticipants();
    });
}

function load(participants) {
  const participantsWithoutSpare = participants.filter((p) => !p.isSpare);
  if (!validate(participantsWithoutSpare)) return;

  _participants = participantsWithoutSpare;
  if (!_participants) return;

  const container = document.getElementById("container");
  container.innerHTML = "";
  appendHeader(container);
  for (let i = 0; i < _participants.length; i++) {
    const row = createContainerRow(i, container);
    createNumberPlateField(i, row, _participants[i].numberPlate);
    createCategorySelector(i, row, _participants[i].category);
    createNameField(i, row, _participants[i].name);
  }
}

function validate(participants) {
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
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `startListe_${Date.now()}.json`);
  dlAnchorElem.click();
}

function getWithSpare(participants) {
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

function showSnackbar(text) {
  const snackbar = document.getElementById("snackbar");
  snackbar.innerText = text;

  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}

window.newParticipantList = newParticipantList;
window.createParticipantField = createParticipantField;
window.exportParticipants = exportParticipants;
window.loadFromStorage = loadFromStorage;
window.loadFromFile = loadFromFile;
