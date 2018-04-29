import { baseValidationRules } from './/rules';
import { ValidationContext } from './/types';

describe('Misc. validation rules', () => {
    describe('rule: required', () => {
        const { required } = baseValidationRules;

        it('should return danger context if value is undefined or empty string', () => {
            expect(required('name', {})).toEqual({
                key: 'required',
                context: ValidationContext.Danger,
                message: 'This field is required',
            });
            expect(required('name', { name: '' })).toEqual({
                key: 'required',
                context: ValidationContext.Danger,
                message: 'This field is required',
            });
        });

        it('should return undefined if value is greater than minValue', () => {
            expect(required('name', { name: 'Peter' })).toBeUndefined();
        });
    });
});

describe('Numeric validation rules', () => {
    describe('rule: minValue', () => {
        const { minValue } = baseValidationRules;

        it('should return danger context if value is less than minValue', () => {
            expect(minValue('age', { age: 16 }, 18)).toEqual({
                key: 'minValue',
                context: ValidationContext.Danger,
                message: '16 must be >= 18',
            });
        });

        it('should return undefined if value is greater than minValue', () => {
            expect(minValue('age', { age: 21 }, 18)).toBeUndefined();
        });
    });

    describe('rule: maxValue', () => {
        const { maxValue } = baseValidationRules;

        it('should return danger context if value is greater than maxValue', () => {
            expect(maxValue('age', { age: 21 }, 18)).toEqual({
                key: 'maxValue',
                context: ValidationContext.Danger,
                message: '21 must be <= 18',
            });
        });

        it('should return undefined if value is greater than maxValue', () => {
            expect(maxValue('age', { age: 15 }, 18)).toBeUndefined();
        });
    });

    describe('rule: isDivisibleBy', () => {
        const { isDivisibleBy } = baseValidationRules;

        it('should return danger context if value is not divisible by criteria', () => {
            expect(isDivisibleBy('age', { age: '10' }, 3)).toEqual({
                key: 'isDivisibleBy',
                context: ValidationContext.Danger,
                message: '10 must be divisible by 3',
            });
        });

        it('should return undefined if value is disivisble by criteria', () => {
            expect(isDivisibleBy('age', { age: '10' }, 5)).toBeUndefined();
        });
    });

    describe('rule: isInteger', () => {
        const { isInteger } = baseValidationRules;

        it('should return danger context if value is not an integer', () => {
            expect(isInteger('age', { age: 'test' })).toEqual({
                key: 'isInteger',
                context: ValidationContext.Danger,
                message: 'Must be an integer',
            });
        });

        it('should return undefined if value is an integer', () => {
            expect(isInteger('age', { age: '10' })).toBeUndefined();
        });
    });

    describe('rule: isDecimal', () => {
        const { isDecimal } = baseValidationRules;

        it('should return danger context if value is not a decimal', () => {
            expect(isDecimal('age', { age: 'test' })).toEqual({
                key: 'isDecimal',
                context: ValidationContext.Danger,
                message: 'Must be a decimal',
            });
        });

        it('should return undefined if value is a decimal', () => {
            expect(isDecimal('age', { age: '10.52' })).toBeUndefined();
        });
    });

    describe('rule: isNumeric', () => {
        const { isNumeric } = baseValidationRules;

        it('should return danger context if value is not a number', () => {
            expect(isNumeric('age', { age: '10.52' })).toEqual({
                key: 'isNumeric',
                context: ValidationContext.Danger,
                message: 'Must be a number',
            });
        });

        it('should return undefined if value is a decimal', () => {
            expect(isNumeric('age', { age: '0' })).toBeUndefined();
        });
    });
});

describe('String validation rules', () => {
    describe('rule: minLength', () => {
        const { minLength } = baseValidationRules;

        it('should return danger context if value length is less than minLength', () => {
            expect(minLength('someString', { someString: 'test' }, 5)).toEqual({
                key: 'minLength',
                context: ValidationContext.Danger,
                message: 'Length must be >= 5',
            });
        });

        it('should return undefined if value length is greater than minLength', () => {
            expect(
                minLength('someString', { someString: 'test' }, 4),
            ).toBeUndefined();
        });
    });

    describe('rule: maxLength', () => {
        const { maxLength } = baseValidationRules;

        it('should return danger context if value length is greater than maxLength', () => {
            expect(maxLength('someString', { someString: 'test' }, 3)).toEqual({
                key: 'maxLength',
                context: ValidationContext.Danger,
                message: 'Length must be <= 3',
            });
        });

        it('should return undefined if value is less than maxLength', () => {
            expect(
                maxLength('someString', { someString: 'test' }, 5),
            ).toBeUndefined();
        });
    });
});

describe('Regex validation rules', () => {
    describe('rule: matches', () => {
        const { matches } = baseValidationRules;

        it('should return danger context if value does not match pattern', () => {
            expect(matches('greeting', { greeting: 'hi' }, /hell.*/i)).toEqual({
                key: 'matches',
                context: ValidationContext.Danger,
                message: 'Invalid input',
            });
        });

        it('should return undefined if value matches pattern', () => {
            expect(
                matches('greeting', { greeting: 'Hello!' }, /hell.*/i),
            ).toBeUndefined();
        });
    });

    describe('rule: isEmail', () => {
        const { isEmail } = baseValidationRules;

        it('should return danger context if value is not an email', () => {
            const invalidEmails = [
                'notanemail',
                'almostan@email.',
                'broken@email.com.',
            ];

            invalidEmails.forEach((email: string) => {
                expect(isEmail('email', { email })).toEqual({
                    key: 'isEmail',
                    context: ValidationContext.Danger,
                    message: 'Invalid email',
                });
            });
        });

        it('should return undefined if value is an email', () => {
            const validEmails = [
                'user@domain.com',
                'test@email.io',
                'another@email.com.au',
            ];

            validEmails.forEach((email: string) => {
                expect(isEmail('email', { email })).toBeUndefined();
            });
        });
    });
});

describe('Cross field validation rules', () => {
    describe('rule: eqTarget', () => {
        const { eqTarget } = baseValidationRules;

        it('should return danger context if value does not match other field value', () => {
            expect(
                eqTarget(
                    'password',
                    {
                        password: 'some password',
                        passwordConfirm: 'that does not match',
                    },
                    'passwordConfirm',
                ),
            ).toEqual({
                key: 'eqTarget',
                context: ValidationContext.Danger,
                message: 'Values do not match',
            });
        });

        it('should return undefined if value matches target value', () => {
            expect(
                eqTarget(
                    'password',
                    { password: 'matching!', passwordConfirm: 'matching!' },
                    'passwordConfirm',
                ),
            ).toBeUndefined();
        });
    });
});
