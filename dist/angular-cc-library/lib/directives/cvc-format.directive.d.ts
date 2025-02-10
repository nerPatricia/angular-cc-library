import { ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as i0 from "@angular/core";
export declare class CvcFormatDirective {
    private el;
    private control;
    private target;
    constructor(el: ElementRef, control: NgControl);
    /**
     * Updates the value to target element, or FormControl if exists.
     * @param value New input value.
     */
    private updateValue;
    onKeypress(e: KeyboardEvent): void;
    reformatCvc(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CvcFormatDirective, [null, { optional: true; self: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<CvcFormatDirective, "[ccCVC]", never, {}, {}, never, never, true, never>;
}
