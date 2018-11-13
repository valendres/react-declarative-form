import * as React from 'react';
import { FormContext, FormApi } from '../Form';

export interface MirrorInstance {
    props: MirrorProps;
    reflect: Mirror['reflect'];
}

export interface MirrorProps {
    name: string;
    children: (value: any) => any;
}

export class Mirror extends React.Component<MirrorProps> {
    formApi: FormApi;

    public componentDidMount() {
        if (this.isInsideForm()) {
            this.formApi.registerMirror(this.props.name, this);

            // Defer an update so we can get loaded values
            setImmediate(this.reflect);
        } else {
            console.error(
                'Mirrors must be placed inside of a <Form/> component.',
            );
        }
    }

    public componentWillUnmount() {
        if (this.isInsideForm()) {
            this.formApi.unregisterMirror(this.props.name, this);
        }
    }

    render() {
        const { children, name } = this.props;

        return (
            <FormContext.Consumer>
                {(api: FormApi) => {
                    this.formApi = api;
                    return children(api.getValue(name));
                }}
            </FormContext.Consumer>
        );
    }

    reflect = (): void => {
        this.forceUpdate();
    };

    isInsideForm = (): boolean => {
        return !!this.formApi;
    };
}
