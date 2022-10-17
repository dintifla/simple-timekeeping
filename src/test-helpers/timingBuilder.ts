import { Participant } from "../participant";
import { mapStartToFinish } from "../resultCalculator";
import { Timing } from "../timinig";

export class TimingBuilder {
  private readonly _startIntervalSeconds: number = 30;
  private _nextStartTime: Date;
  private readonly _startList: Participant[] = [];

  constructor() {
    this._nextStartTime = new Date();
  }

  public addMaleParticipant(name: string): TimingBuilder {
    this.addParticipant(name, "Male");
    return this;
  }

  public addFemaleParticipant(name: string): TimingBuilder {
    this.addParticipant(name, "Female");
    return this;
  }

  public addSpareParticipant(): TimingBuilder {
    this.addParticipant("", "Female");
    return this;
  }

  private addParticipant(name: string, category: string): void {
    const participant: Participant = {
      category,
      name,
      numberPlate: this._startList.length + 1,
      time: this._nextStartTime.toISOString(),
    };
    if (name === "") {
      participant.isSpare = true;
    }
    this._startList.push(participant);
    this._nextStartTime.setSeconds(
      this._nextStartTime.getSeconds() + this._startIntervalSeconds
    );
  }

  public addUnusedSpareParticipant(): TimingBuilder {
    this._startList.push({
      category: "Male",
      name: "",
      numberPlate: this._startList.length + 1,
      time: "",
      isSpare: true,
    });
    return this;
  }

  public getStartList(): Participant[] {
    return this._startList;
  }

  public getFinishListWithRandomTiming(): Participant[] {
    return this._startList.map((t) => {
      if (!t.time) return t;
      let time = new Date(Date.parse(t.time as string));
      time.setSeconds(time.getSeconds() + Math.random() * 200);
      t.time = time;
      return t;
    });
  }
}
