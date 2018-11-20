import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { bind, BoundComponentProps } from '../bind';
import { Form, FormProps } from './Form';
import { Mirror } from '../Mirror';
import { ValidatorContext } from '@types';

describe('component: Form', () => {
    interface TextFieldProps extends BoundComponentProps {
        label?: string;
        type?: string;
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
                value,
                ...restProps
            } = this.props;

            return (
                <input
                    {...restProps}
                    value={value || ''}
                    onChange={this.handleChange}
                />
            );
        }

        handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const { onChange, setValue } = this.props;
            setValue(event.target.value);
            if (onChange) onChange(event);
        };
    }

    const TextField = bind(UnconnectedTextField);

    const mockProps = (props: Partial<FormProps> = {}): FormProps => ({
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        onSubmit: jest.fn(),
        onValidSubmit: jest.fn(),
        onInvalidSubmit: jest.fn(),
        ...props,
    });

    const mockEvent = (value: React.ReactText) => ({
        target: {
            value,
        },
    });

    const documentMount = (component: React.ReactElement<any>): Element => {
        // Mount react component to jsdom
        mount(component, { attachTo: document as any });

        // Return HTML element reference
        return document.lastElementChild;
    };

    describe('form submission', () => {
        it('should allow the form to be submitted when a submit button is clicked', async () => {
            const props = mockProps();
            const form = documentMount(
                <Form {...props}>
                    <TextField name="firstName" value="Peter" />
                    <button type="submit" />
                </Form>,
            );

            // should not have been called yet
            expect(props.onSubmit).not.toHaveBeenCalled();

            return new Promise(resolve => {
                form.addEventListener('submit', resolve);
                form.querySelector('button').click();
            }).then(() => {
                expect(props.onSubmit).toHaveBeenCalledWith({
                    firstName: 'Peter',
                });
            });
        });

        it('should add a hidden submit button to the form when withHiddenSubmit is true', () => {
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

        it('should allow the form to be programatically submitted', () => {
            const props = mockProps();
            const wrapper = shallow(
                <Form {...props}>
                    <TextField />
                </Form>,
            );

            // should not have been called yet
            expect(props.onSubmit).not.toHaveBeenCalled();

            const form = wrapper.instance() as Form;
            form.submit();

            // should have been called
            expect(props.onSubmit).toHaveBeenCalled();
        });
    });

    describe('form component registration/unregistration', () => {
        it('should correctly register and unregister components', () => {
            // We should encounter an error by attempting to mount a duplicate component
            jest.spyOn(console, 'error');

            const componentName = 'firstName';
            const props = mockProps();

            // Trigger component registration
            const wrapper = mount(
                <Form {...props}>
                    <TextField name={componentName} />
                    <TextField name={componentName} />
                </Form>,
            );

            const form = wrapper.instance() as any;
            const component = wrapper
                .find(TextField)
                .at(0)
                .instance();

            // Should store a reference to the first firstName component
            expect(form.componentRefs[componentName]).toEqual(component);

            // Should log an error when attempting to register duplicate firstName component
            expect(console.error).toHaveBeenCalledWith(
                `Duplicate form component: "${componentName}"`,
            );

            // Trigger component unregistration
            wrapper.unmount();

            // Refs should be empty again
            expect(form.componentRefs).toMatchObject({});

            // Cleanup
            (console.error as any).mockRestore();
        });
    });

    describe('form mirror registration/unregistration', () => {
        it('should correctly register and unregister mirrors', () => {
            const componentName = 'firstName';
            const props = mockProps();

            // Trigger component registration
            const wrapper = mount(
                <Form {...props}>
                    <TextField name={componentName} />
                    <Mirror name={componentName}>{() => null}</Mirror>
                    <Mirror name={componentName}>{() => null}</Mirror>
                </Form>,
            );

            const form = wrapper.instance() as any;
            const mirror1 = wrapper
                .find(Mirror)
                .at(0)
                .instance();
            const mirror2 = wrapper
                .find(Mirror)
                .at(1)
                .instance();

            // Should store a reference for both mirrors
            expect(form.mirrorRefs[componentName]).toEqual([mirror1, mirror2]);

            // Trigger mirror unregistration
            wrapper.unmount();

            // Refs should be empty again
            expect(form.mirrorRefs).toMatchObject({});
        });
    });

    describe('event handlers', () => {
        it('should call change handler if a form component has been changed', () => {
            const firstName = 'Peter';
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            // Simulate a change event
            wrapper
                .find({ name: 'firstName' })
                .find('input')
                .simulate('change', mockEvent(firstName));

            // Ensure handler has been called
            expect(props.onChange).toHaveBeenCalledWith('firstName', firstName);
        });

        it('should call blur handler if a form component has been blurred', () => {
            const firstName = 'Peter';
            const props = mockProps({
                initialValues: {
                    firstName,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            // Simulate a change event
            wrapper
                .find({ name: 'firstName' })
                .find('input')
                .simulate('blur');

            // Ensure handler has been called with current value
            expect(props.onBlur).toHaveBeenCalledWith('firstName', firstName);
        });

        it('should call focus handler if a form component has been focused', () => {
            const firstName = 'Peter';
            const props = mockProps({
                initialValues: {
                    firstName,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            // Simulate a change event
            wrapper
                .find({ name: 'firstName' })
                .find('input')
                .simulate('focus');

            // Ensure handler has been called with current value
            expect(props.onFocus).toHaveBeenCalledWith('firstName', firstName);
        });

        it('should call valid form handlers if submitting without an invalid component', async () => {
            const values = {
                firstName: 'Peter',
                lastName: 'Weller',
                age: 10,
            };
            const props = mockProps({
                initialValues: values,
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                    <TextField name="age" />
                </Form>,
            );

            // Programatically submit the form
            const result = await (wrapper.instance() as Form).submit();

            // Test programatic form submission result
            expect(result).toMatchObject({
                values,
                isValid: true,
            });

            // Should always be called on form submission
            expect(props.onSubmit).toHaveBeenCalledWith(values);

            // Should only be called if there are no invalid form components
            expect(props.onValidSubmit).toHaveBeenCalled();

            // Should not be called if theres are no invalid form components
            expect(props.onInvalidSubmit).not.toHaveBeenCalledWith(values);
        });

        it('should call invalid form handlers if submitting with an invalid component', async () => {
            const values = {
                firstName: 'Peter',
                lastName: 'Weller',
                age: 10,
            };
            const props = mockProps({
                initialValues: values,
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                    <TextField
                        name="age"
                        validatorRules={{
                            minValue: 18,
                        }}
                    />
                </Form>,
            );

            // Programatically submit the form
            const result = await (wrapper.instance() as Form).submit();

            // Test programatic form submission result
            expect(result).toMatchObject({
                values,
                isValid: false,
            });

            // Should always be called on form submission
            expect(props.onSubmit).toHaveBeenCalledWith(values);

            // Should only be called if theres an invalid form component
            expect(props.onInvalidSubmit).toHaveBeenCalledWith(values);

            // Should not be called if theres an invalid form component
            expect(props.onValidSubmit).not.toHaveBeenCalled();
        });
    });

    describe('value sources', () => {
        const controlledValue = 'controlled';
        const stateValue = 'state';
        const initialValue = 'initial';
        const defaultValue = 'default';

        it('should allow value to be externally controlled', async () => {
            const props = mockProps({
                initialValues: {
                    firstName: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField
                        name="firstName"
                        value={controlledValue}
                        defaultValue={defaultValue}
                    />
                </Form>,
            );

            // Should be controlled value initially
            expect(wrapper.find({ name: 'firstName' }) as any).toHaveInputValue(
                controlledValue,
            );

            // Fire change event
            wrapper
                .find({ name: 'firstName' })
                .find('input')
                .simulate('change', mockEvent(stateValue));

            // Should still be controlled value, since this component is externally controlled
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                controlledValue,
            );
        });

        it('should allow value to be internally controlled', async () => {
            const props = mockProps({
                initialValues: {
                    firstName: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" defaultValue={defaultValue} />
                </Form>,
            );

            // Should be initialValue initially because we haven't tried to change its value
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                initialValue,
            );

            // Fire change event
            wrapper
                .find({ name: 'firstName' })
                .find('input')
                .simulate('change', mockEvent(stateValue));

            // Should now be stateValue since this component is internally controlled
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                stateValue,
            );
        });

        it('should allow value to be populated with initialValues on Form component', () => {
            const props = mockProps({
                initialValues: {
                    firstName: initialValue,
                },
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" defaultValue={defaultValue} />
                </Form>,
            );

            // Should be initialValue because because it's been specified on the form
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                initialValue,
            );
        });

        it('should allow defaultValue to be specified on individual bound component', () => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" defaultValue={defaultValue} />
                </Form>,
            );

            // Should be defaultValue because no other higher precedence value sources exist
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                defaultValue,
            );
        });

        it('should allow a single form value to be programatically set', async () => {
            const nextValue = 'Peter';
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" />
                </Form>,
            );

            // Should be empty string by default
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue('');

            // Programatically set the form value
            await (wrapper.instance() as Form).setValue('firstName', nextValue);

            // Update the wrapper so the latest value can be retrieved
            wrapper.update();

            // Should have updated value
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                nextValue,
            );
        });

        it('should allow multiple form values to be programatically set', async () => {
            const initialValues = {
                firstName: 'John',
                lastName: 'Smith',
            };
            const nextValues = {
                firstName: 'Peter',
                lastName: 'Weller',
            };

            const wrapper = mount(
                <Form
                    {...mockProps({
                        initialValues,
                    })}
                >
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                </Form>,
            );

            // Should be initial values by default
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                initialValues.firstName,
            );
            expect(wrapper.find({ name: 'lastName' })).toHaveInputValue(
                initialValues.lastName,
            );

            // Programatically set the form values
            await (wrapper.instance() as Form).setValues(nextValues);

            // Update the wrapper so the latest value can be retrieved
            wrapper.update();

            // Should have updated values
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                nextValues.firstName,
            );
            expect(wrapper.find({ name: 'lastName' })).toHaveInputValue(
                nextValues.lastName,
            );
        });

        it('should return a rejected promise if attempting to set a value of a component which does not exist', () => {
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            expect.assertions(1);
            return (wrapper.instance() as Form)
                .setValue('lastName', 'abc')
                .catch(error => {
                    expect(error).toBe(
                        'Failed to set value for "lastName" component. It does not exist in form context.',
                    );
                });
        });
    });

    describe('validation', () => {
        it('should trigger validation for all components when submitting', async () => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" required />
                </Form>,
            );

            // Shouldn't have a response by default
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                undefined,
            );

            // Trigger validation by submitting
            await (wrapper.instance() as Form).submit();

            // Update the wrapper so the latest response can be retrieved
            wrapper.update();

            // Should have updated response
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse({
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
        });

        it('should allow consumers to manage the validation response externally', () => {
            const response = {
                context: ValidatorContext.Danger,
                message: 'Something went wrong :(',
            };

            const wrapper = mount(
                <Form>
                    <TextField
                        name="firstName"
                        validatorContext={response.context}
                        validatorMessage={response.message}
                    />
                </Form>,
            );

            // Should have response by default
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                response,
            );

            // Attempt to replace response
            (wrapper.instance() as Form).setResponse('firstName', {
                context: ValidatorContext.Success,
                message: undefined,
            });

            // Update the wrapper so the latest response can be retrieved
            wrapper.update();

            // Should have the same response as externally managed value should take precedence
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                response,
            );
        });

        it.each([
            // Singular prop
            'passwordConfirm',
            // Array prop
            ['passwordConfirm'],
        ])(
            'should trigger validation on related components if there are no circular dependencies',
            validatorTrigger => {
                const password = 'abc';
                const props = mockProps({
                    initialValues: {
                        password: 'a',
                        passwordConfirm: 'b',
                    },
                });
                const wrapper = mount(
                    <Form {...props}>
                        <TextField
                            name="password"
                            validatorTrigger={validatorTrigger}
                            type="password"
                        />
                        <TextField
                            name="passwordConfirm"
                            validatorRules={{
                                eqTarget: 'password',
                            }}
                            validatorMessages={{
                                eqTarget: 'Must match password',
                            }}
                            type="password"
                        />
                    </Form>,
                );

                // Shouldn't have a responses by default
                expect(wrapper.find({ name: 'password' })).toHaveResponse(
                    undefined,
                );
                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveResponse(undefined);

                // Simulate chaging the password confirmation to something that doesn't match
                wrapper
                    .find({ name: 'passwordConfirm' })
                    .find('input')
                    .simulate('change', mockEvent(password));

                // Update the wrapper so the latest response can be retrieved
                wrapper.update();

                // Should add incorrect password messaeg
                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveResponse({
                    context: ValidatorContext.Danger,
                    message: 'Must match password',
                });

                // Simulate chaging the password to trigger a related updated
                wrapper
                    .find({ name: 'password' })
                    .find('input')
                    .simulate('change', mockEvent(password));

                // Update the wrapper so the latest response can be retrieved
                wrapper.update();

                expect(wrapper.find({ name: 'password' })).toHaveResponse({
                    context: ValidatorContext.Success,
                    message: undefined,
                });

                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveResponse({
                    context: ValidatorContext.Success,
                    message: undefined,
                });
            },
        );

        it('should allow validation on all form components to be programatically triggered', () => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" required />
                    <TextField name="lastName" />
                    <TextField
                        name="age"
                        validatorRules={{
                            custom: () => {
                                return {
                                    context: ValidatorContext.Warning,
                                    message: 'Custom warning message',
                                };
                            },
                        }}
                        value="10"
                    />
                </Form>,
            );

            // Trigger all validations
            (wrapper.instance() as Form).validate();

            // Update the wrapper so the latest response can be retrieved
            wrapper.update();

            expect(wrapper.find({ name: 'firstName' })).toHaveResponse({
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
            expect(wrapper.find({ name: 'lastName' })).toHaveResponse({
                context: ValidatorContext.Success,
                message: undefined,
            });
            expect(wrapper.find({ name: 'age' })).toHaveResponse({
                context: ValidatorContext.Warning,
                message: 'Custom warning message',
            });
        });

        it('should allow a single validation response to be programatically set', async () => {
            const response = {
                context: ValidatorContext.Danger,
                message: 'Invalid first name',
            };

            const wrapper = mount(
                <Form>
                    <TextField name="firstName" />
                </Form>,
            );

            // Shouldn't have a response by default
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                undefined,
            );

            // Programatically set the response
            await (wrapper.instance() as Form).setResponse(
                'firstName',
                response,
            );

            // Update the wrapper so the latest response can be retrieved
            wrapper.update();

            // Should have updated response
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                response,
            );
        });

        it('should allow multiple validation responses to be programatically set', async () => {
            const responses = {
                firstName: {
                    context: ValidatorContext.Danger,
                    message: 'Invalid first name',
                },
                lastName: {
                    context: ValidatorContext.Danger,
                    message: 'Invalid last name',
                },
            };

            const wrapper = mount(
                <Form>
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                </Form>,
            );

            // Shouldn't have any responses by default
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                undefined,
            );
            expect(wrapper.find({ name: 'lastName' })).toHaveResponse(
                undefined,
            );

            // Programatically set the responses
            await (wrapper.instance() as Form).setResponses(responses);

            // Update the wrapper so the latest responses can be retrieved
            wrapper.update();

            // Should have updated responses
            expect(wrapper.find({ name: 'firstName' })).toHaveResponse(
                responses.firstName,
            );
            expect(wrapper.find({ name: 'lastName' })).toHaveResponse(
                responses.lastName,
            );
        });

        it('should return a rejected promise if attempting to set a validation response of a component which does not exist', () => {
            const props = mockProps();
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            expect.assertions(1);
            return (wrapper.instance() as Form)
                .setResponse('lastName', {
                    context: ValidatorContext.Danger,
                    message: 'Something went wrong :(',
                })
                .catch(error => {
                    expect(error).toBe(
                        'Failed to set response for "lastName" component. It does not exist in form context.',
                    );
                });
        });
    });
});
