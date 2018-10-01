import { ValueMap, ValidatorResponse } from './validator.types';

export type ValidatorRule = (
    key: string,
    values: ValueMap,
    criteria?: any,
) => ValidatorResponse;

export interface ValidatorRuleMap {
    readonly [name: string]: ValidatorRule;
}

export interface ValidatorRules {
    /** Input is >= to the specified minimum value */
    minValue?: number;

    /** Input is <= to the specified maximum value */
    maxValue?: number;

    /** Input is divisible by the specified number */
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
    isIP?: boolean;

    /** Input is a valid port number */
    isPort?: boolean;

    /** Input value is == to target input value */
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

    [name: string]: any;
}
