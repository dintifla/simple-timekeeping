import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimekeepingComponent } from './timekeeping.component';

describe('TimekeepingComponent', () => {
  let component: TimekeepingComponent;
  let fixture: ComponentFixture<TimekeepingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimekeepingComponent],
    });
    fixture = TestBed.createComponent(TimekeepingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
