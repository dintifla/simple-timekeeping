import { useEffect, useRef, useState } from "react";
import { Participant } from "../lib/participant";
import { getConfig } from "../lib/config";
import { FileDownloader } from "../lib/file-downloader";
import { parseTime, roundTo100Ms } from "../lib/time";
import { formatDateToTimeString } from "../lib/format-date-to-timestring";
import { measurementStore } from "../services/measurement-store";
import { countdownBus } from "../state/countdown-bus";
import { StartCountdown } from "./StartCountdown";

export function Timekeeping() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState("Start");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  useEffect(() => {
    setCategories(getConfig().categories);
  }, []);

  const reset = (nextLocation: string) => {
    setLocation(nextLocation);
    setParticipants([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getEntries = () => {
    setParticipants([...measurementStore.getEntries(location)]);
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParticipants([]);
    const file = event.target.files?.item(0);
    if (file) {
      measurementStore
        .getEntriesFromFile(file, location)
        .then((e) => setParticipants([...e]));
    }
  };

  const exportMeasurements = () => {
    FileDownloader.exportAsJson(participants, `${location}_${Date.now()}.json`);
  };

  const save = (participant: Participant) => {
    measurementStore.update(participant, location);
  };

  const applyChange = (
    participant: Participant,
    changes: Partial<Participant>,
  ) => {
    const updated = { ...participant, ...changes };
    setParticipants((prev) =>
      prev.map((p) =>
        p.numberPlate === participant.numberPlate ? updated : p,
      ),
    );
    return updated;
  };

  const takeTime = (participant: Participant) => {
    const timestamp = roundTo100Ms(new Date());
    const updated = applyChange(participant, { time: timestamp });
    save(updated);
    countdownBus.start();
  };

  const setManualTime = (value: string, participant: Participant) => {
    const time = value ? parseTime(value) : "";
    const updated = applyChange(participant, { time });
    save(updated);
  };

  const setName = (numberPlate: number, name: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.numberPlate === numberPlate ? { ...p, name } : p)),
    );
  };

  const setCategory = (participant: Participant, category: string) => {
    const updated = applyChange(participant, { category });
    save(updated);
  };

  const nameEditIsEnabled = (participant: Participant): boolean => {
    if (location !== "Start") return false;
    return participant.isSpare !== undefined && participant.isSpare === true;
  };

  return (
    <>
      <h1>Zeitmessung</h1>

      <label htmlFor="select-measurement-location">Mess-Ort:</label>
      <select
        id="select-measurement-location"
        className="big-select"
        value={location}
        onChange={(e) => reset(e.target.value)}
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
        onChange={loadFromFile}
      />

      <button
        type="button"
        id="load-measurements"
        className="big-button"
        onClick={getEntries}
      >
        Laden
      </button>

      <button
        type="button"
        id="export-measurements"
        className="big-button"
        onClick={exportMeasurements}
      >
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
          {participants.map((participant) => (
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
                          onChange={() => setCategory(participant, category)}
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
                      setName(participant.numberPlate, e.target.value)
                    }
                    onBlur={() => {
                      const current = participantsRef.current.find(
                        (p) => p.numberPlate === participant.numberPlate,
                      );
                      if (current) save(current);
                    }}
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
