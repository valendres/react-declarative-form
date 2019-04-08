import * as React from 'react';
import update from 'update-immutable';

import {
    ValidatorData,
    ValueMap,
    Omit,
    OptionalPromise,
    ValidatorContext,
} from '../../types';
import { BoundComponentInstance } from '../bind';
import { MirrorInstance, Mirror } from '../Mirror';
import { ensurePromise } from '../../utils';
import { validate } from '../../validator';

export const FormContext = React.createContext(undefined as FormApi);

export interface FormApi {
    clear: Form<any>['clear'];
    reset: Form<any>['reset'];
    validate: Form<any>['validate'];
    isValid: Form<any>['isValid'];
    isPristine: Form<any>['isPristine'];
    getValidatorData: Form<any>['getValidatorData'];
    setValidatorData: Form<any>['setValidatorData'];
    getValue: Form<any>['getValue'];
    setValue: Form<any>['setValue'];
    onComponentMount: Form<any>['handleComponentMount'];
    onComponentUnmount: Form<any>['handleComponentUnmount'];
    onComponentUpdate: Form<any>['handleComponentUpdate'];
    onComponentBlur: Form<any>['handleComponentBlur'];
    onComponentFocus: Form<any>['handleComponentFocus'];
    registerMirror: Form<any>['registerMirror'];
    unregisterMirror: Form<any>['unregisterMirror'];
}

export interface FormProps<FormFields extends ValueMap>
    extends Omit<
            React.FormHTMLAttributes<HTMLFormElement>,
            'onChange' | 'onBlur' | 'onFocus' | 'onSubmit'
        > {
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
    onBlur?: (
        componentName: keyof FormFields,
        value: any,
        event: React.FocusEvent<any>,
    ) => OptionalPromise<void>;

    /**
     * Called when a bound form component has been focused.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onFocus?: (
        componentName: keyof FormFields,
        value: any,
        event: React.FocusEvent<any>,
    ) => OptionalPromise<void>;

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
     * Initial values to be provided to the bound form components. This is useful for
     * populating the form without having to manage all form values. It can be provided
     * asynchronously. The values will be applied if the form components have not been
     * modified. If you need to apply new values to the form, call reset on the form after
     * updating the initialValues.
     */
    initialValues?: FormFields;

    /**
     * Whether a hidden submit should be rendered within the form. The existance of a
     * `<button type="submit"/>` allows forms to be submitted when the enter key is pressed.
     * However, if you a form which is being submitted programatically, or it doesn't
     * make sense to show a submit button, setting this to true will allow submit on enter
     * to work.
     */
    withHiddenSubmit?: boolean;

    /**
     * Whether the form component values should be sticky and retain their value in between
     * component unmounts and mounts. By default,form component state is bound to the mounted
     * instance - if the instance is unmounted, its value will be lost.
     */
    sticky?: boolean;
}

export class Form<FormComponents extends ValueMap = {}> extends React.Component<
    FormProps<FormComponents>
