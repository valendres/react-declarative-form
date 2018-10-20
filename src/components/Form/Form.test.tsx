import * as React from 'react';
import { shallow, mount } from 'enzyme';

import { Form, FormProps } from './Form';
import { bind, BoundComponentProps } from '../bind';
import { ValidatorContext } from '@types';

interface TextFieldProps extends BoundComponentProps {
    label?: string;
    onChange?: (event: any) => void;
}

class UnconnectedTextField extends React.Component<TextFieldProps> {
    render() {
        const {
            label,
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
        setValue(event.target.value);
        if (onChange) onChange(event);
    };
}

const TextField = bind(UnconnectedTextField);

describe('Component: Form', () => {
    const mockProps = (props: Partial<FormProps> = {}): FormProps => ({
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

    const mockEvent = (value: React.ReactText) => ({
        target: {
            value,
        },
    });

    describe('form submission', () => {
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

        it.each([ValidatorContext.Success, ValidatorContext.Danger])(
            'should call handleSubmit regardless of validity state',
            validationContext => {
                const props = mockProps();
                const wrapper = mount(
                    <Form {...props}>
                        <TextField
                            name="test"
                            value="abc"
                            validatorContext={validationContext}
                        />
                    </Form>,
                );
                const form: Form = wrapper.instance() as any;

                form.submit();
                expect(props.onSubmit).toHaveBeenCalledWith({
                    test: 'abc',
                });
            },
        );

        it('should call onValidSubmit if form is valid when submitting', () => {
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        value="abc"
                        validatorContext={ValidatorContext.Danger}
                    />
                </Form>,
            );
            const form: Form = wrapper.instance() as any;

            form.submit();
            expect(props.onInvalidSubmit).toHaveBeenCalledWith({
                test: 'abc',
            });
            expect(props.onValidSubmit).not.toHaveBeenCalled();
        });

        it('should call onInvalidSubmit if form is invalid when submitting', () => {
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        value="abc"
                        validatorContext={ValidatorContext.Success}
                    />
                </Form>,
            );
            const form: Form = wrapper.instance() as any;

            form.submit();
            expect(props.onInvalidSubmit).not.toHaveBeenCalled();
            expect(props.onValidSubmit).toHaveBeenCalledWith({
                test: 'abc',
            });
        });
    });

    describe('value sources', () => {
        const controlledValue = '1';
        const stateValue = '2';
        const initialValue = '3';
        const defaultValue = '4';

        it('should allow value to be externally controlled', async () => {
            const props = mockProps({
                initialValues: {
                    test: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        label="Controlled (level 1)"
                        value={controlledValue}
                        defaultValue={defaultValue}
                        required
                    />
                </Form>,
            );

            // Should be controlled value initially
            expect(wrapper.find('input').props().value).toBe(controlledValue);

            // Should still be controlled value, since this component is externally controlled
            expect((wrapper.find('input').getDOMNode() as any).value).toBe(
                controlledValue,
            );
        });

        it('should allow value to be internally controlled', async () => {
            const props = mockProps({
                initialValues: {
                    test: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        label="Auto (level 2)"
                        defaultValue={defaultValue}
                        required
                    />
                </Form>,
            );

            // Should be initialValue initially because we haven't tried to change its value
            expect(wrapper.find('input').props().value).toBe(initialValue);

            // Fire change event
            wrapper.find('input').simulate('change', mockEvent(stateValue));

            // Should now be stateValue since this component is internally controlled
            expect(wrapper.find('input').props().value).toBe(stateValue);
        });

        it('should allow value to be populated with initialValues on Form component', () => {
            const props = mockProps({
                initialValues: {
                    test: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        label="Auto (level 2)"
                        defaultValue={defaultValue}
                        required
                    />
                </Form>,
            );

            // Should be initialValue because because it's been specified on the form
            expect(wrapper.find('input').props().value).toBe(initialValue);
        });

        it('should allow defaultValue to be specified on individual bound component', () => {
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="test"
                        label="Auto (level 2)"
                        defaultValue={defaultValue}
                        required
                    />
                </Form>,
            );

            // Should be defaultValue because no other higher precedence value sources exist
            expect(wrapper.find('input').props().value).toBe(defaultValue);
        });
    });
});
