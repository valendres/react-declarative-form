import * as React from 'react';
import { shallowEqual } from 'shallow-equal-object';

import {
    ValidatorData,
    ValidatorRules,
    ValidatorMessageGenerator,
} from '../../types';
import { FormContext, FormApi } from '../Form';
import { OutsideFormError } from '../../errors';

export interface BoundComponentCommonProps {
    /** Unique form component identifier */
    name: string;

    /** Whether or not a value is required */
    required?: boolean;

    /** Whether or not the value has been modified */
    pristine?: boolean;

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
    validatorRules?: ValidatorRules;
    validatorMessages?: {
        [ruleKey: string]: string | ValidatorMessageGenerator;
    };
    validatorTrigger?: string | string[];
    defaultValue?: any;
}

export type BoundComponentProps = BoundComponentInjectedProps &
    BoundComponentCommonProps &
    BoundComponentHOCProps;

export interface BoundComponentInstance {
    props: BoundComponentProps;
    clear: () => Promise<void[]>;
    reset: () => Promise<void[]>;
    validate: () => Promise<void[]>;
    isValid: () => boolean;
    isPristine: () => boolean;
    getValidatorData: () => ValidatorData;
    getValue: () => any;
    setValidatorData: (data: ValidatorData) => Promise<void>;
    setValue: (value: any) => Promise<void>;
    forceUpdate: (callback: () => void) => void;
}

export function bind<ComponentProps extends BoundComponentProps>(
    WrappedComponent: React.ComponentClass<ComponentProps>,
) {
    return class BoundComponent extends React.Component<ComponentProps>
        implements BoundComponentInstance {
        formApi: FormApi;

        // tslint:disable-next-line:variable-name
        _state?: {
            value?: any;
            pristine?: boolean;
            validatorData?: ValidatorData;
        };

        static defaultProps: Partial<BoundComponentProps> = {
            onBlur: () => {},
            onFocus: () => {},
        };

        public componentDidMount() {
            const { name } = this.props;
            if (!this.formApi) {
                console.error(
                    `Bound "${name}" form component must be a descendant of a <Form/>.`,
                );
                return;
            }
            this.formApi.onComponentMount(name, this);
        }

        public componentWillUnmount() {
            const { name } = this.props;
            return this.formApi && this.formApi.onComponentUnmount(name);
        }

        public componentDidUpdate() {
            const { name } = this.props;
            return this.formApi && this.formApi.onComponentUpdate(name);
        }

        public shouldComponentUpdate() {
            const prevState = this._state;
            const nextState = this._getState();
            return (
                prevState.value !== nextState.value ||
                prevState.pristine !== nextState.pristine ||
                !shallowEqual(prevState.validatorData, nextState.validatorData)
            );
        }

        public render() {
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
                        this._state = this._getState();

                        return (
                            <WrappedComponent
                                {...restProps}
                                value={this._state.value}
                                pristine={this._state.pristine}
                                validatorData={this._state.validatorData}
                                setValue={this.setValue}
                                onBlur={this._handleBlur}
                                onFocus={this._handleFocus}
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
            if (!this.formApi) {
                throw new OutsideFormError(`clear "${name}"`);
            }
            return this.formApi.clear(name);
        };

        /**
         * Resets the component by unsetting its value, validator and pristine state.
         * @returns a promise which is resolved once the react component has been re-rendered
         */
        reset = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`reset "${name}"`);
            }
            return this.formApi.reset(name);
        };

        /**
         * Validates the component by executing the validator and updating the component
         * to reflect its new validator state. If no component names are provided,
         * @returns a promise which is resolved once the react component has been re-rendered.
         */
        validate = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`validate "${name}"`);
            }
            return this.formApi.validate(name);
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
            if (!this.formApi) {
                throw new OutsideFormError(`determine if "${name}" is valid`);
            }
            return this.formApi.isValid(name);
        };

        /**
         * Determines if the component is pristine - the component has not been modified
         * by the user or by programatically calling setValue.
         * @returns a boolean flag to indicate whether the component is pristine
         */
        isPristine = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(
                    `determine if "${name}" is pristine`,
                );
            }
            return this.formApi.isPristine(name);
        };
        //#endregion

        //#region Public getters
        /**
         * Returns the components current validatorData. There are 2 ways a components
         * validator data can be retrieved (in order of precedence):
         *  1. externally managed validatorData prop provided to the component
         *  2. internally managed validatorData when the user changes input
         *
         * **Note**: If the component has no validatorData, then an object with undefined
         * context & message will be returned.
         *
         * @returns component validator data
         */
        getValidatorData = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`get validator data for "${name}"`);
            }
            return this.formApi.getValidatorData(name, this.props);
        };

        /**
         * Returns the value of the component. There are four ways a component value
         * can be provied (in order of precedence):
         *  1. externally managed value prop provided to the component
         *  2. internally managed state value when the user changes input
         *  3. value provided to initialValues prop on form component
         *  4. default value specified on individual form component
         *
         * **Note**: the form values should not be mutated
         *
         * @returns component value
         */
        getValue = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`get value for "${name}"`);
            }
            return this.formApi.getValue(name, this.props);
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
            if (!this.formApi) {
                throw new OutsideFormError(`set validator data for "${name}"`);
            }
            return this.formApi.setValidatorData(name, data);
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
            if (!this.formApi) {
                throw new OutsideFormError(`set value for "${name}"`);
            }
            return this.formApi.setValue(name, value, pristine);
        };
        //#endregion

        //#region Private event handlers
        // tslint:disable:variable-name
        _handleBlur = async (event?: React.FocusEvent<any>) => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`handle blur for "${name}"`);
            }

            await this.formApi.onComponentBlur(name, event);
            return this.props.onBlur(event);
        };

        _handleFocus = async (event?: React.FocusEvent<any>) => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`handle focus for "${name}"`);
            }

            await this.formApi.onComponentFocus(name, event);
            return this.props.onFocus(event);
        };

        _getState = () => {
            const value = this.formApi ? this.getValue() : null;
            const pristine = this.formApi ? this.isPristine() : true;
            const validatorData = this.formApi
                ? this.getValidatorData()
                : undefined;

            return {
                value,
                pristine,
                validatorData,
            };
        };
        // tslint:enable:variable-name
        //#endregion
    };
}
