import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

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
