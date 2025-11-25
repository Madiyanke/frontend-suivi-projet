import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDetail } from './projet-detail';

describe('ProjetDetail', () => {
  let component: ProjetDetail;
  let fixture: ComponentFixture<ProjetDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjetDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
