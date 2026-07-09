import { useRef, useState } from "react";
import { Participant } from "../lib/participant";
import { configuration } from "../lib/config";
import { parseTime, roundTo100Ms } from "../lib/time";
import { formatDateToTimeString } from "../lib/format-date-to-timestring";
import { useMeasurements } from "../hooks/useMeasurements";
import { countdownBus } from "../state/countdown-bus";
import { StartCountdown } from "./StartCountdown";

const categories = configuration.categories;

export function Timekeeping() {
  const [location, setLocation] = useState("Start");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { entries, load, loadFromFile, updateEntry, exportEntries } =
    useMeasurements(location);

  const changeLocation = (nextLocation: string) => {
    setLocation(nextLocation);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) loadFromFile(file);
  };

  const takeTime = (participant: Participant) => {
    updateEntry(participant.numberPlate, { time: roundTo100Ms(new Date()) });
    countdownBus.start();
  };

  const setManualTime = (value: string, participant: Participant) => {
    updateEntry(participant.numberPlate, {
      time: value ? parseTime(value) : "",
    });
  };

  const nameEditIsEnabled = (participant: Participant): boolean =>
    location === "Start" && participant.isSpare === true;

  return (
    <>
      <h1>Zeitmessung</h1>

      <label htmlFor="select-measurement-location">Mess-Ort:</label>
      <select
        id="select-measurement-location"
        className="big-select"
        value={location}
        onChange={(e) => changeLocation(e.target.value)}
      >
        <option>Start</option>
        <option>Ziel</option>
      </select>

      <br />
      <label htmlFor="load-file">Startliste laden:</label>
      <input
        type="file"
        id="load-file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFile}
      />

      <button type="button" className="big-button" onClick={load}>
        Laden
      </button>

      <button type="button" className="big-button" onClick={exportEntries}>
        Exportieren
      </button>

      <table>
        <tbody>
          <tr>
            <th>Nr.</th>
            <th></th>
            <th>Name</th>
            <th></th>
            <th>Zeit</th>
          </tr>
          {entries.map((participant) => (
            <tr key={participant.numberPlate}>
              <td>{participant.numberPlate}</td>
              <td>
                {nameEditIsEnabled(participant) && (
                  <div className="category-selection">
                    {categories.map((category) => (
                      <label key={category}>
                        <input
                          type="radio"
                          name={`category-${participant.numberPlate}`}
                          value={category}
                          checked={participant.category === category}
                          onChange={() =>
                            updateEntry(participant.numberPlate, { category })
                          }
                        />
                        <b>{category}</b>
                      </label>
                    ))}
                  </div>
                )}
              </td>
              <td>
                {!nameEditIsEnabled(participant) && (
                  <div className="name-column">{participant.name}</div>
                )}
                {nameEditIsEnabled(participant) && (
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) =>
                      updateEntry(participant.numberPlate, {
                        name: e.target.value,
                      })
                    }
                  />
                )}
              </td>
              <td>
                <button
                  className="small-button"
                  onClick={() => takeTime(participant)}
                >
                  {location} {participant.numberPlate}
                </button>
              </td>
              <td>
                <input
                  key={String(participant.time)}
                  type="text"
                  defaultValue={formatDateToTimeString(participant.time)}
                  onBlur={(e) => setManualTime(e.target.value, participant)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {location === "Start" && <StartCountdown />}
    </>
  );
}
