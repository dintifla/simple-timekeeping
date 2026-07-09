import { describe, it, expect } from 'vitest';
import { validateResults } from './result-validation';
import { Participant } from './participant';

describe('validateResults', () => {
  const starts: Participant[] = [
    {
      numberPlate: 1,
      name: 'Paul',
      category: 'Male',
      time: '2022-10-17T08:07:04.300Z',
    },
  ];
  const finishes: Participant[] = [
    {
      numberPlate: 1,
      name: 'Paul',
      category: 'Male',
      time: '2022-10-17T10:13:57.500Z',
    },
  ];

  it('accepts valid start and finish lists', () => {
    expect(validateResults(starts, finishes)).toBe(true);
  });

  it('rejects when start is not an array', () => {
    expect(
      validateResults(undefined as unknown as Participant[], finishes),
    ).toBe(false);
  });

  it('rejects when finish is not an array', () => {
    expect(
      validateResults(starts, undefined as unknown as Participant[]),
    ).toBe(false);
  });

  it('rejects when start file has wrong format', () => {
    expect(
      validateResults([{ foo: 'bar' } as unknown as Participant], finishes),
    ).toBe(false);
  });

  it('rejects when finish file has wrong format', () => {
    expect(
      validateResults(starts, [{ foo: 'bar' } as unknown as Participant]),
    ).toBe(false);
  });

  it('rejects when start and finish files are reversed', () => {
    expect(validateResults(finishes, starts)).toBe(false);
  });
});
