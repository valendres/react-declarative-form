import * as React from 'react';
import {
    Form,
    ValueMap,
    ValidatorContext,
    NestedForm,
    Mirror,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Button, Grid, Typography } from '@material-ui/core';

export interface WithNestedFormProps {}

export interface WithNestedFormState {
    showInputs: boolean;
}

export class WithNestedForm extends React.Component<
    WithNestedFormProps,
    WithNestedFormState
> {
    private formRef: React.RefObject<
        Form<{
            username: string;
            currency: {
                amount: string;
                code: string;
            };
        }>
    >;

    constructor(props: WithNestedFormProps) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            showInputs: true,
        };
    }

    public render() {
        return (
            <div>
                <Typography variant="title">NestedForm</Typography>
                <div>
                    <Button
                        type="submit"
                        onClick={this.handleSubmitButtonClick}
                    >
                        External submit
                    </Button>
                    <Button onClick={this.handleClearButtonClick}>Clear</Button>
                    <Button onClick={this.handleResetButtonClick}>Reset</Button>
                    <Button onClick={this.handleValidateButtonClick}>
                        Validate
                    </Button>
                    <Button onClick={this.handleToggleVisibilityButtonClick}>
                        Toggle visibility
                    </Button>
                </div>
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onInvalidSubmit={this.handleFormInvalidSubmit}
                    onChange={this.handleFormChange}
                    initialValues={{
                        username: 'ABC',
                        currency: {
                            amount: 500,
                            code: 'AUD',
                        },
                    }}
                    sticky
                >
                    <Button type="submit" variant="raised" color="primary">
                        Internal submit
                    </Button>
                    {this.state.showInputs && (
                        <Grid container spacing={16}>
                            <Grid item sm={4} xs={12}>
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
                            <Grid item sm={4} xs={12}>
                                <NestedForm name="currency">
                                    <TextField name="amount" label="Amount" />
                                    <TextField
                                        name="code"
                                        label="code"
                                        required
                                    />
                                    <Mirror name="code">
                                        {({ code }) => <div>{code}</div>}
                                    </Mirror>
                                </NestedForm>
                            </Grid>
                            <Grid item sm={4} xs={12}>
                                <Mirror name="currency">
                                    {({ currency }) => (
                                        <pre>
                                            {JSON.stringify(currency, null, 2)}
                                        </pre>
                                    )}
                                </Mirror>
                            </Grid>
                        </Grid>
                    )}
                </Form>
            </div>
        );
    }

    private handleFormChange = (name: string, value: any) => {
        console.log('values', this.formRef.current.getValues());
        console.log(
            `${name} field value set to: ${JSON.stringify(value, null, 2)}`,
        );
    };

    private handleFormValidSubmit = (values: ValueMap) => {
        console.log('Successfully submitted form :)', values);
        this.formRef.current.setValidatorData('username', {
            context: ValidatorContext.Danger,
            message: 'already registered!',
        });
    };

    private handleFormInvalidSubmit = (values: ValueMap) => {
        console.log('Failed to submit, form is invalid :(', values);
    };

    private handleSubmitButtonClick = () => {
        this.formRef.current.submit();
    };

    private handleClearButtonClick = () => {
        this.formRef.current.clear(['currency']);
    };

    private handleResetButtonClick = () => {
        this.formRef.current.reset();
    };

    private handleValidateButtonClick = () => {
        this.formRef.current.validate();
    };

    private handleToggleVisibilityButtonClick = () => {
        this.setState({
            showInputs: !this.state.showInputs,
        });
    };
}
