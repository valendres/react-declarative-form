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
                        {(age: string) => <div id="mirroredAge">{age}</div>}
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
                        {(age: string) => <div id="mirroredAge">{age}</div>}
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
                        {(age: string) => <div id="mirroredAge">{age}</div>}
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
                        {(age: string) => <div id="mirroredAge">{age}</div>}
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
    });
});
