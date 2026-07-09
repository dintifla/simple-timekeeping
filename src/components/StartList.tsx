import { useState } from "react";
import { FilePlus2, FolderOpen, Download, UserPlus } from "lucide-react";
import { configuration } from "../lib/config";
import { useStartList } from "../hooks/useStartList";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";

const categories = configuration.categories;

export function StartList() {
  const {
    participants,
    load,
    clear,
    loadFromFile,
    addParticipant,
    updateParticipant,
    exportList,
  } = useStartList();
  const [confirmNew, setConfirmNew] = useState(false);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);

  const newParticipantList = () => {
    if (participants.length > 0) exportList(categories[0]);
    clear();
    setLoadedFileName(null);
  };

  const requestNewList = () => {
    if (participants.length > 0) setConfirmNew(true);
    else newParticipantList();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      loadFromFile(file);
      setLoadedFileName(file.name);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Startliste</h1>
        {participants.length > 0 && (
          <span className="text-sm text-muted">
            {participants.length}{" "}
            {participants.length === 1 ? "Teilnehmer" : "Teilnehmer"}
          </span>
        )}
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={requestNewList}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Neue Liste
          </Button>
          <Button variant="secondary" onClick={() => exportList(categories[0])}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportieren
          </Button>
          <Button
            variant="secondary"
            onClick={() => addParticipant(categories[0])}
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Teilnehmer
          </Button>
        </div>

        <div className="space-y-2">
          <label htmlFor="load-file">Startliste laden</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              id="load-file"
              accept=".json"
              onChange={handleFile}
            />
            <Button variant="secondary" onClick={load}>
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              Laden
            </Button>
          </div>
          {loadedFileName && (
            <p className="text-xs text-muted">Geladen: {loadedFileName}</p>
          )}
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Noch keine Teilnehmer. Erstelle eine neue Liste, lade eine Datei oder
          füge Teilnehmer hinzu.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Kategorie</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.numberPlate}>
                  <td className="font-semibold tabular-nums">
                    {participant.numberPlate}
                  </td>
                  <td>
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
                              updateParticipant(participant.numberPlate, {
                                category,
                              })
                            }
                          />
                          {category}
                        </label>
                      ))}
                    </fieldset>
                  </td>
                  <td className="min-w-[10rem]">
                    <input
                      type="text"
                      aria-label={`Name für Nummer ${participant.numberPlate}`}
                      value={participant.name}
                      onChange={(e) =>
                        updateParticipant(participant.numberPlate, {
                          name: e.target.value,
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmNew}
        title="Neue Liste erstellen?"
        description="Die aktuelle Startliste wird exportiert und anschließend geleert."
        confirmLabel="Erstellen"
        onConfirm={() => {
          newParticipantList();
          setConfirmNew(false);
        }}
        onCancel={() => setConfirmNew(false)}
      />
    </section>
  );
}
