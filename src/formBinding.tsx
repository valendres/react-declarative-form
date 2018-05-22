import * as React from 'react';
import { FormContext, FormApi } from './Form';
import {
    ValidationResponse,
    ValidationContext,
    ValidationRules,
    ValidationMessageGenerator,
} from './types';

export interface BoundComponentCommonProps {
    /** Unique form component identifier */
    name: string;

    /** Whether or not a value is required */
    required?: boolean;

    /** Whether or not the value has been modified */
    pristine?: boolean;

    /** Validation message to be displayed as help text */
    validationMessage?: string;

    /** Validation context: danger, warning, success */
    validationContext?: ValidationContext;

    /** Should be called when component has been blurred */
    onBlur?: React.EventHandler<any>;

    /** Should be called when component has been focused */
    onFocus?: React.EventHandler<any>;

    /** Current form component value */
    value?: any;
}

export interface BoundComponentProps extends BoundComponentCommonProps {
    /** Should be called when component value has changed */
    setValue?: (value: any) => void;
}

/**
 * These props are only used by the HOC and are not passed to the wrapped component.
 */
export interface BoundComponentHOCProps extends BoundComponentProps {
    validationRules?: ValidationRules;
    validationMessages?: {
        [ruleKey: string]: string | ValidationMessageGenerator;
    };
    validationGroup?: string[];
    initialValue?: any;
}

export type BoundComponentAllProps = BoundComponentProps &
    BoundComponentHOCProps;

export interface BoundComponentInstance {
    props: BoundComponentAllProps;
    state: BoundComponentState;
    clear: () => void;
    reset: () => void;
    validate: () => void;
    isValid: () => boolean;
    setValidation: (validation: ValidationResponse) => void;
}

export interface BoundComponentState {
    pristine: boolean;
    value?: any;
    validation?: ValidationResponse;
}
export function bind<ComponentProps extends BoundComponentAllProps>(
    WrappedComponent: React.ComponentClass<ComponentProps>,
) {
    return class BoundComponent
        extends React.Component<
            ComponentProps & BoundComponentAllProps,
            BoundComponentState
        >
        implements BoundComponentInstance {
        formApi: FormApi;

        static defaultProps: Partial<BoundComponentAllProps> = {
            onBlur: () => {},
            onFocus: () => {},
        };

        static getDerivedStateFromProps(
            nextProps: BoundComponentAllProps,
            prevState: BoundComponentState,
        ) {
            return {
                value:
                    nextProps.value !== undefined
                        ? nextProps.value
                        : prevState.value,
            };
        }

        public constructor(props: ComponentProps) {
            super(props);
            this.state = {
                value: props.value || props.initialValue,
                pristine: true,
            };
        }

        public componentDidMount() {
            this.formApi.registerComponent(this.props.name, this);
        }

        public componentWillUnmount() {
            this.formApi.unregisterComponent(this.props.name);
        }

        public clear = (): void => {
            const { value } = this.props;
            this.setState({
                value: value || undefined,
                validation: undefined,
                pristine: true,
            });
        };

        public reset = (): void => {
            const { initialValue, value } = this.props;
            this.setState({
                value: value || initialValue,
                validation: undefined,
                pristine: true,
            });
        };

        public validate = () => {
            this.setState({
                validation: this.getValidation(),
                pristine: false,
            });
        };

        public isValid = (): boolean => {
            const consumerValid = this.props.validationContext
                ? this.props.validationContext !== ValidationContext.Danger
                : true;
            const computedValid =
                this.getValidation().context === ValidationContext.Success;

            return consumerValid && computedValid;
        };

        public setValidation = (validation: ValidationResponse): void => {
            this.setState({
                validation,
            });
        };

        public render() {
            const { validation } = this.state;
            const message =
                this.props.validationMessage ||
                (validation ? validation.message : undefined);
            const context =
                this.props.validationContext ||
                (validation ? validation.context : undefined);
            const pristine =
                'pristine' in this.props
                    ? this.props.pristine
                    : this.state.pristine;

            const {
                // Omit these
                validationRules,
                validationMessages,
                validationGroup,
                initialValue,
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
                                pristine={pristine}
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
            this.setState(
                {
                    value,
                    validation: this.getValidation(value),
                    pristine: false,
                },
                () => {
                    this.formApi.handleChange(this.props.name, value);
                },
            );
        };

        handleBlur = (event?: React.FocusEvent<any>): void => {
            this.formApi.handleBlur(this.props.name, this.state.value);
            this.props.onBlur(event);
        };

        handleFocus = (event?: React.FocusEvent<any>): void => {
            this.formApi.handleFocus(this.props.name, this.state.value);
            this.props.onFocus(event);
        };
    };
}
