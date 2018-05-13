import * as React from 'react';
import { ValidationResponse, ValueMap } from './types';
import { validate } from './validator';
import { BoundComponentInstance } from './formBinding';

export const FormContext = React.createContext({});

export interface FormApi {
    registerComponent: Form['registerComponent'];
    unregisterComponent: Form['unregisterComponent'];
    validate: Form['validate'];
    getValidation: Form['getValidation'];
    handleChange: Form['handleChange'];
    handleBlur: Form['handleBlur'];
    handleFocus: Form['handleFocus'];
}

export interface FormProps {
    onChange?: (name: string, value: any) => void;
    onBlur?: (name: string, value: any) => void;
    onFocus?: (name: string, value: any) => void;
    onSubmit?: (values: ValueMap) => void;
    onValidSubmit?: (values: ValueMap) => void;
    onInvalidSubmit?: (values: ValueMap) => void;
    style?: any;
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
     * Programatically submit form
     */
    public submit = () => {
        this.handleSubmit();
    };

    /**
     * Retrieves the current value for a component
     * @param {string} componentName name of the component
     */
    public getValue = (componentName: string) => {
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
     * Valdiates specified component(s). If no component names are provided,
     * all components within the form will be valdiated.
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
     * Executes validation rules on all component
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
     * Inject a custom validation response on a form component
     * @param {string} componentName name of the component
     * @param {object} validation custom validation response to be injected
     */
    public setValidation = (
        componentName: string,
        validation: ValidationResponse,
    ): void => {
        if (componentName in this.componentRefs) {
            this.componentRefs[componentName].setValidation(validation);
        } else {
            console.warn(
                `Failed to set validation for "${componentName}" component. It does not exist in form context.`,
            );
        }
    };

    /**
     * Injects custom validation responses for form components
     * @param {object} validations component name / validation response map
     */
    public setValidations = (validations: {
        [componentName: string]: ValidationResponse;
    }): void => {
        Object.keys(validations).forEach((componentName: string) => {
            this.setValidation(componentName, validations[componentName]);
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
            getValidation: this.getValidation,
            handleChange: this.handleChange,
            handleBlur: this.handleBlur,
            handleFocus: this.handleFocus,
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
     * Executes validation object for the specified component name. If no custom value
     * is provided, the current value will be retrieved from the form component.
     * @param {string} componentName name of the component
     * @param {any} value (optional) custom value to be used when validating
     * @param {boolean} required (default: false) whether or not a value is required
     * @returns validation response: context, message
     */
    private getValidation = (
        componentName: string,
        value?: any,
        required: boolean = false,
    ): ValidationResponse => {
        const values = this.getValues();
        const component = this.componentRefs[componentName];
        const { validationRules, validationMessages } = component.props;
        return validate(
            componentName,
            {
                ...values,
                [componentName]:
                    value !== undefined ? value : values[componentName],
            },
            {
                required,
                ...validationRules,
            },
            validationMessages,
        );
    };

    /**
     * Recursively builds a dependency map for components that are part of the
     * validation group tree.
     */
    private buildDependencyMap = (
        componentNames: string[],
        mappedNames: any = {},
    ): any => {
        mappedNames = componentNames.reduce(
            (names: any, name: string) => ({ ...names, [name]: true }),
            mappedNames,
        );

        return componentNames.reduce((output: any, name: string) => {
            const validationGroup: string[] =
                this.componentRefs[name].props.validationGroup || [];
            const namesToMap = validationGroup.filter(
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
     * a specific component. Determined using the validation group tree.
     * @returns array of componentNames
     */
    private getRelatedComponents = (componentName: string): string[] => {
        const { validationGroup } = this.componentRefs[componentName].props;
        if (validationGroup) {
            return Object.keys(this.buildDependencyMap(validationGroup)).filter(
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
