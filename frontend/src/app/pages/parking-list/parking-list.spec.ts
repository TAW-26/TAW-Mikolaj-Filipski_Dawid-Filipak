import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingList } from './parking-list';

describe('ParkingList', () => {
  let component: ParkingList;
  let fixture: ComponentFixture<ParkingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingList],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
