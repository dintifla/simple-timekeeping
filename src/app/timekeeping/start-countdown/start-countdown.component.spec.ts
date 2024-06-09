import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartCountdownComponent } from './start-countdown.component';

describe('StartCountdownComponent', () => {
  let component: StartCountdownComponent;
  let fixture: ComponentFixture<StartCountdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StartCountdownComponent],
    });
    fixture = TestBed.createComponent(StartCountdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
