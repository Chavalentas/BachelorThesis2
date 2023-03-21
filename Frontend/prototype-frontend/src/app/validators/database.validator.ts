import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
/**
 * Represents the database correctness validator.
 * @returns The result of the validation.
 */
export function createDatabaseCorrectnessValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        var isValidDatabase = true;
        var containsUnallowedChars = /;|=|&/;

        if (containsUnallowedChars.test(value)){
          isValidDatabase = false;
        }

        return !isValidDatabase ? {correctDatabase:true} : null;
    }
}
