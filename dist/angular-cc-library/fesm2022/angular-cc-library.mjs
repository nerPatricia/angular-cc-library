import * as i1 from '@angular/forms';
import { Validators } from '@angular/forms';
import * as i0 from '@angular/core';
import { HostListener, Self, Optional, Directive, NgModule } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const defaultFormat = /(\d{1,4})/g;
const cards = [
    {
        type: 'maestro',
        patterns: [5018, 502, 503, 506, 56, 58, 639, 6220, 67],
        format: defaultFormat,
        length: [12, 13, 14, 15, 16, 17, 18, 19],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'forbrugsforeningen',
        patterns: [600],
        format: defaultFormat,
        length: [16],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'dankort',
        patterns: [5019],
        format: defaultFormat,
        length: [16],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'visa',
        patterns: [4],
        format: defaultFormat,
        length: [13, 16, 19],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'mastercard',
        patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
        format: defaultFormat,
        length: [16],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'amex',
        patterns: [34, 37],
        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
        length: [15],
        cvvLength: [3, 4],
        luhn: true,
    }, {
        type: 'dinersclub',
        patterns: [30, 36, 38, 39],
        format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
        length: [14],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'discover',
        patterns: [60, 64, 65, 622],
        format: defaultFormat,
        length: [16],
        cvvLength: [3],
        luhn: true,
    }, {
        type: 'unionpay',
        patterns: [62, 88],
        format: defaultFormat,
        length: [16, 17, 18, 19],
        cvvLength: [3],
        luhn: false,
    }, {
        type: 'jcb',
        patterns: [35],
        format: defaultFormat,
        length: [16, 19],
        cvvLength: [3],
        luhn: true,
    },
];
// @dynamic
class CreditCard {
    static cards() {
        return cards;
    }
    static cardFromNumber(num) {
        num = (num + '').replace(/\D/g, '');
        for (let i = 0, len = cards.length; i < len; i++) {
            const card = cards[i];
            const ref = card.patterns;
            for (let j = 0, len1 = ref.length; j < len1; j++) {
                const pattern = ref[j];
                const p = pattern + '';
                if (num.substr(0, p.length) === p) {
                    return card;
                }
            }
        }
    }
    static restrictNumeric(e) {
        if (e.metaKey || e.ctrlKey) {
            return true;
        }
        if (e.which === 32) {
            return false;
        }
        if (e.which === 0) {
            return true;
        }
        if (e.which < 33) {
            return true;
        }
        const input = String.fromCharCode(e.which);
        return !!/[\d\s]/.test(input);
    }
    static hasTextSelected(target) {
        return target.selectionStart !== null && target.selectionStart !== target.selectionEnd;
    }
    static cardType(num) {
        if (!num) {
            return num;
        }
        const card = this.cardFromNumber(num);
        if (card !== null && typeof card !== 'undefined') {
            return card.type;
        }
        else {
            return null;
        }
    }
    static formatCardNumber(num) {
        num = num.replace(/\D/g, '');
        const card = this.cardFromNumber(num);
        if (!card) {
            return num;
        }
        const upperLength = card.length[card.length.length - 1];
        num = num.slice(0, upperLength);
        if (card.format.global) {
            const matches = num.match(card.format);
            if (matches != null) {
                return matches.join(' ');
            }
        }
        else {
            const groups = card.format.exec(num);
            if (groups == null) {
                return;
            }
            groups.shift();
            return groups.filter(Boolean).join(' ');
        }
    }
    static safeVal(value, target, updateValue) {
        let cursor = null;
        const last = target.value;
        let result = null;
        try {
            cursor = target.selectionStart;
        }
        catch (error) {
            // do nothing
        }
        updateValue(value);
        if (cursor !== null && target === document.activeElement) {
            if (cursor === last.length) {
                cursor = value.length;
            }
            if (last !== value) {
                const prevPair = last.slice(cursor - 1, +cursor + 1 || 9e9);
                const currPair = value.slice(cursor - 1, +cursor + 1 || 9e9);
                const digit = value[cursor];
                if (/\d/.test(digit) && prevPair === (`${digit} `) && currPair === (` ${digit}`)) {
                    cursor = cursor + 1;
                }
            }
            result = cursor;
        }
        return result;
    }
    static isCardNumber(key, target) {
        const digit = String.fromCharCode(key);
        if (!/^\d+$/.test(digit)) {
            return false;
        }
        if (CreditCard.hasTextSelected(target)) {
            return true;
        }
        const value = (target.value + digit).replace(/\D/g, '');
        const card = CreditCard.cardFromNumber(value);
        if (card) {
            return value.length <= card.length[card.length.length - 1];
        }
        else {
            return value.length <= 16;
        }
    }
    static restrictExpiry(key, target) {
        const digit = String.fromCharCode(key);
        if (!/^\d+$/.test(digit) || this.hasTextSelected(target)) {
            return false;
        }
        const value = `${target.value}${digit}`.replace(/\D/g, '');
        return value.length > 6;
    }
    static replaceFullWidthChars(str) {
        if (str === null) {
            str = '';
        }
        const fullWidth = '\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19';
        const halfWidth = '0123456789';
        let value = '';
        const chars = str.split('');
        for (let i = 0; i < chars.length; i++) {
            let chr = chars[i];
            const idx = fullWidth.indexOf(chr);
            if (idx > -1) {
                chr = halfWidth[idx];
            }
            value += chr;
        }
        return value;
    }
    static formatExpiry(expiry) {
        const parts = expiry.match(/^\D*(\d{1,2})(\D+)?(\d{1,4})?/);
        if (!parts) {
            return '';
        }
        let mon = parts[1] || '';
        let sep = parts[2] || '';
        const year = parts[3] || '';
        if (year.length > 0) {
            sep = ' / ';
        }
        else if (sep === ' /') {
            mon = mon.substring(0, 1);
            sep = '';
        }
        else if (mon.length === 2 || sep.length > 0) {
            sep = ' / ';
        }
        else if (mon.length === 1 && (mon !== '0' && mon !== '1')) {
            mon = `0${mon}`;
            sep = ' / ';
        }
        return `${mon}${sep}${year}`;
    }
    static restrictCvc(key, target) {
        const digit = String.fromCharCode(key);
        if (!/^\d+$/.test(digit) || this.hasTextSelected(target)) {
            return false;
        }
        const val = `${target.value}${digit}`;
        return val.length <= 4;
    }
    static luhnCheck(num) {
        const digits = num.split('').reverse();
        let odd = true;
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let digit = parseInt(digits[i], 10);
            if ((odd = !odd)) {
                digit *= 2;
            }
            if (digit > 9) {
                digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 === 0;
    }
}

class CreditCardValidators {
    static validateCCNumber(control) {
        if (Validators.required(control) !== undefined && Validators.required(control) !== null) {
            return { ccNumber: true };
        }
        const num = control.value.toString().replace(/\s+|-/g, '');
        if (!/^\d+$/.test(num)) {
            return { ccNumber: true };
        }
        const card = CreditCard.cardFromNumber(num);
        if (!card) {
            return { ccNumber: true };
        }
        if (card.length.includes(num.length) && (card.luhn === false || CreditCard.luhnCheck(num))) {
            return null;
        }
        const upperlength = card.length[card.length.length - 1];
        if (num.length > upperlength) {
            const registeredNum = num.substring(0, upperlength);
            if (CreditCard.luhnCheck(registeredNum)) {
                return null;
            }
        }
        return { ccNumber: true };
    }
    static validateExpDate(control) {
        if (Validators.required(control) !== undefined && Validators.required(control) !== null) {
            return { expDate: true };
        }
        if (typeof control.value !== 'undefined' && control.value.length >= 5) {
            let [month, year] = control.value.split(/[\s/]+/, 2);
            if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
                const prefix = new Date().getFullYear().toString().slice(0, 2);
                year = prefix + year;
            }
            month = parseInt(month, 10).toString();
            year = parseInt(year, 10).toString();
            if (/^\d+$/.test(month) && /^\d+$/.test(year) && (month >= 1 && month <= 12)) {
                const expiry = new Date(year, month);
                const currentTime = new Date();
                expiry.setMonth(expiry.getMonth() - 1);
                expiry.setMonth(expiry.getMonth() + 1, 1);
                if (expiry > currentTime) {
                    return null;
                }
            }
        }
        return { expDate: true };
    }
}

