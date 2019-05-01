import { isDefined, isCallable } from './utils';

describe('module: utils', () => {
    describe('func: isDefined', () => {
        it('should return false if value is undefined or empty string', () => {
            // If it does not exist at all
            expect(isDefined('name', {})).toBe(false);

            // If key does exist in object, but value is undefined
            expect(isDefined('name', { name: undefined })).toBe(false);

            // If key does exist in object, but value is undefined
            expect(isDefined('name', { name: null })).toBe(false);

            // If key does exist in object, but value is empty string
            expect(isDefined('name', { name: '' })).toBe(false);
        });

        it('should return true if value is not undefined or empty string', () => {
            // Should return true for number
            expect(isDefined('age', { age: 32 })).toBe(true);

            // Should return true for falsy 0
            expect(isDefined('age', { age: 0 })).toBe(true);
        });
    });

    describe('func: isCallable', () => {
        it('should return true if arg is callable', () => {
            expect(isCallable(() => {})).toBe(true);
        });

        it('should return false if arg is not callable', () => {
            expect(isCallable('')).toBe(false);

            expect(isCallable(null)).toBe(false);

            expect(isCallable(undefined)).toBe(false);

            expect(isCallable({})).toBe(false);
        });
    });
});
