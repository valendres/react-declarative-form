import * as isCreditCard from 'validator/lib/isCreditCard';
import * as isDecimal from 'validator/lib/isDecimal';
import * as isDivisibleBy from 'validator/lib/isDivisibleBy';
import * as isEmail from 'validator/lib/isEmail';
import * as isHexColor from 'validator/lib/isHexColor';
import * as isInteger from 'validator/lib/isInt';
import * as isIP from 'validator/lib/isIP';
import * as isLowercase from 'validator/lib/isLowercase';
import * as isNumeric from 'validator/lib/isNumeric';
import * as isPort from 'validator/lib/isPort';
import * as isUppercase from 'validator/lib/isUppercase';
import * as isUrl from 'validator/lib/isURL';

import { ValidationContext, ValidationRuleMap } from './types';
import { isDefined } from './utils';

const miscValidationRules: ValidationRuleMap = {
    required: (key: string, values: any) => {
        if (!isDefined(key, values)) {
            return {
                key: 'required',
                context: ValidationContext.Danger,
                message: 'This field is required',
            };
        }
    },
};

const numericValidationRules: ValidationRuleMap = {
    minValue: (key: string, values: any, minValue: number) => {
        if (isDefined(key, values) && values[key] < minValue) {
            return {
                key: 'minValue',
                context: ValidationContext.Danger,
                message: `${values[key]} must be >= ${minValue}`,
            };
        }
    },
    maxValue: (key: string, values: any, maxValue: number) => {
        if (isDefined(key, values) && values[key] > maxValue) {
            return {
                key: 'maxValue',
                context: ValidationContext.Danger,
                message: `${values[key]} must be <= ${maxValue}`,
            };
        }
    },
    isDivisibleBy: (key: string, values: any, num: number) => {
        if (
            isDefined(key, values) &&
            !isDivisibleBy(String(values[key]), num)
        ) {
            return {
                key: 'isDivisibleBy',
                context: ValidationContext.Danger,
                message: `${values[key]} must be divisible by ${num}`,
            };
        }
    },
    isInteger: (key: string, values: any) => {
        if (isDefined(key, values) && !isInteger(String(values[key]))) {
            return {
                key: 'isInteger',
                context: ValidationContext.Danger,
                message: 'Must be an integer',
            };
        }
    },
    isDecimal: (key: string, values: any) => {
        if (isDefined(key, values) && !isDecimal(String(values[key]))) {
            return {
                key: 'isDecimal',
                context: ValidationContext.Danger,
                message: 'Must be a decimal',
            };
        }
    },
    isNumeric: (key: string, values: any) => {
        if (isDefined(key, values) && !isNumeric(String(values[key]))) {
            return {
                key: 'isNumeric',
                context: ValidationContext.Danger,
                message: 'Must be a number',
            };
        }
    },
};

const stringValidationRules: ValidationRuleMap = {
    minLength: (key: string, values: any, minLength: number) => {
        if (isDefined(key, values) && String(values[key]).length < minLength) {
            return {
                key: 'minLength',
                context: ValidationContext.Danger,
                message: `Length must be >= ${minLength}`,
            };
        }
    },
    maxLength: (key: string, values: any, maxLength: number) => {
        if (isDefined(key, values) && String(values[key]).length > maxLength) {
            return {
                key: 'maxLength',
                context: ValidationContext.Danger,
                message: `Length must be <= ${maxLength}`,
            };
        }
    },
    isLength: (key: string, values: any, length: number) => {
        if (isDefined(key, values) && String(values[key]).length === length) {
            return {
                key: 'isLength',
                context: ValidationContext.Danger,
                message: `Length must be ${length}`,
            };
        }
    },
    isLowercase: (key: string, values: any) => {
        if (isDefined(key, values) && !isLowercase(String(values[key]))) {
            return {
                key: 'isLowercase',
                context: ValidationContext.Danger,
                message: `Must be all lowercase`,
            };
        }
    },
    isUppercase: (key: string, values: any) => {
        if (isDefined(key, values) && !isUppercase(String(values[key]))) {
            return {
                key: 'isUppercase',
                context: ValidationContext.Danger,
                message: `Must be all uppercase`,
            };
        }
    },
};

const regexValidationRules: ValidationRuleMap = {
    matches: (key: string, values: any, pattern: RegExp) => {
        if (isDefined(key, values) && !pattern.test(values[key])) {
            return {
                key: 'matches',
                context: ValidationContext.Danger,
                message: 'Invalid input',
            };
        }
    },
    isEmail: (key: string, values: any) => {
        if (isDefined(key, values) && !isEmail(String(values[key]))) {
            return {
                key: 'isEmail',
                context: ValidationContext.Danger,
                message: 'Invalid email',
            };
        }
    },
    isUrl: (key: string, values: any) => {
        if (isDefined(key, values) && !isUrl(String(values[key]))) {
            return {
                key: 'isUrl',
                context: ValidationContext.Danger,
                message: 'Invalid url',
            };
        }
    },
    isCreditCard: (key: string, values: any) => {
        if (isDefined(key, values) && !isCreditCard(String(values[key]))) {
            return {
                key: 'isCreditCard',
                context: ValidationContext.Danger,
                message: 'Invalid credit card number',
            };
        }
    },
    isHexColor: (key: string, values: any) => {
        if (isDefined(key, values) && !isHexColor(String(values[key]))) {
            return {
                key: 'isHexColor',
                context: ValidationContext.Danger,
                message: 'Invalid hex color',
            };
        }
    },
    isIP: (key: string, values: any) => {
        if (isDefined(key, values) && !isIP(String(values[key]))) {
            return {
                key: 'isIP',
                context: ValidationContext.Danger,
                message: 'Invalid IP address',
            };
        }
    },
    isPort: (key: string, values: any) => {
        if (isDefined(key, values) && !isPort(String(values[key]))) {
            return {
                key: 'isPort',
                context: ValidationContext.Danger,
                message: 'Invalid port',
            };
        }
    },
};

const crossFieldValidationRules: ValidationRuleMap = {
    eqTarget: (key: string, values: any, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            values[key] != values[targetKey]
        ) {
            return {
                key: 'eqTarget',
                context: ValidationContext.Danger,
                message: 'Values do not match',
            };
        }
    },
    gtTarget: (key: string, values: any, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[key]) > Number(values[targetKey])
        ) {
            return {
                key: 'gt',
                context: ValidationContext.Danger,
                message: `Value must be > ${values[targetKey]}`,
            };
        }
    },
    gteTarget: (key: string, values: any, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[key]) >= Number(values[targetKey])
        ) {
            return {
                key: 'gte',
                context: ValidationContext.Danger,
                message: `Value must be >= ${values[targetKey]}`,
            };
        }
    },
    ltTarget: (key: string, values: any, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[key]) < Number(values[targetKey])
        ) {
            return {
                key: 'ltTarget',
                context: ValidationContext.Danger,
                message: `Value must be < ${values[targetKey]}`,
            };
        }
    },
    lteTarget: (key: string, values: any, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[key]) <= Number(values[targetKey])
        ) {
            return {
                key: 'lteTarget',
                context: ValidationContext.Danger,
                message: `Value must be <= ${values[targetKey]}`,
            };
        }
    },
};

export const baseValidationRules: ValidationRuleMap = {
    ...miscValidationRules,
    ...numericValidationRules,
    ...stringValidationRules,
    ...regexValidationRules,
    ...crossFieldValidationRules,
};
