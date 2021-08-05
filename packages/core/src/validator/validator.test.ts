import { validatorRules } from '../rules';
import { ValidatorContext, ValueMap } from '../types';
import { addValidatorRule, getValidatorRules, validate } from './validator';

describe('validator rules', () => {
    it('should use default validator rules', () => {
        // Should use default validator rules by default
        expect(getValidatorRules()).toEqual(validatorRules);
    });

    it('should should allow additional validator rules to be defined', () => {
        const customRuleKey = 'customValidatorRule';
        const customRule = (
            componentName: string,
            values: ValueMap,
            criteria: any,
        ) => {
            return {
                context: ValidatorContext.Danger,
                message: 'An error occurred :(',
            };
        };

        // Should allow a custom rule to be defined
        addValidatorRule(customRuleKey, customRule);
        expect(getValidatorRules()[customRuleKey]).toEqual(customRule);
        expect(Object.keys(getValidatorRules()).length).toEqual(
            Object.keys(validatorRules).length + 1,
        );
    });
});

describe('func: validate', () => {
    const validatorKey = 'customValidator';
    const validatorContext = ValidatorContext.Warning;
    const validatorMessage = 'a message...';

    beforeAll(() => {
        addValidatorRule(
            validatorKey,
            (componentName: string, values: ValueMap, criteria: any) => ({
                context: validatorContext,
                message: validatorMessage,
            }),
        );
    });

    it('should console.warn and return success if unknown rule key is specified', () => {
        jest.spyOn(console, 'warn');
        const response = validate('name', { name: '' }, { unknownRuleKey: 52 });

        expect(response.context).toEqual(ValidatorContext.Success);
        expect(console.warn).toHaveBeenCalledWith(
            'Rule "unknownRuleKey" does not exist.',
        );
        (console.warn as any).mockRestore();
    });

    it('should return success if there are no validator rules', () => {
        const response = validate('age', { age: 21 });
        expect(response.context).toEqual(ValidatorContext.Success);
    });

    it('should match customValidator', () => {
        const response = validate('age', { age: 21 }, { [validatorKey]: true });
        expect(response.context).toEqual(validatorContext);
        expect(response.message).toEqual(validatorMessage);
    });

    it('should execute required rule first if it is defined', () => {
        const response = validate(
            'name',
            { name: '' },
            { minLength: 5, required: true },
        );
        expect(response.name).toEqual('required');
    });

    it('should execute custom rule if it is defined', () => {
        const message = 'CUSTOM VALIDATION MESSAGE';
        const response = validate(
            'name',
            { name: 'somevalue' },
            {
                custom: () => ({
                    message,
                    context: ValidatorContext.Danger,
                }),
            },
        );
        expect(response.message).toEqual(message);
    });

    it('should stop matching after first Danger response encountered', () => {
        const response = validate(
            'age',
            { age: 500 },
            { minValue: 1000, maxValue: 50 },
        );
        expect(response.name).toEqual('minValue');
        expect(response.context).toEqual(ValidatorContext.Danger);
    });

    it('should return custom error message string if provided', () => {
        const customMessageStr = 'This field is not long enough :(';

        const response = validate(
            'age',
            { age: 10 },
            { minValue: 50 },
            { minValue: customMessageStr },
        );
        expect(response.message).toEqual(customMessageStr);
    });

    it('should return custom error message generator if provided', () => {
        const inputValue = 10;
        const minValue = 50;
        const generator = (
            componentName: string,
            values: ValueMap,
            criteria: number,
        ) => {
            return `Gen: ${values[componentName]} is less than ${criteria}...`;
        };

        const response = validate(
            'age',
            { age: 10 },
            { minValue: 50 },
            {
                minValue: generator,
            },
        );
        expect(response.message).toEqual(
            `Gen: ${inputValue} is less than ${minValue}...`,
        );
    });

    it('should return custom error message for required if provided', () => {
        const customRequiredMessage = 'A first name is required';
        const response = validate(
            'firstName',
            { firstName: undefined },
            { required: true },
            {
                required: customRequiredMessage,
            },
        );
        expect(response.message).toEqual(customRequiredMessage);
    });

    it('should auto-add the rule name if it was not included in the response of a custom validator', () => {
        addValidatorRule('notZero', () => ({
            // Note: this is intentionally omitted
            // name: 'notZero',
            context: ValidatorContext.Danger,
            message: 'Must not be zero',
        }));

        const response = validate('age', { age: '0' }, { notZero: true });
        expect(response.name).toEqual('notZero');
    });
});
