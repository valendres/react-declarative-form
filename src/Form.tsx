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
        [name: string]: BoundComponentInstance;
    };

    public constructor(props: FormProps) {
        super(props);
        this.componentRefs = {};
    }

    public submit = () => {
        this.handleSubmit();
    };

    public getValue = (name: string) => {
        return this.componentRefs[name].state.value;
    };

    public getValues = (): ValueMap => {
        return Object.keys(this.componentRefs).reduce(
            (values: ValueMap, name: string) => {
                values[name] = this.getValue(name);
                return values;
            },
            {},
        );
    };

    /**
     * Valdiates specified field(s). If no field names are provided,
     * all fields within the form will be valdiated.
     */
    public validate = (name?: string | string[]) => {
        (name !== undefined
            ? Array.isArray(name)
                ? name
                : [name]
            : Object.keys(this.componentRefs)
        ).forEach((name: string) => {
            this.componentRefs[name].validate();
        });
    };

    public isValid = (): boolean => {
        return !Object.keys(this.componentRefs).some((name: string) => {
            const component = this.componentRefs[name];
            return !component.isValid();
        });
    };

    public setValidation = (
        name: string,
        validation: ValidationResponse,
    ): void => {
        if (name in this.componentRefs) {
            this.componentRefs[name].setValidation(validation);
        } else {
            console.warn(
                `Failed to set validation for "${name}" component. It does not exist in form context.`,
            );
        }
    };

    public setValidations = (validations: {
        [name: string]: ValidationResponse;
    }): void => {
        Object.keys(validations).forEach((name: string) => {
            this.setValidation(name, validations[name]);
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

    private registerComponent = (
        name: string,
        componentRef: BoundComponentInstance,
    ) => {
        // Only register if this form component has not been mounted yet
        if (!(name in this.componentRefs)) {
            this.componentRefs[name] = componentRef;
        } else {
            console.error(`Duplicate form component: "${name}"`);
        }
    };

    private unregisterComponent = (name: string) => {
        delete this.componentRefs[name];
    };

    private getValidation = (
        key: string,
        value?: any,
        required: boolean = false,
    ): ValidationResponse => {
        const values = this.getValues();
        const component = this.componentRefs[key];
        const { validationRules, validationMessages } = component.props;
        return validate(
            key,
            {
                ...values,
                [key]: value !== undefined ? value : values[key],
            },
            {
                required,
                ...validationRules,
            },
            validationMessages,
        );
    };

    private buildDependencyTree = (
        inputNames: string[],
        mappedNames: any = {},
    ): any => {
        mappedNames = inputNames.reduce(
            (names: any, name: string) => ({ ...names, [name]: true }),
            mappedNames,
        );

        return inputNames.reduce((output: any, name: string) => {
            const validationGroup: string[] =
                this.componentRefs[name].props.validationGroup || [];
            const namesToMap = validationGroup.filter(
                (n: string) => !(n in mappedNames),
            );

            // Only recurse if necessary
            if (namesToMap.length > 0) {
                return {
                    ...output,
                    ...this.buildDependencyTree(namesToMap, mappedNames),
                };
            }

            return output;
        }, mappedNames);
    };

    private getRelatedComponents = (name: string) => {
        const { validationGroup } = this.componentRefs[name].props;
        if (validationGroup) {
            return Object.keys(
                this.buildDependencyTree(validationGroup),
            ).filter((dependencyName: string) => dependencyName !== name);
        }
        return [];
    };

    private handleChange = (name: string, value: any) => {
        // Cross validate if necessary
        this.getRelatedComponents(name).forEach((relName: string) => {
            this.componentRefs[relName].validate();
        });

        this.props.onChange(name, value);
    };

    private handleBlur = (name: string, value: any) => {
        this.props.onBlur(name, value);
    };

    private handleFocus = (name: string, value: any) => {
        this.props.onFocus(name, value);
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
