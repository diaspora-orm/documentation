import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionSymbolComponent } from './function-symbol.component';

describe('FunctionSymbolComponent', () => {
  let component: FunctionSymbolComponent;
  let fixture: ComponentFixture<FunctionSymbolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionSymbolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionSymbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
