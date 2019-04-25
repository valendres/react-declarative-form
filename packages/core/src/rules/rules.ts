import isCreditCard from 'validator/lib/isCreditCard';
import isDecimal from 'validator/lib/isDecimal';
import isDivisibleBy from 'validator/lib/isDivisibleBy';
import isEmail from 'validator/lib/isEmail';
import isHexColor from 'validator/lib/isHexColor';
import isInteger from 'validator/lib/isInt';
import isIP from 'validator/lib/isIP';
import isLowercase from 'validator/lib/isLowercase';
import isNumeric from 'validator/lib/isNumeric';
import isPort from 'validator/lib/isPort';
import isUppercase from 'validator/lib/isUppercase';
import isUrl from 'validator/lib/isURL';

import { ValidatorContext, ValidatorRuleMap, ValueMap } from '../types';
import { isDefined } from '../utils';

const patterns: {
    [componentName: string]: RegExp;
} = {
    isDate: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/,
};

const miscValidatorRules: ValidatorRuleMap = {
    required: (componentName: string, values: ValueMap) => {
        if (!isDefined(componentName, values)) {
            return {
                name: 'required',
                context: ValidatorContext.Danger,
                message: 'This field is required',
            };
        }
    },
};

const numericValidatorRules: ValidatorRuleMap = {
    minValue: (componentName: string, values: ValueMap, minValue: number) => {
        if (
            isDefined(componentName, values) &&
            values[componentName] < minValue
        ) {
            return {
                name: 'minValue',
                context: ValidatorContext.Danger,
                message: `Value must be >= ${minValue}`,
            };
        }
    },
    maxValue: (componentName: string, values: ValueMap, maxValue: number) => {
        if (
            isDefined(componentName, values) &&
            values[componentName] > maxValue
        ) {
            return {
                name: 'maxValue',
                context: ValidatorContext.Danger,
                message: `Value must be <= ${maxValue}`,
            };
        }
    },
    isDivisibleBy: (componentName: string, values: ValueMap, num: number) => {
        if (
            isDefined(componentName, values) &&
            !isDivisibleBy(String(values[componentName]), num)
        ) {
            return {
                name: 'isDivisibleBy',
                context: ValidatorContext.Danger,
                message: `${values[componentName]} must be divisible by ${num}`,
            };
        }
    },
    isInteger: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isInteger(String(values[componentName]))
        ) {
            return {
                name: 'isInteger',
                context: ValidatorContext.Danger,
                message: 'Must be an integer',
            };
        }
    },
    isDecimal: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isDecimal(String(values[componentName]))
        ) {
            return {
                name: 'isDecimal',
                context: ValidatorContext.Danger,
                message: 'Must be a decimal',
            };
        }
    },
    isNumeric: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isNumeric(String(values[componentName]))
        ) {
            return {
                name: 'isNumeric',
                context: ValidatorContext.Danger,
                message: 'Must be a number',
            };
        }
    },
};

const stringValidatorRules: ValidatorRuleMap = {
    minLength: (componentName: string, values: ValueMap, minLength: number) => {
        if (
            isDefined(componentName, values) &&
            String(values[componentName]).length < minLength
        ) {
            return {
                name: 'minLength',
                context: ValidatorContext.Danger,
                message: `Length must be >= ${minLength}`,
            };
        }
    },
    maxLength: (componentName: string, values: ValueMap, maxLength: number) => {
        if (
            isDefined(componentName, values) &&
            String(values[componentName]).length > maxLength
        ) {
            return {
                name: 'maxLength',
                context: ValidatorContext.Danger,
                message: `Length must be <= ${maxLength}`,
            };
        }
    },
    isLength: (componentName: string, values: ValueMap, length: number) => {
        if (
            isDefined(componentName, values) &&
            String(values[componentName]).length !== length
        ) {
            return {
                name: 'isLength',
                context: ValidatorContext.Danger,
                message: `Length must be ${length}`,
            };
        }
    },
    isLowercase: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isLowercase(String(values[componentName]))
        ) {
            return {
                name: 'isLowercase',
                context: ValidatorContext.Danger,
                message: `Must be all lowercase`,
            };
        }
    },
    isUppercase: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isUppercase(String(values[componentName]))
        ) {
            return {
                name: 'isUppercase',
                context: ValidatorContext.Danger,
                message: `Must be all uppercase`,
            };
        }
    },
};

