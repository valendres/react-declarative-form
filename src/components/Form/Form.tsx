import * as React from 'react';

import { ValidatorResponse, ValueMap, Omit } from '@types';
import { validate } from '@validator';

import { BoundComponentInstance } from '../bind';

export const FormContext = React.createContext(undefined as FormApi);

export interface FormApi {
    registerComponent: Form['registerComponent'];
    unregisterComponent: Form['unregisterComponent'];
    validate: Form['validate'];
    getResponse: Form['getResponse'];
    onChange: Form['handleChange'];
    onBlur: Form['handleBlur'];
    onFocus: Form['handleFocus'];
}

export interface FormProps
    extends Omit<
            React.FormHTMLAttributes<HTMLFormElement>,
            'onChange' | 'onBlur' | 'onFocus'
        > {
    /**
     * Called when the value of a bound form component has been changed.
     * @param {string} componentName name of the component
     * @param {object} value new value
     */
    onChange?: (componentName: string, value: any) => void;

    /**
     * Called when a bound form component has been blurred.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onBlur?: (componentName: string, value: any) => void;

    /**
     * Called when a bound form component has been focused.
     * @param {string} componentName name of the component
     * @param {object} value current value
     */
    onFocus?: (componentName: string, value: any) => void;

    /**
     * 	Called when the form is programmatically submitted, or a button with type="submit" is clicked.
     * @param {object} values name/value pairs for all bound form components.
     */
    onSubmit?: (values: ValueMap) => void;

    /**
     * 	Called after onSubmit if all bound form components are valid.
     * @param {object} values name/value pairs for all bound form components.
     */
    onValidSubmit?: (values: ValueMap) => void;

    /**
     * Called after onSubmit at least 1 bound form component is invalid.
     * @param {object} values name/value pairs for all bound form components.
     */
    onInvalidSubmit?: (values: ValueMap) => void;
}

export class Form extends React.Component<FormProps> {
    static defaultProps: FormProps = {
        onChange: () => {},
        onBlur: () => {},
        onFocus: () => {},
        onSubmit: () => {},
        onValidSubmit: () => {},
        onInvalidSubmit: () => {},
    };

    private componentRefs: {
        [componentName: string]: BoundComponentInstance;
    };

    public constructor(props: FormProps) {
        super(props);
        this.componentRefs = {};
    }

    /**
     * Programmatically submit form
     */
    public submit = (): void => {
        this.handleSubmit();
    };

    /**
     * Retrieves the current value for a component
     * @param {string} componentName name of the component
     */
    public getValue = (componentName: string): any => {
        return this.componentRefs[componentName].state.value;
    };

    /**
     * Retrieves current values for all components
     */
    public getValues = (): ValueMap => {
        return Object.keys(this.componentRefs).reduce(
            (values: ValueMap, componentName: string) => {
                values[componentName] = this.getValue(componentName);
                return values;
            },
            {},
        );
    };

    /**
     * Clears the form. The value and validator for each form component will be
     * set to undefined. Note: this will have no effect if the valueProp has
     * been provided.
     */
    public clear = (): void => {
        Object.keys(this.componentRefs).forEach((componentName: string) => {
            const component = this.componentRefs[componentName];
            component.clear();
        });
    };

    /**
     * Resets the form using the initialValue prop for each form component. If
     * the initialValue prop has not been provided, the new value will be undefined.
     * Note: this will have no effect if the valueProp has been provided.
     */
    public reset = (): void => {
        Object.keys(this.componentRefs).forEach((componentName: string) => {
            const component = this.componentRefs[componentName];
            component.reset();
        });
    };

    /**
     * Validates specified component(s). If no component names are provided,
     * all components within the form will be validated.
     */
    public validate = (componentName?: string | string[]): void => {
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
     * Inject a custom validator response on a form component
     * @param {string} componentName name of the component
     * @param {object} response custom validator response to be injected
     */
    public setResponse = (
        componentName: string,
        response: ValidatorResponse,
    ): void => {
        if (componentName in this.componentRefs) {
            this.componentRefs[componentName].setResponse(response);
        } else {
            console.warn(
                `Failed to set validator for "${componentName}" component. It does not exist in form context.`,
            );
        }
    };

    /**
     * Injects custom validator responses for form components
     * @param {object} responses component name / validator response map
     */
    public setResponses = (responses: {
        [componentName: string]: ValidatorResponse;
    }): void => {
        Object.keys(responses).forEach((componentName: string) => {
            this.setResponse(componentName, responses[componentName]);
        });
    };

    public render() {
        const {
            children,
            // Omitted
            onChange,
            onBlur,
            onFocus,
            onSubmit,
            onValidSubmit,
            onInvalidSubmit,
            // Injected
            ...restProps
        } = this.props;

        const api: FormApi = {
            registerComponent: this.registerComponent,
            unregisterComponent: this.unregisterComponent,
            validate: this.validate,
            getResponse: this.getResponse,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
            onFocus: this.handleFocus,
        };

        return (
            <FormContext.Provider value={api}>
                <form {...restProps} onSubmit={this.handleSubmit}>
                    {children}
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
        componentName: string,
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
    private unregisterComponent = (componentName: string): void => {
        delete this.componentRefs[componentName];
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
        componentName: string,
        value?: any,
        required: boolean = false,
    ): ValidatorResponse => {
        const values = this.getValues();
        const component = this.componentRefs[componentName];
        const { validatorRules, validatorMessages } = component.props;
        return validate(
            componentName,
            {
                ...values,
                [componentName]:
                    value !== undefined ? value : values[componentName],
            },
            {
                required,
                ...validatorRules,
            },
            validatorMessages,
        );
    };

    /**
     * Recursively builds a dependency map for components that are part of the
     * validator group tree.
     */
    private buildDependencyMap = (
        componentNames: string[],
        mappedNames: any = {},
    ): any => {
        // tslint:disable-next-line:no-parameter-reassignment
        mappedNames = componentNames.reduce(
            (names: any, name: string) => ({ ...names, [name]: true }),
            mappedNames,
        );

        return componentNames.reduce((output: any, name: string) => {
            const validatorGroup: string[] =
                this.componentRefs[name].props.validatorGroup || [];
            const namesToMap = validatorGroup.filter(
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
        }, mappedNames);
    };

    /**
     * Returns an of component names that should be validated when validating
     * a specific component. Determined using the validator group tree.
     * @returns array of componentNames
     */
    private getRelatedComponents = (componentName: string): string[] => {
        const { validatorGroup } = this.componentRefs[componentName].props;
        if (validatorGroup) {
            return Object.keys(this.buildDependencyMap(validatorGroup)).filter(
                (dependencyName: string) => dependencyName !== componentName,
            );
        }
        return [];
    };

    private handleChange = (componentName: string, value: any) => {
        // Cross validate if necessary
        this.getRelatedComponents(componentName).forEach((relName: string) => {
            this.componentRefs[relName].validate();
        });

        this.props.onChange(componentName, value);
    };

    private handleBlur = (componentName: string, value: any) => {
        this.props.onBlur(componentName, value);
    };

    private handleFocus = (componentName: string, value: any) => {
        this.props.onFocus(componentName, value);
    };

    private handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) {
            event.preventDefault();
        }
        const values = this.getValues();
        if (this.isValid()) {
            this.handleValidSubmit(values);
        } else {
            this.handleInvalidSubmit(values);
        }
    };

    private handleValidSubmit = (values: ValueMap) => {
        this.props.onValidSubmit(values);
    };

    private handleInvalidSubmit = (values: ValueMap) => {
        this.validate();
        this.props.onInvalidSubmit(values);
    };
}