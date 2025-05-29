import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMachinesComponent } from './configure-machines.component';

describe('ConfigureMachinesComponent', () => {
  let component: ConfigureMachinesComponent;
  let fixture: ComponentFixture<ConfigureMachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigureMachinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigureMachinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
