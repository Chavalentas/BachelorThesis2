import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
/**
 * Represents the port correctness validator.
 * @returns The result of the validation.
 */
export function createPortCorrectnessValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        var isValidPort = true;

        if (isNaN(value)){
          isValidPort = false;
        }

        var portParsed = parseInt(value);

        if (!(portParsed >= 0 && portParsed <= 65535)){
          isValidPort = false;
        }

        return !isValidPort ? {correctPort:true} : null;
    }
}
