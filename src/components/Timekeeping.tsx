import { useRef, useState } from "react";
import { Check, Download, FolderOpen, TimerReset } from "lucide-react";
import { Participant } from "../lib/participant";
import { configuration } from "../lib/config";
import { parseTime, roundTo100Ms } from "../lib/time";
import { formatDateToTimeString } from "../lib/format-date-to-timestring";
import { useMeasurements } from "../hooks/useMeasurements";
import { countdownBus } from "../state/countdown-bus";
import { StartCountdown } from "./StartCountdown";
import { Button } from "./ui/Button";

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
    <section className="space-y-5">
      <h1>Zeitmessung</h1>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label htmlFor="select-measurement-location">Mess-Ort</label>
            <div>
              <select
                id="select-measurement-location"
                className="select"
                value={location}
                onChange={(e) => changeLocation(e.target.value)}
              >
                <option>Start</option>
                <option>Ziel</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="load-file">Startliste laden</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              id="load-file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFile}
            />
            <Button variant="secondary" onClick={load}>
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              Laden
            </Button>
            <Button variant="secondary" onClick={exportEntries}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportieren
            </Button>
          </div>
        </div>
      </div>

      {location === "Start" && <StartCountdown />}

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Keine Einträge. Lade eine Startliste, um mit der Zeitmessung zu
          beginnen.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Name</th>
                <th>Aktion</th>
                <th>Zeit</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((participant) => {
                const hasTime = Boolean(participant.time);
                return (
                  <tr
                    key={participant.numberPlate}
                    className={hasTime ? "bg-success/10" : undefined}
                  >
                    <td className="font-semibold tabular-nums">
                      {participant.numberPlate}
                    </td>
                    <td className="min-w-[10rem]">
                      {nameEditIsEnabled(participant) ? (
                        <div className="space-y-1.5">
                          <fieldset
                            className="category-selection"
                            aria-label={`Kategorie für Nummer ${participant.numberPlate}`}
                          >
                            {categories.map((category) => (
                              <label key={category}>
                                <input
                                  type="radio"
                                  name={`category-${participant.numberPlate}`}
                                  value={category}
                                  checked={participant.category === category}
                                  onChange={() =>
                                    updateEntry(participant.numberPlate, {
                                      category,
                                    })
                                  }
                                />
                                {category}
                              </label>
                            ))}
                          </fieldset>
                          <input
                            type="text"
                            aria-label={`Name für Nummer ${participant.numberPlate}`}
                            value={participant.name}
                            onChange={(e) =>
                              updateEntry(participant.numberPlate, {
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <span className="font-semibold">
                          {participant.name}
                        </span>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={hasTime ? "secondary" : "primary"}
                        onClick={() => takeTime(participant)}
                      >
                        {hasTime ? (
                          <TimerReset className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                        {location} {participant.numberPlate}
                      </Button>
                    </td>
                    <td>
                      <input
                        key={String(participant.time)}
                        type="text"
                        className="max-w-[9rem] tabular-nums"
                        placeholder="hh:mm:ss.s"
                        aria-label={`Zeit für Nummer ${participant.numberPlate}`}
                        defaultValue={formatDateToTimeString(participant.time)}
                        onBlur={(e) =>
                          setManualTime(e.target.value, participant)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
