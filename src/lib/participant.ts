export interface Participant {
  numberPlate: number;
  name: string;
  isSpare?: boolean;
  category: string;

  time?: Date | string;
}
