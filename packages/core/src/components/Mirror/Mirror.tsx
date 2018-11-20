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
            this.getNames().map(name =>
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

    public componentWillUnmount() {
        if (this.isInsideForm()) {
            this.getNames().map(name =>
                this.formApi.unregisterMirror(name, this),
            );
        }
    }

    render() {
        return (
            <FormContext.Consumer>
                {(api: FormApi) => {
                    this.formApi = api;

                    return this.props.children(
                        this.getNames().reduce(
                            (output, singleName) => ({
                                ...output,
                                [singleName]: api.getValue(singleName),
                            }),
                            {},
                        ),
                    );
                }}
            </FormContext.Consumer>
        );
    }

    reflect = (): void => {
        // Document check is done to prevent a jest unit test error where
        // the document may be cleaned up before forceUpdate is called
        document && this.forceUpdate();
    };

    getNames = (): string[] => {
        const { name } = this.props;
        return Array.isArray(name) ? name : [name];
    };

    isInsideForm = (): boolean => {
        return !!this.formApi;
    };
}
