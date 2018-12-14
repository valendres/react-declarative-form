import * as React from 'react';
import { shallowEqual } from 'shallow-equal-object';

import {
    ValidatorResponse,
    ValidatorContext,
    ValidatorRules,
    ValidatorMessageGenerator,
} from '../../types';
import { FormContext, FormApi } from '../Form';

export interface BoundComponentCommonProps {
    /** Unique form component identifier */
    name: string;

    /** Whether or not a value is required */
    required?: boolean;

    /** Whether or not the value has been modified */
    pristine?: boolean;

    /** Validator message to be displayed as help text */
    validatorMessage?: string;

    /** Validator context: danger, warning, success */
    validatorContext?: ValidatorContext;

    /** Should be called when component has been blurred */
    onBlur?: React.EventHandler<any>;

    /** Should be called when component has been focused */
    onFocus?: React.EventHandler<any>;

    /** Current form component value */
    value?: any;
}

export interface BoundComponentInternalProps extends BoundComponentCommonProps {
    /** Should be called when component value has changed */
    setValue?: (value: any) => void;
}

/**
 * These props are only used by the HOC and are not passed to the wrapped component.
 */
export interface BoundComponentHOCProps extends BoundComponentInternalProps {
    validatorRules?: ValidatorRules;
    validatorMessages?: {
        [ruleKey: string]: string | ValidatorMessageGenerator;
    };
    validatorTrigger?: string | string[];
    defaultValue?: any;
}

export type BoundComponentProps = BoundComponentInternalProps &
    BoundComponentHOCProps;

export interface BoundComponentInstance {
    clear: () => void;
    reset: () => void;
    validate: () => void;
    isValid: () => boolean;
    setResponse: (response: ValidatorResponse) => Promise<void>;
    getValue: () => any;
    setValue: (value: any) => Promise<void>;
    getValidatorRules: () => BoundComponentHOCProps['validatorRules'];
    getValidatorMessages: () => BoundComponentHOCProps['validatorMessages'];
    getValidatorTriggers: () => string[];
}

export interface BoundComponentState {
    pristine: boolean;
    value?: any;
    response?: ValidatorResponse;
}

