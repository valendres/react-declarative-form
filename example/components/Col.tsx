import * as React from 'react';
import * as classNames from 'classnames';

export interface ColProps extends React.HTMLProps<HTMLDivElement> {}

export class Col extends React.PureComponent<ColProps> {
    render() {
        const { children, className, ...restProps } = this.props;
        return (
            <div className={classNames('col', className)} {...restProps}>
                {children}
            </div>
        );
    }
}
