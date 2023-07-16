import { Participant } from "../participant";
import { calculateRankAndSort, mapStartToFinish } from "../resultCalculator";
import { TimingBuilder } from "../test-helpers/timingBuilder";

describe("Result calculator", () => {
  describe("Maps start and finish", () => {
    test("Maps values", () => {
      const timingBuilder = new TimingBuilder();
      const starts: Participant[] = timingBuilder
        .addMaleParticipant("Paul")
        .addFemaleParticipant("Clara")
        .addMaleParticipant("Mike")
        .getStartList();
      const finishes: Participant[] =
        timingBuilder.getFinishListWithRandomTiming();
      const mapped = mapStartToFinish(starts, finishes);

      expect(mapped).toHaveLength(3);
      expect(mapped[0].category).toBe("Male");
      expect(mapped[0].name).toBe("Paul");
      expect(mapped[0].numberPlate).toBe(1);
      expect(mapped[0].startTime).toBe(starts[0].time);
      expect(mapped[0].finishTime).toBe(finishes[0].time);
      expect(mapped[1].category).toBe("Female");
      expect(mapped[1].name).toBe("Clara");
      expect(mapped[1].numberPlate).toBe(2);
      expect(mapped[1].startTime).toBe(starts[1].time);
      expect(mapped[1].finishTime).toBe(finishes[1].time);
      expect(mapped[2].category).toBe("Male");
      expect(mapped[2].name).toBe("Mike");
      expect(mapped[2].numberPlate).toBe(3);
      expect(mapped[2].startTime).toBe(starts[2].time);
      expect(mapped[2].finishTime).toBe(finishes[2].time);
    });

    test("excludes unused spares", () => {
      const timingBuilder = new TimingBuilder();
      const starts: Participant[] = timingBuilder
        .addMaleParticipant("Paul")
        .addFemaleParticipant("Clara")
        .addMaleParticipant("Mike")
        .addSpareParticipant()
        .addUnusedSpareParticipant()
        .getStartList();
      const finishes: Participant[] =
        timingBuilder.getFinishListWithRandomTiming();
      const mapped = mapStartToFinish(starts, finishes);

      expect(mapped).toHaveLength(4);
    });
  });

  describe("Result calculation", () => {
    test("calculates time difference", () => {
      const results = calculateRankAndSort([
        {
          name: "Paul",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T10:13:57.500Z",
          category: "M",
        },
      ]);

      expect(results).toHaveLength(1);
      expect(results[0].result).toBe("02:06:53.2");
    });

    test("calculates ranking", () => {
      const results = calculateRankAndSort([
        {
          name: "Paul",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T10:13:57.500Z",
          category: "M",
        },
        {
          name: "Michael",
          numberPlate: 1,
          startTime: "2022-10-17T08:37:00.000Z",
          finishTime: "2022-10-17T09:12:34.500Z",
          category: "M",
        },
        {
          name: "Peter",
          numberPlate: 1,
          startTime: "2022-10-17T09:07:00.000Z",
          finishTime: "2022-10-17T10:07:34.500Z",
          category: "M",
        },
      ]);

      expect(results).toHaveLength(3);
      expect(results[0]).toMatchObject({ name: "Michael", rank: 1 });
      expect(results[1]).toMatchObject({ name: "Peter", rank: 2 });
      expect(results[2]).toMatchObject({ name: "Paul", rank: 3 });
    });

    test("calculates delay to previous and to first", () => {
      const results = calculateRankAndSort([
        {
          name: "Paul",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T10:13:57.500Z",
          category: "M",
        },
        {
          name: "Michael",
          numberPlate: 1,
          startTime: "2022-10-17T08:37:00.000Z",
          finishTime: "2022-10-17T09:12:34.500Z",
          category: "M",
        },
        {
          name: "Peter",
          numberPlate: 1,
          startTime: "2022-10-17T09:07:00.000Z",
          finishTime: "2022-10-17T10:07:34.500Z",
          category: "M",
        },
      ]);

      expect(results).toHaveLength(3);
      expect(results[0]).toMatchObject({ name: "Michael", delay: "---" });
      expect(results[1]).toMatchObject({
        name: "Peter",
        delay: "+00:25:00.0 (+00:25:00.0)",
      });
      expect(results[2]).toMatchObject({
        name: "Paul",
        delay: "+01:31:18.7 (+01:06:18.7)",
      });
    });

    test("gives same rank to same time", () => {
      const results = calculateRankAndSort([
        {
          name: "Paul",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T09:09:07.500Z",
          category: "M",
        },
        {
          name: "Michael",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T21:09:07.500Z",
          category: "M",
        },
        {
          name: "Greg",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:04.300Z",
          finishTime: "2022-10-17T09:09:12.500Z",
          category: "M",
        },
        {
          name: "Peter",
          numberPlate: 1,
          startTime: "2022-10-17T09:07:04.300Z",
          finishTime: "2022-10-17T11:09:06.500Z",
          category: "M",
        },
        {
          name: "Fred",
          numberPlate: 1,
          startTime: "2022-10-17T03:04:14.300Z",
          finishTime: "2022-10-17T05:06:16.500Z",
          category: "M",
        },
        {
          name: "Arthur",
          numberPlate: 1,
          startTime: "2022-10-17T08:07:57.000Z",
          finishTime: "2022-10-17T10:09:59.200Z",
          category: "M",
        },
      ]);

      expect(results).toHaveLength(6);
      expect(results[0]).toMatchObject({ name: "Paul", rank: 1 });
      expect(results[1]).toMatchObject({ name: "Greg", rank: 2 });
      expect(results[2]).toMatchObject({
        name: "Peter",
        rank: 3,
        delay: "+00:59:59.0 (+00:59:54.0)",
      });
      expect(results[3]).toMatchObject({
        name: "Fred",
        rank: 3,
        delay: "+00:59:59.0 (+00:59:54.0)",
      });
      expect(results[4]).toMatchObject({
        name: "Arthur",
        rank: 3,
        delay: "+00:59:59.0 (+00:59:54.0)",
      });
      expect(results[5]).toMatchObject({
        name: "Michael",
        rank: 6,
        delay: "+12:00:00.0 (+11:00:01.0)",
      });
    });

    test("adds DNS and DNS to end of list", () => {
      const results = calculateRankAndSort([
        {
          name: "Paul",
          numberPlate: 1,
          startTime: "---",
          finishTime: "---",
          category: "M",
        },
        {
          name: "Michael",
          numberPlate: 1,
          startTime: "2022-10-17T08:37:00.000Z",
          finishTime: "2022-10-17T09:12:34.500Z",
          category: "M",
        },
        {
          name: "Peter",
          numberPlate: 1,
          startTime: "2022-10-17T09:07:00.000Z",
          finishTime: "---",
          category: "M",
        },
      ]);
      expect(results).toHaveLength(3);
      expect(results[0]).toMatchObject({ name: "Michael", rank: 1 });
      expect(results[1]).toMatchObject({
        name: "Peter",
        rank: "-",
        result: "DNF",
      });
      expect(results[2]).toMatchObject({
        name: "Paul",
        rank: "-",
        result: "DNS",
      });
    });
  });
});
