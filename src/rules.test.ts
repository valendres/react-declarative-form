import { defaultValidationRules } from './/rules';
import { ValidationContext } from './/types';

describe('rule: required', () => {
    const rule = defaultValidationRules.required;

    it('should return danger context if value is undefined or empty string', () => {
        expect(rule('name', {})).toEqual({
            key: 'required',
            context: ValidationContext.Danger,
            message: 'This field is required',
        });
        expect(rule('name', { name: '' })).toEqual({
            key: 'required',
            context: ValidationContext.Danger,
            message: 'This field is required',
        });
    });

    it('should return undefined if value is greater than minValue', () => {
        expect(rule('name', { name: 'Peter' })).toBeUndefined();
    });
});

describe('rule: minValue', () => {
    const rule = defaultValidationRules.minValue;

    it('should return danger context if value is less than minValue', () => {
        expect(rule('age', { age: 16 }, 18)).toEqual({
            key: 'minValue',
            context: ValidationContext.Danger,
            message: '16 must be >= 18',
        });
    });

    it('should return undefined if value is greater than minValue', () => {
        expect(rule('age', { age: 21 }, 18)).toBeUndefined();
    });
});

describe('rule: maxValue', () => {
    const rule = defaultValidationRules.maxValue;

    it('should return danger context if value is greater than maxValue', () => {
        expect(rule('age', { age: 21 }, 18)).toEqual({
            key: 'maxValue',
            context: ValidationContext.Danger,
            message: '21 must be <= 18',
        });
    });

    it('should return undefined if value is greater than maxValue', () => {
        expect(rule('age', { age: 15 }, 18)).toBeUndefined();
    });
});

describe('rule: pattern', () => {
    const rule = defaultValidationRules.pattern;

    it('should return danger context if value does not match pattern', () => {
        expect(rule('greeting', { greeting: 'hi' }, /hell.*/i)).toEqual({
            key: 'pattern',
            context: ValidationContext.Danger,
            message: 'Invalid input',
        });
    });

    it('should return undefined if value matches pattern', () => {
        expect(
            rule('greeting', { greeting: 'Hello!' }, /hell.*/i),
        ).toBeUndefined();
    });
});

describe('rule: sameAs', () => {
    const rule = defaultValidationRules.sameAs;

    it('should return danger context if value does not match other field value', () => {
        expect(
            rule(
                'password',
                {
                    password: 'some password',
                    passwordConfirm: 'that does not match',
                },
                'passwordConfirm',
            ),
        ).toEqual({
            key: 'sameAs',
            context: ValidationContext.Danger,
            message: 'Values do not match',
        });
    });

    it('should return undefined if value matches target value', () => {
        expect(
            rule(
                'password',
                { password: 'matching!', passwordConfirm: 'matching!' },
                'passwordConfirm',
            ),
        ).toBeUndefined();
    });
});
