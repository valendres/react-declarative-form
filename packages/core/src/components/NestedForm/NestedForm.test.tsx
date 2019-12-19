import { NestedForm } from './NestedForm';
import { BoundComponentProps, bind, BoundComponent } from '../bind';
import * as React from 'react';
import { mount } from 'enzyme';
import { Form } from '../Form';
import { ValidatorContext } from '@types';

describe('Component: NestedForm', () => {
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

    const findNestedForm = (wrapper: any, name: string): NestedForm => {
        return wrapper
            .find(NestedForm)
            .find({
                name,
            })
            .at(0)
            .instance() as any;
    };

    const findTextField = (wrapper: any, name: string): BoundComponent => {
        return wrapper
            .find(TextField)
            .find({
                name,
            })
            .at(0)
            .instance() as any;
    };

    describe('Outer <Form/> api', () => {
        describe('Misc behaviour', () => {
            it('should hide the components from the parent form', () => {
                const username = 'peter';
                const currencyAmount = '500';
                const currencyCode = 'AUD';
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" value={username} />
                        <NestedForm name="currency">
                            <TextField name="amount" value={currencyAmount} />
                            <TextField name="code" value={currencyCode} />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();
                const values = outerFormInstance.getValues();

                expect(Object.keys(values)).toEqual(['username', 'currency']);
                expect(values).toEqual({
                    username,
                    currency: {
                        amount: currencyAmount,
                        code: currencyCode,
                    },
                });
            });
        }),
            describe('initialValues', () => {
                it('should pass initial values to nested components', () => {
                    const initialValues = {
                        username: 'James',
                        currency: {
                            amount: '100',
                            code: 'USD',
                        },
                    };
                    const wrapper = mount<Form<any>>(
                        <Form initialValues={initialValues}>
                            <TextField name="username" />
                            <NestedForm name="currency">
                                <TextField name="amount" />
                                <TextField name="code" />
                            </NestedForm>
                        </Form>,
                    );

                    const textFields = wrapper.find(TextField);
                    const usernameTextField = findTextField(
                        wrapper,
                        'username',
                    );
                    const amountTextField = findTextField(wrapper, 'amount');
                    const codeTextField = findTextField(wrapper, 'code');

                    expect(textFields.length).toEqual(3);
                    expect(usernameTextField.getValue()).toEqual(
                        initialValues.username,
                    );
                    expect(amountTextField.getValue()).toEqual(
                        initialValues.currency.amount,
                    );
                    expect(codeTextField.getValue()).toEqual(
                        initialValues.currency.code,
                    );
                });
            });

        describe('func: submit', () => {
            it('should execute respective callbacks depending depending on current validity state', async () => {
                const onSubmitSpy = jest.fn();
                const onValidSubmitSpy = jest.fn();
                const onInvalidSubmitSpy = jest.fn();

                const wrapper = mount<Form<any>>(
                    <Form
                        onSubmit={onSubmitSpy}
                        onValidSubmit={onValidSubmitSpy}
                        onInvalidSubmit={onInvalidSubmitSpy}
                        initialValues={{
                            currency: {
                                code: 'AU',
                            },
                        }}
                    >
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField
                                name="code"
                                validatorRules={{
                                    minLength: 3,
                                }}
                            />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();
                const codeTextField = findTextField(wrapper, 'code');

                // Ensure no spies have been called yet
                expect(onSubmitSpy).not.toHaveBeenCalled();
                expect(onValidSubmitSpy).not.toHaveBeenCalled();
                expect(onInvalidSubmitSpy).not.toHaveBeenCalled();

                // Submit the form with invalid components
                const initialSubmitReturnValue = outerFormInstance.submit();
                expect(initialSubmitReturnValue.isValid).toEqual(false);

                // Only onSubmit and onInvalidSubmit should have been called so far
                const expectedInitialSubmitValues: any = {
                    username: undefined,
                    currency: {
                        amount: undefined,
                        code: 'AU',
                    },
                };
                expect(onSubmitSpy).toHaveBeenCalledWith(
                    expectedInitialSubmitValues,
                );
                expect(onValidSubmitSpy).not.toHaveBeenCalled();
                expect(onInvalidSubmitSpy).toHaveBeenCalledWith(
                    expectedInitialSubmitValues,
                );

                // Reset mocks to not impact future counts
                onSubmitSpy.mockReset();
                onValidSubmitSpy.mockReset();
                onInvalidSubmitSpy.mockReset();

                // Update the value of the invalid component to be length >= 3
                await codeTextField.setValue('GBP');

                // Submit the form with all components being valid
                const secondSubmitReturnValid = outerFormInstance.submit();
                expect(secondSubmitReturnValid.isValid).toEqual(true);

                // Ensure onValidSubmitSpy was called
                const expectedSecondSubmitValues: any = {
                    username: undefined,
                    currency: {
                        amount: undefined,
                        code: 'GBP',
                    },
                };
                expect(onSubmitSpy).toHaveBeenCalledWith(
                    expectedSecondSubmitValues,
                );
                expect(onValidSubmitSpy).toHaveBeenCalledWith(
                    expectedSecondSubmitValues,
                );
                expect(onInvalidSubmitSpy).not.toHaveBeenCalled();
            });
        });

        describe('func: clear', () => {
            it('should clear nested form components when clear is called on the parent form', () => {
                const initialValues = {
                    username: 'James',
                    currency: {
                        amount: '100',
                        code: 'USD',
                    },
                };
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();
                const currencyNestedForm = findNestedForm(wrapper, 'currency');
                const usernameTextField = findTextField(wrapper, 'username');
                const amountTextField = findTextField(wrapper, 'amount');
                const codeTextField = findTextField(wrapper, 'code');

                // Clear the form
                outerFormInstance.clear();

                expect(currencyNestedForm.getValue()).toEqual({
                    amount: null,
                    code: null,
                });
                expect(usernameTextField.getValue()).toEqual(null);
                expect(amountTextField.getValue()).toEqual(null);
                expect(codeTextField.getValue()).toEqual(null);
            });
        });

        describe('func: reset', () => {
            it('should reset nested form components when reset is called on the parent form', async () => {
                const initialValues = {
                    username: 'James',
                    currency: {
                        amount: '100',
                        code: 'USD',
                    },
                };
                const updatedValues = {
                    username: 'Michael',
                    currency: {
                        amount: '999',
                        code: 'NZD',
                    },
                };
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();
                const currencyNestedForm = findNestedForm(wrapper, 'currency');
                const usernameTextField = findTextField(wrapper, 'username');
                const amountTextField = findTextField(wrapper, 'amount');
                const codeTextField = findTextField(wrapper, 'code');

                // Change from default values
                await outerFormInstance.setValues(updatedValues);

                // Ensure values have been changed from defaults
                expect(usernameTextField.getValue()).toEqual(
                    updatedValues.username,
                );
                expect(currencyNestedForm.getValue()).toEqual(
                    updatedValues.currency,
                );
                expect(amountTextField.getValue()).toEqual(
                    updatedValues.currency.amount,
                );
                expect(codeTextField.getValue()).toEqual(
                    updatedValues.currency.code,
                );

                // Reset the form
                outerFormInstance.reset();

                // Ensure values are returned back to their initial state
                expect(usernameTextField.getValue()).toEqual(
                    initialValues.username,
                );
                expect(currencyNestedForm.getValue()).toEqual(
                    initialValues.currency,
                );
                expect(amountTextField.getValue()).toEqual(
                    initialValues.currency.amount,
                );
                expect(codeTextField.getValue()).toEqual(
                    initialValues.currency.code,
                );
            });
        });

        describe('func: validate', () => {
            it('should trigger validation on nested form components', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                // Ensure component do not have validation data initially
                expect(wrapper.find({ name: 'amount' })).toHaveValidatorData(
                    {},
                );
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({});

                // Trigger validation
                const outerFormInstance = wrapper.instance();
                await outerFormInstance.validate();

                // Update the wrapper so the latest validatorData can be retrieved
                wrapper.update();

                // Ensure component has been validated as expected
                expect(wrapper.find({ name: 'amount' })).toHaveValidatorData({
                    context: ValidatorContext.Success,
                    message: undefined,
                });
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({
                    name: 'required',
                    context: ValidatorContext.Danger,
                    message: 'This field is required',
                });

                // Update the components value to something valid
                findTextField(wrapper, 'code').setValue(
                    'Pass required validation',
                );

                // Validate the form again, now we should expect that it's fully valid
                await outerFormInstance.validate();

                // Update the wrapper so the latest validatorData can be calculated
                wrapper.update();

                // Should now be valid
                expect(wrapper.find({ name: 'amount' })).toHaveValidatorData({
                    context: ValidatorContext.Success,
                    message: undefined,
                });
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({
                    context: ValidatorContext.Success,
                    message: undefined,
                });
            });
        });

        describe('func: isValid', () => {
            it('should return the correct validation state for nested form components when setting value on the component', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure component is invalid initially
                const initialIsValid = outerFormInstance.isValid();
                expect(initialIsValid).toEqual(false);

                // Update the components value to something valid
                findTextField(wrapper, 'code').setValue(
                    'Pass required validation',
                );

                // Form should now be valid
                const updatedIsValid = outerFormInstance.isValid();
                expect(updatedIsValid).toEqual(true);
            });

            it('should return the correct validation state for nested form components when setting value on the form', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure component is invalid initially
                const initialIsValid = outerFormInstance.isValid();
                expect(initialIsValid).toEqual(false);

                // Update the components value to something valid
                outerFormInstance.setValue('currency', {
                    amount: 300,
                    code: 'Pass required validation',
                });

                // Form should now be valid
                const updatedIsValid = outerFormInstance.isValid();
                expect(updatedIsValid).toEqual(true);
            });
        });

        describe('func: isPristine', () => {
            it('should return the correct pristine state for nested form components when setting value on the form', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure component is pristine initially
                const initialIsPristine = outerFormInstance.isPristine();
                expect(initialIsPristine).toEqual(true);

                // Update the components value to something valid
                outerFormInstance.setValue('currency', {
                    amount: 300,
                    code: 'Pass required validation',
                });

                // Form should no longer be pristine
                const updatedIsPristine = outerFormInstance.isPristine();
                expect(updatedIsPristine).toEqual(false);
            });
        });

        describe.skip('func: getValidatorData', () => {});

        describe('func: getValue', () => {
            it('should return value according to initialValues', () => {
                const initialValues: any = undefined;
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                expect(outerFormInstance.getValue('username')).toEqual(
                    undefined,
                );
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: undefined,
                    code: undefined,
                });

                // Ensure we can transition from no initialValues to having initialValues
                const initialValuesWithData = {
                    username: 'James',
                    currency: {
                        amount: '100',
                        code: 'AUD',
                    },
                };
                wrapper.setProps({
                    initialValues: initialValuesWithData,
                });
                expect(outerFormInstance.getValue('username')).toEqual(
                    initialValuesWithData.username,
                );
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: initialValuesWithData.currency.amount,
                    code: initialValuesWithData.currency.code,
                });

                // Ensure we can transition from having initialValues to having different initialValues
                const initialValuesWithDifferentData = {
                    username: 'Test',
                    currency: {
                        amount: '999',
                        code: 'GBP',
                    },
                };
                wrapper.setProps({
                    initialValues: initialValuesWithDifferentData,
                });
                expect(outerFormInstance.getValue('username')).toEqual(
                    initialValuesWithDifferentData.username,
                );
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: initialValuesWithDifferentData.currency.amount,
                    code: initialValuesWithDifferentData.currency.code,
                });
            });

            it('should return defaultValue if defined on a nested form component', () => {
                const defaultCurrencyCode = 'AUD';
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField
                                name="code"
                                defaultValue={defaultCurrencyCode}
                            />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();
                const currencyValue = outerFormInstance.getValue('currency');
                expect(currencyValue.code).toEqual(defaultCurrencyCode);
            });
        });

        describe('func: getValues', () => {
            it('should recursively get values from nested forms', async () => {
                const username = '🍆';
                const password = '🍑';
                const employerName = 'secret';
                const preTaxIncome = {
                    amount: undefined as string,
                    code: 'AUD',
                };
                const answer = 'For fun';

                const wrapper = mount<Form<any>>(
                    <Form
                        initialValues={{
                            sectionA: {
                                username,
                                password,
                            },
                        }}
                    >
                        <NestedForm name="sectionA">
                            <h2>Account Details</h2>
                            <TextField name="username" />
                            <TextField name="password" />
                        </NestedForm>
                        <NestedForm name="sectionB">
                            <h2>Financial Details</h2>
                            <TextField
                                name="employerName"
                                defaultValue={employerName}
                            />
                            <NestedForm name="preTaxIncome">
                                <TextField
                                    name="amount"
                                    value={preTaxIncome.amount}
                                />
                                <TextField
                                    name="code"
                                    value={preTaxIncome.code}
                                />
                            </NestedForm>
                        </NestedForm>
                        <NestedForm name="sectionC">
                            <NestedForm name="why">
                                <NestedForm name="is">
                                    <NestedForm name="this">
                                        <NestedForm name="so">
                                            <NestedForm name="nested">
                                                <TextField
                                                    name="answer"
                                                    defaultValue={answer}
                                                />
                                            </NestedForm>
                                        </NestedForm>
                                    </NestedForm>
                                </NestedForm>
                            </NestedForm>
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                expect(outerFormInstance.getValues()).toEqual({
                    sectionA: {
                        username,
                        password,
                    },
                    sectionB: {
                        employerName,
                        preTaxIncome,
                    },
                    sectionC: {
                        why: {
                            is: {
                                this: {
                                    so: {
                                        nested: {
                                            answer,
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
            });
        });

        describe.skip('func: setValidatorData', () => {});

        describe('func: setValue', () => {
            it('should update the form state correctly if calling setValue on the outer Form', () => {
                const initialValues: any = {
                    currency: {
                        amount: 500,
                    },
                };
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure value is in correct state initially
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: initialValues.currency.amount,
                    code: undefined,
                });

                outerFormInstance.setValue('currency', {
                    amount: 999,
                    code: 'AUD',
                });

                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: 999,
                    code: 'AUD',
                });
            });

            it('should set nested component values to null if NestedForm is updated with null value', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" defaultValue="900" />
                            <TextField name="code" defaultValue="AUD" />
                        </NestedForm>
                    </Form>,
                );

                // Ensure correct initial state
                expect(findTextField(wrapper, 'amount').getValue()).toEqual(
                    '900',
                );
                expect(findTextField(wrapper, 'code').getValue()).toEqual(
                    'AUD',
                );

                // Set currency field to null
                const outerFormInstance = wrapper.instance();
                outerFormInstance.setValue('currency', null);

                // Ensure value is now null
                expect(findTextField(wrapper, 'amount').getValue()).toEqual(
                    null,
                );
                expect(findTextField(wrapper, 'code').getValue()).toEqual(null);
            });
        });

        describe('func: setValues', () => {
            it('should allow setting multiple form values', () => {
                const initialValues: any = {
                    currency: {
                        amount: 500,
                    },
                };
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure value is in correct state initially
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: initialValues.currency.amount,
                    code: undefined,
                });

                outerFormInstance.setValues({
                    username: 'HELLO!',
                    currency: {
                        amount: 999,
                        code: 'AUD',
                    },
                });

                expect(outerFormInstance.getValue('username')).toEqual(
                    'HELLO!',
                );
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: 999,
                    code: 'AUD',
                });
            });
        });

        describe('func: isRecursiveComponent', () => {
            it("should return true for components that are NestedForm's", () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance: any = wrapper.instance();

                expect(outerFormInstance.isRecursiveComponent('username')).toBe(
                    false,
                );
                expect(outerFormInstance.isRecursiveComponent('currency')).toBe(
                    true,
                );
            });
        });

        describe('func: getComponentInstance', () => {
            it("should return true for components that are NestedForm's", () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance: any = wrapper.instance();

                // Should be undefined because username is not a nested field
                expect(
                    outerFormInstance.getComponentInstance('username')
                        .constructor.name,
                ).toBe('BoundComponent');

                // Should return an instance of NestedForm
                expect(
                    outerFormInstance.getComponentInstance('currency')
                        .constructor.name,
                ).toBe('NestedForm');
            });
        });
    });

    describe('Inner <NestedForm/> api', () => {
        describe('func: clear', () => {
            it('should clear the nested form components without impacting sibling components', async () => {
                const username = 'James';
                const amount = '500';
                const code = 'AUD';

                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form
                        initialValues={{
                            username,
                            currency: {
                                amount,
                                code,
                            },
                        }}
                    >
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure correct state to start with
                expect(outerFormInstance.getValues()).toEqual({
                    username,
                    currency: {
                        amount,
                        code,
                    },
                });
                expect(outerFormInstance.isPristine()).toBe(true);
                expect(outerFormInstance.isValid()).toBe(true);

                // Clear the currency field
                await currencyNestedFormRef.current.clear();

                // Update the wrapper so the latest validatorData can be retrieved
                wrapper.update();

                // Ensure only the currency fields have been cleared
                expect(outerFormInstance.getValues()).toEqual({
                    username,
                    currency: {
                        amount: null,
                        code: null,
                    },
                });
                expect(outerFormInstance.isPristine()).toBe(false);

                // Additionally, there should now be validator message
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({
                    name: 'required',
                    context: ValidatorContext.Danger,
                    message: 'This field is required',
                });
                expect(outerFormInstance.isValid()).toBe(false);
            });
        });

        describe('func: reset', () => {
            it.skip('should reset the nested form components without impacting sibling components', async () => {
                const username = 'James';
                const amount = '500';
                const code = 'AUD';

                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form
                        initialValues={{
                            username,
                            currency: {
                                amount,
                                code,
                            },
                        }}
                    >
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure correct state to start with
                expect(outerFormInstance.getValues()).toEqual({
                    username,
                    currency: {
                        amount,
                        code,
                    },
                });
                expect(outerFormInstance.isPristine()).toBe(true);
                expect(outerFormInstance.isValid()).toBe(true);

                // Update state
                currencyNestedFormRef.current.setValue({
                    amount: '69',
                    code: 'NZD',
                });

                expect(outerFormInstance.isPristine()).toEqual(false);
                expect(outerFormInstance.getValues()).toEqual({
                    username,
                    currency: {
                        amount: '69',
                        code: 'NZD',
                    },
                });

                // Reset the currency field
                await currencyNestedFormRef.current.reset();

                expect(outerFormInstance.isPristine('currency')).toEqual(true);
            });
        });

        describe('func: validate', () => {
            it('should validate the nested form components without impacting sibling components', async () => {
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" required />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                // Ensure correct state to start with
                expect(wrapper.find({ name: 'username' })).toHaveValidatorData(
                    {},
                );
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({});

                // Validate the currency field
                await currencyNestedFormRef.current.validate();

                // Update the wrapper so the latest validatorData can be retrieved
                wrapper.update();

                // Ensure only the form fields within the currency NestedForm has been validated
                expect(wrapper.find({ name: 'username' })).toHaveValidatorData(
                    {},
                );
                expect(wrapper.find({ name: 'code' })).toHaveValidatorData({
                    name: 'required',
                    context: ValidatorContext.Danger,
                    message: 'This field is required',
                });
            });
        });

        describe('func: isValid', () => {
            it('should return valid state of descendent components without considering sibling components', async () => {
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form initialValues={{ currency: { code: 'AUD' } }}>
                        <TextField name="username" required />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" required />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Validate the currency field
                expect(currencyNestedFormRef.current.isValid()).toBe(true);

                // Outer form should be invalid because username is required
                expect(outerFormInstance.isValid()).toBe(false);

                // Update the currency field to be invalid
                currencyNestedFormRef.current.setValue({
                    code: null,
                });
                expect(currencyNestedFormRef.current.isValid()).toBe(false);
            });
        });

        describe('func: isPristine', () => {
            it('should return pristine state of descendent components without considering sibling components', async () => {
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const currencyCodeTextField = React.createRef<BoundComponent>();
                const wrapper = mount<Form<any>>(
                    <Form initialValues={{ currency: { code: 'AUD' } }}>
                        <TextField name="username" required />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField
                                name="code"
                                ref={currencyCodeTextField}
                            />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure the currency field is initially pristine
                expect(currencyNestedFormRef.current.isPristine()).toBe(true);
                expect(outerFormInstance.isPristine()).toBe(true);

                await outerFormInstance.setValue('username', 'test');

                // Ensure the currency field is still pristine
                expect(currencyNestedFormRef.current.isPristine()).toBe(true);
                expect(outerFormInstance.isPristine()).toBe(false);

                // Update the currency field to make it no longer pristine
                await currencyCodeTextField.current.setValue('Hi');
                expect(currencyNestedFormRef.current.isPristine()).toBe(false);
                expect(outerFormInstance.isPristine()).toBe(false);
            });
        });

        describe.skip('func: getValidatorData', () => {});

        describe('func: getValue', () => {
            it('should return value according to initialValues', () => {
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                expect(currencyNestedFormRef.current.getValue()).toEqual({
                    amount: undefined,
                    code: undefined,
                });

                // Ensure we can transition from no initialValues to having initialValues
                const initialValuesWithData = {
                    username: 'James',
                    currency: {
                        amount: '100',
                        code: 'AUD',
                    },
                };
                wrapper.setProps({
                    initialValues: initialValuesWithData,
                });
                expect(currencyNestedFormRef.current.getValue()).toEqual(
                    initialValuesWithData.currency,
                );

                // Ensure we can transition from having initialValues to having different initialValues
                const initialValuesWithDifferentData = {
                    currency: {
                        amount: '999',
                        code: 'GBP',
                    },
                };
                wrapper.setProps({
                    initialValues: initialValuesWithDifferentData,
                });
                expect(currencyNestedFormRef.current.getValue()).toEqual(
                    initialValuesWithDifferentData.currency,
                );
            });

            it('should return defaultValue if defined on a nested form component', () => {
                const defaultCurrencyCode = 'AUD';

                const currencyNestedFormRef = React.createRef<NestedForm>();
                mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField
                                name="code"
                                defaultValue={defaultCurrencyCode}
                            />
                        </NestedForm>
                    </Form>,
                );

                const currencyValue = currencyNestedFormRef.current.getValue();
                expect(currencyValue.code).toEqual(defaultCurrencyCode);
            });
        });

        describe('func: setValue', () => {
            it('should update the form state correctly if calling setValue on the inner NestedForm', () => {
                const initialValues: any = {
                    currency: {
                        amount: 500,
                    },
                };

                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount<Form<any>>(
                    <Form initialValues={initialValues}>
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const outerFormInstance = wrapper.instance();

                // Ensure value is in correct state initially
                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: initialValues.currency.amount,
                    code: undefined,
                });

                currencyNestedFormRef.current.setValue({
                    amount: 999,
                    code: 'AUD',
                });

                expect(outerFormInstance.getValue('currency')).toEqual({
                    amount: 999,
                    code: 'AUD',
                });
            });

            it('should set nested component values to null if NestedForm is updated with null value', async () => {
                const wrapper = mount<Form<any>>(
                    <Form>
                        <TextField name="username" />
                        <NestedForm name="currency">
                            <TextField name="amount" defaultValue="900" />
                            <TextField name="code" defaultValue="AUD" />
                        </NestedForm>
                    </Form>,
                );

                // Ensure correct initial state
                expect(findTextField(wrapper, 'amount').getValue()).toEqual(
                    '900',
                );
                expect(findTextField(wrapper, 'code').getValue()).toEqual(
                    'AUD',
                );

                // Set currency field to null
                findNestedForm(wrapper, 'currency').setValue(null);

                // Ensure value is now null
                expect(findTextField(wrapper, 'amount').getValue()).toEqual(
                    null,
                );
                expect(findTextField(wrapper, 'code').getValue()).toEqual(null);
            });
        });

        describe('func: _handleChange', () => {
            it('should throw an error if called outside of a Form', async () => {
                const wrapper = mount(
                    <NestedForm name="currency">
                        <TextField name="amount" />
                        <TextField name="code" />
                    </NestedForm>,
                );
                const nestedForm = findNestedForm(wrapper, 'currency');

                expect.assertions(1);
                try {
                    await (nestedForm as any)._handleChange('amount', null);
                } catch (error) {
                    expect(error.message).toBe(
                        'Failed to handle change for "currency:amount". Must be descendant of a <Form/> descendant.',
                    );
                }
            });
        });

        describe('func: _handleBlur', () => {
            it('should bubble up to parent form if called inside a form', async () => {
                const amount = '69';
                const onBlur = jest.fn();
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount(
                    <Form onBlur={onBlur}>
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" defaultValue={amount} />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const nestedForm = findNestedForm(wrapper, 'currency');

                // Mock blur event
                const blurEvent = { currentTarget: { value: amount } };
                await (nestedForm as any)._handleBlur('amount', blurEvent);

                // Ensure callback was fired
                expect(onBlur).toHaveBeenCalledWith(
                    'currency',
                    {
                        amount,
                    },
                    blurEvent,
                );
            });

            it('should throw an error if called outside of a Form', async () => {
                const wrapper = mount(
                    <NestedForm name="currency">
                        <TextField name="amount" />
                        <TextField name="code" />
                    </NestedForm>,
                );
                const nestedForm = findNestedForm(wrapper, 'currency');

                expect.assertions(1);
                try {
                    await (nestedForm as any)._handleBlur('amount', null);
                } catch (error) {
                    expect(error.message).toBe(
                        'Failed to handle blur for "currency:amount". Must be descendant of a <Form/> descendant.',
                    );
                }
            });
        });

        describe('func: _handleFocus', () => {
            it('should bubble up to parent form if called inside a form', async () => {
                const amount = '69';
                const onFocus = jest.fn();
                const currencyNestedFormRef = React.createRef<NestedForm>();
                const wrapper = mount(
                    <Form onFocus={onFocus}>
                        <TextField name="username" />
                        <NestedForm name="currency" ref={currencyNestedFormRef}>
                            <TextField name="amount" defaultValue={amount} />
                            <TextField name="code" />
                        </NestedForm>
                    </Form>,
                );

                const nestedForm = findNestedForm(wrapper, 'currency');

                // Mock focus event
                const focusEvent = { currentTarget: { value: amount } };
                await (nestedForm as any)._handleFocus('amount', focusEvent);

                // Ensure callback was fired
                expect(onFocus).toHaveBeenCalledWith(
                    'currency',
                    {
                        amount,
                    },
                    focusEvent,
                );
            });

            it('should throw an error if called outside of a Form', async () => {
                const wrapper = mount<NestedForm>(
                    <NestedForm name="currency">
                        <TextField name="amount" />
                        <TextField name="code" />
                    </NestedForm>,
                );
                const nestedForm = findNestedForm(wrapper, 'currency');

                expect.assertions(1);
                try {
                    await (nestedForm as any)._handleFocus('amount', null);
                } catch (error) {
                    expect(error.message).toBe(
                        'Failed to handle focus for "currency:amount". Must be descendant of a <Form/> descendant.',
                    );
                }
            });
        });
    });
});
