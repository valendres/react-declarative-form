import * as React from 'react';
import { FormContext, FormApi } from './Form';
import { ValidationResponse, ValidationContext } from './types';

export interface BoundComponentInternalProps {
    readonly name: string;
    readonly validationRules?: any;
    readonly validationMessages?: any;
    readonly validationMessage?: string;
    readonly validationContext?: ValidationContext;
    readonly validationGroup?: string[];
    readonly setValue?: (value: any) => void;
}

export interface BoundComponentExternalProps {
    readonly value?: any;
    readonly required?: boolean;
    readonly onChange?: (event: any) => void;
    readonly onBlur: (event: React.FocusEvent<any>) => void;
    readonly onFocus?: (event: React.FocusEvent<any>) => void;
}

export type BoundComponentProps = BoundComponentInternalProps &
    BoundComponentExternalProps;

export interface BoundComponentInstance {
    readonly props: BoundComponentProps;
    readonly state: BoundComponentState;
    readonly validate: () => void;
    readonly isValid: () => boolean;
}

export interface BoundComponentState {
    readonly value?: any;
    readonly validation?: ValidationResponse;
}
export function bind<ComponentProps extends BoundComponentProps>(
    WrappedComponent: React.ComponentClass<ComponentProps>,
) {
    return class BoundComponent
        extends React.Component<ComponentProps, BoundComponentState>
        implements BoundComponentInstance {
        formApi: FormApi;

        static defaultProps: Partial<BoundComponentProps> = {
            onBlur: () => {},
            onFocus: () => {},
        };

        static getDerivedStateFromProps(
            nextProps: BoundComponentProps,
            prevState: BoundComponentState,
        ) {
            return {
                value: nextProps.value,
            };
        }

        public constructor(props: ComponentProps) {
            super(props);
            this.state = {
                value: props.value,
            };
        }

        public componentDidMount() {
            this.formApi.registerComponent(this.props.name, this);
        }

        public componentWillUnmount() {
            this.formApi.unregisterComponent(this.props.name);
        }

        public validate = () => {
            this.setState({
                validation: this.getValidation(),
            });
        };

        public isValid = (): boolean => {
            return this.getValidation().context === ValidationContext.Success;
        };

        public render() {
            const { validation } = this.state;
            const message =
                this.props.validationMessage ||
                (validation ? validation.message : undefined);
            const context =
                this.props.validationContext ||
                (validation ? validation.context : undefined);

            const {
                // Omit these
                validationGroup,
                validationMessages,
                validationRules,
                ...restProps
            } = this.props as any;

            return (
                <FormContext.Consumer>
                    {(api: FormApi) => {
                        this.formApi = api;
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

        getValidation = (value: any = this.state.value): ValidationResponse => {
            const { name, required } = this.props;
            return this.formApi.getValidation(name, value, required);
        };

        setValue = (value: any) => {
            const { name } = this.props;
            console.log(`Wrapped component: "${name}" changed to "${value}"`);
            this.setState(
                {
                    value,
                    validation: this.getValidation(value),
                },
                () => {
                    this.formApi.handleChange(name, value);
                },
            );
        };

        handleBlur = (event?: React.FocusEvent<any>): void => {
            const { name } = this.props;
            const { value } = this.state;
            console.log(`Wrapped component: "${name}" blurred with "${value}"`);
            this.formApi.handleBlur(name, value);
            this.props.onBlur(event);
        };

        handleFocus = (event?: React.FocusEvent<any>): void => {
            const { name } = this.props;
            const { value } = this.state;
            console.log(`Wrapped component: "${name}" focused with "${value}"`);
            this.formApi.handleFocus(name, value);
            this.props.onFocus(event);
        };
    };
}
