import * as React from 'react';
import {
    NestedFormProps,
    NestedForm,
    addValidatorRule,
    isDefined,
    ValidatorContext,
} from '@react-declarative-form/core';
import { pick } from 'lodash';

import { TextField } from '../TextField';
import { Select } from '../Select';
import { CURRENCY_CODE_OPTIONS } from './CurrencyField.options';
import { Grid } from '@material-ui/core';

// TODO: why is module augmentation actually replacing the module?
// declare module '@react-declarative-form/core' {
//     export interface ValidatorRules {
//         minValue?: number;
//         gtCurrencyField?: string;
//     }
// }

addValidatorRule(
    'gtCurrencyField',
    (currentComponentName, formValues, targetComponentName) => {
        const currentCurrency: Currency = formValues[currentComponentName];
        const targetCurrency: Currency = formValues[targetComponentName];

        if (
            isDefined(currentComponentName, formValues) &&
            isDefined(targetComponentName, formValues) &&
            Number(currentCurrency.amount) < Number(targetCurrency.amount)
        ) {
            return {
                context: ValidatorContext.Danger,
                // TODO: we'd probably want to apply some currency formatting here...
                message: `Value must be greater than ${targetCurrency.amount}`,
            };
        }

        return undefined;
    },
);

export interface Currency {
    amount: string | number;
    code: string;
}

/**
 * Cross-field validation rules must be done at the root level, i.e. directly
 * on the nestedForm itself. This is so that it can access other currency
 * fields within the form.
 *
 * Failed validation rules at this level will take precedence over the
 * validation rules that are passed through to the `amount` field.
 */
export type CurrencyFieldNestedFormValidatorRuleKeys = 'gtCurrencyField';

/**
 * These are rule keys which can be directly passed to the `amount` field as
 * these validation rules do not require access to other components within the
 * parent form.
 */
export type CurrencyFieldAmountValidatorRuleKeys = 'minValue' | 'maxValue';

/**
 * A union of all the validator rules. In theory, it would be possible to add
 * custom validator rules for the `code` field too if we wanted.
 */
export type CurrencyFieldValidatorRuleKeys =
    | CurrencyFieldNestedFormValidatorRuleKeys
    | CurrencyFieldAmountValidatorRuleKeys;

export interface CurrencyFieldProps
    extends Omit<
        NestedFormProps,
        'children' | 'validatorRules' | 'validatorMessages'
    > {
    name: string;
    label: string;
    onChange?: () => void;
    validatorRules?: {
        minValue?: number;
        gtCurrencyField?: string;
    };
    validatorMessages?: Pick<
        NestedFormProps['validatorMessages'],
        CurrencyFieldValidatorRuleKeys
    >;

    /** A fixed currency code to use */
    fixedCurrencyCode?: string;

    // TODO: uncomment this once module augmentation issue is fixed
    // validatorRules?: Pick<
    //     NestedFormProps['validatorRules'],
    //     CurrencyFieldValidatorRuleKeys
    // >;
    // validatorMessages?: Pick<
    //     NestedFormProps['validatorMessages'],
    //     CurrencyFieldValidatorRuleKeys
    // >;
}

export class CurrencyField extends React.Component<CurrencyFieldProps> {
    private nestedFormValidatorRuleKeys: CurrencyFieldNestedFormValidatorRuleKeys[] =
        ['gtCurrencyField'];

    private amountValidatorRuleKeys: CurrencyFieldAmountValidatorRuleKeys[] = [
        'minValue',
        'maxValue',
    ];

    render() {
        const {
            name,
            label,
            validatorTrigger,
            validatorRules,
            validatorMessages,
            fixedCurrencyCode,
        } = this.props;

        return (
            <NestedForm
                name={name}
                validatorTrigger={validatorTrigger}
                validatorRules={
                    // TODO: remove any cast once module augmentation issue is fixed
                    pick(
                        validatorRules,
                        this.nestedFormValidatorRuleKeys,
                    ) as any
                }
                validatorMessages={pick(
                    validatorMessages,
                    this.nestedFormValidatorRuleKeys,
                )}
            >
                {/* Use a render callback from the `NestedForm` to grab its validation data */}
                {({ validatorData }) => (
                    <Grid container spacing={2} alignItems="flex-end">
                        <Grid item xs={9}>
                            <TextField
                                name="amount"
                                type="number"
                                label={label}
                                validatorRules={pick(
                                    validatorRules,
                                    this.amountValidatorRuleKeys,
                                )}
                                validatorMessages={pick(
                                    validatorMessages,
                                    this.amountValidatorRuleKeys,
                                )}
                                /**
                                 * If the validation on the nested form failed,
                                 * override the validatorData on the amount field.
                                 *
                                 * Checking the context here is important because
                                 * without it, we will pass through a Success object
                                 * and override any failed `TextField` validation.
                                 */
                                validatorData={
                                    [
                                        ValidatorContext.Warning,
                                        ValidatorContext.Danger,
                                    ].includes(validatorData?.context) &&
                                    validatorData
                                }
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Select
                                name="code"
                                label="Currency"
                                value={fixedCurrencyCode}
                                options={CURRENCY_CODE_OPTIONS}
                                // tslint:disable-next-line: jsx-no-lambda
                                renderValue={(value) => value}
                                native={false}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                )}
            </NestedForm>
        );
    }
}
