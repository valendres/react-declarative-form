import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import {
    Typography,
    Grid,
    Button,
    FormControlLabel,
    Switch,
} from '@material-ui/core';

export interface IndividualComponentsFormFields {
    clientFirstName: string;
    clientLastName: string;
    clientAge: number;
    partnerFirstName: string;
    partnerLastName: string;
    partnerAge: number;
}

export interface IndividualComponentsFormProps
    extends FormProps<IndividualComponentsFormFields> {
    formRef: React.RefObject<Form<IndividualComponentsFormFields>>;
}

export const IndividualComponentsForm: React.FC<IndividualComponentsFormProps> =
    ({ formRef, ...props }) => {
        const [showPartnerFields, setShowPartnerFields] = React.useState(false);
        const handleClearComponentsByNameClick = React.useCallback(() => {
            formRef.current.setValues(
                {
                    clientFirstName: null,
                    clientLastName: null,
                    clientAge: null,
                    partnerFirstName: null,
                    partnerLastName: null,
                    partnerAge: null,
                },
                true,
            );
        }, [formRef]);
        const handleShowPartnerFieldsChange = React.useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                setShowPartnerFields(event.target.checked);
            },
            [setShowPartnerFields],
        );

        return (
            <Form<IndividualComponentsFormFields> ref={formRef} {...props}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5">
                            Individual components form
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showPartnerFields}
                                    onChange={handleShowPartnerFieldsChange}
                                />
                            }
                            label="Show partner fields"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={showPartnerFields ? 6 : 12}>
                                <Typography variant="h6">
                                    Client info
                                </Typography>
                                <TextField
                                    name="clientFirstName"
                                    label="First name"
                                    required
                                />
                                <TextField
                                    name="clientLastName"
                                    label="Last name"
                                    required
                                />
                                <TextField
                                    name="clientAge"
                                    label="Age"
                                    required
                                />
                            </Grid>
                            {showPartnerFields && (
                                <Grid item xs={6}>
                                    <Typography variant="h6">
                                        Partner info
                                    </Typography>
                                    <TextField
                                        name="partnerFirstName"
                                        label="First name"
                                        required
                                    />
                                    <TextField
                                        name="partnerLastName"
                                        label="Last name"
                                        required
                                    />
                                    <TextField
                                        name="partnerAge"
                                        label="Age"
                                        required
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={handleClearComponentsByNameClick}>
                            Clear components by name
                        </Button>
                    </Grid>
                </Grid>
            </Form>
        );
    };
