import * as React from 'react';
import { bind, BoundComponentProps } from '../bind';
import { Form } from '../Form';
import { mount } from 'enzyme';
import { Mirror } from './Mirror';
const delay = require('delay');

describe('Component: Mirror', () => {
    interface TextFieldProps extends BoundComponentProps {
        name: string;
    }

    class UnboundTextField extends React.Component<TextFieldProps> {
        render() {
            const { value } = this.props;

            return (
                <input
                    value={value !== undefined ? value : ''}
                    onChange={this.handleChange}
                />
            );
        }

        handleChange = (event: React.SyntheticEvent<any>) => {
            this.props.setValue((event.target as any).value);
        };
    }

    const TextField = bind(UnboundTextField);

    describe('render', () => {
        const age = '52';

        it('should reflect initialValue on first render', () => {
            const initialValues = {
                age,
            };

            const wrapper = mount(
                <Form initialValues={initialValues}>
                    <TextField name="age" />
                    <Mirror name="age">
                        {({ age }) => <div id="mirroredAge">{age}</div>}
                    </Mirror>
                </Form>,
            );

            // Should reflect initialValue on mount
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual(
                initialValues.age,
            );
        });

        it('should reflect defaultValue on second render', async () => {
            const wrapper = mount(
                <Form>
                    <TextField name="age" defaultValue={age} />
                    <Mirror name="age">
                        {({ age }) => <div id="mirroredAge">{age}</div>}
                    </Mirror>
                </Form>,
            );

            // Should be an empty string initially because its not possible
            // to reflect the defaultValue on initial render
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should now reflect defaultValue
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual(age);
        });

        it('should reflect externally managed value on second render', async () => {
            const wrapper = mount(
                <Form>
                    <TextField name="age" value={age} />
                    <Mirror name="age">
                        {({ age }) => <div id="mirroredAge">{age}</div>}
                    </Mirror>
                </Form>,
            );

            // Should be an empty string initially because its not possible
            // to reflect the value on initial render
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should now reflect externally managed value
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual(age);
        });

        it('should reflect internally managed value on second render', async () => {
            const wrapper = mount(
                <Form>
                    <TextField name="age" />
                    <Mirror name="age">
                        {({ age }) => <div id="mirroredAge">{age}</div>}
                    </Mirror>
                </Form>,
            );

            // Should be an empty string initially because there is currently no value
            // to mirror
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');

            wrapper
                .find('input')
                .simulate('change', { target: { value: age } });

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should now reflect externally managed value
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual(age);
        });

        it('should reflect multiple values', async () => {
            const values = {
                firstName: 'Peter',
                lastName: 'Weller',
            };
            const wrapper = mount(
                <Form initialValues={values}>
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                    <Mirror name={['firstName', 'lastName']}>
                        {({ firstName, lastName }) => (
                            <React.Fragment>
                                <div id="mirroredFirstName">{firstName}</div>
                                <div id="mirroredLastName">{lastName}</div>
                            </React.Fragment>
                        )}
                    </Mirror>
                </Form>,
            );

            // Should reflect initialValues on mount
            expect(wrapper.find({ id: 'mirroredFirstName' }).text()).toEqual(
                values.firstName,
            );
            expect(wrapper.find({ id: 'mirroredLastName' }).text()).toEqual(
                values.lastName,
            );
        });

        it('should return undefined for reflected names if component does not exist', async () => {
            const wrapper = mount(
                <Form>
                    <Mirror name="age">
                        {({ age }) => <div id="mirroredAge">{age}</div>}
                    </Mirror>
                </Form>,
            );

            // Should be an empty string because the target component does not exist
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should still be an empty string
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');
        });

        it('should return undefined for reflected names if placed outside of a form', async () => {
            const wrapper = mount(
                <Mirror name="age">
                    {({ age }) => (
                        <React.Fragment>
                            <div id="mirroredAge">{age}</div>
                        </React.Fragment>
                    )}
                </Mirror>,
            );

            // Should be an empty string because there is no value to reflect
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should still be an empty string
            expect(wrapper.find({ id: 'mirroredAge' }).text()).toEqual('');
        });
    });
});
