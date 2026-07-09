export interface Configuration {
  categories: string[];
  startIntervalSeconds: number;
}

export const configuration: Configuration = {
  categories: ['Male', 'Female', 'E-Bike'],
  startIntervalSeconds: 30,
};
