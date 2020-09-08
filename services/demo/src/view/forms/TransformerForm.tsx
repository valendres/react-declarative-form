import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';
import {
    TextField,
    Select,
    CurrencyField,
    Currency,
} from '@react-declarative-form/material-ui';
import { Typography, Grid } from '@material-ui/core';

export interface TransformerFormFields {
    firstName: string;
    favFruit: string;
    firstIncome: Currency;
    secondIncome: Currency;
}

export interface TransformerFormProps extends FormProps<TransformerFormFields> {
    formRef: React.RefObject<Form<TransformerFormFields>>;
}

export const TransformerForm: React.FC<TransformerFormProps> = ({
    formRef,
    ...props
}) => (
    <Form<TransformerFormFields>
        ref={formRef}
        // {...props}
        // tslint:disable-next-line: jsx-no-lambda
        valueTransformer={(componentName, value) =>
            componentName === 'firstName' && value === 'apple'
                ? 'pineapple'
                : value
        }
        debug
    >
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h5">Transformer form</Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField name="firstName" label="First name" required />
            </Grid>
            <Grid item xs={12}>
                <Select
                    name="favFruit"
                    label="Favorite fruit"
                    options={[
                        { value: 'pineapple', label: 'Pineapple' },
                        { value: 'apple', label: 'Apple' },
                        { value: 'watermelon', label: 'Watermelon' },
                        { value: 'orange', label: 'Orange' },
                    ]}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <CurrencyField
                    name="firstIncome"
                    label="First income"
                    // validatorTrigger="secondIncome"
                />
            </Grid>
            <Grid item xs={12}>
                <CurrencyField
                    name="secondIncome"
                    label="Second income"
                    validatorRules={{
                        minValue: 100,
                        gtCurrencyField: 'firstIncome',
                    }}
                />
            </Grid>
        </Grid>
    </Form>
);
