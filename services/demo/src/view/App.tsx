import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';

import { useQueryParams, StringParam, withDefault } from 'use-query-params';

import {
    Button,
    Grid,
    Paper,
    Typography,
    Select,
    MenuItem,
} from '@material-ui/core';
import ReactJson from 'react-json-view';
import {
    NestedValuesForm,
    DefaultValuesForm,
    InitialValuesForm,
    StickyValuesForm,
    TransformerForm,
    RegistrationForm,
    CrossValidationForm,
} from './forms';

const forms: {
    value: string;
    label: string;
    Form: React.ComponentType<
        FormProps<any> & {
            formRef: React.RefObject<Form>;
        }
    >;
}[] = [
    {
        value: 'cross-validation-form',
        label: 'Cross-validation form',
        Form: CrossValidationForm,
    },
    {
        value: 'default-values-form',
        label: 'Default values form',
        Form: DefaultValuesForm,
    },
    {
        value: 'initial-values-form',
        label: 'Initial values form',
        Form: InitialValuesForm,
    },
    {
        value: 'registration-form',
        label: 'Registration form',
        Form: RegistrationForm,
    },
    {
        value: 'nested-values-form',
        label: 'Nested values form',
        Form: NestedValuesForm,
    },
    {
        value: 'sticky-values-form',
        label: 'Sticky values form',
        Form: StickyValuesForm,
    },
    {
        value: 'transformer-form',
        label: 'Transformer form',
        Form: TransformerForm,
    },
];

export const App = () => {
    const formRef = React.createRef<Form<any>>();

    // Active form
    const [queryParams, setQueryParams] = useQueryParams({
        form: withDefault(StringParam, forms[0].value),
    });
    const { Form } = forms.find((form) => form.value === queryParams.form);

    // Form data mirror
    const [mirroredFormData, setMirroredFormData] = React.useState({});
    const updateMirroredFormData = () =>
        setMirroredFormData(formRef.current?.getValues() ?? {});
    React.useEffect(updateMirroredFormData, [queryParams.form]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Paper>
                    <Grid container justify="space-between">
                        <Grid item>
                            <Button
                                onClick={() => formRef.current.submit()}
                                type="submit"
                            >
                                Submit
                            </Button>
                            <Button onClick={() => formRef.current.clear()}>
                                Clear
                            </Button>
                            <Button onClick={() => formRef.current.reset()}>
                                Reset
                            </Button>
                            <Button onClick={() => formRef.current.validate()}>
                                Validate
                            </Button>
                        </Grid>
                        <Grid item>
                            <Select
                                // tslint:disable-next-line: jsx-no-lambda
                                onChange={(event) =>
                                    setQueryParams({
                                        form: event.target.value as string,
                                    })
                                }
                                value={queryParams.form}
                            >
                                {forms.map(({ value, label }) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            <Grid item xs={8}>
                <Paper
                    style={{
                        padding: 10,
                    }}
                >
                    <Form formRef={formRef} onChange={updateMirroredFormData} />
                </Paper>
            </Grid>
            <Grid item xs={4}>
                <Paper
                    style={{
                        padding: 10,
                    }}
                >
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant="h5">Data</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <ReactJson
                                src={mirroredFormData}
                                indentWidth={3}
                                enableClipboard={false}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};
