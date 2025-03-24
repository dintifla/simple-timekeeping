import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartListComponent } from './start-list.component';

describe('StartListComponent', () => {
  let component: StartListComponent;
  let fixture: ComponentFixture<StartListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(StartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
