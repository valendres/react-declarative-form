import React from 'react';
import { shallowEqual } from 'shallow-equal-object';
import deepEqual from 'fast-deep-equal';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

import {
    ValidatorData,
    ValidatorRules,
    ValidatorMessageGenerator,
    Omit,
} from '../../types';
import { FormContext, FormApi } from '../Form';
import { OutsideFormError } from '../../errors';
const hoistNonReactStatics = require('hoist-non-react-statics');

export interface BoundComponentCommonProps {
    /** Unique form component identifier */
    name: string;

    /** Whether or not a value is required */
    required?: boolean;

    /** Whether or not the value has been modified */
    pristine?: boolean;

    /** Data which reflects the current validator state for the component. */
    validatorData?: ValidatorData;

    /** Current form component value */
    value?: any;

    /** Should be called when component has been blurred */
    onBlur?: React.EventHandler<any>;

    /** Should be called when component has been focused */
    onFocus?: React.EventHandler<any>;
}

export interface BoundComponentInjectedProps {
    /** Should be called when component value has changed */
    setValue?: (value: any) => Promise<void>;
}

/** Props used by the HOC only. They are not passed to the wrapped component. */
export interface BoundComponentHOCProps {
    /** Validation rules which should be applied to the component */
    validatorRules?: ValidatorRules;

    /**  Custom validator messages for specific validator rules */
    validatorMessages?: {
        [ruleKey: string]: string | ValidatorMessageGenerator;
    };

    /** Triggers validator to execute on the specified component names when this component is modified */
    validatorTrigger?: string | string[];

    /** Default value to be applied if the component does not have a managed, state or initial value */
    defaultValue?: any;
}

export type BoundComponentProps = BoundComponentInjectedProps &
    BoundComponentCommonProps &
    BoundComponentHOCProps;

/**
 * Derived form component state from the nearest Form ancestor. This state data is
 * used instead of `this.state` & `this.setState` to avoid unnecessary renders and
 * duplicate component state, as the Form should always be the source of truth.
 */
export interface BoundComponentDerivedState {
    pristine?: boolean;
    validatorData?: ValidatorData;
    value?: any;
}

export interface BoundComponent extends React.Component<BoundComponentProps> {
    clear: () => Promise<void[]>;
    reset: () => Promise<void[]>;
    validate: () => Promise<void[]>;
    isValid: () => boolean;
    isPristine: () => boolean;
    getValidatorData: () => ValidatorData;
    getValue: () => any;
    setValidatorData: (data: ValidatorData) => Promise<void>;
    setValue: (value: any) => Promise<void>;
}

export function bind<
    WrappedComponentProps extends BoundComponentProps,
    WrappedComponentStatics = {}
