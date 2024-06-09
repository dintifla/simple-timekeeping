import { Participant } from './../participant';
import { ReferenceTimeResultCalculator } from './result-calculator-with-reference-time';
import { TimingBuilder } from './test-helpers/timing-builder';

describe('Result calculator with reference time', () => {
  describe('Maps start and finish', () => {
    it('Maps values', () => {
      const timingBuilder = new TimingBuilder();
      const starts: Participant[] = timingBuilder
        .addMaleParticipant('Paul')
        .addFemaleParticipant('Clara')
        .addMaleParticipant('Mike')
        .getStartList();
      const finishes: Participant[] =
        timingBuilder.getFinishListWithRandomTiming();
      const mapped = new ReferenceTimeResultCalculator().mapStartToFinish(
        starts,
        finishes
      );

      expect(mapped).toHaveSize(3);
      expect(mapped[0].category).toBe('Male');
      expect(mapped[0].name).toBe('Paul');
      expect(mapped[0].numberPlate).toBe(1);
      expect(mapped[0].startTime).toBe(starts[0].time!.toString());
      expect(mapped[0].finishTime).toBe(finishes[0].time!.toString());
      expect(mapped[1].category).toBe('Female');
      expect(mapped[1].name).toBe('Clara');
      expect(mapped[1].numberPlate).toBe(2);
      expect(mapped[1].startTime).toBe(starts[1].time!.toString());
      expect(mapped[1].finishTime).toBe(finishes[1].time!.toString());
      expect(mapped[2].category).toBe('Male');
      expect(mapped[2].name).toBe('Mike');
      expect(mapped[2].numberPlate).toBe(3);
      expect(mapped[2].startTime).toBe(starts[2].time!.toString());
      expect(mapped[2].finishTime).toBe(finishes[2].time!.toString());
    });

    it('excludes unused spares', () => {
      const timingBuilder = new TimingBuilder();
      const starts: Participant[] = timingBuilder
        .addMaleParticipant('Paul')
        .addFemaleParticipant('Clara')
        .addMaleParticipant('Mike')
        .addSpareParticipant()
        .addUnusedSpareParticipant()
        .getStartList();
      const finishes: Participant[] =
        timingBuilder.getFinishListWithRandomTiming();
      const mapped = new ReferenceTimeResultCalculator().mapStartToFinish(
        starts,
        finishes
      );

      expect(mapped).toHaveSize(4);
    });
  });

  describe('Result calculation', () => {
    it('calculates time difference', () => {
      const refTime = Date.parse('1970-01-01T' + '00:34:56' + 'Z');
      const results =
        new ReferenceTimeResultCalculator().calculateAndSortToReferenceTime(
          [
            {
              name: 'Paul',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T10:13:57.500Z',
              category: 'M',
            },
          ],
          refTime
        );

      expect(results).toHaveSize(2);
      expect(results[1].result).toBe('02:06:53.2');
    });

    it('calculates ranking', () => {
      const refTime = Date.parse('1970-01-01T' + '00:46:37.9' + 'Z');
      const results =
        new ReferenceTimeResultCalculator().calculateAndSortToReferenceTime(
          [
            {
              name: 'Paul',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T10:13:57.500Z',
              category: 'M',
            },
            {
              name: 'Michael',
              numberPlate: 1,
              startTime: '2022-10-17T08:37:00.000Z',
              finishTime: '2022-10-17T09:12:34.500Z',
              category: 'M',
            },
            {
              name: 'Peter',
              numberPlate: 1,
              startTime: '2022-10-17T09:07:00.000Z',
              finishTime: '2022-10-17T10:07:34.500Z',
              category: 'M',
            },
          ],
          refTime
        );

      expect(results).toHaveSize(4);
      expect(results[0]).toEqual(
        jasmine.objectContaining({ name: 'Referenzzeit', rank: '-' })
      );
      expect(results[1]).toEqual(
        jasmine.objectContaining({ name: 'Michael', rank: 1 })
      );
      expect(results[2]).toEqual(
        jasmine.objectContaining({ name: 'Peter', rank: 2 })
      );
      expect(results[3]).toEqual(
        jasmine.objectContaining({ name: 'Paul', rank: 3 })
      );
    });

    it('calculates delay to previous and to first', () => {
      const refTime = Date.parse('1970-01-01T' + '00:34:56' + 'Z');
      const results =
        new ReferenceTimeResultCalculator().calculateAndSortToReferenceTime(
          [
            {
              name: 'Paul',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T10:13:57.500Z',
              category: 'M',
            },
            {
              name: 'Michael',
              numberPlate: 1,
              startTime: '2022-10-17T08:37:00.000Z',
              finishTime: '2022-10-17T09:12:34.500Z',
              category: 'M',
            },
            {
              name: 'Peter',
              numberPlate: 1,
              startTime: '2022-10-17T09:07:00.000Z',
              finishTime: '2022-10-17T10:07:34.500Z',
              category: 'M',
            },
          ],
          refTime
        );

      expect(results).toHaveSize(4);
      expect(results[0]).toEqual(
        jasmine.objectContaining({ name: 'Referenzzeit', delay: '---' })
      );
      expect(results[1]).toEqual(
        jasmine.objectContaining({
          name: 'Michael',
          delay: '+00:00:38.5 (---)',
        })
      );
      expect(results[2]).toEqual(
        jasmine.objectContaining({
          name: 'Peter',
          delay: '+00:25:38.5 (00:25:00.0)',
        })
      );
      expect(results[3]).toEqual(
        jasmine.objectContaining({
          name: 'Paul',
          delay: '+01:31:57.2 (01:06:18.7)',
        })
      );
    });

    it('gives same rank to same time', () => {
      const refTime = Date.parse('1970-01-01T' + '00:34:56' + 'Z');
      const results =
        new ReferenceTimeResultCalculator().calculateAndSortToReferenceTime(
          [
            {
              name: 'Paul',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T09:09:07.500Z',
              category: 'M',
            },
            {
              name: 'Michael',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T21:09:07.500Z',
              category: 'M',
            },
            {
              name: 'Greg',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:04.300Z',
              finishTime: '2022-10-17T09:09:12.500Z',
              category: 'M',
            },
            {
              name: 'Peter',
              numberPlate: 1,
              startTime: '2022-10-17T09:07:04.300Z',
              finishTime: '2022-10-17T11:09:06.500Z',
              category: 'M',
            },
            {
              name: 'Fred',
              numberPlate: 1,
              startTime: '2022-10-17T03:04:14.300Z',
              finishTime: '2022-10-17T05:06:16.500Z',
              category: 'M',
            },
            {
              name: 'Arthur',
              numberPlate: 1,
              startTime: '2022-10-17T08:07:57.000Z',
              finishTime: '2022-10-17T10:09:59.200Z',
              category: 'M',
            },
          ],
          refTime
        );

      expect(results).toHaveSize(7);
      expect(results[0]).toEqual(
        jasmine.objectContaining({ name: 'Referenzzeit', rank: '-' })
      );
      expect(results[1]).toEqual(
        jasmine.objectContaining({ name: 'Paul', rank: 1 })
      );
      expect(results[2]).toEqual(
        jasmine.objectContaining({ name: 'Greg', rank: 2 })
      );
      expect(results[3]).toEqual(
        jasmine.objectContaining({
          name: 'Peter',
          rank: 3,
          delay: '+01:27:06.2 (00:59:54.0)',
        })
      );
      expect(results[4]).toEqual(
        jasmine.objectContaining({
          name: 'Fred',
          rank: 3,
          delay: '+01:27:06.2 (00:59:54.0)',
        })
      );
      expect(results[5]).toEqual(
        jasmine.objectContaining({
          name: 'Arthur',
          rank: 3,
          delay: '+01:27:06.2 (00:59:54.0)',
        })
      );
      expect(results[6]).toEqual(
        jasmine.objectContaining({
          name: 'Michael',
          rank: 6,
          delay: '+12:27:07.2 (11:00:01.0)',
        })
      );
    });

    it('adds DNS and DNS to end of list', () => {
      const refTime = 234;
      const results =
        new ReferenceTimeResultCalculator().calculateAndSortToReferenceTime(
          [
            {
              name: 'Paul',
              numberPlate: 1,
              startTime: '---',
              finishTime: '---',
              category: 'M',
            },
            {
              name: 'Michael',
              numberPlate: 1,
              startTime: '2022-10-17T08:37:00.000Z',
              finishTime: '2022-10-17T09:12:34.500Z',
              category: 'M',
            },
            {
              name: 'Peter',
              numberPlate: 1,
              startTime: '2022-10-17T09:07:00.000Z',
              finishTime: '---',
              category: 'M',
            },
          ],
          refTime
        );
      expect(results).toHaveSize(4);
      expect(results[0]).toEqual(
        jasmine.objectContaining({ name: 'Referenzzeit', rank: '-' })
      );
      expect(results[1]).toEqual(
        jasmine.objectContaining({ name: 'Michael', rank: 1 })
      );
      expect(results[2]).toEqual(
        jasmine.objectContaining({
          name: 'Peter',
          rank: '-',
          result: 'DNF',
        })
      );
      expect(results[3]).toEqual(
        jasmine.objectContaining({
          name: 'Paul',
          rank: '-',
          result: 'DNS',
        })
      );
    });
  });
});
