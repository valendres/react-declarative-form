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

import { ValidatorContext, ValidatorRuleMap, ValueMap } from './types';
import { isDefined } from './utils';

const patterns: {
    [key: string]: RegExp;
} = {
    isDate: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/,
};

const miscValidatorRules: ValidatorRuleMap = {
    required: (key: string, values: ValueMap) => {
        if (!isDefined(key, values)) {
            return {
                key: 'required',
                context: ValidatorContext.Danger,
                message: 'This field is required',
            };
        }
    },
};

const numericValidatorRules: ValidatorRuleMap = {
    minValue: (key: string, values: ValueMap, minValue: number) => {
        if (isDefined(key, values) && values[key] < minValue) {
            return {
                key: 'minValue',
                context: ValidatorContext.Danger,
                message: `${values[key]} must be >= ${minValue}`,
            };
        }
    },
    maxValue: (key: string, values: ValueMap, maxValue: number) => {
        if (isDefined(key, values) && values[key] > maxValue) {
            return {
                key: 'maxValue',
                context: ValidatorContext.Danger,
                message: `${values[key]} must be <= ${maxValue}`,
            };
        }
    },
    isDivisibleBy: (key: string, values: ValueMap, num: number) => {
        if (
            isDefined(key, values) &&
            !isDivisibleBy(String(values[key]), num)
        ) {
            return {
                key: 'isDivisibleBy',
                context: ValidatorContext.Danger,
                message: `${values[key]} must be divisible by ${num}`,
            };
        }
    },
    isInteger: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isInteger(String(values[key]))) {
            return {
                key: 'isInteger',
                context: ValidatorContext.Danger,
                message: 'Must be an integer',
            };
        }
    },
    isDecimal: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isDecimal(String(values[key]))) {
            return {
                key: 'isDecimal',
                context: ValidatorContext.Danger,
                message: 'Must be a decimal',
            };
        }
    },
    isNumeric: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isNumeric(String(values[key]))) {
            return {
                key: 'isNumeric',
                context: ValidatorContext.Danger,
                message: 'Must be a number',
            };
        }
    },
};

const stringValidatorRules: ValidatorRuleMap = {
    minLength: (key: string, values: ValueMap, minLength: number) => {
        if (isDefined(key, values) && String(values[key]).length < minLength) {
            return {
                key: 'minLength',
                context: ValidatorContext.Danger,
                message: `Length must be >= ${minLength}`,
            };
        }
    },
    maxLength: (key: string, values: ValueMap, maxLength: number) => {
        if (isDefined(key, values) && String(values[key]).length > maxLength) {
            return {
                key: 'maxLength',
                context: ValidatorContext.Danger,
                message: `Length must be <= ${maxLength}`,
            };
        }
    },
    isLength: (key: string, values: ValueMap, length: number) => {
        if (isDefined(key, values) && String(values[key]).length !== length) {
            return {
                key: 'isLength',
                context: ValidatorContext.Danger,
                message: `Length must be ${length}`,
            };
        }
    },
    isLowercase: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isLowercase(String(values[key]))) {
            return {
                key: 'isLowercase',
                context: ValidatorContext.Danger,
                message: `Must be all lowercase`,
            };
        }
    },
    isUppercase: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isUppercase(String(values[key]))) {
            return {
                key: 'isUppercase',
                context: ValidatorContext.Danger,
                message: `Must be all uppercase`,
            };
        }
    },
};

const regexValidatorRules: ValidatorRuleMap = {
    matches: (key: string, values: ValueMap, pattern: RegExp) => {
        if (isDefined(key, values) && !pattern.test(values[key])) {
            return {
                key: 'matches',
                context: ValidatorContext.Danger,
                message: 'Invalid input',
            };
        }
    },
    isEmail: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isEmail(String(values[key]))) {
            return {
                key: 'isEmail',
                context: ValidatorContext.Danger,
                message: 'Invalid email',
            };
        }
    },
    isUrl: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isUrl(String(values[key]))) {
            return {
                key: 'isUrl',
                context: ValidatorContext.Danger,
                message: 'Invalid url',
            };
        }
    },
    isCreditCard: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isCreditCard(String(values[key]))) {
            return {
                key: 'isCreditCard',
                context: ValidatorContext.Danger,
                message: 'Invalid credit card number',
            };
        }
    },
    isHexColor: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isHexColor(String(values[key]))) {
            return {
                key: 'isHexColor',
                context: ValidatorContext.Danger,
                message: 'Invalid hex color',
            };
        }
    },
    isIp: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isIP(String(values[key]))) {
            return {
                key: 'isIp',
                context: ValidatorContext.Danger,
                message: 'Invalid IP address',
            };
        }
    },
    isPort: (key: string, values: ValueMap) => {
        if (isDefined(key, values) && !isPort(String(values[key]))) {
            return {
                key: 'isPort',
                context: ValidatorContext.Danger,
                message: 'Invalid port',
            };
        }
    },
    isDate: (key: string, values: ValueMap) => {
        // TODO: refactor this so date format is configurable
        if (isDefined(key, values) && !patterns.isDate.test(values[key])) {
            return {
                key,
                context: ValidatorContext.Danger,
                message: 'Invalid date format, expected: dd/mm/yyyy',
            };
        }
    },
};

const crossFieldValidatorRules: ValidatorRuleMap = {
    eqTarget: (key: string, values: ValueMap, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            values[key] != values[targetKey]
        ) {
            return {
                key: 'eqTarget',
                context: ValidatorContext.Danger,
                message: 'Values do not match',
            };
        }
    },
    gtTarget: (key: string, values: ValueMap, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[targetKey]) > Number(values[key])
        ) {
            return {
                key: 'gt',
                context: ValidatorContext.Danger,
                message: `Value must be > ${values[targetKey]}`,
            };
        }
    },
    gteTarget: (key: string, values: ValueMap, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[targetKey]) >= Number(values[key])
        ) {
            return {
                key: 'gte',
                context: ValidatorContext.Danger,
                message: `Value must be >= ${values[targetKey]}`,
            };
        }
    },
    ltTarget: (key: string, values: ValueMap, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[targetKey]) < Number(values[key])
        ) {
            return {
                key: 'ltTarget',
                context: ValidatorContext.Danger,
                message: `Value must be < ${values[targetKey]}`,
            };
        }
    },
    lteTarget: (key: string, values: ValueMap, targetKey: string) => {
        if (
            isDefined(key, values) &&
            isDefined(targetKey, values) &&
            Number(values[targetKey]) <= Number(values[key])
        ) {
            return {
                key: 'lteTarget',
                context: ValidatorContext.Danger,
                message: `Value must be <= ${values[targetKey]}`,
            };
        }
    },
};

export const baseValidatorRules: ValidatorRuleMap = {
    ...miscValidatorRules,
    ...numericValidatorRules,
    ...stringValidatorRules,
    ...regexValidatorRules,
    ...crossFieldValidatorRules,
};
