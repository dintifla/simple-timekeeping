import css from "./styles/styles.css";

function calculate() {
  if (!validateFiles()) return;

  Promise.all(
    new Array(
      Array.from(document.getElementById("start-file").files)[0].text(),
      Array.from(document.getElementById("finish-file").files)[0].text()
    )
  ).then((fileContents) => {
    const startTimeStamps = JSON.parse(fileContents[0]);
    const finishTimeStamps = JSON.parse(fileContents[1]);
    if (startTimeStamps.length != finishTimeStamps.length) {
      showSnackbar("Start und Ziel Datei sind nicht gleich lang");
      return;
    }

    if (!validate(startTimeStamps, finishTimeStamps)) return;

    const container = document.getElementById("container");
    container.innerHTML = "";

    const tempResults = calculateDifference(startTimeStamps, finishTimeStamps);
    const allResults = {
      male: tempResults.filter((r) => r.category === "M"),
      female: tempResults.filter((r) => r.category === "F"),
    };
    for (let key in allResults) {
      const results = allResults[key];
      sortByTime(results);
      let delay = "---";
      let rank = 1;
      for (let i = 0; i < results.length; ++i) {
        rank = i + 1;
        if (i !== 0) {
          delay = getDelay(
            results[0].result,
            results[i].result,
            results[i - 1].result
          );

          const hasSameTime = results[i].result - results[i - 1].result < 100;
          if (hasSameTime) rank = results[i - 1].rank;
        }

        results[i] = { rank, ...results[i], delay };
      }
      results.forEach((x) => {
        x.start = formatTimestampValue(x.start);
        x.finish = formatTimestampValue(x.finish);
        x.result = isNaN(x.result) ? x.result : msToTime(x.result);
      });
      container.appendChild;
      const title = key === "male" ? "Männer" : "Frauen";
      fillTable(title, results, container);
      exportResults(title, results);
    }
  });

  function getDelay(firstTime, currentTime, previousTime) {
    if (isNaN(firstTime) || isNaN(currentTime)) return "---";

    const toFirst = currentTime - firstTime;
    const toPrevious = currentTime - previousTime;
    if (!isNaN(currentTime)) {
      return `+${msToTime(toFirst)} (+${msToTime(toPrevious)})`;
    }
  }

  function formatTimestampValue(value) {
    if (!value) return "---";
    return isNaN(value) ? value : msToTime(value.getTime());
  }

  /**
   * Format the given milliseconds to HH:mm:ss.s
   */
  function msToTime(ms) {
    return new Date(ms).toISOString().substring(11, 21);
  }

  function validate(startTimeStamps, finishTimeStamps) {
    if (!(startTimeStamps instanceof Array)) {
      showSnackbar("Start datei ist kein array!");
      return false;
    }

    if (!(finishTimeStamps instanceof Array)) {
      showSnackbar("Ziel datei ist kein array!");
      return false;
    }
    if (!startTimeStamps.every((p) => "numberPlate" in p && "name" in p)) {
      showSnackbar("Startdatei hat falsches format!");
      return false;
    }

    if (!finishTimeStamps.every((p) => "numberPlate" in p && "name" in p)) {
      showSnackbar("Zieldatei hat falsches format!");
      return false;
    }

    if (
      Math.min(
        ...startTimeStamps
          .map((x) => x.time)
          .filter((x) => !!x)
          .map((x) => Date.parse(x))
      ) >
      Math.min(
        ...finishTimeStamps
          .map((x) => x.time)
          .filter((x) => !!x)
          .map((x) => Date.parse(x))
      )
    ) {
      showSnackbar("Start und Ziel Datei sind vertauscht!");
      return false;
    }
    return true;
  }

  function calculateDifference(startTimeStamps, finishTimeStamps) {
    return zip(startTimeStamps, finishTimeStamps).map((x) => {
      const entry = {
        numberPlate: x[0].numberPlate,
        category: x[0].category,
        name: x[0].name,
        start: x[0].time,
        finish: x[1].time,
      };
      if (!entry.start) entry.result = "DNS";
      else if (!entry.finish) entry.result = "DNF";
      else {
        entry.result = Date.parse(entry.finish) - Date.parse(entry.start);
      }
      return entry;
    });
  }

  function zip(list1, list2) {
    return list1.map((e, i) => [e, list2[i]]);
  }

  function validateFiles() {
    if (!document.getElementById("start-file")?.value) {
      showSnackbar("Startfile fehlt!");
      return false;
    }
    if (!document.getElementById("finish-file")?.value) {
      showSnackbar("Zielfile fehlt!");
      return false;
    }
    return true;
  }

  /**
   * 1. smallest time
   * 2. DNF
   * 3. DNS
   */
  function sortByTime(results) {
    results.sort((a, b) => {
      if (a.result == "DNS" && b.result == "DNF") return 1;
      if (a.result == "DNF" && b.result == "DNS") return -1;
      if (!isNaN(a.result) && isNaN(b.result)) return -1;
      if (isNaN(a.result) && !isNaN(b.result)) return 1;
      if (a.result === b.result) return 0;
      return a.result < b.result ? -1 : 1;
    });
  }

  function exportResults(title, results) {
    exportAsJson(title, results);
    exportAsCsv(title, results);
  }

  function exportAsJson(title, results) {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(results)
    )}`;
    const dlAnchorElem = document.getElementById("downloadAnchorElem");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      `Resultate_${title}_${Date.now()}.json`
    );
    dlAnchorElem.click();
  }

  function exportAsCsv(title, results) {
    const dataStr = `data:text/csv;charset=utf-8,${toCsv(results)}`;
    encodeURIComponent(JSON.stringify(results));
    const dlAnchorElem = document.getElementById("downloadAnchorElem");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      `Resultate_${title}_${Date.now()}.csv`
    );
    dlAnchorElem.click();
  }

  function toCsv(data) {
    const csvRows = [];

    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }

  function fillTable(title, results, container) {
    const headers = [
      "Rang",
      "Startnummer",
      "Kategorie",
      "Name",
      "Startzeit",
      "Zielzeit",
      "Rennzeit",
      "Rückstand",
    ];

    const titleContainer = document.createElement("h1");
    titleContainer.innerText = title;
    container.appendChild(titleContainer);

    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    headers.forEach((headerText) => {
      const header = document.createElement("th");
      const textNode = document.createTextNode(headerText);
      header.appendChild(textNode);
      headerRow.appendChild(header);
    });
    table.appendChild(headerRow);
    results.forEach((emp) => {
      const row = document.createElement("tr");
      Object.values(emp).forEach((text) => {
        const cell = document.createElement("td");
        const textNode = document.createTextNode(text);
        cell.appendChild(textNode);
        row.appendChild(cell);
      });
      table.appendChild(row);
    });
    container.appendChild(table);
  }

  function showSnackbar(text) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerText = text;

    snackbar.className = "show";

    setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  }
}

window.calculate = calculate;
