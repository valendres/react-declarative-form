import * as React from 'react';
import { Form } from 'react-form-validator';
import { TextField } from './Textfield';

export interface AppProps {}

export class App extends React.Component<AppProps> {
    private formRef: React.RefObject<Form>;

    constructor(props: AppProps) {
        super(props);
        this.formRef = React.createRef();
    }

    public render() {
        return (
            <div>
                <Form ref={this.formRef} onSubmit={this.handleSubmit}>
                    <TextField
                        name="password"
                        label="Password"
                        validationRules={{ minValue: 8, maxValue: 32 }}
                        validationGroup={['password-confirm']}
                        type="password"
                        required
                    />
                    <TextField
                        name="password-confirm"
                        label="Confirm password"
                        validationRules={{ sameAs: 'password' }}
                        type="password"
                        required
                    />
                </Form>
            </div>
        );
    }

    private handleSubmit = () => {
        this.formRef.current.reset();
    };
}
