import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineManagementComponent } from './machine-management.component';

describe('MachineManagementComponent', () => {
  let component: MachineManagementComponent;
  let fixture: ComponentFixture<MachineManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
