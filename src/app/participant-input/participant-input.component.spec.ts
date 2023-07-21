import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantInputComponent } from './participant-input.component';

describe('ParticipantInputComponent', () => {
  let component: ParticipantInputComponent;
  let fixture: ComponentFixture<ParticipantInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParticipantInputComponent]
    });
    fixture = TestBed.createComponent(ParticipantInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
