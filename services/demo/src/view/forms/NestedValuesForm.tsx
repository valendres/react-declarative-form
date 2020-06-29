import * as React from 'react';
import {
    Form,
    FormProps,
    NestedForm,
    ValidatorContext,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid, Typography, Switch, FormControlLabel } from '@material-ui/core';

export interface NestedValuesFormFields {
    firstName: string;
    lastName: string;
}

export interface NestedValuesFormProps
    extends FormProps<NestedValuesFormFields> {
    formRef: React.RefObject<Form<NestedValuesFormFields>>;
}

export const NestedValuesForm: React.FC<NestedValuesFormProps> = ({
    formRef,
    ...props
}) => {
    const [showInputs, setShowInputs] = React.useState(true);
    const handleShowInputsCheckboxChange = React.useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >((event) => {
        setShowInputs(event.target.checked);
    }, []);

    return (
        <Form<NestedValuesFormFields> ref={formRef} {...props}>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5">Sticky values form</Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showInputs}
                                onChange={handleShowInputsCheckboxChange}
                            />
                        }
                        label="Toggle field visibility"
                    />
                </Grid>
                {showInputs && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="username"
                                label="Username"
                                validatorData={{
                                    message:
                                        'For some reason this field always has an error',
                                    context: ValidatorContext.Danger,
                                }}
                                pristine={false}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <NestedForm name="personal">
                                <Grid container spacing={2}>
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
                            </NestedForm>
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Form>
    );
};
