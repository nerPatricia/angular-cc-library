import { AbstractControl, ValidationErrors } from '@angular/forms';
export declare class CreditCardValidators {
    static validateCCNumber(control: AbstractControl): ValidationErrors | null;
    static validateExpDate(control: AbstractControl): ValidationErrors | null;
}