> {
    static defaultProps: FormProps<any> = {
        onChange: () => {},
        onBlur: () => {},
        onFocus: () => {},
        onSubmit: () => {},
        onValidSubmit: () => {},
        onInvalidSubmit: () => {},
        initialValues: {},
        sticky: false,
    };

    private components: {
        [ComponentName in keyof FormComponents]: {
            name: string;
            pristine: boolean;
            value?: any;
            validatorData?: ValidatorData;
            instance?: BoundComponentInstance;
        }
    };

    private mirrorRefs: {
        [ComponentName in keyof FormComponents]: MirrorInstance[]
    };

    constructor(props: FormProps<FormComponents>) {
        super(props as any);
        this.components = {} as any;
        this.mirrorRefs = {} as any;
    }

    render() {
        const {
            children,
            withHiddenSubmit,

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
            clear: this.clear,
            reset: this.reset,
            validate: this.validate,
            isValid: this.isValid,
            isPristine: this.isPristine,
            getValidatorData: this.getValidatorData,
            setValidatorData: this.setValidatorData,
            getValue: this.getValue,
            setValue: this.setValue,
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
                <form {...restProps as any} onSubmit={this.handleFormSubmit}>
                    {children}
                    {withHiddenSubmit && (
                        <button type="submit" style={{ display: 'none' }} />
                    )}
                </form>
            </FormContext.Provider>
        );
    }
    //#region Public commands
    public submit = () => {
        return this.handleFormSubmit();
    };

    public clear = async (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(componentName =>
                this.setValue(componentName, null),
            ),
        );
    };

    public reset = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(componentName => {
                this.components = update(this.components, {
                    [componentName]: {
                        $unset: ['value', 'validatorData', 'pristine'],
                    },
                });
                return this.updateComponent(componentName);
            }),
        );
    };

    public validate = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentNames(componentName).map(componentName => {
                return this.setValidatorData(
                    componentName,
                    this.executeValidator(componentName),
                );
            }),
        );
    };
    //#endregion

    //#region Public evaluators
    public isValid = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): boolean => {
        const results = this.getComponentNames(componentName).map(
            componentName => {
                const { context } = this.executeValidator(componentName);
                return context !== ValidatorContext.Danger;
            },
        );
        return !results.includes(false);
    };

    public isPristine = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): boolean => {
        const results = this.getComponentNames(componentName).map(
            componentName =>
                componentName in this.components
                    ? this.components[componentName].pristine
                    : true,
        );
        return !results.includes(false);
    };
    // #endregion

    //#region Public getters
    public getValidatorData = (
        componentName: keyof FormComponents,
        componentProps: BoundComponentInstance['props'] = this.getComponentProps(
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

    public getValue = (
        componentName: keyof FormComponents,
        componentProps: BoundComponentInstance['props'] = this.getComponentProps(
            componentName,
        ),
    ): any => {
        const propValue = componentProps && componentProps.value;
        const defaultValue = componentProps && componentProps.defaultValue;
        const stateValue =
            this.components[componentName] &&
            this.components[componentName].value;
        const initialValue = this.props.initialValues[componentName];

        const dynamicValue = [
            propValue,
            stateValue,
            initialValue,
            defaultValue,
        ].find(v => v !== undefined);

        return dynamicValue instanceof Object
            ? Object.freeze(dynamicValue)
            : dynamicValue;
    };

    public getValues = (
        componentNames?: (keyof FormComponents)[],
    ): FormComponents => {
        return this.getComponentNames(componentNames).reduce(
            (values: FormComponents, componentName: keyof FormComponents) => ({
                ...values,
                [componentName]: this.getValue(componentName),
            }),
            {} as FormComponents,
        );
    };
    //#endregion

    //#region Public setters
    public setValidatorData = async (
        componentName: keyof FormComponents,
        data: ValidatorData,
    ): Promise<void> => {
        // Don't set data if component is unknown
        if (!(componentName in this.components)) {
            throw `Failed to set validatorData for "${componentName}" component. It does not exist in form context.`;
        }

        this.components = update(this.components, {
            [componentName]: {
                pristine: {
                    $set: false,
                },
                validatorData: {
                    $set: data,
                },
            },
        });

        return this.updateComponent(componentName);
    };

    public setValue = async (
        componentName: keyof FormComponents,
        value: any,
        pristine: boolean = false,
    ): Promise<void> => {
        // Don't set value if component is unknown
        if (!(componentName in this.components)) {
            throw `Failed to set value for "${componentName}" component. It does not exist in form context.`;
        }

        const validatorData = this.executeValidator(componentName, value);

        // Update component state
        this.components = update(this.components, {
            [componentName]: {
                pristine: {
                    $set: pristine,
                },
                value: {
                    $set: value,
                },
                validatorData: {
                    $set: validatorData,
                },
            },
        });

        // Trigger component re-render
        await this.updateComponent(componentName);
        return this.props.onChange(componentName, value);
    };

    public setValues = (
        values: { [ComponentName in keyof FormComponents]: any },
        pristine?: boolean,
    ): Promise<void[]> => {
        return Promise.all(
            Object.keys(values).map((componentName: string) =>
                this.setValue(componentName, values[componentName], pristine),
            ),
        );
    };
    //#endregion

    //#region Private component registration/unregistration
    private registerComponent = (
        componentName: keyof FormComponents,
        componentRef: BoundComponentInstance,
    ) => {
        // Return early if a ref has already been refistered
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
     * @param {object} mirrorRef react mirror reference to be registered
     */
    private registerMirror = (
        componentName: keyof FormComponents,
        mirrorRef: Mirror,
    ): void => {
        if (componentName in this.mirrorRefs) {
            this.mirrorRefs[componentName].push(mirrorRef);
        } else {
            this.mirrorRefs[componentName] = [mirrorRef];
        }
    };

    /**
     * Unregisters a mirror with the form, so it will no longer reflect
     * @param {string} componentName name of the component to mirror
     * @param {object} mirrorRef react mirror reference to be unregistered
     */
    private unregisterMirror = (
        componentName: keyof FormComponents,
        mirrorRef: Mirror,
    ): void => {
        if (componentName in this.mirrorRefs) {
            const index = this.mirrorRefs[componentName].indexOf(mirrorRef);
            if (index > -1) {
                this.mirrorRefs[componentName].splice(index, 1);
            }
        }
    };
    //#endregion

    //#region Private event handlers
    private handleFormChange = (
        componentName: keyof FormComponents,
        value: any,
    ) => {
        this.props.onChange(componentName, value);
    };

    private handleFormSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
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

        this.props.onSubmit(values);

        return {
            isValid,
            values,
        };
    };

    private handleFormValidSubmit = (values: FormComponents) => {
        this.props.onValidSubmit(values);
    };

    private handleFormInvalidSubmit = (values: FormComponents) => {
        this.validate();
        this.props.onInvalidSubmit(values);
    };

    private handleComponentMount = async (
        componentName: keyof FormComponents,
        componentRef: BoundComponentInstance,
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
    };

    private handleComponentBlur = async (
        componentName: keyof FormComponents,
        event: React.FocusEvent<any>,
    ) => {
        const value = this.getValue(componentName);
        await ensurePromise(this.props.onBlur(componentName, value, event));
        return event;
    };

    private handleComponentFocus = async (
        componentName: keyof FormComponents,
        event: React.FocusEvent<any>,
    ) => {
        const value = this.getValue(componentName);
        await ensurePromise(this.props.onFocus(componentName, value, event));
        return event;
    };
    //#endregion

    //#region Private helpers
    /**
     * Returns an array of mirror instances that are currently reflecting the specified component.
     * @param {string} componentName name of the component
     * @returns array of mirror instances
     */
    getComponentMirrors = (
        componentName: keyof FormComponents,
    ): MirrorInstance[] => {
        return this.mirrorRefs[componentName] || [];
    };

    getComponentNames = (
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

        throw `Failed to get component names from ${componentName}`;
    };

    getComponentInstance = (
        componentName: keyof FormComponents,
    ): BoundComponentInstance => {
        return componentName in this.components
            ? this.components[componentName].instance
            : undefined;
    };

    getComponentProps = (componentName: keyof FormComponents) => {
        const instance = this.getComponentInstance(componentName);
        return instance ? instance.props : undefined;
    };

    getComponentValidatorTriggers = (
        componentName: keyof FormComponents,
    ): string[] => {
        const props = this.getComponentProps(componentName);
        const validatorTrigger = props.validatorTrigger || [];
        return Array.isArray(validatorTrigger)
            ? validatorTrigger
            : [validatorTrigger];
    };

    /**
     * Recursively builds a dependency map for components that are part of the
     * validator trigger tree.
     */
    getCompomentDependencyMap = (
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
                        ...this.getCompomentDependencyMap(
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
     * @returns array of componentNames
     */
    getRelatedComponentNames = (
        componentName: keyof FormComponents,
    ): (keyof FormComponents)[] => {
        const component = this.components[componentName];
        if (component) {
            return Object.keys(
                this.getCompomentDependencyMap(
                    this.getComponentValidatorTriggers(componentName),
                ),
            ).filter(
                (dependencyName: string) => dependencyName !== componentName,
            );
        }
        return [];
    };

    updateComponent = (componentName: keyof FormComponents): Promise<void> => {
        const component = this.components[componentName];
        if (component && component.instance) {
            return new Promise(resolve => {
                return component.instance.forceUpdate(resolve);
            });
        }
    };

    reflectComponentMirrors = (
        componentName: keyof FormComponents,
    ): Promise<void[]> => {
        return Promise.all(
            this.getComponentMirrors(componentName).map(
                (mirror: MirrorInstance) => mirror.reflect(),
            ),
        );
    };

    executeValidator = (
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
