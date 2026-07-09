export interface Configuration {
  categories: string[];
  startIntervalSeconds: number;
}

export function getConfig(): Configuration {
  return {
    categories: ['Male', 'Female', 'E-Bike'],
    startIntervalSeconds: 30,
  };
}
