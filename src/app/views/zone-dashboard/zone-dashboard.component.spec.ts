import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneDashboardComponent } from './zone-dashboard.component';

describe('ZoneDashboardComponent', () => {
  let component: ZoneDashboardComponent;
  let fixture: ComponentFixture<ZoneDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoneDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
