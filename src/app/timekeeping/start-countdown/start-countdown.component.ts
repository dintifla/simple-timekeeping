import { Component } from '@angular/core';
import { Subscription, map, takeWhile, timer } from 'rxjs';
import { ConfigurationService } from '../../configuration-service';
import { CountdownService } from '../countdown.service';

@Component({
  selector: 'app-start-countdown',
  templateUrl: './start-countdown.component.html',
  styleUrls: ['./start-countdown.component.css'],
})
export class StartCountdownComponent {
  constructor(
    private configService: ConfigurationService,
    private countdownService: CountdownService
  ) {}

  ngOnInit(): void {
    this.getStartInterval();
    this.countdownService.started.subscribe(() => this.start());
  }

  private getStartInterval(): void {
    this.configService
      .getConfig()
      .subscribe((c) => (this.intervalTimeSeconds = c.startIntervalSeconds));
  }

  remainingTimeSeconds?: number;
  blink = false;

  private intervalTimeSeconds = 30;
  private timerSubscription?: Subscription;

  public start(): void {
    this.reset();
    this.remainingTimeSeconds = this.intervalTimeSeconds;

    this.timerSubscription = timer(0, 1000)
      .pipe(
        map((n) => this.intervalTimeSeconds - n),
        takeWhile((n) => n >= 0)
      )
      .subscribe((t) => {
        this.remainingTimeSeconds = t;
        if (this.remainingTimeSeconds <= 4) this.blink = true;
      });
  }

  public reset(): void {
    this.timerSubscription?.unsubscribe();
    this.remainingTimeSeconds = 0;
  }
}
