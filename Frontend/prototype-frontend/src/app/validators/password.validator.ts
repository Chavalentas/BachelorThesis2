import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function createPasswordCorrectnessValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        var isValidPassword = true;
        var containsUnallowedChars = /;|=|&/;

        if (containsUnallowedChars.test(value)){
          isValidPassword = false;
        }

        return !isValidPassword ? {correctPassword:true} : null;
    }
}
