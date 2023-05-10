export class Countdown {
  private _countdownElement: HTMLElement;
  private _remainingTimeMs: number = 0;
  private _updateIntervalMs: number = 1000;
  private _timerId: number = -1;

  constructor() {
    this._countdownElement = this.render();
  }

  private render(): HTMLDivElement {
    let container = document.getElementById("countdown-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "countdown-container";
      document.body.appendChild(container);
    }
    container.className = "start-countdown";
    container.innerHTML = "";
    const header = document.createElement("p");
    header.innerText = "Next start in:";
    container.appendChild(header);
    const display = document.createElement("div");
    display.innerText = "---";
    display.className = "start-countdown-time";
    container.appendChild(display);
    return display;
  }

  public start(intervalSeconds: number): void {
    this._remainingTimeMs = intervalSeconds * 1000;

    const container = document.getElementById("countdown-container");
    if (container) container.classList.remove("blink");

    this._countdownElement.innerText = `${intervalSeconds.toString()} s`;
    this.resume();
  }

  public pause(): void {
    window.clearInterval(this._timerId);
  }

  public resume(): void {
    window.clearInterval(this._timerId);
    this._timerId = window.setInterval(
      this.updateDisplay.bind(this),
      this._updateIntervalMs
    );
  }

  public reset(): void {
    this._remainingTimeMs = 0;
    this.updateDisplay();
    const container = document.getElementById("countdown-container");
    if (container) container.remove();
  }

  private updateDisplay(): void {
    this._remainingTimeMs -= this._updateIntervalMs;
    if (this._remainingTimeMs <= 5000) {
      const container = document.getElementById("countdown-container");
      if (container) container.classList.add("blink");
    }

    if (this._remainingTimeMs <= 0) {
      window.clearInterval(this._timerId);
      this._remainingTimeMs = 0;
    }
    this._countdownElement.innerText = `${(
      this._remainingTimeMs / 1000
    ).toString()} s`;
  }
}