const regexValidatorRules: ValidatorRuleMap = {
    matches: (componentName: string, values: ValueMap, pattern: RegExp) => {
        if (
            isDefined(componentName, values) &&
            pattern &&
            !pattern.test(values[componentName])
        ) {
            return {
                name: 'matches',
                context: ValidatorContext.Danger,
                message: 'Invalid input',
            };
        }
    },
    isEmail: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isEmail(String(values[componentName]))
        ) {
            return {
                name: 'isEmail',
                context: ValidatorContext.Danger,
                message: 'Invalid email',
            };
        }
    },
    isUrl: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isUrl(String(values[componentName]))
        ) {
            return {
                name: 'isUrl',
                context: ValidatorContext.Danger,
                message: 'Invalid url',
            };
        }
    },
    isCreditCard: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isCreditCard(String(values[componentName]))
        ) {
            return {
                name: 'isCreditCard',
                context: ValidatorContext.Danger,
                message: 'Invalid credit card number',
            };
        }
    },
    isHexColor: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isHexColor(String(values[componentName]))
        ) {
            return {
                name: 'isHexColor',
                context: ValidatorContext.Danger,
                message: 'Invalid hex color',
            };
        }
    },
    isIp: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isIP(String(values[componentName]))
        ) {
            return {
                name: 'isIp',
                context: ValidatorContext.Danger,
                message: 'Invalid IP address',
            };
        }
    },
    isPort: (componentName: string, values: ValueMap) => {
        if (
            isDefined(componentName, values) &&
            !isPort(String(values[componentName]))
        ) {
            return {
                name: 'isPort',
                context: ValidatorContext.Danger,
                message: 'Invalid port',
            };
        }
    },
    isDate: (componentName: string, values: ValueMap) => {
        // TODO: refactor this so date format is configurable
        if (
            isDefined(componentName, values) &&
            !patterns.isDate.test(values[componentName])
        ) {
            return {
                name: componentName,
                context: ValidatorContext.Danger,
                message: 'Invalid date format, expected: dd/mm/yyyy',
            };
        }
    },
};

const crossFieldValidatorRules: ValidatorRuleMap = {
    eqTarget: (
        componentName: string,
        values: ValueMap,
        targetcomponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetcomponentName, values) &&
            values[componentName] !== values[targetcomponentName]
        ) {
            return {
                name: 'eqTarget',
                context: ValidatorContext.Danger,
                message: 'Values do not match',
            };
        }
    },
    gtTarget: (
        componentName: string,
        values: ValueMap,
        targetcomponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetcomponentName, values) &&
            Number(values[targetcomponentName]) > Number(values[componentName])
        ) {
            return {
                name: 'gtTarget',
                context: ValidatorContext.Danger,
                message: `Value must be > ${values[targetcomponentName]}`,
            };
        }
    },
    gteTarget: (
        componentName: string,
        values: ValueMap,
        targetcomponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetcomponentName, values) &&
            Number(values[targetcomponentName]) >= Number(values[componentName])
        ) {
            return {
                name: 'gteTarget',
                context: ValidatorContext.Danger,
                message: `Value must be >= ${values[targetcomponentName]}`,
            };
        }
    },
    ltTarget: (
        componentName: string,
        values: ValueMap,
        targetcomponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetcomponentName, values) &&
            Number(values[targetcomponentName]) < Number(values[componentName])
        ) {
            return {
                name: 'ltTarget',
                context: ValidatorContext.Danger,
                message: `Value must be < ${values[targetcomponentName]}`,
            };
        }
    },
    lteTarget: (
        componentName: string,
        values: ValueMap,
        targetcomponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetcomponentName, values) &&
            Number(values[targetcomponentName]) <= Number(values[componentName])
        ) {
            return {
                name: 'lteTarget',
                context: ValidatorContext.Danger,
                message: `Value must be <= ${values[targetcomponentName]}`,
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
