export interface CardDefinition {
    type: string;
    patterns: number[];
    format: RegExp;
    length: number[];
    cvvLength: number[];
    luhn: boolean;
}
export declare class CreditCard {
    static cards(): CardDefinition[];
    static cardFromNumber(num: string): CardDefinition;
    static restrictNumeric(e: KeyboardEvent): boolean;
    static hasTextSelected(target: HTMLInputElement): boolean;
    static cardType(num: string): string;
    static formatCardNumber(num: string): string;
    static safeVal(value: string, target: HTMLInputElement, updateValue: (value: string) => void): number;
    static isCardNumber(key: number, target: HTMLInputElement): boolean;
    static restrictExpiry(key: number, target: HTMLInputElement): boolean;
    static replaceFullWidthChars(str: string): string;
    static formatExpiry(expiry: string): string;
    static restrictCvc(key: number, target: HTMLInputElement): boolean;
    static luhnCheck(num: string): boolean;
}
