import * as React from 'react';
import * as classNames from 'classnames';

export interface RowProps extends React.HTMLProps<HTMLDivElement> {}

export class Row extends React.PureComponent<RowProps> {
    render() {
        const { children, className, ...restProps } = this.props;
        return (
            <div className={classNames('row', className)} {...restProps}>
                {children}
            </div>
        );
    }
}
