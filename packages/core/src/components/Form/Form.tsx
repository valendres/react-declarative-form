import * as React from 'react';
import update, { UpdateTransform } from 'update-immutable';

import {
    ValidatorData,
    ValueMap,
    ValidatorContext,
    Environment,
} from '../../types';
import { BoundComponent } from '../bind';
import { MirrorInstance, Mirror } from '../Mirror';
import { validate } from '../../validator';
import { UnknownComponentError } from '../../errors';
import { isCallable, getEnvironment } from '../../utils';

export const FormContext = React.createContext(undefined as FormApi);

export interface FormApi {
    initialValues: any;
    clear: Form<any>['clear'];
    reset: Form<any>['reset'];
    validate: Form<any>['validate'];
    isValid: Form<any>['isValid'];
    isPristine: Form<any>['isPristine'];
    getValidatorData: Form<any>['getValidatorData'];
    getValue: Form<any>['getValue'];
    getValues: Form<any>['getValues'];
    setValidatorData: Form<any>['setValidatorData'];
    setValue: Form<any>['setValue'];
    setValues: Form<any>['setValues'];
    onComponentMount: Form<any>['handleComponentMount'];
    onComponentUnmount: Form<any>['handleComponentUnmount'];
    onComponentUpdate: Form<any>['handleComponentUpdate'];
    onComponentBlur: Form<any>['handleComponentBlur'];
    onComponentFocus: Form<any>['handleComponentFocus'];
    registerMirror: Form<any>['registerMirror'];
    unregisterMirror: Form<any>['unregisterMirror'];
}

export interface FormProps<FormFields extends ValueMap> {
    /**
     * Called when the value of a bound form component has been changed.
     * @param {string} componentName name of the component
     * @param {object} value new value
     */
    onChange?: (componentName: keyof FormFields, value: any) => void;

    /**
     * Called when a bound form component has been blurred.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onBlur?: (componentName: keyof FormFields, value: any, event: any) => void;

    /**
     * Called when a bound form component has been focused.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onFocus?: (componentName: keyof FormFields, value: any, event: any) => void;

    /**
     * Called when a component updates
     * @param {string} componentName name of the component
     */
    onUpdate?: (componentName: keyof FormFields) => void;

    /**
     * 	Called when the form is programmatically submitted, or a button with type="submit" is clicked.
     * @param {object} values name/value pairs for all bound form components.
     */
    onSubmit?: (values: FormFields) => void;

    /**
     * 	Called after onSubmit if all bound form components are valid.
     * @param {object} values name/value pairs for all bound form components.
     */
    onValidSubmit?: (values: FormFields) => void;

    /**
     * Called after onSubmit at least 1 bound form component is invalid.x
     * @param {object} values name/value pairs for all bound form components.
     */
    onInvalidSubmit?: (values: FormFields) => void;

    /**
     * A transformer func which allows the final form value to be manipulated.
     * The calculated value that `getValue` would normally return is provided
     * as an argument to this transformer.
     *
     * The returned value will take precedence over the value normally returned
     * by `getValue`. It will also be use for form validation and provided to
     * bound components.  If it is not necessary to modify the value, simply
     * return the provided value and `getValue` will behave as normal.
     */
    valueTransformer?: (componentName: keyof FormFields, value: any) => any;

    /**
     * If you don't want to modify the values, simply return the provided values.
     *
     * A transformer func which is used to manipulate the entire form values to
     * be manipulated. It is calculated after any individual `valueTransformer`'s
     * have been applied.
     *
     * The returned value will take precedence over the value normally returned by
     * `getValues`. If it is not necessary to modify the value, simply return the
     * provided value and `getValue` will behave as normal
     *
     */
    valuesTransformer?: (values: FormFields) => FormFields;

    /**
     * Whether a hidden submit should be rendered within the form. The existence of a
     * `<button type="submit"/>` allows forms to be submitted when the enter key is pressed.
     * However, if you a form which is being submitted programmatically, or it doesn't
     * make sense to show a submit button, setting this to true will allow submit on enter
     * to work.
     * @note this prop has no effect when using `react-native`.
     */
    withHiddenSubmit?: boolean;

