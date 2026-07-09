import { configuration } from "../lib/config";
import { useStartList } from "../hooks/useStartList";

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

  const newParticipantList = () => {
    if (participants.length > 0) exportList(categories[0]);
    clear();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) loadFromFile(file);
  };

  return (
    <>
      <h1>Startliste</h1>

      <button type="button" className="big-button" onClick={newParticipantList}>
        Neue Liste
      </button>

      <br />
      <label htmlFor="load-file">Startliste laden:</label>
      <input type="file" id="load-file" accept=".json" onChange={handleFile} />

      <button type="button" className="big-button" onClick={load}>
        Laden
      </button>

      <button
        type="button"
        className="big-button"
        onClick={() => exportList(categories[0])}
      >
        Exportieren
      </button>
      <br />
      <button
        type="button"
        className="big-button"
        onClick={() => addParticipant(categories[0])}
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
                      onChange={() =>
                        updateParticipant(participant.numberPlate, { category })
                      }
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
    </>
  );
}
