import { useState } from "react";
import { Calculator } from "lucide-react";
import { Result } from "../lib/result";
import { Timing } from "../lib/timing";
import { ResultCalculator } from "../lib/result-calculator";
import { ReferenceTimeResultCalculator } from "../lib/result-calculator-with-reference-time";
import { validateResults } from "../lib/result-validation";
import { FileDownloader } from "../lib/file-downloader";
import { exportRanglisteAsExcel as exportFullResultsAsExcel } from "../lib/full-results-exporter";
import { messageBus } from "../state/message-bus";
import { Button } from "./ui/Button";

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
  const [isCalculating, setIsCalculating] = useState(false);

  const refTimeValid = /^(\d{2}):(\d{2}):(\d{2})(\.\d)?$/.test(refTime);

  const validate = (): boolean => {
    if (!startFile) {
      messageBus.add("Start file fehlt!");
      return false;
    }
    if (!finishFile) {
      messageBus.add("Ziel file fehlt!");
      return false;
    }
    if (!refTimeValid) {
      messageBus.add(
        "Ungültiges Format für die Referenzzeit. Erwartet wird HH:mm:ss.s",
      );
      return false;
    }
    return true;
  };

  const calculate = async () => {
    if (!validate() || !startFile || !finishFile) return;

    setIsCalculating(true);
    try {
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
      messageBus.add("Auswertung erstellt und exportiert.", "success");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <section className="space-y-5">
      <h1>Auswertung</h1>

      <div className="card space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="start-file">Startzeiten</label>
          <input
            type="file"
            id="start-file"
            accept=".json"
            onChange={(e) => setStartFile(e.target.files?.item(0) ?? null)}
          />
          {startFile && (
            <p className="text-xs text-muted">Gewählt: {startFile.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="finish-file">Ankunftszeiten</label>
          <input
            type="file"
            id="finish-file"
            accept=".json"
            onChange={(e) => setFinishFile(e.target.files?.item(0) ?? null)}
          />
          {finishFile && (
            <p className="text-xs text-muted">Gewählt: {finishFile.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="refTimeEbike">Referenzzeit E-Bike</label>
          <input
            type="text"
            id="refTimeEbike"
            className="max-w-[12rem] tabular-nums"
            placeholder="hh:mm:ss.s"
            aria-invalid={refTime !== "" && !refTimeValid}
            aria-describedby="refTime-hint"
            value={refTime}
            onChange={(e) => setRefTime(e.target.value)}
          />
          <p
            id="refTime-hint"
            className={`text-xs ${
              refTime !== "" && !refTimeValid ? "text-danger" : "text-muted"
            }`}
          >
            Format: HH:mm:ss.s (z.&nbsp;B. 01:23:45.6)
          </p>
        </div>

        <Button variant="primary" onClick={calculate} loading={isCalculating}>
          {!isCalculating && (
            <Calculator className="h-4 w-4" aria-hidden="true" />
          )}
          {isCalculating ? "Wird ausgewertet…" : "Auswerten"}
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <h3>{category}</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Startnummer</th>
                  <th>Name</th>
                  <th>Startzeit</th>
                  <th>Ankunftszeit</th>
                  <th>Laufzeit</th>
                  <th>Rückstand</th>
                </tr>
              </thead>
              <tbody>
                {results[category]?.map((result, index) => (
                  <tr key={`${result.numberPlate}-${index}`}>
                    <td className="font-semibold tabular-nums">
                      {result.rank}
                    </td>
                    <td className="tabular-nums">{result.numberPlate}</td>
                    <td>{result.name}</td>
                    <td className="tabular-nums">{result.startTime}</td>
                    <td className="tabular-nums">{result.finishTime}</td>
                    <td className="tabular-nums">{result.result}</td>
                    <td className="tabular-nums">{result.delay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
