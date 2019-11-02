import * as React from 'react';
import { Form, FormContext, FormApi, FormComponentState } from '../Form';
import { BoundComponent } from '../bind';
import { OutsideFormError } from '../../errors';

export interface NestedFormProps {
    name: string;
    children: React.ReactNode;
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
        const { name, children } = this.props;
        return (
            <FormContext.Consumer>
                {(api: FormApi) => {
                    this._parentFormApi = api;
                    const initialValues = api && api.initialValues[name];
                    return (
                        <Form
                            ref={this._wrappedFormRef}
                            onChange={this._handleChange}
                            onBlur={this._handleBlur}
                            onFocus={this._handleFocus}
                            initialValues={initialValues}
                            virtual
                        >
                            {children}
                        </Form>
                    );
                }}
            </FormContext.Consumer>
        );
    }

    clear: BoundComponent['clear'] = () => {
        return this._wrappedFormRef.current.clear();
    };

    reset: BoundComponent['reset'] = () => {
        return this._wrappedFormRef.current.reset();
    };

    validate: BoundComponent['validate'] = () => {
        return this._wrappedFormRef.current.validate();
    };

    isValid: BoundComponent['isValid'] = () => {
        return this._wrappedFormRef.current.isValid();
    };

    isPristine: BoundComponent['isPristine'] = () => {
        return this._wrappedFormRef.current.isPristine();
    };

    getValidatorData: BoundComponent['getValidatorData'] = () => {
        // return this._wrappedFormRef.current.getValidatorData();
        return undefined;
    };

    getValue: BoundComponent['getValue'] = () => {
        return this._wrappedFormRef.current.getValues();
    };

    setValidatorData: BoundComponent['setValidatorData'] = () => {
        // return this._wrappedFormRef.current.setValidatorData();
        return undefined;
    };

    setValue: BoundComponent['setValue'] = async value => {
        await this._wrappedFormRef.current.setValues(
            this._transformValue(value),
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

        return Promise.resolve();
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
