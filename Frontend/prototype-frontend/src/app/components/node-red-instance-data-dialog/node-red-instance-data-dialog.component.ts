import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DefaultErrorMatcher } from 'src/app/error-state-matchers/default.error-matcher';

@Component({
  selector: 'app-node-red-instance-data-dialog',
  templateUrl: './node-red-instance-data-dialog.component.html',
  styleUrls: ['./node-red-instance-data-dialog.component.scss']
})
/**
 * Represents the Node-RED instance data dialog component.
 */
export class NodeRedInstanceDataDialogComponent implements OnInit{
  /**
   * Represents the constructor.
   * @param dialogRef Represents the dialog reference.
   */
  constructor(public dialogRef: MatDialogRef<NodeRedInstanceDataDialogComponent>){
  }

  /**
   * Represents the success message.
   */
  public successMessage: string = "";

  /**
   * Represents the error state matcher.
   */
  public matcher = new DefaultErrorMatcher();

  /**
   * Represents the Node-RED instance data form group.
   */
  public nodeRedInstanceDataFormGroup = new FormGroup({
    entityURL: new FormControl("", [Validators.required])
  });

  /**
   * Represents the ngOnInit.
   */
  ngOnInit(): void{
  }

  /**
   * Handles the OK button click.
   * @returns Leaves the method.
   */
  public handleOkButtonClick(): void{
    this.nodeRedInstanceDataFormGroup.markAllAsTouched();
    if (this.nodeRedInstanceDataFormGroup.invalid){
      this.successMessage = "The URL of the Node-RED instance was empty!";
      return;
    }

    var url = this.nodeRedInstanceDataFormGroup?.get("entityURL")?.value;

    if (url === null || url === undefined){
      this.successMessage = "The URL of the Node-RED instance was empty!";
      return;
    }

    if (url[url.length - 1] != "/"){
      url += "/";
    }

    var result = {
      result: url
    };

    this.dialogRef.close(result);
  }

  /**
   * Handles the cancel button click.
   */
  public handleCancelButtonClick(): void{
    this.dialogRef.close();
  }
}
