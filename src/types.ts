export enum ValidationContext {
    Danger = 'danger',
    Warning = 'warning',
    Success = 'success',
}

export type ValidationRule = (
    key: string,
    values: any,
    criteria?: any,
) => ValidationResponse;

export interface ValidationRuleMap {
    readonly [name: string]: ValidationRule;
}

export interface ValidationRules {
    readonly [name: string]: any;
}

export type ValidationMessageGenerator = ((
    key: string,
    values: any,
    criteria?: any,
) => string);

export interface ValidationMessages {
    readonly [name: string]: ValidationMessageGenerator | string;
}

export interface ValidationResponse {
    readonly key?: string;
    readonly context: ValidationContext;
    readonly message?: string;
}
