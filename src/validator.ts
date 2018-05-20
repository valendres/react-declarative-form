import {
    ValidationRule,
    ValidationMessages,
    ValidationResponse,
    ValidationContext,
    ValidationRuleMap,
    ValidationMessageGenerator,
    ValueMap,
} from './types';
import { baseValidationRules } from './rules';

/**
 * Validation rules to be used by validator
 */
let validationRules = baseValidationRules;

/**
 * Returns current validation rules in use
 */
export const getValidationRules = (): ValidationRuleMap => {
    return validationRules;
};

/**
 * Adds a custom validation rule to the validator. If the rule is
 * already defined, the new rule will override the original.
 *
 * @param rule new rule to be added
 */
export const addValidationRule = (key: string, rule: ValidationRule): void => {
    validationRules = {
        ...validationRules,
        [key]: rule,
    };
};

/**
 * Validate a field using the provided rules
 *
 * @param valueKey key of value to be validated
 * @param values values of all fields
 * @param targetRules validation rules to use
 * @param customMessages custom validation messages
 */
export const validate = (
    valueKey: string,
    values: ValueMap = {},
    targetRules: {
        readonly [name: string]: any;
    } = {},
    customMessages: ValidationMessages = {},
): ValidationResponse => {
    const { required, custom, ...restRules } = targetRules;

    // Execute required rule first (if it exists)
    if (required) {
        const response = validationRules.required(valueKey, values);
        if (response) return response;
    }

    // Execute custom validation rule second (if it exists)
    if (custom) {
        const response = custom(valueKey, values);
        // Only return if there is a response to return
        if (response) return response;
    }

    // Excute rest rules
    let cachedResponse: ValidationResponse;
    Object.keys(restRules).some((ruleKey: string) => {
        const criteria = targetRules[ruleKey];
        if (ruleKey in validationRules) {
            const response = validationRules[ruleKey](
                valueKey,
                values,
                criteria,
            );

            // Break early if danger response is encountered
            if (response && response.context === ValidationContext.Danger) {
                cachedResponse = response;
                return true;
            }

            // Cache first warning response, don't break because there might be an error later on
            if (
                response &&
                response.context === ValidationContext.Warning &&
                !cachedResponse
            ) {
                cachedResponse = response;
            }
        } else {
            console.warn(`Rule "${ruleKey}" does not exist.`);
        }

        // Keep iterating
        return false;
    });

    // If we have a cached response, return it
    if (cachedResponse) {
        // Use custom error message if available
        const ruleKey = cachedResponse.key;
        if (ruleKey in customMessages) {
            const customMessage =
                customMessages[ruleKey] instanceof Function
                    ? ((customMessages[ruleKey] as ValidationMessageGenerator)(
                          valueKey,
                          values,
                          targetRules[ruleKey],
                      ) as string)
                    : (customMessages[ruleKey] as string);

            return {
                ...cachedResponse,
                message: customMessage,
            };
        }

        return cachedResponse;
    }

    // If we don't have a cached response, assume validation is successful
    return {
        context: ValidationContext.Success,
    };
};
