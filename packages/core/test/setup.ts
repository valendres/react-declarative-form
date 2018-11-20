import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { BoundComponentProps, ValidatorResponse } from '../src';
import { shallowEqual } from 'shallow-equal-object';

Enzyme.configure({ adapter: new Adapter() });

expect.extend({
    toHaveInputValue(wrapper: Enzyme.ReactWrapper<any>, expectedValue: string) {
        const inputValue = (wrapper.find('input').getDOMNode() as any).value;

        return {
            pass: inputValue === expectedValue,
            message: () =>
                `expected input to have value "${expectedValue}", received "${inputValue}"`,
        };
    },

    toHaveResponse(
        wrapper: Enzyme.ReactWrapper<any>,
        expectedResponse: ValidatorResponse = {
            context: undefined,
            message: undefined,
        },
    ) {
        const props: BoundComponentProps = wrapper
            .find('BoundComponent')
            .childAt(0)
            .props();

        const response: ValidatorResponse = {
            context: props.validatorContext,
            message: props.validatorMessage,
        };

        return {
            pass: shallowEqual(response, expectedResponse),
            message: () =>
                `expected response to equal "${JSON.stringify(
                    expectedResponse,
                )}", received "${JSON.stringify(response)}"`,
        };
    },
});
