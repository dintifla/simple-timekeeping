import { useState } from "react";
import { Result } from "../lib/result";
import { Timing } from "../lib/timing";
import { ResultCalculator } from "../lib/result-calculator";
import { ReferenceTimeResultCalculator } from "../lib/result-calculator-with-reference-time";
import { validateResults } from "../lib/result-validation";
import { FileDownloader } from "../lib/file-downloader";
import { exportRanglisteAsExcel as exportFullResultsAsExcel } from "../lib/full-results-exporter";
import { messageBus } from "../state/message-bus";

const calculator = new ResultCalculator();
const eBikeCalculator = new ReferenceTimeResultCalculator();

function getUniqueCategories(timings: Timing[]): string[] {
  return timings
    .map((t) => t.category)
    .filter((category, i, cats) => cats.indexOf(category) === i);
}

function exportResultsPerCategory(
  title: string,
  categoryResults: Result[],
): void {
  const fileName = `Resultate_${title}_${Date.now()}`;
  FileDownloader.exportAsJson(categoryResults, fileName + ".json");
}

export function Evaluation() {
  const [startFile, setStartFile] = useState<File | null>(null);
  const [finishFile, setFinishFile] = useState<File | null>(null);
  const [refTime, setRefTime] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<{ [category: string]: Result[] }>({});

  const validate = (): boolean => {
    if (!startFile) {
      messageBus.add("Start file fehlt!");
      return false;
    }
    if (!finishFile) {
      messageBus.add("Ziel file fehlt!");
      return false;
    }
    if (!/^(\d{2}):(\d{2}):(\d{2})(\.\d)?$/.test(refTime)) {
      messageBus.add(
        "Ungültiges Format für die Referenzzeit. Erwartet wird HH:mm:ss.s",
      );
      return false;
    }
    return true;
  };

  const calculate = async () => {
    if (!validate() || !startFile || !finishFile) return;

    const refTimeMs = Date.parse("1970-01-01T" + refTime + "Z");
    const [startText, finishText] = await Promise.all([
      startFile.text(),
      finishFile.text(),
    ]);
    const starts = JSON.parse(startText);
    const finishes = JSON.parse(finishText);
    if (starts.length !== finishes.length) {
      messageBus.add("Start und Ziel file sind nicht gleich lang");
      return;
    }
    if (!validateResults(starts, finishes)) return;

    const timings = calculator.mapStartToFinish(starts, finishes);
    const uniqueCategories = getUniqueCategories(timings);
    const nextResults: { [category: string]: Result[] } = {};
    for (const category of uniqueCategories) {
      const categoryTimings = timings.filter((t) => t.category === category);
      nextResults[category] =
        category === "E-Bike"
          ? eBikeCalculator.calculateAndSortToReferenceTime(
              categoryTimings,
              refTimeMs,
            )
          : calculator.calculateRankAndSort(categoryTimings);
      exportResultsPerCategory(category, nextResults[category]);
    }
    await exportFullResultsAsExcel(nextResults);
    setCategories(uniqueCategories);
    setResults(nextResults);
  };

  return (
    <>
      <h1>Auswertung</h1>

      <label htmlFor="start-file">Startzeiten:</label>
      <input
        type="file"
        id="start-file"
        accept=".json"
        onChange={(e) => setStartFile(e.target.files?.item(0) ?? null)}
      />
      <br />
      <label htmlFor="finish-file">Ankunftszeiten:</label>
      <input
        type="file"
        id="finish-file"
        accept=".json"
        onChange={(e) => setFinishFile(e.target.files?.item(0) ?? null)}
      />
      <br />

      <label htmlFor="refTimeEbike">Referenzzeit E-Bike (HH:mm:ss.s):</label>
      <input
        type="text"
        id="refTimeEbike"
        value={refTime}
        onChange={(e) => setRefTime(e.target.value)}
      />
      <br />
      <button type="button" className="big-button" onClick={calculate}>
        Auswerten
      </button>

      {categories.map((category) => (
        <div key={category}>
          <h3>{category}</h3>
          <table>
            <tbody>
              <tr>
                <th>Rang</th>
                <th>Startnummer</th>
                <th>Name</th>
                <th>Startzeit</th>
                <th>Ankunftszeit</th>
                <th>Laufzeit</th>
                <th>Rückstand</th>
              </tr>
              {results[category]?.map((result, index) => (
                <tr key={`${result.numberPlate}-${index}`}>
                  <td>{result.rank}</td>
                  <td>{result.numberPlate}</td>
                  <td>{result.name}</td>
                  <td>{result.startTime}</td>
                  <td>{result.finishTime}</td>
                  <td>{result.result}</td>
                  <td>{result.delay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
