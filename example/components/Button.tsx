import * as React from 'react';
import * as classNames from 'classnames';

export enum ButtonStyle {
    Primary = 'primary',
    Secondary = 'secondary',
    Success = 'success',
    Danger = 'danger',
    Warning = 'warning',
    Info = 'info',
    Light = 'light',
    Dark = 'dark',
    Link = 'link',
}

export enum ButtonSize {
    Large = 'lg',
    Small = 'sm',
}

export interface ButtonProps {
    label: string;
    className?: string;
    type?: string;
    size?: ButtonSize;
    style?: ButtonStyle;
    onClick?: any;
}

export class Button extends React.Component<ButtonProps> {
    static Style = ButtonStyle;
    static Size = ButtonSize;
    static defaultProps = {
        onClick: () => {},
        style: ButtonStyle.Primary,
    };

    render() {
        const { className, label, size, style, ...restProps } = this.props;

        return (
            <button
                className={classNames(
                    'btn',
                    `btn-${style}`,
                    size ? `btn-${size}` : '',
                    className,
                )}
                {...restProps}
            >
                {label}
            </button>
        );
    }
}
