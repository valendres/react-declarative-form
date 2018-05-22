import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    ValidationContext,
} from 'react-form-validator';

import MaterialTextField, {
    TextFieldProps as MaterialTextFieldProps,
} from 'material-ui/TextField';

export interface TextFieldProps
    extends MaterialTextFieldProps,
        BoundComponentProps {
    name: string;
    label?: string;
}

export class UnboundTextField extends React.Component<TextFieldProps> {
    render() {
        const {
            name,
            value,
            setValue,
            onChange,
            validationContext,
            validationMessage,
            pristine,
            required,
            ...restProps
        } = this.props;

        const hasError = validationContext === ValidationContext.Danger;

        return (
            <MaterialTextField
                fullWidth
                margin="dense"
                {...restProps}
                id={name}
                name={name}
                value={value || ''}
                onChange={this.handleChange}
                error={!pristine && hasError}
                helperText={!pristine && validationMessage}
            />
        );
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange, setValue } = this.props;
        setValue(event.currentTarget.value);
        if (onChange) onChange(event);
    };
}

export const TextField = bind<TextFieldProps>(UnboundTextField);