export function bind<ComponentProps extends BoundComponentProps>(
    WrappedComponent: React.ComponentClass<ComponentProps>,
) {
    return class BoundComponent
        extends React.Component<
            ComponentProps & BoundComponentProps,
            BoundComponentState
        >
        implements BoundComponentInstance {
        formApi: FormApi;

        static defaultProps: Partial<BoundComponentProps> = {
            onBlur: () => {},
            onFocus: () => {},
        };

        public constructor(props: ComponentProps) {
            super(props);
            this.state = {
                pristine: true,
            };
            this.getResponse = this.getResponse.bind(this);
            this.isInsideForm = this.isInsideForm.bind(this);
        }

        public componentDidMount() {
            if (this.isInsideForm()) {
                this.formApi.registerComponent(this.props.name, this);
                this.formApi.onMount(this.props.name);
            } else {
                console.error(
                    'Bound form components must be placed inside of a <Form/> component.',
                );
            }
        }

        public componentWillUnmount() {
            if (this.isInsideForm()) {
                this.formApi.unregisterComponent(this.props.name);
            }
        }

        public componentDidUpdate() {
            const { pristine, response: prevResponse } = this.state;

            if (this.isInsideForm()) {
                // Notify form of when this component has been updated, this
                // allows for any attached mirrors to reflect this components value.
                this.formApi.onUpdate(this.props.name);
            }

            // Only update state if necessary to prevent setState loops
            if (!pristine) {
                const nextResponse = this.getResponse();
                if (!shallowEqual(prevResponse, nextResponse)) {
                    this.setState({
                        response: nextResponse,
                    });
                }
            }
        }

        public shouldComponentUpdate(
            nextProps: ComponentProps & BoundComponentProps,
            nextState: BoundComponentState,
        ) {
            const propsChanged = !shallowEqual(this.props, nextProps);
            const stateChanged =
                this.state.pristine !== nextState.pristine ||
                this.state.value !== nextState.value ||
                !shallowEqual(this.state.response, nextState.response);

            return propsChanged || stateChanged;
        }

        public clear = (): void => {
            const { value } = this.props;
            this.setState({
                value: value || undefined,
                response: undefined,
                pristine: true,
            });
        };

        public reset = (): void => {
            const { value } = this.props;
            this.setState({
                value,
                response: undefined,
                pristine: true,
            });
        };

        public validate = () => {
            this.setState({
                response: this.getResponse(),
                pristine: false,
            });
        };

        public isValid = (): boolean => {
            const response = this.getResponse();

            const consumerValid = this.props.validatorContext
                ? this.props.validatorContext !== ValidatorContext.Danger
                : true;
            const computedValid = response
                ? response.context === ValidatorContext.Success
                : true;

            return consumerValid && computedValid;
        };

        public setResponse = (response: ValidatorResponse): Promise<void> =>
            new Promise(resolve => {
                this.setState(
                    {
                        response,
                    },
                    resolve,
                );
            });

        public render() {
            const { response } = this.state;
            const message =
                this.props.validatorMessage ||
                (response ? response.message : undefined);
            const context =
                this.props.validatorContext ||
                (response ? response.context : undefined);
            const pristine =
                'pristine' in this.props
                    ? this.props.pristine
                    : this.state.pristine;

            const {
                // Omit these
                validatorRules,
                validatorMessages,
                validatorTrigger,
                ...restProps
            } = this.props as any;

            return (
                <FormContext.Consumer>
                    {(api: FormApi) => {
                        this.formApi = api;
                        return (
                            <WrappedComponent
                                {...restProps}
                                value={this.getValue()}
                                pristine={pristine}
                                validatorMessage={message}
                                validatorContext={context}
                                setValue={this.setValue}
                                onBlur={this.handleBlur}
                                onFocus={this.handleFocus}
                            />
                        );
                    }}
                </FormContext.Consumer>
            );
        }

        getResponse(value: any = this.state.value): ValidatorResponse {
            const { name, required } = this.props;
            if (this.isInsideForm()) {
                return this.formApi.getResponse(name, value, required);
            }
            return undefined;
        }

        getValidatorMessages = () => {
            return this.props.validatorMessages;
        };

        getValidatorRules = () => {
            return this.props.validatorRules;
        };

        getValidatorTriggers = () => {
            const { validatorTrigger } = this.props;
            return Array.isArray(validatorTrigger)
                ? validatorTrigger
                : validatorTrigger !== undefined
                    ? [validatorTrigger]
                    : [];
        };

        /**
         * Determines the value to be provided to the wrapped component. There are 4 ways a
         * component value can be provied (in order of precedence):
         *  1. externally managed value prop provided to the component
         *  2. internally managed value when the user changes input
         *  3. value provided to initialValues prop on form component
         *  4. default value specified on individual form component
         *
         * Note: the form values should not be mutated
         */
        getValue = () => {
            const { name, defaultValue, value } = this.props;
            const stateValue = this.state.value;
            const initialValue = this.isInsideForm()
                ? this.formApi.getInitialValue(name)
                : undefined;

            const dynamicValue = [
                value,
                stateValue,
                initialValue,
                defaultValue,
            ].find(v => v !== undefined);

            return dynamicValue instanceof Object
                ? Object.freeze(dynamicValue)
                : dynamicValue;
        };

        setValue = (value: any): Promise<void> =>
            new Promise(resolve => {
                this.setState(
                    {
                        value,
                        pristine: false,
                        // Use cache response if value has not changed
                        response:
                            this.state.value !== value
                                ? this.getResponse(value)
                                : this.state.response,
                    },
                    resolve,
                );
                if (this.isInsideForm()) {
                    this.formApi.onChange(this.props.name, value);
                }
            });

        handleBlur = (event?: React.FocusEvent<any>): void => {
            if (this.isInsideForm()) {
                this.formApi.onBlur(this.props.name);
            }
            this.props.onBlur(event);
        };

        handleFocus = (event?: React.FocusEvent<any>): void => {
            if (this.isInsideForm()) {
                this.formApi.onFocus(this.props.name);
            }
            this.props.onFocus(event);
        };

        isInsideForm(): boolean {
            return !!this.formApi;
        }
    };
}
