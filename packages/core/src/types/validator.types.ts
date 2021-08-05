export enum ValidatorContext {
    Danger = 'danger',
    Warning = 'warning',
    Success = 'success',
}

export type ValidatorMessageGenerator = (
    key: string,
    values: ValueMap,
    criteria?: any,
) => string;

export interface ValidatorMessages {
    readonly [name: string]: ValidatorMessageGenerator | string;
}

export interface ValidatorData {
    readonly name?: string;
    readonly context: ValidatorContext;
    readonly message: string;
}

export interface ValidatorTest {
    value?: any;
    criteria?: any;
    message?: string;
    context?: string;
}

export interface ValueMap {
    [name: string]: any;
}
