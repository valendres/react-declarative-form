import * as React from 'react';
import {
    addValidatorRule,
    Form,
    FormProps,
    ValidatorContext,
    ValidatorRule,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid, Typography } from '@material-ui/core';

const notZeroRule: ValidatorRule = (key, values, enabled: boolean) => {
    const value: string = values[key];
    if (enabled && value && value.trim() === '0') {
        return {
            context: ValidatorContext.Danger,
            message: 'This must not be zero',
        };
    }
    return undefined;
};

addValidatorRule('notZero', notZeroRule);

declare module '@react-declarative-form/core' {
    export interface ValidatorRules {
        /** Enforces that the value is not zero */
        notZero?: boolean;
    }
}

export interface CustomRulesFormFields {}

export interface CustomRulesFormProps extends FormProps<CustomRulesFormFields> {
    formRef: React.RefObject<Form<CustomRulesFormFields>>;
}

export const CustomRulesForm: React.FC<CustomRulesFormProps> = ({
    formRef,
    ...props
}) => (
    <Form ref={formRef} {...props}>
        <Grid container>
            <Grid item xs={12}>
                <Typography variant="h5">Custom rules form</Typography>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    name="age"
                    label="Age"
                    type="number"
                    validatorRules={{
                        notZero: true,
                    }}
                    validatorMessages={{
                        required: 'A custom required message',
                        notZero: 'A custom not zero message',
                    }}
                    required
                />
            </Grid>
        </Grid>
    </Form>
);