class CreditCardFormatDirective {
    constructor(el, control) {
        this.el = el;
        this.control = control;
        this.cards = CreditCard.cards();
        this.resolvedScheme$ = new BehaviorSubject('unknown');
        this.target = this.el.nativeElement;
    }
    /**
     * Updates the value to target element, or FormControl if exists.
     * @param value New input value.
     */
    updateValue(value) {
        if (this.control) {
            this.control.control.setValue(value);
        }
        else {
            this.target.value = value;
        }
    }
    onKeypress(e) {
        if (CreditCard.restrictNumeric(e)) {
            if (CreditCard.isCardNumber(e.which, this.target)) {
                this.formatCardNumber(e);
            }
        }
        else {
            e.preventDefault();
        }
    }
    onKeydown(e) {
        this.formatBackCardNumber(e);
        this.reFormatCardNumber();
    }
    onKeyup() {
        this.setCardType();
    }
    onPaste() {
        this.reFormatCardNumber();
    }
    onChange() {
        this.reFormatCardNumber();
    }
    onInput() {
        this.reFormatCardNumber();
        this.setCardType();
    }
    formatCardNumber(e) {
        const digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        const value = this.target.value;
        const card = CreditCard.cardFromNumber(value + digit);
        const length = (value.replace(/\D/g, '') + digit).length;
        const upperLength = card ? card.length[card.length.length - 1] : 19;
        if (length >= upperLength) {
            return;
        }
    }
    formatBackCardNumber(e) {
        const value = this.target.value;
        const selStart = this.target.selectionStart;
        if (e.which !== 8) {
            return;
        }
        if (selStart != null
            && selStart === this.target.selectionEnd
            && selStart > 0
            && selStart !== value.length
            && value[selStart - 1] === ' ') {
            e.preventDefault();
            if (selStart <= 2) {
                this.updateValue(value.slice(selStart));
                this.target.selectionStart = 0;
                this.target.selectionEnd = 0;
            }
            else {
                this.updateValue(value.slice(0, selStart - 2) + value.slice(selStart));
                this.target.selectionStart = selStart - 2;
                this.target.selectionEnd = selStart - 2;
            }
        }
    }
    setCardType() {
        const cardType = CreditCard.cardType(this.target.value) || 'unknown';
        this.resolvedScheme$.next(cardType);
        if (!this.target.classList.contains(cardType)) {
            this.cards.forEach((card) => {
                this.target.classList.remove(card.type);
            });
            this.target.classList.remove('unknown');
            this.target.classList.add(cardType);
            this.target.classList.toggle('identified', cardType !== 'unknown');
        }
    }
    reFormatCardNumber() {
        const value = CreditCard.formatCardNumber(CreditCard.replaceFullWidthChars(this.target.value));
        const oldValue = this.target.value;
        if (value !== oldValue) {
            this.target.selectionStart = this.target.selectionEnd = CreditCard.safeVal(value, this.target, (safeVal => {
                this.updateValue(safeVal);
            }));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CreditCardFormatDirective, deps: [{ token: i0.ElementRef }, { token: i1.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.1.5", type: CreditCardFormatDirective, isStandalone: true, selector: "[ccNumber]", host: { listeners: { "keypress": "onKeypress($event)", "keydown": "onKeydown($event)", "keyup": "onKeyup()", "paste": "onPaste()", "change": "onChange()", "input": "onInput()" } }, exportAs: ["ccNumber"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CreditCardFormatDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ccNumber]',
                    exportAs: 'ccNumber',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NgControl, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }], propDecorators: { onKeypress: [{
                type: HostListener,
                args: ['keypress', ['$event']]
            }], onKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }], onKeyup: [{
                type: HostListener,
                args: ['keyup']
            }], onPaste: [{
                type: HostListener,
                args: ['paste']
            }], onChange: [{
                type: HostListener,
                args: ['change']
            }], onInput: [{
                type: HostListener,
                args: ['input']
            }] } });

