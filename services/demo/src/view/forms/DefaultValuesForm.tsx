import * as React from 'react';
import {
    Form,
    FormProps,
    Mirror,
    ValidatorContext,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid } from '@material-ui/core';

export interface DefaultValuesFormFields {
    firstName: string;
    amount: string;
    redeemAmount: string;
}

export interface DefaultValuesFormProps
    extends FormProps<DefaultValuesFormFields> {
    formRef: React.RefObject<Form<DefaultValuesFormFields>>;
}

export const DefaultValuesForm: React.FC<DefaultValuesFormProps> = ({
    formRef,
    ...props
}) => (
    <Form ref={formRef} {...props}>
        <Grid container>
            <Grid item xs={12}>
                <TextField
                    name="firstName"
                    label="First name"
                    defaultValue="Joe"
                    required
                />
            </Grid>
            <Grid item xs={12}>
                <Mirror name="firstName">
                    {({ firstName }) =>
                        firstName && <div>Welcome {firstName}!</div>
                    }
                </Mirror>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={6}>
                    <TextField
                        name="amount"
                        label="Amount"
                        validatorTrigger="redeemAmount"
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        name="redeemAmount"
                        label="Redeem amount"
                        validatorRules={{
                            custom: (
                                key: string,
                                values: DefaultValuesFormFields,
                            ) => {
                                if (
                                    Number(values.redeemAmount) >
                                    Number(values.amount)
                                ) {
                                    return {
                                        context: ValidatorContext.Danger,
                                        message:
                                            'Redeem amount must be less than Amount',
                                    };
                                }

                                return undefined;
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </Grid>
    </Form>
);
