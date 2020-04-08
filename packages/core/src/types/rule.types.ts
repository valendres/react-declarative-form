import { ValueMap, ValidatorData } from './validator.types';

export type ValidatorRule = (
    key: string,
    values: ValueMap,
    criteria?: any,
) => ValidatorData;

export interface ValidatorRuleMap {
    readonly [name: string]: ValidatorRule;
}

export interface ValidatorRules {
    /**
     * Whether the input is required. If true, the value must not be:
     * - undefined
     * - null
     * - empty string
     */
    required?: boolean;

    /** Input is === to the specified value */
    equals?: any;

    /** Input is !== to the specified value */
    notEquals?: any;

    /** Input is > than the specified value */
    greaterThan?: number;

    /** Input is < than the specified value */
    lessThan?: number;

    /** Input is >= to the specified value */
    minValue?: number;

    /** Input is <= to the specified value */
    maxValue?: number;

    /** Input is divisible by the specified value */
    isDivisibleBy?: number;

    /** Input is an integer */
    isInteger?: boolean;

    /** Input is a decimal number */
    isDecimal?: boolean;

    /** Input is numeric characters only [0-9]+ */
    isNumeric?: boolean;

    /** Input length is at least the specified length */
    minLength?: number;

    /** Input length is at most the specified length */
    maxLength?: number;

    /** Input length equals the specified length */
    isLength?: number;

    /** Input is all lowercase characters */
    isLowercase?: boolean;

    /** Input is all uppercase characters */
    isUppercase?: boolean;

    /** Input matches the specified regex pattern */
    matches?: RegExp;

    /** Input is a valid email address */
    isEmail?: boolean;

    /** Input is a valid url */
    isUrl?: boolean;

    /** Input is a valid credit card number */
    isCreditCard?: boolean;

    /** Input is a valid hexadecimal color */
    isHexColor?: boolean;

    /** Input is a valid IPv4 or IPv6 address */
    isIp?: boolean;

    /** Input is a valid port number */
    isPort?: boolean;

    /** Input value is === to target input value */
    eqTarget?: string;

    /** Input value is > to target input value */
    gtTarget?: string;

    /** Input value is >= to target input value */
    gteTarget?: string;

    /** Input value is < to target input value */
    ltTarget?: string;

    /** Input value is <= to target input value */
    lteTarget?: string;

    /** Custom validator rule. It is executed before other rules */
    custom?: ValidatorRule;
}
