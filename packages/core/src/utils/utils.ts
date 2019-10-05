import { ValueMap, Environment } from '../types';

export const isDefined = (key: string, values: ValueMap) => {
    return (
        key in values &&
        values[key] !== undefined &&
        values[key] !== null &&
        values[key] !== ''
    );
};

export const isCallable = (arg: unknown): boolean => {
    return typeof arg === 'function';
};

export const getEnvironment = (): Environment => {
    if (typeof document !== 'undefined') {
        return Environment.ReactDom;
    }
    if (
        typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative'
    ) {
        return Environment.ReactNative;
    }
    return Environment.Node;
};
