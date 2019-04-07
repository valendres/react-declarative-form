import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { BoundComponentProps, ValidatorData } from '../src';
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

    toHaveValidatorData(
        wrapper: Enzyme.ReactWrapper<any>,
        expectedData: ValidatorData = {
            context: undefined,
            message: undefined,
        },
    ) {
        const props: BoundComponentProps = wrapper
            .find('BoundComponent')
            .childAt(0)
            .props();

        const data: ValidatorData = props.validatorData;

        return {
            pass:
                data.context === expectedData.context &&
                data.message === expectedData.message,
            message: () =>
                `expected data to equal "${JSON.stringify(
                    expectedData,
                )}", received "${JSON.stringify(data)}"`,
        };
    },
});
