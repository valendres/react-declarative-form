import * as React from 'react';
import { shallow } from 'enzyme';

import { Form, FormProps } from './Form';
import { bind } from '../bind';

class UnconnectedTextField extends React.Component<any> {
    render() {
        const {
            setValue,
            validatorContext,
            validatorMessage,
            pristine,
            ...restProps
        } = this.props;

        return <input {...restProps} onChange={this.handleChange} />;
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange, setValue } = this.props;
        setValue(event.currentTarget.value);
        if (onChange) onChange(event);
    };
}

const TextField = bind(UnconnectedTextField);

describe('Component: Form', () => {
    const mockProps = (props: Partial<FormProps>): FormProps => ({
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        onSubmit: jest.fn(),
        onValidSubmit: jest.fn(),
        onInvalidSubmit: jest.fn(),
        initialValues: undefined,
        withHiddenSubmit: false,
        ...props,
    });

    it('should add a hidden submit to form if withHiddenSubmit is true', () => {
        const props = mockProps({
            withHiddenSubmit: true,
        });
        const wrapper = shallow(
            <Form {...props}>
                <TextField />
            </Form>,
        );

        const submitButtons = wrapper.find('button[type="submit"]');
        expect(submitButtons.length).toBe(1);
        expect(submitButtons.at(0).props().style.display).toBe('none');
    });
});
