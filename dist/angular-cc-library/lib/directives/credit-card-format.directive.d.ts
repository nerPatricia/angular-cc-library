import { ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class CreditCardFormatDirective {
    private el;
    private control;
    private target;
    private cards;
    resolvedScheme$: BehaviorSubject<string>;
    constructor(el: ElementRef, control: NgControl);
    /**
     * Updates the value to target element, or FormControl if exists.
     * @param value New input value.
     */
    private updateValue;
    onKeypress(e: KeyboardEvent): void;
    onKeydown(e: KeyboardEvent): void;
    onKeyup(): void;
    onPaste(): void;
    onChange(): void;
    onInput(): void;
    private formatCardNumber;
    private formatBackCardNumber;
    private setCardType;
    private reFormatCardNumber;
    static ɵfac: i0.ɵɵFactoryDeclaration<CreditCardFormatDirective, [null, { optional: true; self: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CreditCardFormatDirective, "[ccNumber]", ["ccNumber"], {}, {}, never, never, true, never>;
}
