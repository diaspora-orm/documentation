import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallSignatureComponent } from './call-signature.component';

describe('CallSignatureComponent', () => {
  let component: CallSignatureComponent;
  let fixture: ComponentFixture<CallSignatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallSignatureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
