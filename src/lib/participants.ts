import { Participant } from './participant';

/** Returns the next free number plate (highest existing plate + 1). */
export function generateNumberPlate(participants: Participant[]): number {
  return (
    participants.map((p) => p.numberPlate).reduce((a, b) => Math.max(a, b), 0) +
    1
  );
}

/** Type guard: checks that a parsed value looks like a participant list. */
export function isParticipantList(value: unknown): value is Participant[] {
  return (
    Array.isArray(value) &&
    value.every((p) => 'numberPlate' in p && 'name' in p)
  );
}

/** Returns the list padded with `spareCount` empty spare participants. */
export function withSpareParticipants(
  participants: Participant[],
  category: string,
  spareCount = 20,
): Participant[] {
  const result = [...participants];
  for (let i = 0; i < spareCount; ++i) {
    result.push({
      numberPlate: generateNumberPlate(result),
      category,
      name: '',
      isSpare: true,
    });
  }
  return result;
}
