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

        it('should reflect the new name if name is updated', async () => {
            const values = {
                target: 'firstName',
                firstName: 'Peter',
                lastName: 'Weller',
            };

            // Use target as a dummy Mirror to assist in testing the update lifecycle
            const wrapper = mount<Form<any>>(
                <Form initialValues={values}>
                    <TextField name="target" />
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                    <Mirror name="target">
                        {({ target }) => (
                            <Mirror name={target}>
                                {(mirroredValues) => (
                                    <React.Fragment>
                                        <div id="mirroredChild">
                                            {mirroredValues[target]}
                                        </div>
                                    </React.Fragment>
                                )}
                            </Mirror>
                        )}
                    </Mirror>
                </Form>,
            );

            // Should reflect the initial name
            expect(wrapper.find({ id: 'mirroredChild' }).text()).toEqual(
                values.firstName,
            );

            // Change what should be reflected
            wrapper.instance().setValue('target' as any, 'lastName');

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should reflect the new name
            expect(wrapper.find({ id: 'mirroredChild' }).text()).toEqual(
                values.lastName,
            );
        });

        it('should reflect multiple new names if names are updated', async () => {
            const values = {
                targets: ['firstName', 'lastName'],
                firstName: 'Peter',
                lastName: 'Weller',
                age: '52',
            };

            // Use target as a dummy Mirror to assist in testing the update lifecycle
            const wrapper = mount<Form<any>>(
                <Form initialValues={values}>
                    <TextField name="targets" />
                    <TextField name="firstName" />
                    <TextField name="lastName" />
                    <TextField name="age" />
                    <Mirror name="targets">
                        {({ targets }) => (
                            <Mirror name={targets}>
                                {(mirroredValues) => (
                                    <React.Fragment>
                                        <div id="mirroredChildA">
                                            {mirroredValues[targets[0]]}
                                        </div>
                                        <div id="mirroredChildB">
                                            {mirroredValues[targets[1]]}
                                        </div>
                                    </React.Fragment>
                                )}
                            </Mirror>
                        )}
                    </Mirror>
                </Form>,
            );

            // Should reflect the initial names
            expect(wrapper.find({ id: 'mirroredChildA' }).text()).toEqual(
                values.firstName,
            );
            expect(wrapper.find({ id: 'mirroredChildB' }).text()).toEqual(
                values.lastName,
            );

            // Change what should be reflected
            wrapper.instance().setValue('targets' as any, ['lastName', 'age']);

            // Wait unti next event loop
            await delay(10);
            wrapper.update();

            // Should reflect the new name
            expect(wrapper.find({ id: 'mirroredChildA' }).text()).toEqual(
                values.lastName,
            );
            expect(wrapper.find({ id: 'mirroredChildB' }).text()).toEqual(
                values.age,
            );
        });

        it('should not enter an infite loop when mirrors are reflecting eachother', async () => {
            mount(
                <Form>
                    <Mirror name="endDate">
                        {(mirroredValues) => (
                            <TextField
                                name="startDate"
                                value={undefined}
                                validatorRules={{
                                    maxValue: mirroredValues.endDate,
                                }}
                            />
                        )}
                    </Mirror>
                    <Mirror name="startDate">
                        {(mirroredValues) => (
                            <TextField
                                name="endDate"
                                value={new Date()}
                                validatorRules={{
                                    minValue: mirroredValues.startDate,
                                }}
                            />
                        )}
                    </Mirror>
                </Form>,
            );

            /**
             * Whenever a bound component is updated, it will cause the
             * mirrors refelcting them to be updated. Without sufficient
             * guards in place, the componentDidUpdate can enter into an
             * infinite promise loop. Which means that is impossible to
             * enter the next javascript event tick.
             *
             * Here we call `await delay(0)` to wait for the next tick -
             * it is expected that this will not be resolved if we enter
             * an infinite loop. Therefore this test will never pass or fail.
             */
            await delay(0);
            expect('Promise to have been resolved').toBeTruthy();
        });
    });
});
