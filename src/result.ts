export interface Result {
  rank?: number;
  numberPlate: number;
  category: string;
  name: string;
  startTime: string | number;
  finishTime: string | number;
  result?: string | number;
  delay?: string;
}
