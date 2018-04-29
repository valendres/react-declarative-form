import { addValidationRule, getValidationRules, validate } from './/validator';
import { baseValidationRules } from './/rules';
import { ValidationContext } from './/types';

describe('validation rules', () => {
    it('should use default validation rules', () => {
        // Should use default validation rules by default
        expect(getValidationRules()).toEqual(baseValidationRules);
    });

    it('should should allow additional validation rules to be defined', () => {
        const customRuleKey = 'customValidationRule';
        const customRule = (key: string, values: any, criteria: any) => {
            return {
                context: ValidationContext.Danger,
            };
        };

        // Should allow a custom rule to be defined
        addValidationRule(customRuleKey, customRule);
        expect(getValidationRules()[customRuleKey]).toEqual(customRule);
        expect(Object.keys(getValidationRules()).length).toEqual(
            Object.keys(baseValidationRules).length + 1,
        );
    });
});

describe('func: validate', () => {
    const validationKey = 'customValidator';
    const validationContext = ValidationContext.Warning;
    const validationMessage = 'a message...';

    beforeAll(() => {
        addValidationRule(
            validationKey,
            (key: string, values: any, criteria: any) => ({
                context: validationContext,
                message: validationMessage,
            }),
        );
    });

    it('should console.warn and return success if unknown rule key is specified', () => {
        jest.spyOn(console, 'warn');
        const response = validate('name', { name: '' }, { unknownRuleKey: 52 });

        expect(response.context).toEqual(ValidationContext.Success);
        expect(console.warn).toHaveBeenCalledWith(
            'Rule "unknownRuleKey" does not exist.',
        );
        (console.warn as any).mockRestore();
    });

    it('should return success if there are no validation rules', () => {
        const response = validate('age', { age: 21 });
        expect(response.context).toEqual(ValidationContext.Success);
    });

    it('should match customValidator', () => {
        const response = validate(
            'age',
            { age: 21 },
            { [validationKey]: true },
        );
        expect(response.context).toEqual(validationContext);
        expect(response.message).toEqual(validationMessage);
    });

    it('should execute required rule first if it is defined', () => {
        const response = validate(
            'name',
            { name: '' },
            { minLength: 5, required: true },
        );
        expect(response.key).toEqual('required');
    });

    it('should stop matching after first Danger response encountered', () => {
        const response = validate(
            'age',
            { age: 500 },
            { minValue: 1000, maxValue: 50 },
        );
        expect(response.key).toEqual('minValue');
        expect(response.context).toEqual(ValidationContext.Danger);
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
        const generator = (key: string, values: any, criteria: number) => {
            return `Gen: ${values[key]} is less than ${criteria}...`;
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
});
