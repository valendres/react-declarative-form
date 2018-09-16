import * as React from 'react';
import { Form, ValueMap } from 'react-declarative-form';
import Button from '@material-ui/core/Button';
// import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { TextField } from '../components';

export interface InitialValuesFormValues {
    firstName: string;
    lastName: string;
}

export interface InitialValuesFormProps {}
export interface InitialValuesFormState {
    initialValues?: Partial<InitialValuesFormValues>;
}

export class InitialValuesForm extends React.Component<
    InitialValuesFormProps,
    InitialValuesFormState
> {
    private formRef: React.RefObject<Form> = React.createRef();

    constructor(props: InitialValuesFormProps) {
        super(props);
        this.state = {
            initialValues: {
                firstName: 'test',
                lastName: 'abc',
            },
        };
    }

    public render() {
        return (
            <div>
                <Typography variant="title">Initial values form</Typography>
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onInvalidSubmit={this.handleFormInvalidSubmit}
                    onChange={this.handleFormChange}
                    initialValues={this.state.initialValues}
                >
                    <TextField name="firstName" label="First name" required />
                    <TextField name="lastName" label="Last name" required />
                    <TextField
                        name="comment"
                        label="Comment"
                        initialValue="Some comment"
                        required
                    />
                </Form>
                <Button type="submit" onClick={this.handleSubmitButtonClick}>
                    Submit
                </Button>
                <Button onClick={this.handleClearButtonClick}>Clear</Button>
                <Button onClick={this.handleResetButtonClick}>Reset</Button>
                <Button onClick={this.handleUpdateButtonClick}>
                    Update initial values
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
        this.setState(
            {
                initialValues: {
                    ...this.state.initialValues,
                    firstName: 'TEST!!!',
                },
            },
            this.formRef.current.reset,
        );
    };
}
