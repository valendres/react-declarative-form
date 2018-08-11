import {
    ValidatorRule,
    ValidatorMessages,
    ValidatorResponse,
    ValidatorContext,
    ValidatorRuleMap,
    ValidatorMessageGenerator,
    ValueMap,
} from './types';
import { baseValidatorRules } from './rules';

/**
 * Validator rules to be used by validator
 */
let validatorRules = baseValidatorRules;

/**
 * Returns current validator rules in use
 */
export const getValidatorRules = (): ValidatorRuleMap => {
    return validatorRules;
};

/**
 * Adds a custom validator rule to the validator. If the rule is
 * already defined, the new rule will override the original.
 *
 * @param rule new rule to be added
 */
export const addValidatorRule = (key: string, rule: ValidatorRule): void => {
    validatorRules = {
        ...validatorRules,
        [key]: rule,
    };
};

/**
 * Validate a field using the provided rules
 *
 * @param valueKey key of value to be validated
 * @param values values of all fields
 * @param targetRules validator rules to use
 * @param customMessages custom validator messages
 */
export const validate = (
    valueKey: string,
    values: ValueMap = {},
    targetRules: {
        readonly [name: string]: any;
    } = {},
    customMessages: ValidatorMessages = {},
): ValidatorResponse => {
    const { required, custom, ...restRules } = targetRules;

    // Execute required rule first (if it exists)
    if (required) {
        const response = validatorRules.required(valueKey, values);
        if (response) return response;
    }

    // Execute custom validator rule second (if it exists)
    if (custom) {
        const response = custom(valueKey, values);
        // Only return if there is a response to return
        if (response) return response;
    }

    // Excute rest rules
    let cachedResponse: ValidatorResponse;
    Object.keys(restRules).some((ruleKey: string) => {
        const criteria = targetRules[ruleKey];
        if (ruleKey in validatorRules) {
            const response = validatorRules[ruleKey](
                valueKey,
                values,
                criteria,
            );

            // Break early if danger response is encountered
            if (response && response.context === ValidatorContext.Danger) {
                cachedResponse = response;
                return true;
            }

            // Cache first warning response, don't break because there might be an error later on
            if (
                response &&
                response.context === ValidatorContext.Warning &&
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
                    ? ((customMessages[ruleKey] as ValidatorMessageGenerator)(
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

    // If we don't have a cached response, assume validator is successful
    return {
        context: ValidatorContext.Success,
    };
};
