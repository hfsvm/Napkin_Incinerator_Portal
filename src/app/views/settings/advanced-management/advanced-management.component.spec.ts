import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedManagementComponent } from './advanced-management.component';

describe('AdvancedManagementComponent', () => {
  let component: AdvancedManagementComponent;
  let fixture: ComponentFixture<AdvancedManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
