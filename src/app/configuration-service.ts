import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Configuration {
  categories: string[];
  startIntervalSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  getConfig(): Observable<Configuration> {
    const config = {
      categories: ['Male', 'Female', 'E-Bike'],
      startIntervalSeconds: 30,
    };
    return of(config);
  }
}
