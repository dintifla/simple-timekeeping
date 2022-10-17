import { showSnackbar } from "./helpers/snackbar";
import { Participant } from "./participant";

export function validate(starts: Participant[], finishes: Participant[]) {
  if (!(starts instanceof Array)) {
    showSnackbar("Start datei ist kein array!");
    return false;
  }

  if (!(finishes instanceof Array)) {
    showSnackbar("Ziel datei ist kein array!");
    return false;
  }
  if (!starts.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Startdatei hat falsches format!");
    return false;
  }

  if (!finishes.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Zieldatei hat falsches format!");
    return false;
  }

  if (
    Math.min(
      ...starts
        .map((x) => x.time)
        .filter((x): x is string => !!x)
        .map((x) => Date.parse(x))
    ) >
    Math.min(
      ...finishes
        .map((x) => x.time)
        .filter((x): x is string => !!x)
        .map((x) => Date.parse(x))
    )
  ) {
    showSnackbar("Start und Ziel Datei sind vertauscht!");
    return false;
  }
  return true;
}
