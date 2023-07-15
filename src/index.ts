import startListHtml from "./startList.html";
import * as startList from "./startList";
import timekeepingHtml from "./timekeeping.html";
import * as timeKeeping from "./timekeeping";
import evaluationHtml from "./evaluation.html";
import * as evaluation from "./evaluation";
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

(window as any).newParticipantList = startList.newParticipantList;
(window as any).createParticipantField = startList.createParticipantField;
(window as any).exportParticipants = startList.exportParticipants;
(window as any).loadFromStorage = startList.loadFromStorage;
(window as any).loadFromFile = startList.loadFromFile;

(window as any).loadFromStorage = timeKeeping.loadFromStorage;
(window as any).loadFromFile = timeKeeping.loadFromFile;
(window as any).reset = timeKeeping.reset;
(window as any).exportMeasurements = timeKeeping.exportMeasurements;

(window as any).calculate = evaluation.calculate;

(window as any).openStartList = openStartList;
(window as any).openTimekeeping = openTimekeeping;
(window as any).openEvaluation = openEvaluation;