class CvcFormatDirective {
    constructor(el, control) {
        this.el = el;
        this.control = control;
        this.target = this.el.nativeElement;
    }
    /**
     * Updates the value to target element, or FormControl if exists.
     * @param value New input value.
     */
    updateValue(value) {
        if (this.control) {
            this.control.control.setValue(value);
        }
        else {
            this.target.value = value;
        }
    }
    onKeypress(e) {
        if (!CreditCard.restrictNumeric(e) && !CreditCard.restrictCvc(e.which, this.target)) {
            e.preventDefault();
        }
    }
    reformatCvc() {
        const val = CreditCard.replaceFullWidthChars(this.target.value)
            .replace(/\D/g, '')
            .slice(0, 4);
        const oldVal = this.target.value;
        if (val !== oldVal) {
            this.target.selectionStart = this.target.selectionEnd = CreditCard.safeVal(val, this.target, (safeVal => {
                this.updateValue(safeVal);
            }));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CvcFormatDirective, deps: [{ token: i0.ElementRef }, { token: i1.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.1.5", type: CvcFormatDirective, isStandalone: true, selector: "[ccCVC]", host: { listeners: { "keypress": "onKeypress($event)", "paste": "reformatCvc()", "change": "reformatCvc()", "input": "reformatCvc()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CvcFormatDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ccCVC]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NgControl, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }], propDecorators: { onKeypress: [{
                type: HostListener,
                args: ['keypress', ['$event']]
            }], reformatCvc: [{
                type: HostListener,
                args: ['paste']
            }, {
                type: HostListener,
                args: ['change']
            }, {
                type: HostListener,
                args: ['input']
            }] } });

