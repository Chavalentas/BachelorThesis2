import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-node-red-instance-data-dialog',
  templateUrl: './node-red-instance-data-dialog.component.html',
  styleUrls: ['./node-red-instance-data-dialog.component.scss']
})
export class NodeRedInstanceDataDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NodeRedInstanceDataDialogComponent>) {
  }

  public successMessage : string = '';

  public nodeRedInstanceDataFormGroup = new FormGroup({
    entityURL: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
  }

  public handleOkButtonClick() : void{
    if (this.nodeRedInstanceDataFormGroup.invalid){
      this.successMessage = 'The URL of the Node-RED instance was empty!';
      return;
    }

    var url = this.nodeRedInstanceDataFormGroup?.get('entityURL')?.value;

    if (url === null || url === undefined){
      this.successMessage = 'The URL of the Node-RED instance was empty!';
      return;
    }

    if (url[url.length - 1] != '/'){
      url += '/';
    }

    var result = {
      result : url
    };

    this.dialogRef.close(result);
  }

  public handleCancelButtonClick() : void{
    this.dialogRef.close();
  }
}
