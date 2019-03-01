import * as React from 'react';

import { ValidatorResponse, ValueMap, Omit } from '../../types';
import { validate } from '../../validator';
import { BoundComponentInstance } from '../bind';
import { MirrorInstance, Mirror } from '../Mirror';

export const FormContext = React.createContext(undefined as FormApi);

export interface FormApi {
    registerComponent: Form<any>['registerComponent'];
    unregisterComponent: Form<any>['unregisterComponent'];
    registerMirror: Form<any>['registerMirror'];
    unregisterMirror: Form<any>['unregisterMirror'];
    validate: Form<any>['validate'];
    setStickyValue: Form<any>['setStickyValue'];
    getStickyValue: Form<any>['getStickyValue'];
    getInitialValue: Form<any>['getInitialValue'];
    getResponse: Form<any>['getResponse'];
    getValue: Form<any>['getValue'];
    onMount: Form<any>['handleMount'];
    onUpdate: Form<any>['handleUpdate'];
    onChange: Form<any>['handleChange'];
    onBlur: Form<any>['handleBlur'];
    onFocus: Form<any>['handleFocus'];
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
    onBlur?: (componentName: keyof FormFields, value: any) => void;

    /**
     * Called when a bound form component has been focused.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onFocus?: (componentName: keyof FormFields, value: any) => void;

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
     * Called after onSubmit at least 1 bound form component is invalid.
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

    private componentRefs: {
        [ComponentName in keyof FormComponents]: BoundComponentInstance
    };

    private mirrorRefs: {
        [ComponentName in keyof FormComponents]: MirrorInstance[]
    };

    private stickyValues: { [ComponentName in keyof FormComponents]: any };

    public constructor(props: FormProps<FormComponents>) {
        super(props as any);
        this.componentRefs = {} as any;
        this.mirrorRefs = {} as any;
        this.stickyValues = {} as any;
    }

    /**
     * Programmatically submit form
     */
    public submit = () => {
        return this.handleSubmit();
    };

    /**
     * Retrieves the current value for a component
     * @param {string} componentName name of the component
     */
    public getValue = (componentName: keyof FormComponents): any => {
        const component = this.componentRefs[componentName];
        return component
            ? component.getValue()
            : this.props.initialValues[componentName];
    };

    /**
     * Retrieves current values for all components
     */
    public getValues = (): FormComponents => {
        return Object.keys(this.componentRefs).reduce(
            (values: FormComponents, componentName: keyof FormComponents) => {
                values[componentName] = this.getValue(componentName);
                return values;
            },
            {} as FormComponents,
        );
    };

    /**
     * Clears the form. The value and validator for each form component will be
     * set to undefined. Note: this will have no effect if the valueProp has
     * been provided.
     */
    public clear = (): void => {
        Object.keys(this.componentRefs).forEach(
            (componentName: keyof FormComponents) => {
                const component = this.componentRefs[componentName];
                component.clear();
            },
        );
    };

    /**
     * Resets the form using the initialValue prop for each form component. If
     * the initialValue prop has not been provided, the new value will be undefined.
     * Note: this will have no effect if the valueProp has been provided.
     */
    public reset = (): void => {
        // Clear all sticky values before calling individual component.reset's
        this.stickyValues = {} as any;

        Object.keys(this.componentRefs).forEach(
            (componentName: keyof FormComponents) => {
                const component = this.componentRefs[componentName];
                // Check if the component still exists because some of the
                // conditionally mounted components might have been unregistered with the form
                if (component) {
                    component.reset();
                }
            },
        );
    };

    /**
     * Validates specified component(s). If no component names are provided,
     * all components within the form will be validated.
     */
    public validate = (
        componentName?: keyof FormComponents | (keyof FormComponents)[],
    ): void => {
        (componentName !== undefined
            ? Array.isArray(componentName)
                ? componentName
                : [componentName]
            : Object.keys(this.componentRefs)
        ).forEach((componentName: string) => {
            this.componentRefs[componentName].validate();
        });
    };

    /**
     * Executes validator rules on all component
     * @returns true if all all components are valid
     */
    public isValid = (): boolean => {
        return !Object.keys(this.componentRefs).some(
            (componentName: string) => {
                const component = this.componentRefs[componentName];
                return !component.isValid();
            },
        );
    };

