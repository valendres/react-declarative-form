import * as React from 'react';
import { Form, FormProps, Mirror } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid, Typography, Switch, FormControlLabel } from '@material-ui/core';

export interface StickyValuesFormFields {
    firstName: string;
    lastName: string;
}

export interface StickyValuesFormProps
    extends FormProps<StickyValuesFormFields> {
    formRef: React.RefObject<Form<StickyValuesFormFields>>;
}

export const StickyValuesForm: React.FC<StickyValuesFormProps> = ({
    formRef,
    ...props
}) => {
    const [showInputs, setShowInputs] = React.useState(true);

    return (
        <Form<StickyValuesFormFields> ref={formRef} {...props} sticky>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5">Sticky values form</Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showInputs}
                                // tslint:disable-next-line: jsx-no-lambda
                                onChange={(event) =>
                                    setShowInputs(event.target.checked)
                                }
                            />
                        }
                        label="Toggle field visibility"
                    />
                </Grid>
                {showInputs && (
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <TextField
                                name="firstName"
                                label="First name"
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="lastName"
                                label="Last name"
                                required
                            />
                        </Grid>
                    </Grid>
                )}
                <Mirror name="firstName">
                    {({ firstName }) =>
                        firstName && (
                            <Grid item xs={12}>
                                Welcome {firstName}!
                            </Grid>
                        )
                    }
                </Mirror>
            </Grid>
        </Form>
    );
};
