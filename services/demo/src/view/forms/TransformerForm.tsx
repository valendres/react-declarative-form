import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';
import {
    TextField,
    Select,
    CurrencyField,
} from '@react-declarative-form/material-ui';
import { Typography, Grid } from '@material-ui/core';

const transformerFormValueTransformer = (
    componentName: keyof TransformerFormFields,
    value: any,
) => (componentName === 'firstName' && value === 'apple' ? 'pineapple' : value);

export interface TransformerFormFields {
    firstName: string;
    favFruit: string;
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
        {...props}
        valueTransformer={transformerFormValueTransformer}
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
                <CurrencyField name="income" label="Income" />
            </Grid>
        </Grid>
    </Form>
);