class ExpiryFormatDirective {
    constructor(el, control) {
        this.el = el;
        this.control = control;
        this.target = this.el.nativeElement;
    }
    /**
     * Updates the value to target element, or FormControl if exists.
     * @param value New input value.
     */
    updateValue(value) {
        if (this.control) {
            this.control.control.setValue(value);
        }
        else {
            this.target.value = value;
        }
    }
    onKeypress(e) {
        if (CreditCard.restrictNumeric(e)) {
            if (CreditCard.restrictExpiry(e.which, this.target)) {
                this.formatExpiry(e);
                this.formatForwardSlashAndSpace(e);
                this.formatForwardExpiry(e);
            }
        }
        else {
            e.preventDefault();
            return false;
        }
    }
    onKeydown(e) {
        if (CreditCard.restrictNumeric(e) && CreditCard.restrictExpiry(e.which, this.target)) {
            this.formatBackExpiry(e);
        }
    }
    onChange() {
        this.reformatExpiry();
    }
    onInput() {
        this.reformatExpiry();
    }
    formatExpiry(e) {
        const digit = String.fromCharCode(e.which);
        const val = `${this.target.value}${digit}`;
        if (!/^\d+$/.test(digit)) {
            return;
        }
        if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
            e.preventDefault();
            this.updateValue(`0${val} / `);
        }
        else if (/^\d\d$/.test(val)) {
            e.preventDefault();
            const m1 = parseInt(val[0], 10);
            const m2 = parseInt(val[1], 10);
            if (m2 > 2 && m1 !== 0) {
                this.updateValue(`0${m1} / ${m2}`);
            }
            else {
                this.updateValue(`${val} / `);
            }
        }
    }
    formatForwardSlashAndSpace(e) {
        const which = String.fromCharCode(e.which);
        const val = this.target.value;
        if (!(which === '/' || which === ' ')) {
            return false;
        }
        if (/^\d$/.test(val) && val !== '0') {
            this.updateValue(`0${val} / `);
        }
    }
    formatForwardExpiry(e) {
        const digit = String.fromCharCode(e.which);
        const val = this.target.value;
        if (!/^\d+$/.test(digit) && /^\d\d$/.test(val)) {
            this.updateValue(this.target.value = `${val} / `);
        }
    }
    formatBackExpiry(e) {
        const val = this.target.valueOf;
        if (e.which !== 8) {
            return;
        }
        if ((this.target.selectionStart != null) && this.target.selectionStart !== val.length) {
            return;
        }
        if (/\d\s\/\s$/.test(val)) {
            e.preventDefault();
            this.updateValue(val.replace(/\d\s\/\s$/, ''));
        }
    }
    reformatExpiry() {
        const val = CreditCard.formatExpiry(CreditCard.replaceFullWidthChars(this.target.value));
        const oldVal = this.target.value;
        if (val !== oldVal) {
            this.target.selectionStart = this.target.selectionEnd = CreditCard.safeVal(val, this.target, (safeVal => {
                this.updateValue(safeVal);
            }));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: ExpiryFormatDirective, deps: [{ token: i0.ElementRef }, { token: i1.NgControl, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "19.1.5", type: ExpiryFormatDirective, isStandalone: true, selector: "[ccExp]", host: { listeners: { "keypress": "onKeypress($event)", "keydown": "onKeydown($event)", "change": "onChange()", "input": "onInput()" } }, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: ExpiryFormatDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ccExp]',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.NgControl, decorators: [{
                    type: Self
                }, {
                    type: Optional
                }] }], propDecorators: { onKeypress: [{
                type: HostListener,
                args: ['keypress', ['$event']]
            }], onKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }], onChange: [{
                type: HostListener,
                args: ['change']
            }], onInput: [{
                type: HostListener,
                args: ['input']
            }] } });

const CREDIT_CARD_LIBRARY_DIRECTIVES = [
    CreditCardFormatDirective,
    ExpiryFormatDirective,
    CvcFormatDirective,
];
class CreditCardDirectivesModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CreditCardDirectivesModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.1.5", ngImport: i0, type: CreditCardDirectivesModule, imports: [CreditCardFormatDirective,
            ExpiryFormatDirective,
            CvcFormatDirective], exports: [CreditCardFormatDirective,
            ExpiryFormatDirective,
            CvcFormatDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CreditCardDirectivesModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.1.5", ngImport: i0, type: CreditCardDirectivesModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CREDIT_CARD_LIBRARY_DIRECTIVES],
                    exports: [CREDIT_CARD_LIBRARY_DIRECTIVES],
                }]
        }] });

/*
 * Public API Surface of angular-cc-library
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CreditCard, CreditCardDirectivesModule, CreditCardFormatDirective, CreditCardValidators, CvcFormatDirective, ExpiryFormatDirective };
//# sourceMappingURL=angular-cc-library.mjs.map
