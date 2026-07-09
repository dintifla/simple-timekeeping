import { messageBus } from '../state/message-bus';
import { Participant } from './participant';

export function validateResults(
  starts: Participant[],
  finishes: Participant[],
): boolean {
  if (!(starts instanceof Array)) {
    messageBus.add('Start file is not an array!');
    return false;
  }

  if (!(finishes instanceof Array)) {
    messageBus.add('Finish file is not an array!');
    return false;
  }
  if (!starts.every((p) => 'numberPlate' in p && 'name' in p)) {
    messageBus.add('Start file has wrong format!');
    return false;
  }

  if (!finishes.every((p) => 'numberPlate' in p && 'name' in p)) {
    messageBus.add('Finish file has wrong format!');
    return false;
  }

  if (
    Math.min(
      ...starts
        .map((x) => x.time)
        .filter((x): x is string => !!x)
        .map((x) => Date.parse(x)),
    ) >
    Math.min(
      ...finishes
        .map((x) => x.time)
        .filter((x): x is string => !!x)
        .map((x) => Date.parse(x)),
    )
  ) {
    messageBus.add('Start und Finish file are reversed!');
    return false;
  }
  return true;
}
