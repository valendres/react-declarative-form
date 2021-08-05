import * as React from 'react';
import {
    Form,
    FormContext,
    FormApi,
    FormComponentState,
    FormProps,
} from '../Form';
import { ValidatorData } from '../../types';
import { BoundComponent, BoundComponentProps } from '../bind';
import { OutsideFormError } from '../../errors';
import { isCallable } from '../../utils';

export type NestedFormChildrenRenderFunc = (renderProps: {
    validatorData: ValidatorData;
}) => React.ReactNode;

export interface NestedFormProps extends BoundComponentProps {
    name: string;
    children: React.ReactNode | NestedFormChildrenRenderFunc;
    valueTransformer?: FormProps<any>['valuesTransformer'];
}

export class NestedForm extends React.Component<NestedFormProps>
    implements BoundComponent {
    //#region Private variables
    // tslint:disable:variable-name
    /**
     * Reference to the nearest Form ancestor provided via the context API
     */
    _parentFormApi: FormApi;

    /**
     * Reference to the wrapped Form
     */
    _wrappedFormRef: React.RefObject<Form<any>> = React.createRef();
    // tslint:enable:variable-name
    //#endregion

    public componentDidMount() {
        this.logCall('componentDidMount');
        const { name } = this.props;
        if (!this._parentFormApi) {
            console.error(
                `NestedForm "${name}" form component must be a descendant of a <Form/>.`,
            );
            return;
        }
        this._parentFormApi.onComponentMount(name, this);
    }

    public componentWillUnmount() {
        this.logCall('componentWillUnmount');
        const { name } = this.props;
        return (
            this._parentFormApi && this._parentFormApi.onComponentUnmount(name)
        );
    }

    renderChildren(children: NestedFormProps['children']) {
        if (isCallable(children)) {
            const validatorData = this.getValidatorData();
            return (children as NestedFormChildrenRenderFunc)({
                validatorData,
            });
        }
        return children;
    }

    render() {
        this.logCall('render');
        const { name, children, valueTransformer } = this.props;
        return (
            <FormContext.Consumer>
                {(api: FormApi) => {
                    this._parentFormApi = api;
                    return (
                        <Form
                            ref={this._wrappedFormRef}
                            onChange={this._handleChange}
                            onBlur={this._handleBlur}
                            onFocus={this._handleFocus}
                            onUpdate={this._handleUpdate}
                            valuesTransformer={valueTransformer}
                            initialValues={api?.initialValues[name]}
                            debug={api?.debug}
                            virtual
                        >
                            {this.renderChildren(children)}
                        </Form>
                    );
                }}
            </FormContext.Consumer>
        );
    }

    clear: BoundComponent['clear'] = async () => {
        this.logCall('clear');
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`handle clear for "${name}"`);
        }

        await this._wrappedFormRef.current.clear();
        await this._parentFormApi.onComponentUpdate(name);
    };

    reset: BoundComponent['reset'] = async () => {
        this.logCall('reset');
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`handle reset for "${name}"`);
        }

        await this._wrappedFormRef.current.reset();
        await this._parentFormApi.onComponentUpdate(name);
    };

    validate: BoundComponent['validate'] = async () => {
        this.logCall('validate');
        await this._wrappedFormRef.current.validate();
    };

    isValid: BoundComponent['isValid'] = () => {
        return this._wrappedFormRef.current.isValid();
    };

    isPristine: BoundComponent['isPristine'] = () => {
        return this._wrappedFormRef.current.isPristine();
    };

    getValue: BoundComponent['getValue'] = () => {
        return this._wrappedFormRef.current.getValues();
    };

    setValue: BoundComponent['setValue'] = async (value, pristine) => {
        this.logCall('setValue', { value, pristine });
        await this._wrappedFormRef.current.setValues(
            this._transformValue(value),
            pristine,
        );
        return undefined;
    };

    getValidatorData: BoundComponent['getValidatorData'] = () => {
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`get validator data for for "${name}"`);
        }

        return this._parentFormApi.getValidatorData(name, this.props);
    };

    setValidatorData: BoundComponent['setValidatorData'] = (validatorData) => {
        this.logCall('setValidatorData', { validatorData });
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`set validator data for for "${name}"`);
        }

        return this._parentFormApi.setValidatorData(name, validatorData);
    };

    //#region Private functions
    // tslint:disable:variable-name
    _handleChange = async (componentName: string, value: any) => {
        this.logCall('_handleChange', { componentName, value });
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle change for "${name}:${componentName}"`,
            );
        }

        await this._parentFormApi.setValue(name, {
            ...this._wrappedFormRef.current.getValues(),
            [componentName]: value,
        });
        await this._parentFormApi.onComponentUpdate(name);
    };

    _handleBlur = (componentName: string, event: any) => {
        this.logCall('_handleBlur', { componentName, event });
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle blur for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentBlur(name, event);
    };

    _handleFocus = (componentName: string, event: any) => {
        this.logCall('_handleFocus', { componentName, event });
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle focus for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentFocus(name, event);
    };

    _handleUpdate = (componentName: string) => {
        this.logCall('_handleUpdate', { componentName });
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle update for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentUpdate(name);
    };

    _update = async (componentState: FormComponentState) => {
        this.logCall('_update', { componentState });
        const { value, pristine } = componentState;
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`get validator data for "${name}"`);
        }

        await this._wrappedFormRef.current.setValues(
            this._transformValue(value),
            pristine,
            true,
        );

        // TODO: trigger the component to render if the validatorDate changes
        await new Promise((resolve) => {
            this.forceUpdate(resolve);
        });
    };

    _isRecursive = () => {
        return true;
    };

    /**
     * If we're setting the value to undefined or null, we need to map
     * the new value to each nested form component. Otherwise, providing
     * this value to setValues will have no impact.
     */
    _transformValue = (value: any) => {
        return value === null || value === undefined
            ? (this._wrappedFormRef.current as any).getComponentNames().reduce(
                  (values: any, key: string) => ({
                      ...values,
                      [key]: value,
                  }),
                  {},
              )
            : value;
    };
    // tslint:enable:variable-name
    //#endregion

    logCall = (
        functionName: string,
        args?: {
            [argName: string]: any;
        },
    ) => {
        if (!this._parentFormApi || !this._parentFormApi.debug) {
            return;
        }
        const logPrefix = `🟧 NestedForm['${this.props.name}'].${functionName}`;

        if (args) {
            console.debug(`${logPrefix}:`, args);
        } else {
            console.debug(logPrefix);
        }
    };
}
