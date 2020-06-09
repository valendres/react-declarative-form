import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Grid, Typography } from '@material-ui/core';

export interface InitialValuesFormFields {
    controlled: string;
    auto: string;
    initial: string;
    default: string;
}

export interface InitialValuesFormProps
    extends FormProps<InitialValuesFormFields> {
    formRef: React.RefObject<Form<InitialValuesFormFields>>;
}

export const InitialValuesForm: React.FC<InitialValuesFormProps> = ({
    formRef,
    ...props
}) => {
    const [controlledValue, setControlledValue] = React.useState('Level 1');
    const defaultValue = 'Default...';

    return (
        <Form<InitialValuesFormFields>
            ref={formRef}
            {...props}
            initialValues={{ ...props.initialValues, initial: 'Level 3' }}
        >
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h5">Initial values form</Typography>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            name="controlled"
                            label="Controlled (level 1)"
                            value={controlledValue}
                            // tslint:disable-next-line: jsx-no-lambda
                            onChange={(event) =>
                                setControlledValue(event.currentTarget.value)
                            }
                            defaultValue={defaultValue}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="auto"
                            label="Auto (level 2)"
                            defaultValue={defaultValue}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="initial"
                            label="Initial value (Level 3)"
                            defaultValue={defaultValue}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="default"
                            label="Default value (Level 4)"
                            defaultValue={defaultValue}
                            required
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Form>
    );
};
