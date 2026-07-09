import { describe, it, expect } from 'vitest';
import { resultToRowValues, updateYearInTitle } from './full-results-exporter';
import { Result } from './result';

describe('rangliste-exporter', () => {
  describe('resultToRowValues', () => {
    it('maps a result to the five template columns in order', () => {
      const result: Result = {
        rank: 1,
        numberPlate: 42,
        name: 'Jane Doe',
        startTime: '10:00:00.0',
        finishTime: '10:05:00.0',
        result: '00:05:00.0',
        delay: '+00:00:00.0 (---)',
      };

      expect(resultToRowValues(result)).toEqual([
        1,
        42,
        'Jane Doe',
        '00:05:00.0',
        '+00:00:00.0 (---)',
      ]);
    });

    it('keeps non-numeric rank and result values', () => {
      const result: Result = {
        rank: '-',
        numberPlate: 7,
        name: 'DNF Runner',
        startTime: '---',
        finishTime: '---',
        result: 'DNF',
        delay: '---',
      };

      expect(resultToRowValues(result)).toEqual([
        '-',
        7,
        'DNF Runner',
        'DNF',
        '---',
      ]);
    });
  });

  describe('updateYearInTitle', () => {
    it('replaces the four-digit year in the subtitle', () => {
      expect(updateYearInTitle('Bergzeitfahren 2025', 2026)).toBe(
        'Bergzeitfahren 2026',
      );
    });

    it('leaves text without a year unchanged', () => {
      expect(updateYearInTitle('Bergzeitfahren', 2026)).toBe('Bergzeitfahren');
    });
  });
});
