import { ValueMap, OptionalPromise } from '../types';

export const isDefined = (key: string, values: ValueMap) => {
    return (
        key in values &&
        values[key] !== undefined &&
        values[key] !== null &&
        values[key] !== ''
    );
};

export const isPromise = (possiblePromise?: OptionalPromise<any>): boolean =>
    possiblePromise instanceof Promise;

export const ensurePromise = <T extends any>(
    optionalPromise?: OptionalPromise<T>,
): Promise<T> =>
    isPromise(optionalPromise) ? (optionalPromise as any) : Promise.resolve();
