import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { Form, ValueMap, ValidationContext } from 'react-form-validator';
import { Button } from './Button';
import { Col } from './Col';
import { Row } from './Row';
import { TextField } from './Textfield';

const getPasswordStrength = (password: string) => {
    if (!password) {
        return;
    }

    switch (zxcvbn(password).score) {
        case 0:
            return 'Too guessable: risky password.';
        case 1:
            return 'Very guessable: protection from throttled online attacks.';
        case 2:
            return 'Somewhat guessable: protection from unthrottled online attacks.';
        case 3:
            return 'Safely unguessable: moderate protection from offline slow-hash scenario.';
        case 4:
            return 'Very unguessable: strong protection from offline slow-hash scenario.';
    }
};

export interface AppProps {}

export interface AppState {
    password?: string;
    passwordStrength?: string;
}

export class App extends React.Component<AppProps, AppState> {
    private formRef: React.RefObject<Form>;

    constructor(props: AppProps) {
        super(props);
        this.formRef = React.createRef();
        this.state = {};
    }

    public render() {
        const { password, passwordStrength } = this.state;

        return (
            <div
                style={{
                    maxWidth: '600px',
                    margin: '1.5rem',
                }}
            >
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onChange={this.handleFormChange}
                >
                    <h1>Create an account</h1>
                    <Row>
                        <Col>
                            <TextField
                                name="username"
                                label="Username"
                                validationContext={ValidationContext.Danger}
                                validationMessage="For some reason this field always has an error"
                                pristine={false}
                                required
                            />
                        </Col>
                        <Col>
                            <TextField
                                name="email"
                                label="Email"
                                validationRules={{
                                    // Reject emails that contain the word cute
                                    matches: /^((?!cuti?e).)*$/i,
                                    isEmail: true,
                                }}
                                validationMessages={{
                                    matches:
                                        "Are you sure you're older than 13?",
                                }}
                                required
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <TextField
                                name="password"
                                label="Password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                validationGroup={['password-confirm']}
                                validationRules={{
                                    minLength: 8,
                                }}
                                type="password"
                                required
                            />
                        </Col>
                        <Col>
                            <TextField
                                name="password-confirm"
                                label="Confirm password"
                                validationRules={{ eqTarget: 'password' }}
                                validationMessages={{
                                    eqTarget: 'Must match password',
                                }}
                                type="password"
                                required
                            />
                        </Col>
                    </Row>
                    <Row>
                        {passwordStrength && (
                            <Col>
                                <strong>Password strength:</strong>{' '}
                                {passwordStrength}
                            </Col>
                        )}
                    </Row>
                    <Button
                        label="Internal submit"
                        type="submit"
                        style={Button.Style.Primary}
                    />
                </Form>
                <Button
                    label="External submit"
                    type="submit"
                    style={Button.Style.Link}
                    onClick={this.handleSubmitButtonClick}
                />
            </div>
        );
    }

    private handlePasswordChange = (event: React.FormEvent<any>) => {
        const { value: password } = event.currentTarget;
        this.setState({
            password,
            passwordStrength: getPasswordStrength(password),
        });
    };

    private handleFormChange = (name: string, value: any) => {
        console.log(`${name} field value set to: ${value}`);
    };

    private handleFormValidSubmit = (values: ValueMap) => {
        console.log('Successfully submitted form :)');
    };

    private handleSubmitButtonClick = () => {
        this.formRef.current.submit();
    };
}
