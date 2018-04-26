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
                        name="first-name"
                        label="First name"
                        validationRules={{ minValue: 5, maxValue: 10 }}
                        validationMessages={{ minValue: 'too low...' }}
                        type="number"
                    />
                </Form>
            </div>
        );
    }

    private handleSubmit = () => {
        this.formRef.current.reset();
    };
}
