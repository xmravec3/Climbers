import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailVideoComponent } from './detail-video.component';

describe('DetailVideoComponent', () => {
  let component: DetailVideoComponent;
  let fixture: ComponentFixture<DetailVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
