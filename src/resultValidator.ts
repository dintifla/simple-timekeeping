import { showSnackbar } from "./components/snackbar";
import { Participant } from "./participant";

export function validate(starts: Participant[], finishes: Participant[]) {
  if (!(starts instanceof Array)) {
    showSnackbar("Start file is not an array!");
    return false;
  }

  if (!(finishes instanceof Array)) {
    showSnackbar("Finish file is not an array!");
    return false;
  }
  if (!starts.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Start file has wrong format!");
    return false;
  }

  if (!finishes.every((p) => "numberPlate" in p && "name" in p)) {
    showSnackbar("Finish file has wrong format!");
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
    showSnackbar("Start und Finish file are reversed!");
    return false;
  }
  return true;
}
