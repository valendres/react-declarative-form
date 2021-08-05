import * as React from 'react';
import {
    Form,
    FormProps,
    NestedForm,
    ValidatorContext,
    Mirror,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import {
    Grid,
    Typography,
    Switch,
    FormControlLabel,
    Button,
} from '@material-ui/core';

export interface NestedValuesFormFields {
    username: string;
    personal: {
        firstName: string;
        lastName: string;
    };
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

    const updateFirstLastName = React.useCallback(() => {
        formRef.current.setValue('personal', {
            firstName: 'updated first',
            lastName: 'updated last',
        });
    }, [formRef]);

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
                    <React.Fragment>
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
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button onClick={updateFirstLastName}>
                                    Update first/last name
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Mirror name="personal">
                                    {({
                                        personal,
                                    }: {
                                        personal: NestedValuesFormFields['personal'];
                                    }) => {
                                        if (personal) {
                                            return (
                                                <span>
                                                    Hello: {personal.firstName},
                                                    {personal.lastName}
                                                </span>
                                            );
                                        }
                                        return null;
                                    }}
                                </Mirror>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                )}
            </Grid>
        </Form>
    );
};
