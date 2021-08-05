import {
    ValidatorRule,
    ValidatorMessages,
    ValidatorData,
    ValidatorContext,
    ValidatorRuleMap,
    ValidatorMessageGenerator,
    ValueMap,
    ValidatorRules,
} from '../types';
import { validatorRules as importedValidatorRules } from '../rules';

/**
 * Validator rules to be used by validator
 */
let validatorRules = importedValidatorRules;

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
): ValidatorData => {
    const { required, custom, ...restRules } = targetRules;

    // Execute required rule first (if it exists)
    if (required) {
        const response = validatorRules.required(valueKey, values);
        if (response) {
            return {
                ...response,
                ...('required' in customMessages
                    ? {
                          message: formatCustomMessage(
                              customMessages['required'],
                              valueKey,
                              values,
                          ),
                      }
                    : {}),
            };
        }
    }

    // Execute custom validator rule second (if it exists)
    if (custom) {
        const response = custom(valueKey, values);
        // Only return if there is a response to return
        if (response) return response;
    }

    // Execute rest rules
    let cachedValidatorData: ValidatorData;
    Object.keys(restRules).some(
        (ruleKey: keyof Omit<ValidatorRules, 'custom'>) => {
            const criteria = targetRules[ruleKey];
            if (ruleKey in validatorRules) {
                const data: ValidatorData = {
                    name: ruleKey,
                    ...validatorRules[ruleKey](valueKey, values, criteria),
                };

                // Break early if danger context is encountered
                if (data && data.context === ValidatorContext.Danger) {
                    cachedValidatorData = data;
                    return true;
                }

                // Cache first warning context, don't break because there might be an error later on
                if (
                    data &&
                    data.context === ValidatorContext.Warning &&
                    !cachedValidatorData
                ) {
                    cachedValidatorData = data;
                }
            } else {
                console.warn(`Rule "${ruleKey}" does not exist.`);
            }

            // Keep iterating
            return false;
        },
    );

    // If we have a cached validatorData, return it
    if (cachedValidatorData) {
        // Use custom error message if available
        const ruleKey = cachedValidatorData.name;
        if (ruleKey in customMessages) {
            return {
                ...cachedValidatorData,
                message: formatCustomMessage(
                    customMessages[ruleKey],
                    valueKey,
                    values,
                    targetRules[ruleKey],
                ),
            };
        }

        return cachedValidatorData;
    }

    // If we don't have a cached response, assume validator is successful
    return {
        context: ValidatorContext.Success,
        message: undefined,
    };
};

const formatCustomMessage = (
    customMessage: ValidatorMessageGenerator | string,
    valueKey: string,
    values: ValueMap = {},
    criteria?: any,
) => {
    return customMessage instanceof Function
        ? ((customMessage as ValidatorMessageGenerator)(
              valueKey,
              values,
              criteria,
          ) as string)
        : (customMessage as string);
};
