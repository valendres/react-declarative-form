import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import { Form, ValueMap, ValidationContext } from 'react-form-validator';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import { LinearProgress } from 'material-ui/Progress';
import { TextField } from './Textfield';

const getPasswordStrength = (password: string) => {
    if (!password) {
        return;
    }

    const score = zxcvbn(password).score;
    const message = (() => {
        switch (score) {
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
    })();

    return {
        score,
        message,
    };
};

export interface AppProps {}

export interface AppState {
    password?: string;
    passwordStrength?: {
        score: number;
        message: string;
    };
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

        const passwordStrengthPercent = passwordStrength
            ? (passwordStrength.score + 1) * 20
            : 0;
        const passwordStrengthTooltip = passwordStrength
            ? passwordStrength.message
            : 'Enter a password to determine strength';

        return (
            <div>
                <Typography variant="title">Create an account</Typography>
                <Form
                    ref={this.formRef}
                    onValidSubmit={this.handleFormValidSubmit}
                    onInvalidSubmit={this.handleFormInvalidSubmit}
                    onChange={this.handleFormChange}
                    style={{
                        maxWidth: '600px',
                    }}
                >
                    <Grid container spacing={16}>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                name="username"
                                label="Username"
                                validationContext={ValidationContext.Danger}
                                validationMessage="For some reason this field always has an error"
                                pristine={false}
                                required
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
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
                        </Grid>
                        <Grid item sm={6} xs={12}>
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
                        </Grid>
                        <Grid item sm={6} xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
                            <Tooltip
                                title={passwordStrengthTooltip}
                                placement="right"
                            >
                                <div
                                    style={{
                                        width: '150px',
                                        maxWidth: '100%',
                                        marginBottom: '1.5rem',
                                    }}
                                >
                                    <Typography>Password strength</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={passwordStrengthPercent}
                                    />
                                </div>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="raised" color="primary">
                        Internal submit
                    </Button>
                </Form>
                <Button type="submit" onClick={this.handleSubmitButtonClick}>
                    External submit
                </Button>
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
        console.log('Successfully submitted form :)', values);
    };

    private handleFormInvalidSubmit = (values: ValueMap) => {
        console.log('Failed to submit, form is invalid :(', values);
    };

    private handleSubmitButtonClick = () => {
        this.formRef.current.submit();
    };
}
