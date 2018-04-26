import * as React from 'react';
import { FormContext, FormApi } from './Form';
import { ValidationResponse, ValidationContext } from './types';

export interface BoundExternalProps {
    name: string;
    value?: any;
    validationRules?: any;
    validationMessages?: any;
    onChange?: () => void;
    onBlur?: (event: React.FormEvent<any>) => void;
    onFocus?: (event: React.FormEvent<any>) => void;
}

export interface BoundInternalProps {
    value?: any;
    setValue?: (value: any) => void;
    validationMessage?: string;
    validationContext?: ValidationContext;
}

export interface BoundState {
    value?: any;
    validation?: ValidationResponse;
}

export function bind<
    ComponentProps extends BoundExternalProps & BoundInternalProps
>(WrappedComponent: React.ComponentClass<ComponentProps>) {
    return class extends React.Component<
        ComponentProps & BoundExternalProps,
        BoundState
    > {
        static defaultProps = {
            onBlur: () => {},
            onFocus: () => {},
        };

        formApi: FormApi;

        public constructor(props: ComponentProps) {
            super(props);
            this.state = {
                value: props.value,
            };
        }

        public componentWillUnmount() {
            this.formApi.unregisterComponent(this.props.name);
        }

        public validate = () => {
            const validation = this.formApi.getValidation(
                this.props.name,
                this.state.value,
            );
            this.setState({
                validation,
            });
        };

        public isValid = (): boolean => {
            const validation = this.formApi.getValidation(
                this.props.name,
                this.state.value,
            );
            return validation.context === ValidationContext.Success;
        };

        public render() {
            const { validation } = this.state;
            const message = validation ? validation.message : undefined;
            const context = validation ? validation.context : undefined;

            const {
                // Omit these
                validationMessages,
                validationRules,
                ...restProps
            } = this.props as any;

            return (
                <FormContext.Consumer>
                    {(api: FormApi) => {
                        this.formApi = api;
                        this.formApi.registerComponent(this.props.name, this);
                        return (
                            <WrappedComponent
                                {...restProps}
                                value={this.state.value}
                                validationMessage={message}
                                validationContext={context}
                                setValue={this.setValue}
                                onBlur={this.handleBlur}
                                onFocus={this.handleFocus}
                            />
                        );
                    }}
                </FormContext.Consumer>
            );
        }

        setValue = (value: any) => {
            const { name } = this.props;
            const validation = this.formApi.getValidation(name, value);
            console.log(`Wrapped component: "${name}" changed to "${value}"`);
            this.setState(
                {
                    value,
                    validation,
                },
                () => {
                    this.formApi.handleChange(name, value);
                },
            );
        };

        handleBlur = (event?: React.FormEvent<any>): void => {
            const { name } = this.props;
            const { value } = this.state;
            console.log(`Wrapped component: "${name}" blurred with "${value}"`);
            this.formApi.handleBlur(name, value);
            this.props.onBlur(event);
        };

        handleFocus = (event?: React.FormEvent<any>): void => {
            const { name } = this.props;
            const { value } = this.state;
            console.log(`Wrapped component: "${name}" focused with "${value}"`);
            this.formApi.handleFocus(name, value);
            this.props.onFocus(event);
        };
    };
}
