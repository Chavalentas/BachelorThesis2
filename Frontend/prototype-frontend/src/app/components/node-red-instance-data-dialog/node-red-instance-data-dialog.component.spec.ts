import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeRedInstanceDataDialogComponent } from './node-red-instance-data-dialog.component';

describe('NodeRedInstanceDataDialogComponent', () => {
  let component: NodeRedInstanceDataDialogComponent;
  let fixture: ComponentFixture<NodeRedInstanceDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeRedInstanceDataDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeRedInstanceDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
