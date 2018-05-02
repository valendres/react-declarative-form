import * as React from 'react';
import {
    bind,
    BoundComponentInternalProps,
    ValidationContext,
} from 'react-form-validator';

import MaterialTextField, {
    TextFieldProps as MaterialTextFieldProps,
} from 'material-ui/TextField';

export interface TextFieldProps
    extends MaterialTextFieldProps,
        BoundComponentInternalProps {
    name: string;
    label?: string;
    onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export class UnboundTextField extends React.Component<TextFieldProps> {
    static defaultProps = {
        onChange: () => {},
    };

    render() {
        const {
            name,
            value,
            setValue,
            validationContext,
            validationMessage,
            pristine,
            required,
            ...restProps
        } = this.props;

        const inputId = `${name}`;
        const hasError = validationContext === ValidationContext.Danger;

        return (
            <MaterialTextField
                fullWidth
                margin="dense"
                {...restProps}
                id={inputId}
                name={inputId}
                value={value || ''}
                onChange={this.handleChange}
                error={!pristine && hasError}
                helperText={!pristine && validationMessage}
            />
        );
    }

    private handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.setValue(event.currentTarget.value);
        this.props.onChange(event);
    };
}

export const TextField: React.ComponentClass<TextFieldProps> = bind<
    TextFieldProps
>(UnboundTextField);
