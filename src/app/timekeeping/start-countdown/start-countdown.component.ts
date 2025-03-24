import { Component } from '@angular/core';
import { Subscription, map, takeWhile, timer } from 'rxjs';
import { ConfigurationService } from '../../configuration-service';
import { CountdownService } from '../countdown.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-countdown',
  templateUrl: './start-countdown.component.html',
  styleUrls: ['./start-countdown.component.css'],
  imports: [CommonModule],
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
  private blinkForLastSeconds = 5;

  private intervalTimeSeconds = 30;
  private timerSubscription?: Subscription;

  public start(): void {
    this.reset();

    this.timerSubscription = timer(0, 1000)
      .pipe(
        map((n) => this.intervalTimeSeconds - n),
        takeWhile((n) => n >= 0)
      )
      .subscribe((t) => {
        this.remainingTimeSeconds = t;
        if (this.remainingTimeSeconds <= this.blinkForLastSeconds)
          this.blink = true;
      });
  }

  public reset(): void {
    this.timerSubscription?.unsubscribe();
    this.remainingTimeSeconds = 0;
    this.blink = false;
  }
}
