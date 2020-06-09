import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    ValidatorContext,
    Omit,
} from '@react-declarative-form/core';

import MaterialSelect, {
    SelectProps as MaterialSelectProps,
} from '@material-ui/core/Select';
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
} from '@material-ui/core';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps
    extends Omit<MaterialSelectProps, 'value' | 'defaultValue' | 'children'>,
        Omit<BoundComponentProps, 'onBlur' | 'onFocus'> {
    name: string;
    label: string;
    options: SelectOption[];
}

export class UnboundSelect extends React.PureComponent<SelectProps> {
    render() {
        const {
            label,
            name,
            value,
            setValue,
            onChange,
            validatorData,
            pristine,
            required,
            defaultValue,
            options,
            ...restProps
        } = this.props;
        const labelId = `${name}-label`;

        return (
            <FormControl fullWidth margin="dense">
                <InputLabel id={labelId}>{label}</InputLabel>
                <MaterialSelect
                    fullWidth
                    {...restProps}
                    labelId={labelId}
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={this.handleChange}
                    error={
                        validatorData &&
                        validatorData.context === ValidatorContext.Danger
                    }
                >
                    {options.map(({ value, label }) => (
                        <MenuItem value={value} key={value}>
                            {label}
                        </MenuItem>
                    ))}
                </MaterialSelect>
                {validatorData && (
                    <FormHelperText>{validatorData.message}</FormHelperText>
                )}
            </FormControl>
        );
    }

    private handleChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
        child: React.ReactNode,
    ) => {
        const { onChange, setValue } = this.props;
        setValue(event.target.value);
        if (onChange) onChange(event, child);
    };
}

export const Select = bind<SelectProps>(UnboundSelect);
