import * as React from 'react';
import * as zxcvbn from 'zxcvbn';
import {
    Form,
    FormProps,
    ValidatorContext,
    ValueMap,
    ValidatorData,
} from '@react-declarative-form/core';
import { TextField } from '@react-declarative-form/material-ui';
import {
    Grid,
    Typography,
    LinearProgress,
    Tooltip,
    Button,
} from '@material-ui/core';

const getPasswordStrength = (password: string) => {
    if (!password) {
        return {
            score: -1,
            percent: 0,
            message: '',
        };
    }

    const score = zxcvbn(password).score;
    const percent = score ? (score + 1) * 20 : 0;
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
        percent,
        message,
    };
};

const validateDob = (name: string, values: ValueMap): ValidatorData => {
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

export interface RegistrationFormFields {
    username: string;
    email: string;
    dob: Date;
    password: string;
    passwordConfirm: string;
}

export interface RegistrationFormProps
    extends FormProps<RegistrationFormFields> {
    formRef: React.RefObject<Form<RegistrationFormFields>>;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
    formRef,
    ...props
}) => {
    const [password, setPassword] = React.useState(undefined);
    const passwordStrength = React.useMemo(() => {
        return getPasswordStrength(password);
    }, [password]);

    return (
        <Form<RegistrationFormFields> ref={formRef} {...props}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5">Registration form</Typography>
                </Grid>
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
                            matches: "Are you sure you're older than 13?",
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
                            custom: validateDob,
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
                        // tslint:disable-next-line: jsx-no-lambda
                        onChange={(event) => {
                            setPassword(event.currentTarget.value);
                        }}
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
                        title={
                            passwordStrength?.message ??
                            'Enter a password to determine strength'
                        }
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
                                value={passwordStrength.percent}
                            />
                        </div>
                    </Tooltip>
                </Grid>
            </Grid>
            <Button type="submit" color="primary">
                Internal submit
            </Button>
        </Form>
    );
};
