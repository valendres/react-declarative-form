import * as React from 'react';

export interface FormProps {
    onChange?: () => void;
    onBlur?: () => void;
    onSubmit?: () => void;
    onValidSubmit?: () => void;
    onInvalidSubmit?: () => void;
}

export class Form extends React.Component<FormProps> {
    public submit() {}

    public reset() {}

    public render() {
        const { children, ...restProps } = this.props;

        return <form {...restProps}>{children}</form>;
    }
}
