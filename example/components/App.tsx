import * as React from 'react';
import { Form } from 'react-form-validator';

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
                <Form ref={this.formRef} onSubmit={this.handleSubmit} />
            </div>
        );
    }

    private handleSubmit = () => {
        this.formRef.current.reset();
    };
}
