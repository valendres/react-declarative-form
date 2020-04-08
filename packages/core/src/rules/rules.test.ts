import { ValidatorContext, ValidatorRule, ValidatorTest } from '../types';
import { validatorRules } from './rules';

const testRule = (rule: ValidatorRule, tests: ValidatorTest[]) => {
    const name = 'TEST';
    tests.forEach(({ value, criteria, message, context }) => {
        const output = rule(name, { [name]: value }, criteria);
        if (message || context) {
            if (message) {
                expect(output.message).toBe(message);
            }
            if (context) {
                expect(output.context).toBe(context);
            }
        } else {
            expect(output).toBeUndefined();
        }
    });
};

describe('Misc. validator rules', () => {
    describe('rule: required', () => {
        const { required } = validatorRules;

        it('should return danger context if value is undefined or empty string', () => {
            expect(required('name', {})).toEqual({
                name: 'required',
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
            expect(required('name', { name: '' })).toEqual({
                name: 'required',
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
        });

        it('should return undefined if value is greater than minValue', () => {
            expect(required('name', { name: 'Peter' })).toBeUndefined();
        });
    });

    describe('rule: equals', () => {
        const { equals } = validatorRules;

        it('should return danger context if value is not equal to specified string value', () => {
            expect(equals('name', { name: 'John' }, 'Peter')).toEqual({
                name: 'equals',
                context: ValidatorContext.Danger,
                message: 'Value must be equal to "Peter"',
            });
        });

        it('should return danger context if value is not equal to specified numeric value', () => {
            expect(equals('age', { age: 20 }, 18)).toEqual({
                name: 'equals',
                context: ValidatorContext.Danger,
                message: 'Value must be equal to 18',
            });
        });

        it('should return undefined if value is equal to specified string value', () => {
            expect(equals('name', { name: 'Peter' }, 'Peter')).toBeUndefined();
        });

        it('should return undefined if value is equal to specified numeric value', () => {
            expect(equals('age', { age: 18 }, 18)).toBeUndefined();
        });
    });

    describe('rule: notEquals', () => {
        const { notEquals } = validatorRules;

        it('should return danger context if value is equal to specified string value', () => {
            expect(notEquals('name', { name: 'Peter' }, 'Peter')).toEqual({
                name: 'notEquals',
                context: ValidatorContext.Danger,
                message: 'Value must not be equal to "Peter"',
            });
        });

        it('should return danger context if value is equal to specified numeric value', () => {
            expect(notEquals('age', { age: 18 }, 18)).toEqual({
                name: 'notEquals',
                context: ValidatorContext.Danger,
                message: 'Value must not be equal to 18',
            });
        });

        it('should return undefined if value is equal to specified string value', () => {
            expect(
                notEquals('name', { name: 'John' }, 'Peter'),
            ).toBeUndefined();
        });

        it('should return undefined if value is equal to specified numeric value', () => {
            expect(notEquals('age', { age: 20 }, 18)).toBeUndefined();
        });
    });

    describe('rule: minValue', () => {
        const { minValue } = validatorRules;

        it('should return danger context if value is less than minValue', () => {
            expect(minValue('age', { age: 16 }, 18)).toEqual({
                name: 'minValue',
                context: ValidatorContext.Danger,
                message: 'Minimum value of 18',
            });
        });

        it('should return undefined if value is equal to minValue', () => {
            expect(minValue('age', { age: 18 }, 18)).toBeUndefined();
        });

        it('should return undefined if value is greater than minValue', () => {
            expect(minValue('age', { age: 21 }, 18)).toBeUndefined();
        });
    });

    describe('rule: maxValue', () => {
        const { maxValue } = validatorRules;

        it('should return danger context if value is greater than maxValue', () => {
            expect(maxValue('age', { age: 21 }, 18)).toEqual({
                name: 'maxValue',
                context: ValidatorContext.Danger,
                message: 'Maximum value of 18',
            });
        });

        it('should return undefined if value is equal to the maxValue', () => {
            expect(maxValue('age', { age: 18 }, 18)).toBeUndefined();
        });

        it('should return undefined if value is greater than maxValue', () => {
            expect(maxValue('age', { age: 15 }, 18)).toBeUndefined();
        });
    });

    describe('rule: greaterThan', () => {
        const { greaterThan } = validatorRules;

        it('should return danger context if value is less than the specified value', () => {
            expect(greaterThan('amount', { amount: 9.999 }, 10)).toEqual({
                name: 'greaterThan',
                context: ValidatorContext.Danger,
                message: 'Value must be greater than 10',
            });
        });

        it('should return danger context if value is equal to the specified value', () => {
            expect(greaterThan('amount', { amount: 10 }, 10)).toEqual({
                name: 'greaterThan',
                context: ValidatorContext.Danger,
                message: 'Value must be greater than 10',
            });
        });

        it('should return undefined if value is greater than specified value', () => {
            expect(
                greaterThan('amount', { amount: 10.001 }, 10),
            ).toBeUndefined();
        });
    });

    describe('rule: lessThan', () => {
        const { lessThan } = validatorRules;

        it('should return danger context if value is greater than the specified value', () => {
            expect(lessThan('amount', { amount: 10.001 }, 10)).toEqual({
                name: 'lessThan',
                context: ValidatorContext.Danger,
                message: 'Value must be less than 10',
            });
        });

        it('should return danger context if value is equal to the specified value', () => {
            expect(lessThan('amount', { amount: 10 }, 10)).toEqual({
                name: 'lessThan',
                context: ValidatorContext.Danger,
                message: 'Value must be less than 10',
            });
        });

        it('should return undefined if value is less than specified value', () => {
            expect(lessThan('amount', { amount: 9.999 }, 10)).toBeUndefined();
        });
    });

    describe('rule: isDivisibleBy', () => {
        const { isDivisibleBy } = validatorRules;

        it('should return danger context if value is not divisible by criteria', () => {
            expect(isDivisibleBy('age', { age: '10' }, 3)).toEqual({
                name: 'isDivisibleBy',
                context: ValidatorContext.Danger,
                message: '10 must be divisible by 3',
            });
        });

        it('should return undefined if value is disivisble by criteria', () => {
            expect(isDivisibleBy('age', { age: '10' }, 5)).toBeUndefined();
        });
    });

    describe('rule: isInteger', () => {
        const { isInteger } = validatorRules;

        it('should return danger context if value is not an integer', () => {
            expect(isInteger('age', { age: 'test' })).toEqual({
                name: 'isInteger',
                context: ValidatorContext.Danger,
                message: 'Must be an integer',
            });
        });

        it('should return undefined if value is an integer', () => {
            expect(isInteger('age', { age: '10' })).toBeUndefined();
        });
    });

    describe('rule: isDecimal', () => {
        const { isDecimal } = validatorRules;

        it('should return danger context if value is not a decimal', () => {
            expect(isDecimal('age', { age: 'test' })).toEqual({
                name: 'isDecimal',
                context: ValidatorContext.Danger,
                message: 'Must be a decimal',
            });
        });

        it('should return undefined if value is a decimal', () => {
            expect(isDecimal('age', { age: '10.52' })).toBeUndefined();
        });
    });

    describe('rule: isNumeric', () => {
        const { isNumeric } = validatorRules;

        it('should return danger context if value is not a number', () => {
            expect(isNumeric('age', { age: '$10.52' })).toEqual({
                name: 'isNumeric',
                context: ValidatorContext.Danger,
                message: 'Must be a number',
            });
        });

        it('should return undefined if value is a decimal', () => {
            expect(isNumeric('age', { age: '0' })).toBeUndefined();
        });
    });

    describe('rule: minLength', () => {
        const { minLength } = validatorRules;

        it('should return danger context if string value length is < minLength', () => {
            const context = ValidatorContext.Danger;
            testRule(minLength, [
                {
                    context,
                    value: 'short',
                    criteria: 8,
                    message: 'Minimum 8 characters',
                },
            ]);
        });

        it('should return danger context if array value length is < minLength', () => {
            const context = ValidatorContext.Danger;
            testRule(minLength, [
                {
                    context,
                    value: [1, 2, 3, 4, 5],
                    criteria: 10,
                    message: 'Minimum 10 items',
                },
            ]);
        });

        it('should return undefined if value length is >= minLength', () => {
            const response: ValidatorTest = {
                message: undefined,
                context: undefined,
            };
            testRule(minLength, [
                // Shouldn't validate empty string
                { value: undefined, criteria: 10, ...response },
                { value: '', criteria: 10, ...response },

                // Length >= minLenghth
                {
                    value: 'withinlimit', // Length: 11
                    criteria: 11,
                    ...response,
                },
            ]);
        });
    });

    describe('rule: maxLength', () => {
        const { maxLength } = validatorRules;

        it('should return danger context if string value length is > maxLength', () => {
            const context = ValidatorContext.Danger;
            testRule(maxLength, [
                {
                    context,
                    value: 'toolong',
                    criteria: 3,
                    message: 'Maximum 3 characters',
                },
            ]);
        });

        it('should return danger context if array value length is > maxLength', () => {
            const context = ValidatorContext.Danger;
            testRule(maxLength, [
                {
                    context,
                    value: [1, 2, 3, 4, 5],
                    criteria: 3,
                    message: 'Maximum 3 items',
                },
            ]);
        });

        it('should return undefined if value is <= maxLength', () => {
            const response: ValidatorTest = {
                message: undefined,
                context: undefined,
            };
            testRule(maxLength, [
                // Shouldn't validate empty string
                { value: undefined, criteria: 10, ...response },
                { value: '', criteria: 10, ...response },

                // Length <= maxLength
                {
                    value: 'withinlimit', // Length: 11
                    criteria: 11,
                    ...response,
                },
            ]);
        });
    });

    describe('rule: isLength', () => {
        const { isLength } = validatorRules;

        it('should return danger context if value length is equal to length', () => {
            const context = ValidatorContext.Danger;
            testRule(isLength, [
                {
                    context,
                    value: 'toolong',
                    criteria: 3,
                    message: 'Length must be 3',
                },
            ]);
        });

        it('should return undefined if value is equal to length', () => {
            const response: ValidatorTest = {
                message: undefined,
                context: undefined,
            };
            testRule(isLength, [
                // Shouldn't validate empty string
                { value: undefined, criteria: 10, ...response },
                { value: '', criteria: 10, ...response },

                // Matching length
                {
                    value: 'withinlimit', // Length: 11
                    criteria: 11,
                    ...response,
                },
            ]);
        });
    });

    describe('rule: isLowercase', () => {
        const { isLowercase } = validatorRules;

        it('should return danger context if value is not all lowercase', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Must be all lowercase',
            };
            testRule(isLowercase, [
                { value: 'StringWithMixedCase', ...response },
            ]);
        });

        it('should return undefined if value does not contain uppercase characters', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isLowercase, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid urls
                { value: 'all lowercase', ...response },
                { value: 'lower case with numbers: 123', ...response },
            ]);
        });
    });

    describe('rule: isUppercase', () => {
        const { isUppercase } = validatorRules;

        it('should return danger context if value is not all uppercase', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Must be all uppercase',
            };
            testRule(isUppercase, [
                { value: 'StringWithMixedCase', ...response },
            ]);
        });

        it('should return undefined if value does not contain lowercase characters', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isUppercase, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid urls
                { value: 'ALL UPPERCASE', ...response },
                { value: 'LOWER CASE WITH NUMBERS: 123', ...response },
            ]);
        });
    });

    describe('rule: matches', () => {
        const { matches } = validatorRules;

        it('should return danger context if value does not match pattern', () => {
            expect(matches('greeting', { greeting: 'hi' }, /hell.*/i)).toEqual({
                name: 'matches',
                context: ValidatorContext.Danger,
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
        const { isEmail } = validatorRules;

        it('should return danger context if value is not an email', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid email',
            };
            testRule(isEmail, [
                { value: 'notanemail', ...response },
                { value: 'almostan@email.', ...response },
                { value: 'broken@email.com.', ...response },
            ]);
        });

        it('should return undefined if value is an email', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isEmail, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid emails
                { value: 'user@domain.com', ...response },
                { value: 'test@email.io', ...response },
                { value: 'another@email.com.au', ...response },
            ]);
        });
    });

    describe('rule: isUrl', () => {
        const { isUrl } = validatorRules;

        it('should return danger context if value is not a url', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid url',
            };
            testRule(isUrl, [
                { value: 'notaurl', ...response },
                { value: 'http://test', ...response },
                { value: 'http://test.', ...response },
            ]);
        });

        it('should return undefined if value is a url', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isUrl, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid urls
                { value: 'www.google.com', ...response },
                { value: 'www.google.com.au', ...response },
                { value: 'http://www.google.com', ...response },
                { value: 'http://www.google.com/', ...response },
                { value: 'http://www.google.com/test?name=value', ...response },
            ]);
        });
    });

    describe('rule: isCreditCard', () => {
        const { isCreditCard } = validatorRules;

        it('should return danger context if value is not a credit card number', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid credit card number',
            };
            testRule(isCreditCard, [
                { value: 'notacreditcardnumber', ...response },
                { value: '123123123123', ...response },
                { value: '3902810912381233', ...response },
            ]);
        });

        it('should return undefined if value is an email', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isCreditCard, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Visa
                { value: '4444333322221111', ...response },
                { value: '4111111111111111', ...response },
                { value: '4012888888881881', ...response },
                { value: '4222222222222', ...response },

                // MasterCard
                { value: '5555555555554444', ...response },
                { value: '5105105105105100', ...response },
                { value: '2223000048400011', ...response },
                { value: '2223520043560014', ...response },

                // Amex
                { value: '378282246310005', ...response },
                { value: '371449635398431', ...response },

                // Diners
                { value: '30569309025904', ...response },
                { value: '38520000023237', ...response },
            ]);
        });
    });

    describe('rule: isHexColor', () => {
        const { isHexColor } = validatorRules;

        it('should return danger context if value is not a hex color', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid hex color',
            };
            testRule(isHexColor, [
                { value: 'ffg', ...response },
                { value: 'ffgffg', ...response },
                { value: '#ffg', ...response },
                { value: '#ffgffg', ...response },
            ]);
        });

        it('should return undefined if value is a hex color', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isHexColor, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid colors
                { value: 'fff', ...response },
                { value: 'ffffff', ...response },
                { value: '#fff', ...response },
                { value: '#ffffff', ...response },
            ]);
        });
    });

    describe('rule: isIp', () => {
        const { isIp } = validatorRules;

        it('should return danger context if value is not an IP address', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid IP address',
            };
            testRule(isIp, [
                { value: 'notanip', ...response },
                { value: '0.0.0.256', ...response },
                { value: '0.0.256.0', ...response },
                { value: '0.256.0.0', ...response },
                { value: '1200::AB00:1234::2552:7777:1313', ...response },
                {
                    value: '1200:0000:AB00:1234:O000:2552:7777:1313',
                    ...response,
                },
            ]);
        });

        it('should return undefined if value is an IP address', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isIp, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid IPv4 addresses
                { value: '0.0.0.0', ...response },
                { value: '1.1.1.1', ...response },
                { value: '192.168.0.1', ...response },
                { value: '255.255.255.255', ...response },

                // Valid IPv6 addresses
                {
                    value: '1200:0000:AB00:1234:0000:2552:7777:1313',
                    ...response,
                },
                { value: '21DA:D3:0:2F3B:2AA:FF:FE28:9C5A', ...response },
            ]);
        });
    });

    describe('rule: isPort', () => {
        const { isPort } = validatorRules;

        it('should return danger context if value is not a port', () => {
            const response: ValidatorTest = {
                context: ValidatorContext.Danger,
                message: 'Invalid port',
            };
            testRule(isPort, [
                { value: 'notaport', ...response },
                { value: '192.168.0.1', ...response },
                { value: '65536', ...response }, // Valid port range: 0-65535
                { value: ':80', ...response }, // Colon prefix
            ]);
        });

        it('should return undefined if value is a port', () => {
            const response: ValidatorTest = {
                context: undefined,
                message: undefined,
            };
            testRule(isPort, [
                // Shouldn't validate empty string
                { value: undefined, ...response },
                { value: '', ...response },

                // Valid port
                { value: '0', ...response }, // Min port
                { value: '80', ...response },
                { value: '65535', ...response }, // Max port
            ]);
        });
    });

    describe('rule: eqTarget', () => {
        const { eqTarget } = validatorRules;

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
                name: 'eqTarget',
                context: ValidatorContext.Danger,
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

    // TODO
    describe('rule: gtTarget', () => {});

    // TODO
    describe('rule: gteTarget', () => {});

    // TODO
    describe('rule: ltTarget', () => {});

    // TODO
    describe('rule: lteTarget', () => {});
});
