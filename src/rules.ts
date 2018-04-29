import { ValidationRuleMap, ValidationContext } from './types';
import { isDefined } from './utils';

export const defaultValidationRules: ValidationRuleMap = {
    // Shared
    required: (key: string, values: any) => {
        if (!isDefined(key, values)) {
            return {
                key: 'required',
                context: ValidationContext.Danger,
                message: `This field is required`,
            };
        }
    },

    // Number
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

    // Regex
    pattern: (key: string, values: any, pattern: RegExp) => {
        if (isDefined(key, values) && !pattern.test(values[key])) {
            return {
                key: 'pattern',
                context: ValidationContext.Danger,
                message: 'Invalid input',
            };
        }
    },

    // Cross field validation
    sameAs: (key: string, values: any, targetKey: any) => {
        if (
            isDefined(key, values) &&
            isDefined(key, values) &&
            values[key] !== values[targetKey]
        ) {
            return {
                key: 'sameAs',
                context: ValidationContext.Danger,
                message: 'Values do not match',
            };
        }
    },
};
