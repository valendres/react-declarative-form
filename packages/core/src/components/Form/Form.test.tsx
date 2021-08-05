import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { bind, BoundComponentProps } from '../bind';
import { Form, FormProps } from './Form';
import { Mirror } from '../Mirror';
import { ValidatorContext, ValidatorData } from '@types';
const delay = require('delay');

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
                validatorData,
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

    const TextField = bind<TextFieldProps>(UnconnectedTextField);

    const mockProps = (
        props: Partial<FormProps<any>> = {},
    ): FormProps<any> => ({
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

            return new Promise((resolve) => {
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
                    <TextField name="test" />
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
                    <TextField name="test" />
                </Form>,
            );

            // should not have been called yet
            expect(props.onSubmit).not.toHaveBeenCalled();

            const form = wrapper.instance() as Form<any>;
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
            const componentInstance = wrapper.find(TextField).at(0).instance();

            // Should store a reference to the first firstName component
            expect(form.components[componentName].instance).toEqual(
                componentInstance,
            );

            // Should log an error when attempting to register duplicate firstName component
            expect(console.error).toHaveBeenCalledWith(
                `Failed to register component: "${componentName}", a component with this name already exists.`,
            );

            // Trigger component unregistration
            wrapper.unmount();

            // Refs should be empty again
            expect(form.components).toMatchObject({});

            // Cleanup
            (console.error as any).mockRestore();
        });

        it.each([
            [
                'should validate component on registration if it is not initially pristine',
                {
                    pristine: false,
                    expectedValidatorData: {
                        context: ValidatorContext.Warning,
                        message: 'Custom warning message',
                    },
                },
            ],
            [
                'should not validate component on registration if component is pristine',
                {
                    pristine: true,
                    expectedValidatorData: undefined,
                },
            ],
            [
                'should not validate component on registration if no pristine prop provided (undefined)',
                {
                    pristine: undefined,
                    expectedValidatorData: undefined,
                },
            ],
        ])('%s', (_, { pristine, expectedValidatorData }) => {
            const componentName = 'firstName';
            const wrapper = mount(
                <Form>
                    <TextField
                        name={componentName}
                        validatorRules={{
                            custom: () => {
                                return {
                                    context: ValidatorContext.Warning,
                                    message: 'Custom warning message',
                                };
                            },
                        }}
                        pristine={pristine}
                        value="Tai"
                    />
                </Form>,
            );

            const form = wrapper.instance() as any;

            // Pristine prop should determine whether it should be validated on initial load/registration
            // We check component validatorData and instance._state as they should both contain validator data
            expect(form.components[componentName].validatorData).toStrictEqual(
                expectedValidatorData,
            );
            expect(
                form.components[componentName].instance._state.validatorData,
            ).toStrictEqual({
                context: expectedValidatorData?.context,
                message: expectedValidatorData?.message,
            });
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
            const mirror1 = wrapper.find(Mirror).at(0).instance();
            const mirror2 = wrapper.find(Mirror).at(1).instance();

            // Should store a reference for both mirrors
            expect(form.mirrors[componentName]).toEqual([mirror1, mirror2]);

            // Trigger mirror unregistration
            wrapper.unmount();

            // Refs should be empty again
            expect(form.mirrors).toMatchObject({});
        });
    });

    describe('event handlers', () => {
        it('should call change handler if a form component has been changed', async () => {
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

            await delay(10);

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
            wrapper.find({ name: 'firstName' }).find('input').simulate('blur');

            // Ensure handler has been called with current value
            const [
                componentName,
                value,
                event,
            ] = (props.onBlur as any).mock.calls[0];
            expect(componentName).toBe('firstName');
            expect(value).toBe(firstName);
            expect(event.type).toBe('blur');
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
            wrapper.find({ name: 'firstName' }).find('input').simulate('focus');

            // Ensure handler has been called with current value
            const [
                componentName,
                value,
                event,
            ] = (props.onFocus as any).mock.calls[0];
            expect(componentName).toBe('firstName');
            expect(value).toBe(firstName);
            expect(event.type).toBe('focus');
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
            const result = await (wrapper.instance() as Form<any>).submit();

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
            const result = await (wrapper.instance() as Form<any>).submit();

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
            await (wrapper.instance() as Form<any>).setValue(
                'firstName',
                nextValue,
            );

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
            await (wrapper.instance() as Form<any>).setValues(nextValues);

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

        it('should do nothing if attempting to set a value of a component which does not exist', async () => {
            const props = mockProps();
            const wrapper = mount<Form<any>>(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            return expect(
                wrapper.instance().setValue('lastName', 'abc'),
            ).resolves.toBeUndefined();
        });

        it('should ignore initialValues if null', async () => {
            const props = mockProps({
                initialValues: null,
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="firstName" defaultValue={defaultValue} />
                </Form>,
            );

            // Should be defaultValue because initialValues is null
            expect(wrapper.find({ name: 'firstName' })).toHaveInputValue(
                defaultValue,
            );
        });
    });

    describe('value transformation', () => {
        it('should provide the transformed value from valueTransformer to the form component', () => {
            const props = mockProps({
                initialValues: {
                    fruit: 'grape',
                },
                valueTransformer: (componentName, value) =>
                    componentName === 'fruit' ? `transformed-${value}` : value,
            });
            const wrapper = mount(
                <Form {...props}>
                    <TextField name="fruit" />
                </Form>,
            );

            // Should be the transformed initial value
            expect(wrapper.find({ name: 'fruit' })).toHaveInputValue(
                'transformed-grape',
            );
        });

        it('should provide the new transformed value from the value transformer to the form component if setValue is called', () => {
            const props = mockProps({
                initialValues: {
                    fruit: 'lemon',
                },
                valueTransformer: (componentName, value) =>
                    componentName === 'fruit' ? `transformed-${value}` : value,
            });
            const wrapper = mount<
                Form<{
                    fruit: string;
                }>
            >(
                <Form {...props}>
                    <TextField name="fruit" />
                </Form>,
            );

            wrapper.instance().setValue('fruit', 'lime');

            // Should be the transformed updated value
            expect(wrapper.find({ name: 'fruit' })).toHaveInputValue(
                'transformed-lime',
            );
        });

        it('should provide the new transformed value from the value transformer to the form component if setValue is called', () => {
            const props = mockProps({
                initialValues: {
                    fruit: 'lemon',
                },
                valueTransformer: (componentName, value) =>
                    componentName === 'fruit' ? `transformed-${value}` : value,
            });
            const wrapper = mount<
                Form<{
                    fruit: string;
                }>
            >(
                <Form {...props}>
                    <TextField name="fruit" />
                </Form>,
            );

            wrapper.instance().setValue('fruit', 'lime');

            // Should be the transformed updated value
            expect(wrapper.find({ name: 'fruit' })).toHaveInputValue(
                'transformed-lime',
            );
        });

        it('should used the transformed value for component validation', () => {
            const customValidator = jest.fn().mockReturnValue(undefined);
            const props = mockProps({
                valueTransformer: (componentName, value) =>
                    componentName === 'fruit' ? `ripe-${value}` : value,
            });
            const wrapper = mount<
                Form<{
                    fruit: string;
                }>
            >(
                <Form {...props}>
                    <TextField
                        name="fruit"
                        defaultValue="banana"
                        validatorRules={{
                            matches: /^ripe-/,
                            custom: customValidator,
                        }}
                    />
                </Form>,
            );

            // Should be true because the transformed default value should match the expected value
            expect(wrapper.instance().isValid('fruit')).toBe(true);

            // Ensure that the transformed value was passed to the validator
            expect(customValidator.mock.calls[0][1]).toMatchObject({
                fruit: 'ripe-banana',
            });
        });

        it('should use the valueTransformer when calling getValue', () => {
            const initialFruitValue = 'eggplant';
            const initialVegetableValue = 'pumpkin';

            const props = mockProps({
                initialValues: {
                    fruit: initialFruitValue,
                    vegetable: initialVegetableValue,
                },
                valueTransformer: jest
                    .fn()
                    .mockImplementation((componentName, value) =>
                        componentName === 'fruit'
                            ? `transformed-${value}`
                            : value,
                    ),
            });
            const wrapper = mount<
                Form<{
                    fruit: string;
                    vegetable: string;
                }>
            >(
                <Form {...props}>
                    <TextField name="fruit" />
                    <TextField name="vegetable" />
                </Form>,
            );

            // The value should be the transformed fruit value
            expect(wrapper.instance().getValue('fruit')).toEqual(
                'transformed-eggplant',
            );

            // The last name should have not changed because our transformer did not modify it
            expect(wrapper.instance().getValue('vegetable')).toEqual('pumpkin');
        });

        it('should use the valuesTransformer when calling getValues', () => {
            const initialFruitValue = 'apple';
            const initialVegetableValue = 'potato';

            const props = mockProps({
                initialValues: {
                    fruit: initialFruitValue,
                    vegetable: initialVegetableValue,
                },
                valuesTransformer: jest.fn().mockImplementation((values) => ({
                    ...values,
                    fruit: `transformed-${values.fruit}`,
                })),
            });
            const wrapper = mount<Form>(
                <Form {...props}>
                    <TextField name="fruit" />
                    <TextField name="vegetable" />
                </Form>,
            );

            // Values transformer should not have been called because we haven't called getValues yet
            expect(props.valuesTransformer).not.toHaveBeenCalled();

            expect(wrapper.instance().getValues()).toEqual({
                // The value should be the transformed fruit value
                fruit: 'transformed-apple',
                // The last name should have not changed because our transformer did not modify it
                vegetable: 'potato',
            });

            // Values transformer should have now been called
            expect(props.valuesTransformer).toHaveBeenCalledWith(
                props.initialValues,
            );
        });
    });

    describe('validation', () => {
        it('should trigger validation for all components when submitting', async () => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" required />
                </Form>,
            );

            // Shouldn't have validatorData by default
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData(
                undefined,
            );

            // Trigger validation by submitting
            await (wrapper.instance() as Form<any>).submit();

            // Update the wrapper so the latest validatorData can be retrieved
            wrapper.update();

            // Should have updated validatorData
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData({
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
        });

        it('should allow consumers to manage the validatorData externally', () => {
            const validatorData: ValidatorData = {
                context: ValidatorContext.Danger,
                message: 'Something went wrong :(',
            };

            const wrapper = mount(
                <Form>
                    <TextField name="firstName" validatorData={validatorData} />
                </Form>,
            );

            // Should have validatorData by default
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData(
                validatorData,
            );

            // Attempt to replace validatorData
            (wrapper.instance() as Form<any>).setValidatorData('firstName', {
                context: ValidatorContext.Success,
                message: undefined,
            });

            // Update the wrapper so the latest validatorData can be retrieved
            wrapper.update();

            // Should have the same validatorData as externally managed value should take precedence
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData(
                validatorData,
            );
        });

        it.each([
            // Singular prop
            'passwordConfirm',
            // Array prop
            ['passwordConfirm'],
        ])(
            'should trigger validation on related components if there are no circular dependencies',
            (validatorTrigger) => {
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

                // Shouldn't have validatorData by default
                expect(wrapper.find({ name: 'password' })).toHaveValidatorData(
                    undefined,
                );
                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveValidatorData(undefined);

                // Simulate chaging the password confirmation to something that doesn't match
                wrapper
                    .find({ name: 'passwordConfirm' })
                    .find('input')
                    .simulate('change', mockEvent(password));

                // Update the wrapper so the latest validatorData can be retrieved
                wrapper.update();

                // Should add incorrect password messaeg
                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveValidatorData({
                    context: ValidatorContext.Danger,
                    message: 'Must match password',
                });

                // Simulate chaging the password to trigger a related updated
                wrapper
                    .find({ name: 'password' })
                    .find('input')
                    .simulate('change', mockEvent(password));

                // Update the wrapper so the latest validatorData can be retrieved
                wrapper.update();

                expect(wrapper.find({ name: 'password' })).toHaveValidatorData({
                    context: ValidatorContext.Success,
                    message: undefined,
                });

                expect(
                    wrapper.find({ name: 'passwordConfirm' }),
                ).toHaveValidatorData({
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
            (wrapper.instance() as Form<any>).validate();

            // Update the wrapper so the latest validatorData can be retrieved
            wrapper.update();

            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData({
                context: ValidatorContext.Danger,
                message: 'This field is required',
            });
            expect(wrapper.find({ name: 'lastName' })).toHaveValidatorData({
                context: ValidatorContext.Success,
                message: undefined,
            });
            expect(wrapper.find({ name: 'age' })).toHaveValidatorData({
                context: ValidatorContext.Warning,
                message: 'Custom warning message',
            });
        });

        it('should allow validatorData to be programatically set', async () => {
            const validatorData: ValidatorData = {
                context: ValidatorContext.Danger,
                message: 'Invalid first name',
            };

            const wrapper = mount(
                <Form>
                    <TextField name="firstName" />
                </Form>,
            );

            // Shouldn't have validatorData by default
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData({
                context: undefined,
                message: undefined,
            });

            // Programatically set the validatorData
            await (wrapper.instance() as Form<any>).setValidatorData(
                'firstName',
                validatorData,
            );

            // Update the wrapper so the latest validatorData can be retrieved
            wrapper.update();

            // Should have updated validatorData
            expect(wrapper.find({ name: 'firstName' })).toHaveValidatorData(
                validatorData,
            );
        });

        it('should do nothing if attempting to set validatorData for a component which does not exist', () => {
            const props = mockProps();
            const wrapper = mount<Form<any>>(
                <Form {...props}>
                    <TextField name="firstName" />
                </Form>,
            );

            return expect(
                wrapper.instance().setValidatorData('lastName', {
                    context: ValidatorContext.Danger,
                    message: 'Something went wrong :(',
                }),
            ).resolves.toBeUndefined();
        });
    });

    describe('func: isPristine', () => {
        it.each([
            [
                'should default to pristine if pristine prop is not provided',
                {
                    pristine: undefined,
                    expectedResult: true,
                },
            ],
            [
                'should return pristine prop if provided (true)',
                {
                    pristine: true,
                    expectedResult: true,
                },
            ],
            [
                'should return pristine prop if provided (false)',
                {
                    pristine: false,
                    expectedResult: false,
                },
            ],
        ])('%s', (_, { pristine, expectedResult }) => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" pristine={pristine} />
                </Form>,
            );

            // Check pristine of TextField
            const instance = wrapper.find(TextField).instance() as any;
            expect(instance.isPristine()).toBe(expectedResult);
        });

        it('should no longer be pristine after validation is triggered', () => {
            const wrapper = mount(
                <Form>
                    <TextField name="firstName" />
                </Form>,
            );

            // Initially form should be pristine
            expect(
                (wrapper.find(TextField).instance() as any).isPristine(),
            ).toBe(true);

            // Trigger validation on the form
            (wrapper.instance() as Form<any>).validate();

            // After validation is triggered form is no longer pristine
            expect(
                (wrapper.find(TextField).instance() as any).isPristine(),
            ).toBe(false);
        });
    });
});