    /**
     * If true, a the html form element will not be rendered.
     * @note this prop has no effect when using `react-native`.
     */
    virtual?: boolean;

    /**
     * Whether the form component values should be sticky and retain their value in
     * between component unmounts and mounts. By default, form component state is
     * lost when a component is unmounted.
     */
    sticky?: boolean;

    /**
     * Initial values to be provided to the bound form components. This is useful for
     * populating the form without having to manage all form values. It can be provided
     * asynchronously. The values will be applied if the form components have not been
     * modified. If you need to apply new values to the form, call reset on the form after
     * updating the initialValues.
     */
    initialValues?: FormFields;
}

export interface FormComponentState {
    name: string;
    pristine: boolean;
    value?: any;
    validatorData?: ValidatorData;
    instance?: BoundComponent;
}

export class Form<FormComponents extends ValueMap = {}> extends React.Component<
    FormProps<FormComponents>
> {
    static defaultProps: FormProps<any> = {
        sticky: false,
        initialValues: {},
    };

    private components: {
        [ComponentName in keyof FormComponents]: FormComponentState;
    };

    private mirrors: {
        [ComponentName in keyof FormComponents]: MirrorInstance[];
    };

    constructor(props: FormProps<FormComponents>) {
        super(props as any);
        this.components = {} as any;
        this.mirrors = {} as any;
    }

    render() {
        const {
            children,
            withHiddenSubmit,
            virtual,

            // Omitted
            onChange,
            onBlur,
            onFocus,
            onSubmit,
            onValidSubmit,
            onInvalidSubmit,
            initialValues,
            sticky,

            // Injected
            ...restProps
        } = this.props;

        const api: FormApi = {
            initialValues,
            clear: this.clear,
            reset: this.reset,
            validate: this.validate,
            isValid: this.isValid,
            isPristine: this.isPristine,
            getValidatorData: this.getValidatorData,
            setValidatorData: this.setValidatorData,
            getValue: this.getValue,
            getValues: this.getValues,
            setValue: this.setValue,
            setValues: this.setValues,
            onComponentMount: this.handleComponentMount,
            onComponentUnmount: this.handleComponentUnmount,
            onComponentUpdate: this.handleComponentUpdate,
            onComponentBlur: this.handleComponentBlur,
            onComponentFocus: this.handleComponentFocus,
            registerMirror: this.registerMirror,
            unregisterMirror: this.unregisterMirror,
        };

        return (
            <FormContext.Provider value={api}>
                {/* Skip rendering dom element in react-native environments */}
                {virtual || getEnvironment() === Environment.ReactNative ? (
                    children
                ) : (
                    <form
                        {...(restProps as any)}
                        onSubmit={this.handleFormSubmit}
                    >
                        {children}
                        {withHiddenSubmit && (
                            <button type="submit" style={{ display: 'none' }} />
                        )}
                    </form>
                )}
            </FormContext.Provider>
        );
    }

    //#region Public commands
    /**
     * programmatically submit the form. If you don't want to manually call this, a button
     * with type submit should be provided to the form. This can be provided in your form
     * implementation, or automatically using the `withHiddenSubmit` prop on the Form.
     * @returns an object with 2 properties:
     *  - isValid: whether the entire form was valid when submitting
     *  - values: all of the form values at the time of submission
     */
    public submit = () => {
        return this.handleFormSubmit();
    };

    /**
     * Clears the specified component(s) by setting their value to null. If no component
     * names are provided, all components within the form will be cleared.
     * @param {string|string[]} componentName component name(s) to be cleared
     * @returns a promise which is resolved once the react components have been re-rendered
     */
    public clear = async (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(async (componentName) => {
                await this.setValue(componentName, null);
            }),
        );
    };

    /**
     * Resets the specified component(s) by unsetting their value, validator and pristine
     * state. If no component names are provided, all components within the form will be
     * reset.
     * @param {string|string[]} componentName component name(s) to be reset
     * @returns a promise which is resolved once the react components have been re-rendered
     */
    public reset = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(async (componentName) => {
                await this.updateComponent(componentName, {
                    $unset: ['value', 'validatorData', 'pristine'],
                });

                // We need to explicitly call reset since the updateComponent $unset wont reset validatorData
                if (this.isRecursiveComponent(componentName)) {
                    await this.getComponentInstance(componentName).reset();
                }
            }),
        );
    };

    /**
     * Validates specified component(s) by executing the validator and updating the
     * components to reflect their validator state. If no component names are provided,
     * all components within the form will be validated.
     * @param {string|string[]} componentName component name(s) to be validated.
     * @returns a promise which is resolved once the react components have been re-rendered.
     */
    public validate = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(async (componentName) => {
                /**
                 * Recursive components don't have validation rules, therefore we rely on
                 * recursively calling isValid on the form.
                 */
                if (this.isRecursiveComponent(componentName)) {
                    await this.getComponentInstance(componentName).validate();
                } else {
                    await this.setValidatorData(
                        componentName,
                        this.executeValidator(componentName),
                    );
                }
            }),
        );
    };
    //#endregion

    //#region Public evaluators

    /**
     * Determines if all the specified component(s) are valid by executing the validator
     * using the components current value. If no component names are provided, all
     * components within the form will be tested.
     *
     * Note: if validatorData is being managed, the provided validatorData.context will
     * be used instead of executing the validator.
     *
     * @param {string|string[]} componentName component name(s) to be tested
     * @returns a boolean flag to indicate whether all the components are valid
     */
    public isValid = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): boolean => {
        const results = this.getComponentNames(componentName).map(
            (componentName) => {
                /**
                 * Recursive components don't have validation rules, therefore we rely on
                 * recursively calling isValid.
                 */
                if (this.isRecursiveComponent(componentName)) {
                    return this.getComponentInstance(componentName).isValid();
                }

                const componentProps = this.getComponentProps(componentName);

                // Use managed validatorData (if exists), otherwise execute validator
                const { context } = componentProps.validatorData
                    ? componentProps.validatorData
                    : this.executeValidator(componentName);

                return context !== ValidatorContext.Danger;
            },
        );
        return !results.includes(false);
    };

    /**
     * Determines if all the specified component(s) are pristine - the component has not
     * been modified by the user or by programmatically calling setValue. If no component
     * names are provided, all components within the form will checked.
     * @param {string|string[]} componentName component name(s) to be tested
     * @returns a boolean flag to indicate whether all the components are pristine
     */
    public isPristine = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): boolean => {
        const results = this.getComponentNames(componentName).map(
            (componentName) => {
                if (this.isRecursiveComponent(componentName)) {
                    return this.getComponentInstance(
                        componentName,
                    ).isPristine();
                }

                return componentName in this.components
                    ? this.components[componentName].pristine
                    : true;
            },
        );
        return !results.includes(false);
    };
    // #endregion

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
     * @param {string} componentName name of the component to get validator data for
     * @param {object} componentProps component props to extract validator data from.
     *       It's not necessary to provide this prop as its intended to be used by the
     *      form library internally.
     * @returns component validator data
     */
    public getValidatorData = (
        componentName: keyof FormComponents,
        componentProps: BoundComponent['props'] = this.getComponentProps(
            componentName,
        ),
    ): ValidatorData => {
        // Return user provided validatorData (if exists)
        if (componentProps.validatorData) {
            return componentProps.validatorData;
        }

        if (componentName in this.components) {
            return this.components[componentName].validatorData;
        }

        return {
            context: undefined,
            message: undefined,
        };
    };

    /**
     * Returns the value of the specified component. There are four
     * ways a component value can be provided (in order of precedence):
     *  1. *externally managed* value prop provided to the component
     *  2. *internally managed* state value when the user changes input
     *  3. *initialValues* provided to the form component
     *  4. *defaultValue* specified on individual form component
     *
     * **Note**: the form values should not be mutated
     *
     * @param {string} componentName name of the component to get value for
     * @param {object} componentProps component props to extract value from. It's
     *      not necessary to provide this prop as its intended to be used by the
     *      form library internally.
     * @returns component value
     */
    public getValue = (
        componentName: keyof FormComponents,
        componentProps: BoundComponent['props'] = this.getComponentProps(
            componentName,
        ),
    ): any => {
        const { valueTransformer } = this.props;

        /**
         * Recursive component values can't be derived from props, therefore we rely on
         * recursively calling getValue.
         */
        const value = this.isRecursiveComponent(componentName)
            ? this.getComponentInstance(componentName).getValue()
            : (() => {
                  const propValue = componentProps
                      ? componentProps.value
                      : undefined;
                  const defaultValue = componentProps
                      ? componentProps.defaultValue
                      : undefined;
                  const stateValue = this.components[componentName]
                      ? this.components[componentName].value
                      : undefined;
                  const initialValue = this.props.initialValues
                      ? this.props.initialValues[componentName]
                      : undefined;

                  return [
                      propValue,
                      stateValue,
                      initialValue,
                      defaultValue,
                  ].find((v) => v !== undefined);
              })();

        const transformedValue = valueTransformer
            ? valueTransformer(componentName, value)
            : value;

        return transformedValue instanceof Object
            ? Object.freeze(transformedValue)
            : transformedValue;
    };

    /**
     * Gets the values of the provided component names using the same logic as
     * `getValue`.
     * @param {string} componentNames component names to retrieve values for
     * @returns an object with componentName:value pairs
     */
    public getValues = (
        componentNames?: (keyof FormComponents)[],
    ): FormComponents => {
        const values = this.getComponentNames(componentNames).reduce(
            (values: FormComponents, componentName: keyof FormComponents) => ({
                ...values,
                [componentName]: this.getValue(componentName),
            }),
            {} as FormComponents,
        );

        const { valuesTransformer } = this.props;
        return valuesTransformer ? valuesTransformer(values) : values;
    };
    //#endregion

    //#region Public setters
    /**
     * Sets the component internally managed validatorData & updates the component
     * to reflect its new state.
     * @param {string} componentName name of the component which should be updated
     * @param {object} validatorData the new validator data to be stored in Form state
     * @returns a promise which is resolved once the react component has been re-rendered.
     */
    public setValidatorData = async (
        componentName: keyof FormComponents,
        data: ValidatorData,
    ): Promise<void> => {
        // Don't set data if component is unknown
        if (!(componentName in this.components)) {
            throw new UnknownComponentError(
                `set validatorData for "${componentName}" component`,
            );
        }

        return this.updateComponent(componentName, {
            pristine: {
                $set: false,
            },
            validatorData: {
                $set: data,
            },
        });
    };

    /**
     * Sets the component internally managed state value & updates the component
     * validatorData using the provided value. By default, the components pristine state
     * will be set to `false` to indicate that the component has been modified.
     * @param {string} componentName name of the component to set value for
     * @param {any} value the new value to be stored in Form state
     * @param {boolean} pristine the new pristine state when setting this value (default: false).
     * @param {boolean} internal if true, the handle form change will not be executed
     * @returns a promise which is resolved once the react component has been re-rendered.
     */
    public setValue = async (
        componentName: keyof FormComponents,
        value: any,
        pristine: boolean = false,
        internal: boolean = false,
    ): Promise<void> => {
        // Don't set value if component is unknown
        if (!(componentName in this.components)) {
            throw new UnknownComponentError(
                `set value for "${componentName}" component`,
            );
        }

        await this.updateComponent(componentName, {
            pristine: {
                $set: pristine,
            },
            value: {
                $set: value,
            },
            validatorData: {
                $set: this.executeValidator(componentName, value),
            },
        });

        if (!internal) {
            await this.handleFormChange(componentName, value);
        }

        return Promise.resolve();
    };

    /**
     * Sets the components internally managed state values & updates their component
     * validatorData using the provided values. By default, the components pristine state
     * will be set to `false` to indicate that the components have been modified.
     * @param {object} values the values to be saved in Form state: componentName:value map
     * @returns a promise which is resolved once the react components have been re-rendered.
     */
    public setValues = (
        values: { [ComponentName in keyof FormComponents]: any },
        pristine?: boolean,
        internal?: boolean,
    ): Promise<void[]> => {
        return Promise.all(
            Object.keys(values).map((componentName: string) =>
                this.setValue(
                    componentName,
                    values[componentName],
                    pristine,
                    internal,
                ),
            ),
        );
    };
    //#endregion

    //#region Private helpers
    private isRecursiveComponent = (componentName: keyof FormComponents) => {
        const instance = this.getComponentInstance(componentName);
        return instance && instance._isRecursive();
    };
    //#endregion

    //#region Private component registration/unregistration
    /**
     * Registers a component with the form, allowing it to be managed.
     * @param {string} componentName name of the component
     * @param {object} componentRef react component reference to be monitored
     * @returns void
     */
    private registerComponent = (
        componentName: keyof FormComponents,
        componentRef: BoundComponent,
    ) => {
        // Return early if a ref has already been registered
        if (
            componentName in this.components &&
            !!this.components[componentName].instance
        ) {
            console.error(
                `Failed to register component: "${componentName}", a component with this name already exists.`,
            );
            return;
        }

        // Update component state
        this.components = update(this.components, {
            [componentName]: {
                name: {
                    $set: componentName,
                },
                instance: {
                    $set: componentRef,
                },
            },
        });
    };

    /**
     * Unregisters a component with the form, so it will no longer be managed
     * @param {string} componentName name of the component
     * @returns void
     */
    private unregisterComponent = (componentName: keyof FormComponents) => {
        if (
            !(componentName in this.components) ||
            !this.components[componentName].instance
        ) {
            console.error(
                `Failed to unregister ref for "${componentName}", not registered.`,
            );
            return;
        }

        if (this.props.sticky) {
            // Remove instance without destroying associated data
            this.components = update(this.components, {
                [componentName]: {
                    $unset: 'instance',
                },
            });
        } else {
            // Else, remove component entirely
            this.components = update(this.components, {
                $unset: componentName,
            });
        }
    };

    /**
     * Registers a mirror with the form, allowing it to reflect a component.
     * @param {string} componentName name of the component to mirror
     * @param {object} mirror react mirror reference to be registered
     * @returns void
     */
    private registerMirror = (
        componentName: keyof FormComponents,
        mirror: Mirror,
    ): void => {
        if (componentName in this.mirrors) {
            this.mirrors[componentName].push(mirror);
        } else {
            this.mirrors[componentName] = [mirror];
        }
    };

    /**
     * Unregisters a mirror with the form, so it will no longer reflect
     * @param {string} componentName name of the component to mirror
     * @param {object} mirrorRef react mirror reference to be unregistered
     * @returns void
     */
    private unregisterMirror = (
        componentName: keyof FormComponents,
        mirrorRef: Mirror,
    ): void => {
        if (componentName in this.mirrors) {
            const index = this.mirrors[componentName].indexOf(mirrorRef);
            if (index > -1) {
                this.mirrors[componentName].splice(index, 1);
            }
        }
    };
    //#endregion

    //#region Private event handlers
    private handleFormChange = (
        componentName: keyof FormComponents,
        value: any,
    ) => {
        const { onChange } = this.props;
        if (isCallable(onChange)) {
            onChange(componentName, value);
        }
    };

    private handleFormSubmit = (event?: any) => {
        if (event) {
            event.preventDefault();
        }

        const isValid = this.isValid();
        const values = this.getValues();

        if (isValid) {
            this.handleFormValidSubmit(values);
        } else {
            this.handleFormInvalidSubmit(values);
        }

        const { onSubmit } = this.props;
        if (isCallable(onSubmit)) {
            onSubmit(values);
        }

        return {
            isValid,
            values,
        };
    };

    private handleFormValidSubmit = (values: FormComponents) => {
        const { onValidSubmit } = this.props;
        if (isCallable(onValidSubmit)) {
            onValidSubmit(values);
        }
    };

    private handleFormInvalidSubmit = (values: FormComponents) => {
        const { onInvalidSubmit } = this.props;
        this.validate();
        if (isCallable(onInvalidSubmit)) {
            onInvalidSubmit(values);
        }
    };

    private handleComponentMount = async (
        componentName: keyof FormComponents,
        componentRef: BoundComponent,
    ) => {
        this.registerComponent(componentName, componentRef);
        this.reflectComponentMirrors(componentName);
    };

    private handleComponentUnmount = async (
        componentName: keyof FormComponents,
    ) => {
        this.unregisterComponent(componentName);
        this.reflectComponentMirrors(componentName);
    };

    private handleComponentUpdate = async (
        componentName: keyof FormComponents,
    ) => {
        // Cross-validate if necessary
        await Promise.all(
            this.getRelatedComponentNames(componentName).map(
                (relatedComponentName: string) => {
                    return this.validate(relatedComponentName);
                },
            ),
        );

        // Reflect all mirrors
        this.reflectComponentMirrors(componentName);

        const { onUpdate } = this.props;
        if (isCallable(onUpdate)) {
            onUpdate(componentName);
        }
    };

    private handleComponentBlur = (
        componentName: keyof FormComponents,
        event: any,
    ) => {
        const value = this.getValue(componentName);

        const { onBlur } = this.props;
        if (isCallable(onBlur)) {
            onBlur(componentName, value, event);
        }

        return event;
    };

    private handleComponentFocus = (
        componentName: keyof FormComponents,
        event: any,
    ) => {
        const value = this.getValue(componentName);

        const { onFocus } = this.props;
        if (isCallable(onFocus)) {
            onFocus(componentName, value, event);
        }

        return event;
    };
    //#endregion

    //#region Private helpers
    /**
     * Returns an array of mirror instances that are currently reflecting the specified component.
     * @param {string} componentName name of the component
     * @returns array of mirror instances
     */
    private getComponentMirrors = (
        componentName: keyof FormComponents,
    ): MirrorInstance[] => {
        return this.mirrors[componentName] || [];
    };

    /** Helper function for retrieving an array of component names. This is used by
     * functions which can iterate over a single, multiple or all components within
     * the form.
     * * If a singular component name is provided, it will be returned as an array.
     * * If multiple component names are provided, they will be returned unchanged.
     * * If no component names are provided, all component names will be returned.
     * @param {string|string[]} componentName component name(s)
     * @returns array of component names
     */
    private getComponentNames = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): (keyof FormComponents)[] => {
        // If no component name(s) was provided, return all component names
        if (!componentName) {
            return Object.keys(this.components);
        }

        // If explicit component names were provided, return them instead
        if (Array.isArray(componentName)) {
            return componentName;
        }

        // If a singular component name was provided, return it as an array
        if (typeof componentName === 'string') {
            return [componentName];
        }

        throw new UnknownComponentError(
            `get component names from ${componentName}`,
        );
    };

    /**
     * Gets the react component instance for the specified component
     * @param {string} componentName name of the component
     * @returns react component instance
     */
    private getComponentInstance = (
        componentName: keyof FormComponents,
    ): BoundComponent => {
        return componentName in this.components
            ? (this.components[componentName].instance as any)
            : undefined;
    };

    /**
     * Gets the react component props for the specified component
     * @param {string} componentName name of the component
     * @returns react component props
     */
    private getComponentProps = (componentName: keyof FormComponents) => {
        const instance = this.getComponentInstance(componentName);
        return instance ? instance.props : undefined;
    };

    /**
     * Get an array of component names which should be updated when the
     * specified component is updated..
     * @param {string} componentName name of the component
     * @returns array of component names
     */
    private getComponentValidatorTriggers = (
        componentName: keyof FormComponents,
    ): (keyof FormComponents)[] => {
        const props = this.getComponentProps(componentName);
        const validatorTrigger = props.validatorTrigger || [];
        return Array.isArray(validatorTrigger)
            ? validatorTrigger
            : [validatorTrigger];
    };

    /**
     * Recursively builds a dependency map for components that are part of the
     * validator trigger tree.
     * @param {string[]} componentNames array of component names to check
     * @param {object} mappedNames while recurseing, a mappedNames object is kept
     * to ensure that a component is not included twice and to ensure that
     * components cannot trigger each other.
     * @returns array of component names which are dependent on the specified
     * component names.
     */
    private getComponentDependencyMap = (
        componentNames: (keyof FormComponents)[],
        mappedNames: FormComponents = {} as any,
    ): (keyof FormComponents)[] => {
        // tslint:disable-next-line:no-parameter-reassignment
        mappedNames = componentNames.reduce(
            (names: any, name: string) => ({ ...names, [name]: true }),
            mappedNames,
        );

        return componentNames.reduce(
            (dependencyMap: any, componentName: keyof FormComponents) => {
                const validatorTrigger = this.getComponentValidatorTriggers(
                    componentName,
                );
                const namesToMap = validatorTrigger.filter(
                    (n: string) => !(n in mappedNames),
                );

                // Only recurse if necessary
                if (namesToMap.length > 0) {
                    return {
                        ...dependencyMap,
                        ...this.getComponentDependencyMap(
                            namesToMap,
                            mappedNames,
                        ),
                    };
                }

                return dependencyMap;
            },
            mappedNames,
        );
    };

    /**
     * Returns an array of component names that should be validated when validating
     * a specific component. Determined using the validator trigger tree.
     * @param {string} componentName name of the component to check
     * @returns array of componentNames
     */
    private getRelatedComponentNames = (
        componentName: keyof FormComponents,
    ): (keyof FormComponents)[] => {
        const component = this.components[componentName];
        if (component) {
            return Object.keys(
                this.getComponentDependencyMap(
                    this.getComponentValidatorTriggers(componentName),
                ),
            ).filter(
                (dependencyName: string) => dependencyName !== componentName,
            );
        }
        return [];
    };

    /**
     * Updates the form component state using an update-immutable transform. Once
     * the state has been updated, the react component will be updated to reflect
     * the change.
     * @param {string} componentName name of the component which should be updated
     * @param {object} transform the `update-immutable` transform object
     * @returns a promise which is resolved once the react component has been re-rendered.
     */
    private updateComponent = (
        componentName: keyof FormComponents,
        componentTransform: UpdateTransform,
    ): Promise<void> => {
        if (!(componentName in this.components)) {
            throw new UnknownComponentError(
                `Unable to update "${componentName}" component`,
            );
        }

        this.components = update(this.components, {
            [componentName]: componentTransform,
        });
        // console.log(this.components.amount.pristine);

        const component = this.components[componentName];
        if (component && component.instance) {
            return component.instance._update(component);
        }
    };

    /**
     * Update all the mirrors which are reflecting the specified component
     * @param {string} componentName name of the component which should be reflected
     * @returns a promise which is resolved once all the mirrors have been re-rendered
     */
    private reflectComponentMirrors = (
        componentName: keyof FormComponents,
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentMirrors(
                componentName,
            ).map((mirror: MirrorInstance) => mirror.reflect()),
        );
    };

    /**
     * Executes validator for the specified component. If no custom value is provided,
     * the current value will be retrieved from the form component.
     * @param {string} componentName name of the component
     * @param {any} value (optional) custom value to be used when validating
     * @returns validator data: context, message
     */
    private executeValidator = (
        componentName: keyof FormComponents,
        value: any = this.getValue(componentName),
    ): ValidatorData => {
        const props = this.getComponentProps(componentName);
        return validate(
            componentName as string,
            {
                ...this.getValues(),
                ...(value !== undefined
                    ? {
                          [componentName]: value,
                      }
                    : {}),
            },
            {
                required: props && props.required,
                ...((props && props.validatorRules) || {}),
            },
            (props && props.validatorMessages) || {},
        );
    };
    //#endregion
}
