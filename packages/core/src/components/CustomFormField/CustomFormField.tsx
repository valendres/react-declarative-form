import * as React from 'react';

import { bind, BoundComponentProps } from '../bind';

export interface CustomFormFieldProps extends BoundComponentProps {
    children?: (props: BoundComponentProps) => React.ReactNode;
}

export class UnboundCustomFormField extends React.Component<
    CustomFormFieldProps
> {
    render() {
        const { children, ...restProps } = this.props;
        return children?.(restProps) ?? null;
    }
}

export const CustomFormField = bind<CustomFormFieldProps>(
    UnboundCustomFormField,
);
