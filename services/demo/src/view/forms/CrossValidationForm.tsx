import * as React from 'react';
import { Form, FormProps, Mirror } from '@react-declarative-form/core';
import { CurrencyField, Currency } from '@react-declarative-form/material-ui';
import { Typography, Grid } from '@material-ui/core';

export interface CrossValidationFormFields {
    firstIncome: Currency;
    secondIncome: Currency;
}

export interface CrossValidationFormProps
    extends FormProps<CrossValidationFormFields> {
    formRef: React.RefObject<Form<CrossValidationFormFields>>;
}

export const CrossValidationForm: React.FC<CrossValidationFormProps> = ({
    formRef,
    ...props
}) => (
    <Form<CrossValidationFormFields> ref={formRef} {...props} debug>
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h5">Cross-validation form</Typography>
            </Grid>
            <Grid item xs={12}>
                <CurrencyField name="firstIncome" label="First income" />
            </Grid>
            <Grid item xs={12}>
                <Mirror name="firstIncome">
                    {(fields: CrossValidationFormFields) => (
                        <CurrencyField
                            name="secondIncome"
                            label="Second income"
                            validatorRules={{
                                minValue: 100,
                                gtCurrencyField: 'firstIncome',
                            }}
                            fixedCurrencyCode={fields?.firstIncome?.code}
                        />
                    )}
                </Mirror>
            </Grid>
        </Grid>
    </Form>
);
