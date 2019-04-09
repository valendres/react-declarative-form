import * as React from 'react';

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
    setValue?: (value: any) => void;
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
                        return (
                            <WrappedComponent
                                {...restProps}
                                value={this.formApi ? this.getValue() : null}
                                pristine={
                                    this.formApi ? this.isPristine() : true
                                }
                                validatorData={
                                    this.formApi
                                        ? this.getValidatorData()
                                        : undefined
                                }
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
        clear = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`clear "${name}"`);
            }
            return this.formApi.clear(name);
        };

        reset = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`reset "${name}"`);
            }
            return this.formApi.reset(name);
        };

        validate = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`validate "${name}"`);
            }
            return this.formApi.validate(name);
        };
        //#endregion

        //#region Public evaluators
        isValid = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`determine if "${name}" is valid`);
            }
            return this.formApi.isValid(name);
        };

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
        getValidatorData = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`get validator data for "${name}"`);
            }
            return this.formApi.getValidatorData(name, this.props);
        };

        getValue = () => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`get value for "${name}"`);
            }
            return this.formApi.getValue(name, this.props);
        };
        //#endregion

        //#region Public setters
        setValidatorData = async (data: ValidatorData): Promise<void> => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`set validator data for "${name}"`);
            }
            return this.formApi.setValidatorData(name, data);
        };

        setValue = async (value: any) => {
            const { name } = this.props;
            if (!this.formApi) {
                throw new OutsideFormError(`set value for "${name}"`);
            }
            return this.formApi.setValue(name, value);
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
        // tslint:enable:variable-name
        //#endregion
    };
}
