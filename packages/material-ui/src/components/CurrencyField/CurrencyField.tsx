import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    // ValidatorContext,
    Omit,
    NestedForm,
} from '@react-declarative-form/core';

import { TextField } from '../TextField';
import { Select } from '../Select';
import { CURRENCY_CODE_OPTIONS } from './CurrencyField.options';
import { Grid, makeStyles, Theme, createStyles } from '@material-ui/core';

export interface CurrencyFieldValues {
    amount: string | number;
    code: string;
}

export interface CurrencyFieldProps
    extends Omit<BoundComponentProps, 'onBlur' | 'onFocus'> {
    name: string;
    label: string;
    onChange?: () => void;
}

export class UnboundCurrencyField extends React.Component<CurrencyFieldProps> {
    render() {
        const { name, label } = this.props;

        return (
            <NestedForm
                name={name}
                // tslint:disable-next-line: jsx-no-lambda
                valueTransformer={({ amount, code }: CurrencyFieldValues) =>
                    amount === undefined || amount === null || amount === ''
                        ? undefined
                        : {
                              amount,
                              code,
                          }
                }
            >
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={9}>
                        <TextField name="amount" type="number" label={label} />
                    </Grid>
                    <Grid item xs={3}>
                        <Select
                            name="code"
                            label="Currency"
                            options={CURRENCY_CODE_OPTIONS}
                            // tslint:disable-next-line: jsx-no-lambda
                            renderValue={(value) => value}
                            native={false}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </NestedForm>
        );
    }
}

export const CurrencyField = bind<CurrencyFieldProps>(UnboundCurrencyField);
