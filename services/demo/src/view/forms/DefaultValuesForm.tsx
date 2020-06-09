import * as React from 'react';
import { Form, FormProps, Mirror } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid } from '@material-ui/core';

export interface DefaultValuesFormFields {
    firstName: string;
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
        </Grid>
    </Form>
);
