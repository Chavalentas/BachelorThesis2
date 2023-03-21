import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function createUsernameCorrectnessValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        var isValidUsername = true;
        var containsUnallowedChars = /;|=|&/;

        if (containsUnallowedChars.test(value)){
          isValidUsername = false;
        }

        return !isValidUsername ? {correctUsername:true} : null;
    }
}