>(
    WrappedComponent: React.ComponentClass<WrappedComponentProps>,
): WrappedComponentStatics & {
    /**
     * Use explicit type for React.Component ref to allow consumers to pass a
     * React.RefObject<BoundComponentInstance>` to ref prop of their connected
     * component. Without explicitly typing this, the inferred type will be wrong.
     *
     * The custom ref prop is injected here instead of in the `ComponentProps`
     * interface so that consumers are able to provide a RefObject, but they're
     * not able to use it in their wrapped component.
     */
    new (props: WrappedComponentProps): Omit<
        React.Component<WrappedComponentProps>,
        'props'
    > & {
        props: WrappedComponentProps & {
            ref?: React.RefObject<BoundComponent>;
            unboundRef?: React.RefObject<any>;
        };
    };
} {
    class BoundComponent
        extends React.Component<
            WrappedComponentProps & {
                unboundRef?: React.RefObject<
                    React.ComponentClass<WrappedComponentProps>
                >;
            }
        >
        implements BoundComponent {
        //#region Private variables
        // tslint:disable:variable-name
        /**
         * Reference to the nearest Form ancestor provided via the context API
         */
        _formApi: FormApi;

        /**
         * Cached output from the most recent `this._getState()` call.
         */
        _state?: BoundComponentDerivedState;
        // tslint:enable:variable-name
        //#endregion

        static defaultProps: Partial<BoundComponentProps> = {
            onBlur: () => {},
            onFocus: () => {},
        };

        public componentDidMount() {
            const { name } = this.props;
            if (!this._formApi) {
                console.error(
                    `Bound "${name}" form component must be a descendant of a <Form/>.`,
                );
                return;
            }
            this._formApi.onComponentMount(name, this);
        }

        public componentWillUnmount() {
            const { name } = this.props;
            return this._formApi && this._formApi.onComponentUnmount(name);
        }

        public componentDidUpdate() {
            const { name } = this.props;
            return this._formApi && this._formApi.onComponentUpdate(name);
        }

        public shouldComponentUpdate(nextProps: WrappedComponentProps) {
            const prevProps = this.props;
            const prevState = this._state;
            const nextState = this._getState();

            const validatorObjectKeys: (keyof WrappedComponentProps)[] = [
                'validatorData',
                'validatorRules',
                'validatorMessages',
            ];

            const propsChanged =
                !shallowEqual(
                    omit(prevProps, validatorObjectKeys),
                    omit(nextProps, validatorObjectKeys),
                ) ||
                !deepEqual(
                    pick(prevProps, validatorObjectKeys),
                    pick(prevProps, validatorObjectKeys),
                );

            const stateChanged = prevState !== nextState;
            return propsChanged || stateChanged;
        }

        public render() {
            const {
                // Omit these
                validatorRules,
                validatorMessages,
                validatorTrigger,
                unboundRef,
                ...restProps
            } = this.props as any;

            return (
                <FormContext.Consumer>
                    {(api: FormApi) => {
                        this._formApi = api;
                        const {
                            value,
                            pristine,
                            validatorData,
                        } = this._getState();

                        return (
                            <WrappedComponent
                                {...restProps}
                                value={value}
                                pristine={pristine}
                                validatorData={validatorData}
                                setValue={this.setValue}
                                onBlur={this._handleBlur}
                                onFocus={this._handleFocus}
                                ref={unboundRef}
                            />
                        );
                    }}
                </FormContext.Consumer>
            );
        }

        //#region Public commands
        /**
         * Clears the scomponent by setting its value to null.
         * @returns a promise which is resolved once the react component has been re-rendered
         */
        clear = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`clear "${name}"`);
            }
            return this._formApi.clear(name);
        };

        /**
         * Resets the component by unsetting its value, validator and pristine state.
         * @returns a promise which is resolved once the react component has been re-rendered
         */
        reset = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`reset "${name}"`);
            }
            return this._formApi.reset(name);
        };

        /**
         * Validates the component by executing the validator and updating the component
         * to reflect its new validator state. If no component names are provided,
         * @returns a promise which is resolved once the react component has been re-rendered.
         */
        validate = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`validate "${name}"`);
            }
            return this._formApi.validate(name);
        };
        //#endregion

        //#region Public evaluators
        /**
         * Determines if the component is valid by executing the validator using the
         * components current value.
         * @returns a boolean flag to indicate whether the component is valid
         */
        isValid = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`determine if "${name}" is valid`);
            }
            return this._formApi.isValid(name);
        };

        /**
         * Determines if the component is pristine - the component has not been modified
         * by the user or by programatically calling setValue.
         * @returns a boolean flag to indicate whether the component is pristine
         */
        isPristine = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(
                    `determine if "${name}" is pristine`,
                );
            }
            return this._formApi.isPristine(name);
        };
        //#endregion

        //#region Public getters
        /**
         * Returns the components current validatorData. There are 2 ways a components
         * validator data can be retrieved (in order of precedence):
         *  1. *externally managed validatorData* prop provided to the component
         *  2. *internally managed validatorData* state when the user changes input
         *
         * **Note**: If the component has no validatorData, then an object with undefined
         * context & message will be returned.
         *
         * @returns component validator data
         */
        getValidatorData = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`get validator data for "${name}"`);
            }
            return this._formApi.getValidatorData(name, this.props);
        };

        /**
         * Returns the value of the component. There are four ways a component value
         * can be provied (in order of precedence):
         *  1. *externally managed* value prop provided to the component
         *  2. *internally managed* state value when the user changes input
         *  3. *initialValues* provided to the form component
         *  4. *defaultValue* specified on individual form component
         *
         * **Note**: the form values should not be mutated
         *
         * @returns component value
         */
        getValue = () => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`get value for "${name}"`);
            }
            return this._formApi.getValue(name, this.props);
        };
        //#endregion

        //#region Public setters
        /**
         * Sets the component internally managed validatorData & updates the component
         * to reflect its new state.
         * @param {object} validatorData the new validator data to be stored in Form state
         * @returns a promise which is resolved once the react component has been re-rendered.
         */
        setValidatorData = async (data: ValidatorData): Promise<void> => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`set validator data for "${name}"`);
            }
            return this._formApi.setValidatorData(name, data);
        };

        /**
         * Sets the component internally managed state value & updates the component
         * validatorData using the provided value. By default, the components pristine state
         * will be set to `false` to indicate that the component has been modified.
         * @param {any} value the new value to be stored in Form state
         * @param {boolean} pristine the new pristine state when setting this value (default: false).
         * @returns a promise which is resolved once the react component has been re-rendered.
         */
        setValue = async (value: any, pristine?: boolean) => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`set value for "${name}"`);
            }
            return this._formApi.setValue(name, value, pristine);
        };
        //#endregion

        //#region Private functions
        // tslint:disable:variable-name
        _handleBlur = async (event?: React.FocusEvent<any>) => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`handle blur for "${name}"`);
            }

            await this._formApi.onComponentBlur(name, event);
            return this.props.onBlur(event);
        };

        _handleFocus = async (event?: React.FocusEvent<any>) => {
            const { name } = this.props;
            if (!this._formApi) {
                throw new OutsideFormError(`handle focus for "${name}"`);
            }

            await this._formApi.onComponentFocus(name, event);
            return this.props.onFocus(event);
        };

        /**
         * Retrieves the components derived state from the nearest form Ancestor. The
         * output is cached in between calls as `this._state`. If the object is shallow
         * equal to the previously calculated value, it will be returned instead.
         */
        _getState = (): BoundComponentDerivedState => {
            const prevState = this._state || {};
            const nextState = {
                pristine: this._formApi ? this.isPristine() : true,
                value: this._formApi ? this.getValue() : null,
                validatorData: this._formApi
                    ? this.getValidatorData()
                    : undefined,
            };

            // Cache next state if value has changed
            if (
                prevState.value !== nextState.value ||
                prevState.pristine !== nextState.pristine ||
                !shallowEqual(prevState.validatorData, nextState.validatorData)
            ) {
                this._state = nextState;
            }

            return this._state;
        };
        // tslint:enable:variable-name
        //#endregion
    }

    return hoistNonReactStatics(BoundComponent, WrappedComponent);
}
