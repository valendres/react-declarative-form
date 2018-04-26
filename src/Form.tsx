import * as React from 'react';
import { ValidationResponse } from './types';
import { validate } from './validator';

export const FormContext = React.createContext({});

export interface FormApi {
    registerComponent: Form['registerComponent'];
    unregisterComponent: Form['unregisterComponent'];
    getValidation: Form['getValidation'];
    // getValue: Form['getValue'];
    // setValue: Form['setValue'];
    handleChange: Form['handleChange'];
    handleBlur: Form['handleBlur'];
    handleFocus: Form['handleFocus'];
}

export interface FormProps {
    onChange?: () => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onSubmit?: () => void;
    onValidSubmit?: () => void;
    onInvalidSubmit?: () => void;
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

    private componentRefs: any;

    public constructor(props: FormProps) {
        super(props);
        this.componentRefs = {};
    }

    public submit = () => {
        this.handleSubmit();
    };

    public reset = () => {
        this.setState({
            values: {},
            validations: {},
        });
    };

    public getValue = (name: string) => {
        return this.componentRefs[name].state.value;
    };

    public getValues = () => {
        return Object.keys(this.componentRefs).reduce(
            (values: any, name: string) => {
                values[name] = this.getValue(name);
                return values;
            },
            {},
        );
    };

    public validate = (name?: string) => {
        if (name) {
            // Validate single component
            this.componentRefs[name].validate();
        } else {
            // Validate all components
            Object.keys(this.componentRefs).forEach((name: string) => {
                this.componentRefs[name].validate();
            });
        }
    };

    public isValid = (): boolean => {
        return true;
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
            // setValue: this.setValue,
            // getValue: this.getValue,
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

    private registerComponent = (key: string, ref: any) => {
        this.componentRefs[key] = ref;
    };

    private unregisterComponent = (key: string) => {
        delete this.componentRefs[key];
    };

    private getValidation = (key: string, value?: any): ValidationResponse => {
        const values = this.getValues();
        const component = this.componentRefs[key];
        const { validationRules, valdiationMessages } = component.props;
        return validate(
            key,
            {
                ...values,
                [key]: value !== undefined ? value : values[key],
            },
            validationRules,
            valdiationMessages,
        );
    };

    // private setValue = (key: string, value: any) => {
    //     this.setState({
    //         ...this.state,
    //         values: {
    //             ...this.state.values,
    //             [key]: value,
    //         },
    //         validations: {
    //             ...this.state.validations,
    //             [key]: this.getValidation(key, value),
    //         },
    //     });
    // };

    private handleChange = (name: string, value: any) => {
        this.props.onChange();
        console.log(`Form: "${name}" changed to "${value}"`);
    };

    private handleBlur = (name: string, value: any) => {
        this.props.onBlur();
        console.log(`Form: "${name}" blurred with "${value}"`);
    };

    private handleFocus = (name: string, value: any) => {
        this.props.onFocus();
        console.log(`Form: "${name}" focused with "${value}"`);
    };

    private handleSubmit = () => {
        this.props.onSubmit();
        if (this.isValid()) {
            this.handleValidSubmit();
        } else {
            this.handleInvalidSubmit();
        }
    };

    private handleValidSubmit = () => {
        this.props.onValidSubmit();
    };

    private handleInvalidSubmit = () => {
        this.props.onInvalidSubmit();
        this.validate();
    };
}
