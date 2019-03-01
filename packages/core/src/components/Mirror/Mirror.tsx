import * as React from 'react';
import { FormContext, FormApi } from '../Form';

export interface MirrorInstance {
    props: MirrorProps;
    reflect: Mirror['reflect'];
}

export interface MirrorProps {
    name: string | string[];
    children: (
        values: {
            [key: string]: any;
        },
    ) => any;
}

export class Mirror extends React.Component<MirrorProps> {
    formApi: FormApi;

    public componentDidMount() {
        if (this.isInsideForm()) {
            this.getNames().forEach(name =>
                this.formApi.registerMirror(name, this),
            );

            // Defer an update so we can get loaded values
            setImmediate(this.reflect);
        } else {
            console.error(
                'Mirrors must be placed inside of a <Form/> component.',
            );
        }
    }

    public componentDidUpdate(prevProps: MirrorProps) {
        const names = this.getNames();
        const prevNames = this.getNames(prevProps);

        // Unregister names no longer included
        prevNames
            .filter(name => !names.includes(name))
            .forEach(name => this.formApi.unregisterMirror(name, this));
        // Register names that were not included before
        names
            .filter(name => !prevNames.includes(name))
            .forEach(name => this.formApi.registerMirror(name, this));
    }

    public componentWillUnmount() {
        if (this.isInsideForm()) {
            this.getNames().forEach(name =>
                this.formApi.unregisterMirror(name, this),
            );
        }
    }

    render() {
        return (
            <FormContext.Consumer>
                {(api: FormApi) => {
                    this.formApi = api;
                    return this.props.children(this.getValues());
                }}
            </FormContext.Consumer>
        );
    }

    reflect = (): void => {
        // Document check is done to prevent a jest unit test error where
        // the document may be cleaned up before forceUpdate is called
        document && this.forceUpdate();
    };

    getNames = (props: MirrorProps = this.props): string[] => {
        const { name } = props;
        return Array.isArray(name) ? name : [name];
    };

    getValues = () => {
        return this.getNames().reduce(
            (output, name) => ({
                ...output,
                [name]: this.isInsideForm()
                    ? this.formApi.getValue(name)
                    : undefined,
            }),
            {},
        );
    };

    isInsideForm = (): boolean => {
        return !!this.formApi;
    };
}
