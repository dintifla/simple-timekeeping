import { msToTime, parseTime, roundTo100Ms } from './time';

describe('time module', () => {
  describe('parse time', () => {
    it('sets the time in todays date', () => {
      const now = new Date(Date.now());
      expect(parseTime('14:36:18').toISOString()).toBe(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          14,
          36,
          18,
          0,
        ).toISOString(),
      );
    });
  });

  describe('round to 100 ms', () => {
    it('rounds up to 100 ms', () => {
      expect(
        roundTo100Ms(new Date(2022, 10, 16, 11, 25, 10, 350)).getMilliseconds(),
      ).toBe(400);
    });

    it('rounds down to 100 ms', () => {
      expect(
        roundTo100Ms(new Date(2022, 10, 16, 11, 25, 10, 349)).getMilliseconds(),
      ).toBe(300);
    });

    it('does nothing if already rounded to 100 ms', () => {
      expect(
        roundTo100Ms(new Date(2022, 10, 16, 11, 25, 10, 500)).getMilliseconds(),
      ).toBe(500);
    });
  });

  describe('milliseconds to time', () => {
    it('', () => {
      expect(msToTime(1665912581151)).toBe('09:29:41.2');
    });
  });
});
