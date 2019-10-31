import React from 'react';
import { Form, FormContext, FormApi, FormComponentState } from '../Form';
import { BoundComponent } from '../bind';

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
                    const initialValues = api.getValue(name, {
                        name,
                    });
                    return (
                        <Form
                            ref={this._wrappedFormRef}
                            onChange={this.handleFormChange}
                            onBlur={this.handleComponentBlur}
                            onFocus={this.handleComponentFocus}
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

    setValue: BoundComponent['setValue'] = async values => {
        await this._wrappedFormRef.current.setValues(values);
        return undefined;
    };

    private handleFormChange = (componentName: string, value: any) => {
        this._parentFormApi.setValue(this.props.name, {
            ...this._wrappedFormRef.current.getValues(),
            [componentName]: value,
        });
    };

    private handleComponentBlur = () => {};

    private handleComponentFocus = () => {};

    // forceUpdate() {
    //     return super.forceUpdate();
    // }

    update = async ({ value, pristine }: FormComponentState) => {
        /**
         * If we're setting the value to undefined or null, we need to map
         * the new value to each nested form component. Otherwise, providing
         * this value to setValues will have no impact.
         */
        const transformedValue =
            value === undefined || value === null
                ? this._wrappedFormRef.current
                      .getComponentNames()
                      .reduce(
                          (values, key) => ({ ...values, [key]: value }),
                          {},
                      )
                : value;

        await this._wrappedFormRef.current.setValues(
            transformedValue,
            pristine,
            true,
        );

        return Promise.resolve();
    };
}
