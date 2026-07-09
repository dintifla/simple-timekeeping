import { useEffect, useRef, useState } from "react";
import { Participant } from "../lib/participant";
import { getConfig } from "../lib/config";
import { FileDownloader } from "../lib/file-downloader";
import { participantStore } from "../services/participant-store";
import { messageBus } from "../state/message-bus";

export function StartList() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  useEffect(() => {
    setCategories(getConfig().categories);
  }, []);

  const clearParticipants = () => {
    setParticipants([]);
    participantStore.clear();
  };

  const getParticipants = () => {
    setParticipants([...participantStore.getParticipants()]);
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearParticipants();
    const file = event.target.files?.item(0);
    if (file) {
      participantStore
        .getParticipantsFromFile(file)
        .then((p) => setParticipants([...p]));
    }
  };

  const exportParticipants = () => {
    FileDownloader.exportAsJson(
      participantStore.getWithSpare(categories[0]),
      `Startliste_${Date.now()}.json`,
    );
  };

  const newParticipantList = () => {
    if (participantsRef.current.length > 0) exportParticipants();
    clearParticipants();

    if (categories && categories.length <= 0) {
      messageBus.add("StartList: Configuriere mindestens eine Kategorie");
      throw Error("no categories configured");
    }
    setParticipants([...participantStore.getParticipants()]);
  };

  const addParticipant = () => {
    participantStore.add({ name: "", category: categories[0] } as Participant);
    setParticipants([...participantStore.participants]);
  };

  const save = (participant: Participant) => {
    participantStore.update(participant);
  };

  const setName = (numberPlate: number, name: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.numberPlate === numberPlate ? { ...p, name } : p)),
    );
  };

  const setCategory = (participant: Participant, category: string) => {
    const updated = { ...participant, category };
    setParticipants((prev) =>
      prev.map((p) =>
        p.numberPlate === participant.numberPlate ? updated : p,
      ),
    );
    save(updated);
  };

  return (
    <>
      <h1>Startliste</h1>

      <button
        type="button"
        id="new-participantList"
        className="big-button"
        onClick={newParticipantList}
      >
        Neue Liste
      </button>

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
        id="load-participants"
        className="big-button"
        onClick={getParticipants}
      >
        Laden
      </button>

      <button
        type="button"
        id="export-participants"
        className="big-button"
        onClick={exportParticipants}
      >
        Exportieren
      </button>
      <br />
      <button
        type="button"
        id="new-participant"
        className="big-button"
        onClick={addParticipant}
      >
        + Teilnehmer
      </button>

      <table>
        <tbody>
          <tr>
            <th>Nr.</th>
            <th>Kategorie</th>
            <th>Name</th>
          </tr>

          {participants.map((participant) => (
            <tr key={participant.numberPlate}>
              <td>{participant.numberPlate}</td>
              <td className="category-selection">
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
              </td>
              <td>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
