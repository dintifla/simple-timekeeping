import * as startList from "./startList";
import * as timeKeeping from "./timekeeping";
import * as evaluation from "./evaluation";
import "./styles/styles.css";

render();
const contentContainer = document.getElementById("content-container");
openStartList();

function render(): void {
  const container = document.createElement("div");

  const contentContainer = document.createElement("div");
  contentContainer.id = "content-container";

  const snackBar = document.createElement("div");
  snackBar.id = "snackbar";

  container.appendChild(renderMenu());
  container.appendChild(contentContainer);
  container.appendChild(snackBar);

  document.title = "Zeitmessung";
  document.body.lang = "de-CH";
  document.body.appendChild(container);
}

function renderMenu(): HTMLElement {
  const menu = document.createElement("menu");

  const menuItems: [string, () => void][] = [
    ["Startliste", openStartList],
    ["Zeitmessung", openTimekeeping],
    ["Auswertung", openEvaluation],
  ];
  menuItems.forEach((x: [string, () => void]) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.innerText = x[0];
    button.className = "big-button";
    button.onclick = x[1];
    li.appendChild(button);
    menu.appendChild(li);
  });

  return menu;
}

function openStartList(): void {
  timeKeeping.resetCountdown();
  if (contentContainer) {
    contentContainer.innerHTML = "";
    contentContainer.appendChild(startList.render());
  }
}

function openTimekeeping(): void {
  if (contentContainer) {
    contentContainer.innerHTML = "";
    contentContainer.appendChild(timeKeeping.render());
  }
}

function openEvaluation(): void {
  timeKeeping.resetCountdown();
  if (contentContainer) {
    contentContainer.innerHTML = "";
    contentContainer.appendChild(evaluation.render());
  }
}
