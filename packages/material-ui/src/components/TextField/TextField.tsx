import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    ValidatorContext,
    Omit,
} from '@react-declarative-form/core';

import MaterialTextField, {
    StandardTextFieldProps as MaterialTextFieldProps,
} from '@material-ui/core/TextField';

export interface TextFieldProps
    extends Omit<MaterialTextFieldProps, 'value' | 'defaultValue'>,
        Omit<BoundComponentProps, 'onBlur' | 'onFocus'> {
    name: string;
    label?: string;
}

export class UnboundTextField extends React.PureComponent<TextFieldProps> {
    render() {
        const {
            name,
            value,
            setValue,
            onChange,
            validatorData,
            pristine,
            required,
            defaultValue,
            ...restProps
        } = this.props;

        return (
            <MaterialTextField
                fullWidth
                margin="dense"
                {...restProps}
                id={name}
                name={name}
                value={value || ''}
                onChange={this.handleChange}
                error={
                    !pristine &&
                    validatorData &&
                    validatorData.context === ValidatorContext.Danger
                }
                helperText={!pristine && validatorData && validatorData.message}
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
