import * as React from 'react';

import {
    ValidatorData,
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
    update: () => Promise<void>;
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

        // public constructor(props: ComponentProps) {
        //     super(props);
        //     this.getResponse = this.getResponse.bind(this);
        //     this.isInsideForm = this.isInsideForm.bind(this);
        // }

        public componentDidMount() {
            if (this.isInsideForm()) {
                this.formApi.onComponentMount(this.props.name, this);
            } else {
                console.error(
                    'Bound form components must be placed inside of a <Form/> component.',
                );
            }
        }

        public componentWillUnmount() {
            if (this.isInsideForm()) {
                this.formApi.onComponentUnmount(this.props.name);
            }
        }

        public componentDidUpdate() {
            if (this.isInsideForm()) {
                this.formApi.onComponentUpdate(this.props.name);
            }
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

                        const value = this.isInsideForm()
                            ? this.getValue()
                            : null;
                        const isPristine = this.isInsideForm()
                            ? this.isPristine()
                            : true;
                        const validatorData = this.isInsideForm()
                            ? this.getValidatorData()
                            : undefined;

                        console.log(
                            'BoundComponentInstance render called:',
                            this.props.name,
                            validatorData,
                        );
                        return (
                            <WrappedComponent
                                {...restProps}
                                value={value}
                                pristine={isPristine}
                                validatorData={validatorData}
                                setValue={this.setValue}
                                onBlur={this.UNSAFE_handleBlur}
                                onFocus={this.UNSAFE_handleFocus}
                            />
                        );
                    }}
                </FormContext.Consumer>
            );
        }

        //#region Public functions
        clear = () => {
            if (this.isInsideForm()) {
                return this.formApi.clear(this.props.name);
            }
            throw `Failed to clear "${this.props.name}", not inside form.`;
        };

        reset = () => {
            if (this.isInsideForm()) {
                return this.formApi.reset(this.props.name);
            }
            throw `Failed to reset "${this.props.name}", not inside form.`;
        };

        validate = () => {
            if (this.isInsideForm()) {
                return this.formApi.validate(this.props.name);
            }
            throw `Failed to validate "${this.props.name}", not inside form.`;
        };

        isValid = () => {
            if (this.isInsideForm()) {
                return this.formApi.isValid(this.props.name);
            }
            throw `Failed to determine if "${
                this.props.name
            }" is valid, not inside form.`;
        };

        isPristine = () => {
            if (this.isInsideForm()) {
                return this.formApi.isPristine(this.props.name);
            }
            throw `Failed to determine if "${
                this.props.name
            }" is pristine, not inside form.`;
        };

        setValidatorData = (data: ValidatorData): Promise<void> => {
            if (this.isInsideForm()) {
                return this.formApi.setValidatorData(this.props.name, data);
            }
            throw `Failed to set set validator data for "${
                this.props.name
            }", not inside form.`;
        };

        getValidatorData = () => {
            if (this.isInsideForm()) {
                return this.formApi.getValidatorData(
                    this.props.name,
                    this.props,
                );
            }
            throw `Failed to get validator data for "${
                this.props.name
            }", not inside form.`;
        };

        getValue = () => {
            if (this.isInsideForm()) {
                return this.formApi.getValue(this.props.name, this.props);
            }
            throw `Failed to get value for "${
                this.props.name
            }", not inside form.`;
        };

        setValue = async (value: any) => {
            if (this.isInsideForm()) {
                return this.formApi.setValue(this.props.name, value);
            }
            throw `Failed to set value for "${
                this.props.name
            }", not inside form.`;
        };
        //#endregion

        //#region Private functions
        // tslint:disable-next-line:variable-name
        UNSAFE_handleBlur = async (event?: React.FocusEvent<any>) => {
            if (this.isInsideForm()) {
                await this.formApi.onComponentBlur(this.props.name, event);
                return this.props.onBlur(event);
            }
            throw `Failed to handle blur for "${
                this.props.name
            }", not inside form.`;
        };

        // tslint:disable-next-line:variable-name
        UNSAFE_handleFocus = async (event?: React.FocusEvent<any>) => {
            if (this.isInsideForm()) {
                await this.formApi.onComponentFocus(this.props.name, event);
                return this.props.onFocus(event);
            }
            throw `Failed to handle focus for "${
                this.props.name
            }", not inside form.`;
        };

        update = (): Promise<void> => {
            return new Promise(resolve => {
                this.forceUpdate(resolve);
            });
        };

        isInsideForm(): boolean {
            return !!this.formApi;
        }
        //#endregion
    };
}
