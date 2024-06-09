import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SnackbarComponent } from './snackbar/snackbar.component';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [AppComponent, SnackbarComponent],
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
