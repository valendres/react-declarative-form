import { NestedForm } from './NestedForm';
import { BoundComponentProps, bind, BoundComponent } from '../bind';
import React from 'react';
import { mount } from 'enzyme';
import { Form } from '../Form';

describe.skip('Component: NestedForm', () => {
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
        return wrapper.find(NestedForm).find({
            name,
        }) as any;
    };

    const findTextField = (wrapper: any, name: string): BoundComponent => {
        return wrapper.find(TextField).find({
            name,
        }) as any;
    };

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

        expect(values.keys()).toEqual(['currency']);
        expect(values).toEqual({
            username,
            currency: {
                amount: currencyAmount,
                code: currencyCode,
            },
        });
    });

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
        const usernameTextField = findTextField(wrapper, 'username');
        const amountTextField = findTextField(wrapper, 'amount');
        const codeTextField = findTextField(wrapper, 'code');

        expect(textFields.length).toEqual(3);
        expect(usernameTextField.getValue()).toEqual(initialValues.username);
        expect(amountTextField.getValue()).toEqual(
            initialValues.currency.amount,
        );
        expect(codeTextField.getValue()).toEqual(initialValues.currency.code);
    });

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
        const innerFormInstance = findNestedForm(wrapper, 'currency');
        const usernameTextField = findTextField(wrapper, 'username');
        const amountTextField = findTextField(wrapper, 'amount');
        const codeTextField = findTextField(wrapper, 'code');

        jest.spyOn(innerFormInstance, 'clear');
        jest.spyOn(usernameTextField, 'clear');
        jest.spyOn(amountTextField, 'clear');
        jest.spyOn(codeTextField, 'clear');

        outerFormInstance.clear();

        expect(innerFormInstance.clear).toHaveBeenCalled();
        expect(usernameTextField.clear).toHaveBeenCalled();
        expect(amountTextField.clear).toHaveBeenCalled();
        expect(codeTextField.clear).toHaveBeenCalled();

        expect(innerFormInstance.getValue()).toEqual(null);
        expect(usernameTextField.getValue()).toEqual(null);
        expect(amountTextField.getValue()).toEqual(null);
        expect(codeTextField.getValue()).toEqual(null);
    });

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
        const innerFormInstance = findNestedForm(wrapper, 'currency');
        const usernameTextField = findTextField(wrapper, 'username');
        const amountTextField = findTextField(wrapper, 'amount');
        const codeTextField = findTextField(wrapper, 'code');

        // Change from default values
        await outerFormInstance.setValues(updatedValues);

        // Ensure values have been changed from defaults
        expect(usernameTextField.getValue()).toEqual(updatedValues.username);
        expect(amountTextField.getValue()).toEqual(
            updatedValues.currency.amount,
        );
        expect(codeTextField.getValue()).toEqual(updatedValues.currency.code);

        jest.spyOn(innerFormInstance, 'reset');
        jest.spyOn(usernameTextField, 'reset');
        jest.spyOn(amountTextField, 'reset');
        jest.spyOn(codeTextField, 'reset');

        outerFormInstance.reset();

        expect(innerFormInstance.reset).toHaveBeenCalled();
        expect(usernameTextField.reset).toHaveBeenCalled();
        expect(amountTextField.reset).toHaveBeenCalled();
        expect(codeTextField.reset).toHaveBeenCalled();

        // Ensure values are returned back to their initial state
        expect(innerFormInstance.getValue()).toEqual(initialValues);
        expect(usernameTextField.getValue()).toEqual(initialValues.username);
        expect(amountTextField.getValue()).toEqual(
            initialValues.currency.amount,
        );
        expect(codeTextField.getValue()).toEqual(initialValues.currency.code);
    });

    it('should reset nested form components when reset is called on the parent form', async () => {
        const initialValues = {
            username: 'James',
            currency: {
                amount: '100',
                code: 'USD',
            },
        };
        const updatedValues = {
            currency: {
                amount: '222',
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
        const innerFormInstance = findNestedForm(wrapper, 'currency');
        const usernameTextField = findTextField(wrapper, 'username');
        const amountTextField = findTextField(wrapper, 'amount');
        const codeTextField = findTextField(wrapper, 'code');

        // Ensure value is correct initially
        expect(amountTextField.getValue()).toEqual(
            initialValues.currency.amount,
        );

        // Change from default value
        await amountTextField.setValue(updatedValues.currency.amount);

        // Ensure values were updated correctly
        expect(outerFormInstance.getValues()).toEqual({
            username: initialValues.username,
            currency: {
                amount: updatedValues.currency.amount,
                code: initialValues.currency.amount,
            },
        });
        expect(innerFormInstance.getValue()).toEqual({
            amount: updatedValues.currency.amount,
            code: initialValues.currency.amount,
        });
        expect(usernameTextField.getValue()).toEqual(initialValues.username);
        expect(amountTextField.getValue()).toEqual(
            updatedValues.currency.amount,
        );
        expect(codeTextField.getValue()).toEqual(initialValues.currency.code);
    });
});
