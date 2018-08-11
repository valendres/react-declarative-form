import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    ValidatorContext,
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
            validatorContext,
            validatorMessage,
            pristine,
            required,
            ...restProps
        } = this.props;

        const hasError = validatorContext === ValidatorContext.Danger;

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
                helperText={!pristine && validatorMessage}
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
