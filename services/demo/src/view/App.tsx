import * as React from 'react';
import { Form, FormProps } from '@react-declarative-form/core';
import { SelectOption } from '@react-declarative-form/material-ui';

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
    LoginForm,
    ComplexForm,
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
        value: 'complex-form',
        label: 'Complex form',
        Form: ComplexForm,
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
        value: 'login-form',
        label: 'Login form',
        Form: LoginForm,
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
    const formRef = React.useRef<Form<any>>();

    // Active form query params
    const [queryParams, setQueryParams] = useQueryParams({
        form: withDefault(StringParam, forms[0].value),
    });
    const { Form } = forms.find((form) => form.value === queryParams.form);

    // Form data mirror
    const [mirroredFormData, setMirroredFormData] = React.useState({});
    const updateMirroredFormData = React.useCallback(
        () => setMirroredFormData(formRef.current?.getValues() ?? {}),
        [formRef.current],
    );
    React.useEffect(updateMirroredFormData, [queryParams.form]);

    // Event handlers
    const handleSubmitClick = React.useCallback<React.MouseEventHandler>(() => {
        formRef.current.submit();
        updateMirroredFormData();
    }, [formRef.current]);

    const handleClearClick = React.useCallback<React.MouseEventHandler>(() => {
        formRef.current.clear();
        updateMirroredFormData();
    }, [formRef.current]);
    const handleResetClick = React.useCallback<React.MouseEventHandler>(() => {
        formRef.current.reset();
        updateMirroredFormData();
    }, [formRef.current]);
    const handleValidateClick = React.useCallback<
        React.MouseEventHandler
    >(() => {
        formRef.current.validate();
        updateMirroredFormData();
    }, [formRef.current]);
    const handleActiveFormChange = React.useCallback<
        React.ChangeEventHandler<SelectOption>
    >(
        (event) => {
            setQueryParams({
                form: event.target.value as string,
            });
        },
        [formRef.current],
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Paper>
                    <Grid container justify="space-between">
                        <Grid item>
                            <Button onClick={handleSubmitClick} type="submit">
                                Submit
                            </Button>
                            <Button onClick={handleClearClick}>Clear</Button>
                            <Button onClick={handleResetClick}>Reset</Button>
                            <Button onClick={handleValidateClick}>
                                Validate
                            </Button>
                        </Grid>
                        <Grid item>
                            <Select
                                onChange={handleActiveFormChange}
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
