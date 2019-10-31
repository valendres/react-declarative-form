import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import {
    Form,
    ValueMap,
    ValidatorContext,
    ValidatorData,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import {
    Button,
    Grid,
    Typography,
    Tooltip,
    LinearProgress,
} from '@material-ui/core';

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

export interface LoginFormProps {}

export interface LoginFormState {
    password?: string;
    passwordStrength?: {
        score: number;
        message: string;
    };
}

export class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
    private formRef: React.RefObject<
        Form<{
            username: string;
            email: string;
            dob: Date;
            password: string;
            passwordConfirm: string;
        }>
    >;

    constructor(props: LoginFormProps) {
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
                >
                    <Grid container spacing={16}>
                        <Grid item sm={4} xs={12}>
                            {/* External validator example */}
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
                            {/* Multi-rule and custom validator message example */}
                            <TextField
                                name="email"
                                label="Email"
                                defaultValue="prefilledemail@domain.com"
                                validatorRules={{
                                    // Reject emails that contain the word cute
                                    matches: /^((?!cuti?e).)*$/i,
                                    isEmail: true,
                                }}
                                validatorMessages={{
                                    matches:
                                        "Are you sure you're older than 13?",
                                }}
                                required
                            />
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            {/* Custom validator rule example */}
                            <TextField
                                name="dob"
                                label="Date of birth"
                                validatorRules={{
                                    custom: this.validateDob,
                                }}
                                required
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            {/* External state management example + triggering validator on another field */}
                            <TextField
                                name="password"
                                label="Password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                validatorTrigger={['passwordConfirm']}
                                validatorRules={{
                                    minLength: 8,
                                }}
                                type="password"
                                required
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            {/* Cross-field validator example */}
                            <TextField
                                name="passwordConfirm"
                                label="Confirm password"
                                validatorRules={{ eqTarget: 'password' }}
                                validatorMessages={{
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
                <Button onClick={this.handleClearButtonClick}>Clear</Button>
                <Button onClick={this.handleResetButtonClick}>Reset</Button>
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
        console.log('values', this.formRef.current.getValues());
        console.log(`${name} field value set to: ${value}`);
    };

    private handleFormValidSubmit = (values: ValueMap) => {
        console.log('Successfully submitted form :)', values);
        this.formRef.current.setValidatorData('email', {
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
        this.formRef.current.clear(['password', 'passwordConfirm']);
    };

    private handleResetButtonClick = () => {
        this.formRef.current.reset();
    };

    private validateDob = (name: string, values: ValueMap): ValidatorData => {
        // We could have just used matches or isDate rules, but a custom regex
        // is used here to demonstrate how custom validator can be done
        const datePattern = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{4})$/;
        if (!datePattern.test(values[name])) {
            // If we have an error, return danger response.
            return {
                name,
                context: ValidatorContext.Danger,
                message: 'Invalid date format, expected: dd/mm/yyyy',
            };
        }

        // Notice the omission of a success response. This is done intentionally.
        // If we return a success response here, no other validator rules will be run.
    };
}
