import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinereportComponent } from './machinereport.component';

describe('MachinereportComponent', () => {
  let component: MachinereportComponent;
  let fixture: ComponentFixture<MachinereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachinereportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachinereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
