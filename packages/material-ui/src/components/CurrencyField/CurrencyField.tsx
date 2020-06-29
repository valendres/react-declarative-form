import * as React from 'react';
import { NestedForm } from '@react-declarative-form/core';

import { TextField } from '../TextField';
import { Select } from '../Select';
import { CURRENCY_CODE_OPTIONS } from './CurrencyField.options';
import { Grid } from '@material-ui/core';

const valueTransformer = ({ value, code }: CurrencyFieldValues) =>
    value === undefined || value === null || value === ''
        ? undefined
        : {
              value,
              code,
          };
const renderValue = (value: string) => value;

export interface CurrencyFieldValues {
    value: string | number;
    code: string;
}

export interface CurrencyFieldProps {
    name: string;
    label: string;
    fixedCurrencyCode?: string;
    disabled?: boolean;
    onChange?: () => void;
}

export class CurrencyField extends React.Component<CurrencyFieldProps> {
    render() {
        const { name, label, fixedCurrencyCode, disabled } = this.props;

        return (
            <NestedForm name={name} valueTransformer={valueTransformer}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={9}>
                        <TextField
                            name="value"
                            type="number"
                            label={label}
                            disabled={disabled}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Select
                            name="code"
                            label="Currency"
                            disabled={disabled || !!fixedCurrencyCode}
                            value={fixedCurrencyCode ?? undefined}
                            options={CURRENCY_CODE_OPTIONS}
                            renderValue={renderValue}
                            native={false}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </NestedForm>
        );
    }
}
