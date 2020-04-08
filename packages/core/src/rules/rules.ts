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

import {
    ValidatorContext,
    ValueMap,
    ValidatorRules,
    ValidatorRule,
} from '../types';
import { isDefined } from '../utils';

/*
 * Use `ValidatorRules` interface to ensure that there is is a corresponding rule
 * implementation for every rule specified in the interface.
 *
 * Note: `custom` is omitted because it is expected that consumers implement it.
 */
export const validatorRules: {
    [rule in keyof Required<Omit<ValidatorRules, 'custom'>>]: ValidatorRule;
} = {
    required: (componentName: string, values: ValueMap) => {
        if (!isDefined(componentName, values)) {
            return {
                name: 'required',
                context: ValidatorContext.Danger,
                message: 'This field is required',
            };
        }
    },
    equals: (
        componentName: string,
        values: ValueMap,
        target: number | string,
    ) => {
        if (
            isDefined(componentName, values) &&
            values[componentName] !== target
        ) {
            return {
                name: 'equals',
                context: ValidatorContext.Danger,
                message:
                    typeof target === 'string'
                        ? `Value must be equal to "${target}"`
                        : `Value must be equal to ${target}`,
            };
        }
    },
    notEquals: (
        componentName: string,
        values: ValueMap,
        target: number | string,
    ) => {
        if (
            isDefined(componentName, values) &&
            values[componentName] === target
        ) {
            return {
                name: 'notEquals',
                context: ValidatorContext.Danger,
                message:
                    typeof target === 'string'
                        ? `Value must not be equal to "${target}"`
                        : `Value must not be equal to ${target}`,
            };
        }
    },
    greaterThan: (componentName: string, values: ValueMap, num: number) => {
        if (isDefined(componentName, values) && values[componentName] <= num) {
            return {
                name: 'greaterThan',
                context: ValidatorContext.Danger,
                message: `Value must be greater than ${num}`,
            };
        }
    },
    lessThan: (componentName: string, values: ValueMap, num: number) => {
        if (isDefined(componentName, values) && values[componentName] >= num) {
            return {
                name: 'lessThan',
                context: ValidatorContext.Danger,
                message: `Value must be less than ${num}`,
            };
        }
    },
    minValue: (componentName: string, values: ValueMap, minValue: number) => {
        if (
            isDefined(componentName, values) &&
            values[componentName] < minValue
        ) {
            return {
                name: 'minValue',
                context: ValidatorContext.Danger,
                message: `Minimum value of ${minValue}`,
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
                message: `Maximum value of ${maxValue}`,
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
    minLength: (componentName: string, values: ValueMap, minLength: number) => {
        const value = values[componentName];
        if (isDefined(componentName, values) && value.length < minLength) {
            return {
                name: 'minLength',
                context: ValidatorContext.Danger,
                message: Array.isArray(value)
                    ? `Minimum ${minLength} items`
                    : `Minimum ${minLength} characters`,
            };
        }
    },
    maxLength: (componentName: string, values: ValueMap, maxLength: number) => {
        const value = values[componentName];
        if (isDefined(componentName, values) && value.length > maxLength) {
            return {
                name: 'maxLength',
                context: ValidatorContext.Danger,
                message: Array.isArray(value)
                    ? `Maximum ${maxLength} items`
                    : `Maximum ${maxLength} characters`,
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
    eqTarget: (
        componentName: string,
        values: ValueMap,
        targetComponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetComponentName, values) &&
            values[componentName] !== values[targetComponentName]
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
        targetComponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetComponentName, values) &&
            Number(values[targetComponentName]) > Number(values[componentName])
        ) {
            return {
                name: 'gtTarget',
                context: ValidatorContext.Danger,
                message: `Value must be greater than ${values[targetComponentName]}`,
            };
        }
    },
    gteTarget: (
        componentName: string,
        values: ValueMap,
        targetComponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetComponentName, values) &&
            Number(values[targetComponentName]) >= Number(values[componentName])
        ) {
            return {
                name: 'gteTarget',
                context: ValidatorContext.Danger,
                message: `Minimum value of ${values[targetComponentName]}`,
            };
        }
    },
    ltTarget: (
        componentName: string,
        values: ValueMap,
        targetComponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetComponentName, values) &&
            Number(values[targetComponentName]) < Number(values[componentName])
        ) {
            return {
                name: 'ltTarget',
                context: ValidatorContext.Danger,
                message: `Value must be less than ${values[targetComponentName]}`,
            };
        }
    },
    lteTarget: (
        componentName: string,
        values: ValueMap,
        targetComponentName: string,
    ) => {
        if (
            isDefined(componentName, values) &&
            isDefined(targetComponentName, values) &&
            Number(values[targetComponentName]) <= Number(values[componentName])
        ) {
            return {
                name: 'lteTarget',
                context: ValidatorContext.Danger,
                message: `Maximum value of ${values[targetComponentName]}`,
            };
        }
    },
};
