import * as React from 'react';
import { Form, ValueMap, Mirror } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Button, Typography, Grid } from '@material-ui/core';

export interface StickyValuesFormValues {
    firstName: string;
    lastName: string;
}

export interface StickyValuesFormProps {}
export interface StickyValuesFormState {
    showInputs: boolean;
}

export class StickyValuesForm extends React.Component<
    StickyValuesFormProps,
    StickyValuesFormState
> {
    private formRef: React.RefObject<Form> = React.createRef();

    constructor(props: StickyValuesFormProps) {
        super(props);
        this.state = {
            showInputs: true,
        };
    }

    public render() {
        return (
            <div>
                <Typography variant="title">Sticky values form</Typography>

                <Button type="submit" onClick={this.handleSubmitButtonClick}>
                    Submit
                </Button>
                <Button onClick={this.handleToggleVisibilityButtonClick}>
                    Toggle visibility
                </Button>
                <Button onClick={this.handleResetButtonClick}>
                    Reset form
                </Button>
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onInvalidSubmit={this.handleFormInvalidSubmit}
                    onChange={this.handleFormChange}
                    sticky
                >
                    {this.state.showInputs && (
                        <Grid>
                            <Grid>
                                <TextField
                                    name="firstName"
                                    label="First name"
                                    required
                                />
                            </Grid>
                        </Grid>
                    )}
                    <Mirror name="firstName">
                        {({ firstName }) =>
                            firstName && <div>Welcome {firstName}!</div>
                        }
                    </Mirror>
                </Form>
            </div>
        );
    }

    private handleResetButtonClick = () => {
        this.formRef.current.reset();
    };

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

    private handleToggleVisibilityButtonClick = () => {
        this.setState({
            showInputs: !this.state.showInputs,
        });
    };
}