    /**
     * Inject a custom value on a form component
     * @param {string} componentName name of the component
     * @param {any} value custom value to be injected
     */
    public setValue = (
        componentName: keyof FormComponents,
        value: any,
    ): Promise<void> =>
        componentName in this.componentRefs
            ? this.componentRefs[componentName].setValue(value)
            : Promise.reject(
                  `Failed to set value for "${componentName}" component. It does not exist in form context.`,
              );

    /**
     * Injects custom values for form components
     * @param {object} values component name / value map
     */
    public setValues = (
        values: { [ComponentName in keyof FormComponents]: any },
    ): Promise<void[]> =>
        Promise.all(
            Object.keys(values).map((componentName: string) =>
                this.setValue(componentName, values[componentName]),
            ),
        );

    /**
     * Inject a custom validator response on a form component
     * @param {string} componentName name of the component
     * @param {object} response custom validator response to be injected
     */
    public setResponse = (
        componentName: keyof FormComponents,
        response: ValidatorResponse,
    ): Promise<void> =>
        componentName in this.componentRefs
            ? this.componentRefs[componentName].setResponse(response)
            : Promise.reject(
                  `Failed to set response for "${componentName}" component. It does not exist in form context.`,
              );

    /**
     * Injects custom validator responses for form components
     * @param {object} responses component name / validator response map
     */
    public setResponses = (
        responses: {
            [ComponentName in keyof FormComponents]: ValidatorResponse
        },
    ): Promise<void[]> =>
        Promise.all(
            Object.keys(responses).map((componentName: keyof FormComponents) =>
                this.setResponse(componentName, responses[componentName]),
            ),
        );

    public render() {
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
            // Injected
            ...restProps
        } = this.props;

        const api: FormApi = {
            registerComponent: this.registerComponent,
            unregisterComponent: this.unregisterComponent,
            registerMirror: this.registerMirror,
            unregisterMirror: this.unregisterMirror,
            validate: this.validate,
            setStickyValue: this.setStickyValue,
            getStickyValue: this.getStickyValue,
            getInitialValue: this.getInitialValue,
            getResponse: this.getResponse,
            getValue: this.getValue,
            onMount: this.handleMount,
            onUpdate: this.handleUpdate,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
            onFocus: this.handleFocus,
        };

