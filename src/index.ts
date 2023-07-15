import startListHtml from "./startList.html";
import "./startList";
import timekeepingHtml from "./timekeeping.html";
import * as timeKeeping from "./timekeeping";
import evaluationHtml from "./evaluation.html";
import "./evaluation";
import "./styles/styles.css";

const contentContainer = document.getElementById("content-container");
openStartList();

function openStartList(): void {
  timeKeeping.resetCountdown();
  if (contentContainer) contentContainer.innerHTML = startListHtml;
}

function openTimekeeping(): void {
  if (contentContainer) contentContainer.innerHTML = timekeepingHtml;
}

function openEvaluation(): void {
  timeKeeping.resetCountdown();
  if (contentContainer) contentContainer.innerHTML = evaluationHtml;
}

(window as any).openStartList = openStartList;
(window as any).openTimekeeping = openTimekeeping;
(window as any).openEvaluation = openEvaluation;
