import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingDetails } from './parking-details';

describe('ParkingDetails', () => {
  let component: ParkingDetails;
  let fixture: ComponentFixture<ParkingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
