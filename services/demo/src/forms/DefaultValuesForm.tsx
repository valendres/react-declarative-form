import * as React from 'react';
import { Form, ValueMap, Mirror } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Button, Typography, Grid } from '@material-ui/core';

export interface DefaultValuesFormValues {
    firstName: string;
    lastName: string;
}

export interface DefaultValuesFormProps {}
export interface DefaultValuesFormState {
    defaultValues?: Partial<DefaultValuesFormValues>;
}

export class DefaultValuesForm extends React.Component<
    DefaultValuesFormProps,
    DefaultValuesFormState
> {
    private formRef: React.RefObject<Form> = React.createRef();

    constructor(props: DefaultValuesFormProps) {
        super(props);
        this.state = {
            defaultValues: {
                firstName: undefined,
                lastName: undefined,
            },
        };
    }

    public render() {
        return (
            <div>
                <Typography variant="title">Default values form</Typography>
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onInvalidSubmit={this.handleFormInvalidSubmit}
                    onChange={this.handleFormChange}
                >
                    <Grid>
                        <Grid>
                            <TextField
                                name="firstName"
                                label="First name"
                                defaultValue={
                                    this.state.defaultValues.firstName
                                }
                                required
                            />
                            <Mirror name="firstName">
                                {(firstName: string) =>
                                    firstName && <div>Welcome {firstName}!</div>
                                }
                            </Mirror>
                        </Grid>
                    </Grid>
                </Form>
                <Button type="submit" onClick={this.handleSubmitButtonClick}>
                    Submit
                </Button>
                <Button onClick={this.handleClearButtonClick}>Clear</Button>
                <Button onClick={this.handleResetButtonClick}>Reset</Button>
                <Button onClick={this.handleUpdateButtonClick}>
                    Update default values
                </Button>
            </div>
        );
    }

    private handleFormChange = (name: string, value: any) => {
        console.log(`${name} field value set to: ${value}`);
    };

    private handleFormValidSubmit = (values: ValueMap) => {
        console.log('Successfully submitted form :)', values);
    };

    private handleFormInvalidSubmit = (values: ValueMap) => {
        console.log('Failed to submit, form is invalid :(', values);
    };

    private handleSubmitButtonClick = () => {
        this.formRef.current.submit();
    };

    private handleClearButtonClick = () => {
        this.formRef.current.clear();
    };

    private handleResetButtonClick = () => {
        this.formRef.current.reset();
    };

    private handleUpdateButtonClick = () => {
        this.setState({
            defaultValues: {
                ...this.state.defaultValues,
                firstName: 'Peter',
            },
        });
    };
}
