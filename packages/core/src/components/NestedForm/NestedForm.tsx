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

export interface NestedFormProps extends BoundComponentProps {
    name: string;
    children:
        | React.ReactNode
        | ((renderProps: { validatorData: ValidatorData }) => React.ReactNode);
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
        const { name } = this.props;
        return (
            this._parentFormApi && this._parentFormApi.onComponentUnmount(name)
        );
    }

    render() {
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
                            initialValues={api?.initialValues[name]}
                            valuesTransformer={valueTransformer}
                            virtual
                        >
                            {isCallable(children)
                                ? (children as Function)({
                                      validatorData: api?.getValidatorData(
                                          name,
                                          this.props,
                                      ),
                                  })
                                : children}
                        </Form>
                    );
                }}
            </FormContext.Consumer>
        );
    }

    clear: BoundComponent['clear'] = async () => {
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`handle clear for "${name}"`);
        }

        await this._wrappedFormRef.current.clear();
        await this._parentFormApi.onComponentUpdate(name);
    };

    reset: BoundComponent['reset'] = async () => {
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(`handle reset for "${name}"`);
        }

        await this._wrappedFormRef.current.reset();
        await this._parentFormApi.onComponentUpdate(name);
    };

    validate: BoundComponent['validate'] = async () => {
        await this._wrappedFormRef.current.validate();
    };

    isValid: BoundComponent['isValid'] = () => {
        return this._wrappedFormRef.current.isValid();
    };

    isPristine: BoundComponent['isPristine'] = () => {
        return this._wrappedFormRef.current.isPristine();
    };

    getValidatorData: BoundComponent['getValidatorData'] = () => {
        return undefined;
    };

    getValue: BoundComponent['getValue'] = () => {
        return this._wrappedFormRef.current.getValues();
    };

    setValidatorData: BoundComponent['setValidatorData'] = () => {
        return Promise.resolve();
    };

    setValue: BoundComponent['setValue'] = async (value, pristine) => {
        await this._wrappedFormRef.current.setValues(
            this._transformValue(value),
            pristine,
        );
        return undefined;
    };

    //#region Private functions
    // tslint:disable:variable-name
    _handleChange = async (componentName: string, value: any) => {
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
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle blur for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentBlur(name, event);
    };

    _handleFocus = (componentName: string, event: any) => {
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle focus for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentFocus(name, event);
    };

    _handleUpdate = (componentName: string) => {
        const { name } = this.props;

        if (!this._parentFormApi) {
            throw new OutsideFormError(
                `handle update for "${name}:${componentName}"`,
            );
        }

        return this._parentFormApi.onComponentUpdate(name);
    };

    _update = async ({ value, pristine }: FormComponentState) => {
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
        return Promise.resolve();
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
}
