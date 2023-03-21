import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
/**
 * Represents the hostname correctness validator.
 * @returns The result of the validation.
 */
export function createHostnameCorrectnessValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        var isValidHostname = true;
        var containsUnallowedChars = /;|=|&/;

        if (containsUnallowedChars.test(value)){
          isValidHostname = false;
        }

        return !isValidHostname ? {correctHostname:true} : null;
    }
}
