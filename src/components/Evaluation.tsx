import { useRef, useState } from "react";
import { Result } from "../lib/result";
import { Timing } from "../lib/timing";
import { ResultCalculator } from "../lib/result-calculator";
import { ReferenceTimeResultCalculator } from "../lib/result-calculator-with-reference-time";
import { validateResults } from "../lib/result-validation";
import { FileDownloader } from "../lib/file-downloader";
import { messageBus } from "../state/message-bus";

export function Evaluation() {
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<{ [category: string]: Result[] }>({});
  const startFileRef = useRef<HTMLInputElement>(null);
  const finishFileRef = useRef<HTMLInputElement>(null);
  const refTimeRef = useRef<HTMLInputElement>(null);

  const calculator = new ResultCalculator();
  const eBikeCalculator = new ReferenceTimeResultCalculator();

  const validateFiles = (): boolean => {
    if (!startFileRef.current?.value) {
      messageBus.add("Start file fehlt!");
      return false;
    }
    if (!finishFileRef.current?.value) {
      messageBus.add("Ziel file fehlt!");
      return false;
    }
    return true;
  };

  const validateRefTime = (refTimeValue: string): boolean => {
    if (/^(\d{2}):(\d{2}):(\d{2})(\.\d)?$/.test(refTimeValue)) {
      return true;
    }
    messageBus.add(
      "Ungültiges Format für die Referenzzeit. Erwartet wird HH:mm:ss.s",
    );
    return false;
  };

  const getRefTimeMs = (fieldValue: string): number => {
    const refTime = fieldValue ?? "00:00:00.0";
    return Date.parse("1970-01-01T" + refTime + "Z");
  };

  const getUniqueCategories = (timings: Timing[]): string[] => {
    return timings
      .map((t) => t.category)
      .filter((category, i, cats) => cats.indexOf(category) == i);
  };

  const exportResults = (title: string, categoryResults: Result[]) => {
    const fileName = `Resultate_${title}_${Date.now()}`;
    FileDownloader.exportAsJson(categoryResults, fileName + ".json");
    FileDownloader.exportAsCsv(categoryResults, fileName + ".csv");
  };

  const calculate = () => {
    if (!validateFiles()) return;
    const refTimeValue = refTimeRef.current?.value ?? "";
    if (!validateRefTime(refTimeValue)) return;

    const startFile = startFileRef.current?.files;
    const finishFile = finishFileRef.current?.files;
    if (!startFile) throw Error("Start file not found");
    if (!finishFile) throw Error("Finish file not found");

    const refTimeMs = getRefTimeMs(refTimeValue);
    Promise.all([startFile[0].text(), finishFile[0].text()]).then(
      (fileContents: string[]) => {
        const starts = JSON.parse(fileContents[0]);
        const finishes = JSON.parse(fileContents[1]);
        if (starts.length != finishes.length) {
          messageBus.add("Start und Ziel file sind nicht gleich lang");
          return;
        }

        if (!validateResults(starts, finishes)) return;

        const timings = calculator.mapStartToFinish(starts, finishes);
        const uniqueCategories = getUniqueCategories(timings);
        const nextResults: { [category: string]: Result[] } = {};
        for (const category of uniqueCategories) {
          if (category === "E-Bike") {
            nextResults[category] =
              eBikeCalculator.calculateAndSortToReferenceTime(
                timings.filter((t) => t.category === category),
                refTimeMs,
              );
          } else {
            nextResults[category] = calculator.calculateRankAndSort(
              timings.filter((t) => t.category === category),
            );
          }
          exportResults(category, nextResults[category]);
        }
        setCategories(uniqueCategories);
        setResults(nextResults);
      },
    );
  };

  return (
    <>
      <h1>Auswertung</h1>

      <label htmlFor="start-file">Startzeiten:</label>
      <input type="file" id="start-file" accept=".json" ref={startFileRef} />
      <br />
      <label htmlFor="finish-file">Ankunftszeiten:</label>
      <input type="file" id="finish-file" accept=".json" ref={finishFileRef} />
      <br />

      <label htmlFor="refTimeEbike">Referenzzeit E-Bike (HH:mm:ss.s):</label>
      <input type="text" id="refTimeEbike" ref={refTimeRef} />
      <br />
      <button
        type="button"
        id="evaluate"
        className="big-button"
        onClick={calculate}
      >
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