        return (
            <FormContext.Provider value={api}>
                <form {...restProps as any} onSubmit={this.handleSubmit}>
                    {children}
                    {withHiddenSubmit && (
                        <button type="submit" style={{ display: 'none' }} />
                    )}
                </form>
            </FormContext.Provider>
        );
    }

    /**
     * Registers a component with the form, allowing it to be managed.
     * @param {string} componentName name of the component
     * @param {object} componentRef react component reference to be monitored
     */
    private registerComponent = (
        componentName: keyof FormComponents,
        componentRef: BoundComponentInstance,
    ): void => {
        // Only register if this form component has not been mounted yet
        if (!(componentName in this.componentRefs)) {
            this.componentRefs[componentName] = componentRef;
        } else {
            console.error(`Duplicate form component: "${componentName}"`);
        }
    };

    /**
     * Unregisters a component with the form, so it will no longer be managed
     * @param {string} componentName name of the component
     */
    private unregisterComponent = (
        componentName: keyof FormComponents,
    ): void => {
        delete this.componentRefs[componentName];
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

    /** Sets the sticky component value using internal form state */
    private setStickyValue = (
        componentName: keyof FormComponents,
        value: any,
    ) => {
        if (this.props.sticky) {
            this.stickyValues[componentName] = value;
        }
    };

    /** Retrieves the sticky component value from internal form state */
    private getStickyValue = (componentName: keyof FormComponents): any => {
        return this.props.sticky ? this.stickyValues[componentName] : undefined;
    };

    /** Retrieves the initial component value from the initialValues prop */
    private getInitialValue = (componentName: keyof FormComponents): any => {
        const { initialValues } = this.props;
        return initialValues ? initialValues[componentName] : undefined;
    };

    /**
     * Executes validator object for the specified component name. If no custom value
     * is provided, the current value will be retrieved from the form component.
     * @param {string} componentName name of the component
     * @param {any} value (optional) custom value to be used when validating
     * @param {boolean} required (default: false) whether or not a value is required
     * @returns validator response: context, message
     */
    private getResponse = (
        componentName: keyof FormComponents,
        value?: any,
        required: boolean = false,
    ): ValidatorResponse => {
        const values = this.getValues();
        const component = this.componentRefs[componentName];
        return validate(
            componentName as string,
            {
                ...(values as ValueMap),
                [componentName]:
                    value !== undefined ? value : values[componentName],
            },
            {
                required,
                ...(component ? component.getValidatorRules() : {}),
            },
            component ? component.getValidatorMessages() : {},
        );
    };

    /**
     * Recursively builds a dependency map for components that are part of the
     * validator trigger tree.
     */
    private buildDependencyMap = (
        componentNames: (keyof FormComponents)[],
        mappedNames: FormComponents = {} as any,
    ): (keyof FormComponents)[] => {
        // tslint:disable-next-line:no-parameter-reassignment
        mappedNames = componentNames.reduce(
            (names: any, name: string) => ({ ...names, [name]: true }),
            mappedNames,
        );

        return componentNames.reduce(
            (output: any, name: keyof FormComponents) => {
                const validatorTrigger: string[] =
                    (this.componentRefs[name] &&
                        this.componentRefs[name].getValidatorTriggers()) ||
                    [];
                const namesToMap = validatorTrigger.filter(
                    (n: string) => !(n in mappedNames),
                );

                // Only recurse if necessary
                if (namesToMap.length > 0) {
                    return {
                        ...output,
                        ...this.buildDependencyMap(namesToMap, mappedNames),
                    };
                }

                return output;
            },
            mappedNames,
        );
    };

    /**
     * Returns an array of component names that should be validated when validating
     * a specific component. Determined using the validator trigger tree.
     * @returns array of componentNames
     */
    private getRelatedComponents = (
        componentName: keyof FormComponents,
    ): string[] => {
        const component = this.componentRefs[componentName];
        if (component) {
            return Object.keys(
                this.buildDependencyMap(component.getValidatorTriggers()),
            ).filter(
                (dependencyName: string) => dependencyName !== componentName,
            );
        }
        return [];
    };

    /**
     * Returns an array of mirror instances that are currently reflecting the specified component.
     * @param {string} componentName name of the component
     * @returns array of mirror instances
     */
    private getMirrors = (
        componentName: keyof FormComponents,
    ): MirrorInstance[] => {
        return this.mirrorRefs[componentName] || [];
    };

    /**
     * Event handler to be fired whenever a bound form component is mounted. When called, the components
     * mirrors updated to reflect the new value. If the form is in sticky mode, the sticky value state will
     * also be updated.
     * @param {string} componentName name of the component
     * @param {any} value value which the component was updated with
     */
    private handleMount = (componentName: keyof FormComponents, value: any) => {
        // Update sticky value state
        if (this.props.sticky) {
            this.setStickyValue(componentName, value);
        }

        // Reflect all mirrors
        this.getMirrors(componentName).forEach((mirror: MirrorInstance) =>
            mirror.reflect(),
        );
    };

    /**
     * Event handler to be fired whenever a bound form component is updated. When called, validation rules
     * will be executed on any related components, and mirrors updated to reflect the new value. If the form
     * is in sticky mode, the sticky value state will also be updated.
     * @param {string} componentName name of the component
     * @param {any} value value which the component was updated with
     */
    private handleUpdate = (
        componentName: keyof FormComponents,
        value: any,
    ) => {
        // Update sticky value state
        if (this.props.sticky) {
            this.setStickyValue(componentName, value);
        }

        // Cross-validate if necessary
        this.getRelatedComponents(componentName).forEach((relName: string) => {
            this.componentRefs[relName].validate();
        });

        // Reflect all mirrors
        this.getMirrors(componentName).forEach((mirror: MirrorInstance) =>
            mirror.reflect(),
        );
    };

    private handleChange = (
        componentName: keyof FormComponents,
        value: any,
    ) => {
        this.props.onChange(componentName, value);
    };

    private handleBlur = (componentName: keyof FormComponents) => {
        this.props.onBlur(componentName, this.getValue(componentName));
    };

    private handleFocus = (componentName: keyof FormComponents) => {
        this.props.onFocus(componentName, this.getValue(componentName));
    };

    private handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) {
            event.preventDefault();
        }

        const isValid = this.isValid();
        const values = this.getValues();

        if (isValid) {
            this.handleValidSubmit(values);
        } else {
            this.handleInvalidSubmit(values);
        }

        this.props.onSubmit(values);

        return {
            isValid,
            values,
        };
    };

    private handleValidSubmit = (values: FormComponents) => {
        this.props.onValidSubmit(values);
    };

    private handleInvalidSubmit = (values: FormComponents) => {
        this.validate();
        this.props.onInvalidSubmit(values);
    };
}
