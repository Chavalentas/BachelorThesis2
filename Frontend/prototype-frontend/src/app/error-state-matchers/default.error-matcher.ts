import { ErrorStateMatcher } from "@angular/material/core";
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
/**
 * Represents the default error matcher.
 */
export class DefaultErrorMatcher implements ErrorStateMatcher{
  /**
   * Returns a boolean indicating whether there is an error state in a control.
   * @param control The control.
   * @param form The form.
   * @returns Boolean indicating whether there is an error state.
   */
  public isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean{
    return !!(control && control.invalid && control.touched);
  }
}
