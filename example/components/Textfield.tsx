import * as React from 'react';
import * as classNames from 'classnames';
import {
    bind,
    BoundInternalProps,
    ValidationContext,
} from 'react-form-validator';

export interface TextFieldProps extends BoundInternalProps {
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
            label,
            name,
            value,
            setValue,
            validationContext,
            validationMessage,
            ...restProps
        } = this.props;
        const inputId = `${name}`;

        const isInvalid = validationContext === ValidationContext.Danger;
        const isValid = validationContext === ValidationContext.Success;

        return (
            <div className="form-group">
                {label && (
                    <label className="control-label" htmlFor={inputId}>
                        {label}
                    </label>
                )}
                <input
                    {...restProps}
                    className={classNames('form-control', {
                        'is-invalid': isInvalid,
                        'is-valid': isValid,
                    })}
                    id={inputId}
                    name={inputId}
                    value={value || ''}
                    onChange={this.handleChange}
                />
                {isInvalid &&
                    validationMessage && (
                        <span className="invalid-feedback">
                            {validationMessage}
                        </span>
                    )}
            </div>
        );
    }

    private handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.setValue(event.currentTarget.value);
        this.props.onChange(event);
    };
}

export const TextField = bind<TextFieldProps>(UnboundTextField);
