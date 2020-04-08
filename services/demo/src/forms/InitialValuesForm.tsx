import * as React from 'react';
import { Form, ValueMap } from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import { Button, Typography, Grid } from '@material-ui/core';

export interface InitialValuesFormValues {
    initial: string;
}

export interface InitialValuesFormProps {}
export interface InitialValuesFormState {
    initialValues?: Partial<InitialValuesFormValues>;
    controlledValue?: string;
}

export class InitialValuesForm extends React.Component<
    InitialValuesFormProps,
    InitialValuesFormState
> {
    private formRef: React.RefObject<Form> = React.createRef();

    constructor(props: InitialValuesFormProps) {
        super(props);
        this.state = {
            controlledValue: 'Level 1',
            initialValues: {
                initial: 'Level 3',
            },
        };
    }

    public render() {
        const { controlledValue } = this.state;
        const defaultValue = 'Default...';

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
                    <Grid>
                        <Grid>
                            <TextField
                                name="controlled"
                                label="Controlled (level 1)"
                                value={controlledValue}
                                onChange={this.handleControlledChange}
                                defaultValue={defaultValue}
                                required
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                name="auto"
                                label="Auto (level 2)"
                                defaultValue={defaultValue}
                                required
                            />
                        </Grid>
                    </Grid>
                    <Grid>
                        <Grid>
                            <TextField
                                name="initial"
                                label="Initial value (Level 3)"
                                defaultValue={defaultValue}
                                required
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                name="default"
                                label="Default value (Level 4)"
                                defaultValue={defaultValue}
                                required
                            />
                        </Grid>
                    </Grid>
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

    private handleControlledChange = (event: React.SyntheticEvent<any>) => {
        console.log('Handle comment change!');
        this.setState({
            controlledValue: event.currentTarget.value,
        });
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
                },
            },
            this.formRef.current.reset,
        );
    };
}
