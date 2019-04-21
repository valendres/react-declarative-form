import * as React from 'react';

import { bind, BoundComponentProps, BoundComponent } from './bind';
import { FormApi, FormContext } from '../Form';
import { mount } from 'enzyme';
import { ValidatorData, ValidatorContext } from '@types';

describe('module: bind', () => {
    class FakeForm extends React.Component<{
        api: FormApi;
    }> {
        render() {
            const { api, children } = this.props;
            return (
                <FormContext.Provider value={api}>
                    {children}
                </FormContext.Provider>
            );
        }
    }

    interface ComponentProps extends BoundComponentProps {}

    class UnboundComponent extends React.Component<ComponentProps> {
        render() {
            return <div />;
        }
    }

    const Component = bind<ComponentProps>(UnboundComponent);

    const mockProps = (
        props: Partial<BoundComponentProps> = {},
    ): BoundComponentProps => ({
        name: 'test',
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        ...props,
    });

    const mockFormApi = (api: Partial<FormApi> = {}): FormApi => ({
        clear: jest.fn().mockResolvedValue(undefined),
        reset: jest.fn().mockResolvedValue(undefined),
        validate: jest.fn().mockResolvedValue(undefined),
        isValid: jest.fn(),
        isPristine: jest.fn(),
        getValidatorData: jest.fn().mockResolvedValue(undefined),
        getValue: jest.fn().mockResolvedValue(undefined),
        setValidatorData: jest.fn().mockResolvedValue(undefined),
        setValue: jest.fn().mockResolvedValue(undefined),
        onComponentMount: jest.fn().mockResolvedValue(undefined),
        onComponentUnmount: jest.fn().mockResolvedValue(undefined),
        onComponentUpdate: jest.fn().mockResolvedValue(undefined),
        onComponentBlur: jest.fn().mockResolvedValue(undefined),
        onComponentFocus: jest.fn().mockResolvedValue(undefined),
        registerMirror: jest.fn(),
        unregisterMirror: jest.fn(),
        ...api,
    });

    describe('Public commands', () => {
        describe('func: clear', () => {
            it('should call clear on Form ancestor', () => {
                const formApi = mockFormApi();
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                instance.clear();
                expect(formApi.clear).toHaveBeenCalledWith(props.name);
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.clear).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to clear \\"test\\". Must be descendant of a <Form/> descendant."`,
                );
            });
        });

        describe('func: reset', () => {
            it('should call reset on Form ancestor', () => {
                const formApi = mockFormApi();
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                instance.reset();
                expect(formApi.reset).toHaveBeenCalledWith(props.name);
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.reset).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to reset \\"test\\". Must be descendant of a <Form/> descendant."`,
                );
            });
        });

        describe('func: validate', () => {
            it('should call validate on Form ancestor', () => {
                const formApi = mockFormApi();
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                instance.validate();
                expect(formApi.validate).toHaveBeenCalledWith(props.name);
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.validate).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to validate \\"test\\". Must be descendant of a <Form/> descendant."`,
                );
            });
        });
    });

    describe('Public evaluators', () => {
        describe('func: isValid', () => {
            it('should call isValid on Form ancestor', () => {
                const expectedReturnValue = true;
                const formApi = mockFormApi({
                    isValid: jest.fn().mockReturnValue(expectedReturnValue),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                const result = instance.isValid();
                expect(result).toBe(expectedReturnValue);
                expect(formApi.isValid).toHaveBeenCalledWith(props.name);
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.isValid).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to determine if \\"test\\" is valid. Must be descendant of a <Form/> descendant."`,
                );
            });
        });

        describe('func: isPristine', () => {
            it('should call isPristine on Form ancestor', () => {
                const expectedReturnValue = true;
                const formApi = mockFormApi({
                    isPristine: jest.fn().mockReturnValue(expectedReturnValue),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                const result = instance.isPristine();
                expect(result).toBe(expectedReturnValue);
                expect(formApi.isPristine).toHaveBeenCalledWith(props.name);
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.isPristine).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to determine if \\"test\\" is pristine. Must be descendant of a <Form/> descendant."`,
                );
            });
        });
    });

    describe('Public getters', () => {
        describe('func: getValidatorData', () => {
            it('should call getValidatorData on Form ancestor', () => {
                const expectedReturnValue: ValidatorData = {
                    context: ValidatorContext.Success,
                    message: '',
                };
                const formApi = mockFormApi({
                    getValidatorData: jest
                        .fn()
                        .mockReturnValue(expectedReturnValue),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                const result = instance.getValidatorData();
                expect(result).toBe(expectedReturnValue);
                expect(formApi.getValidatorData).toHaveBeenCalledWith(
                    props.name,
                    props,
                );
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(
                    instance.getValidatorData,
                ).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to get validator data for \\"test\\". Must be descendant of a <Form/> descendant."`,
                );
            });
        });

        describe('func: getValue', () => {
            it('should call getValue on Form ancestor', () => {
                const expectedReturnValue: any = 'abc';
                const formApi = mockFormApi({
                    getValue: jest.fn().mockReturnValue(expectedReturnValue),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                const result = instance.getValue();
                expect(result).toBe(expectedReturnValue);
                expect(formApi.getValue).toHaveBeenCalledWith(
                    props.name,
                    props,
                );
            });

            it('should throw an error if called outside of a Form', () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                expect(instance.getValue).toThrowErrorMatchingInlineSnapshot(
                    `"Failed to get value for \\"test\\". Must be descendant of a <Form/> descendant."`,
                );
            });
        });
    });

    describe('Public setters', () => {
        describe('func: setValidatorData', () => {
            const validatorData: ValidatorData = {
                context: ValidatorContext.Danger,
                message: 'custom error message',
            };

            it('should call setValidatorData on Form ancestor', () => {
                const formApi = mockFormApi({
                    setValidatorData: jest.fn().mockResolvedValue(undefined),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                instance.setValidatorData(validatorData);
                expect(formApi.setValidatorData).toHaveBeenCalledWith(
                    props.name,
                    validatorData,
                );
            });

            it('should throw an error if called outside of a Form', async () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                await expect(
                    instance.setValidatorData(validatorData),
                ).rejects.toMatchInlineSnapshot(
                    `[OutsideFormError: Failed to set validator data for "test". Must be descendant of a <Form/> descendant.]`,
                );
            });
        });

        describe('func: setValue', () => {
            const value: any = 'abc';

            it('should call setValue on Form ancestor', () => {
                const formApi = mockFormApi({
                    setValue: jest.fn().mockResolvedValue(undefined),
                });
                const props = mockProps();
                const wrapper = mount(
                    <FakeForm api={formApi}>
                        <Component {...props} />
                    </FakeForm>,
                );
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                instance.setValue(value);
                expect(formApi.setValue).toHaveBeenCalledWith(
                    props.name,
                    value,
                    undefined,
                );
            });

            it('should throw an error if called outside of a Form', async () => {
                const props = mockProps();
                const wrapper = mount(<Component {...props} />);
                const instance: BoundComponent = wrapper
                    .find(Component)
                    .instance() as any;
                await expect(
                    instance.setValue(value),
                ).rejects.toMatchInlineSnapshot(
                    `[OutsideFormError: Failed to set value for "test". Must be descendant of a <Form/> descendant.]`,
                );
            });
        });
    });

    describe('Misc.', () => {
        it('should hoist non-react statics', () => {
            interface ComponentWithStaticsProps extends BoundComponentProps {}
            interface ComponentWithStaticsStatics {
                Title: string;
            }

            class UnboundComponentWithStatics extends React.Component<
                ComponentWithStaticsProps
            > {
                static Title: string = 'Some static value';

                render() {
                    return <div />;
                }
            }

            const ComponentWithStatics = bind<
                ComponentWithStaticsProps,
                ComponentWithStaticsStatics
            >(UnboundComponentWithStatics);

            expect(ComponentWithStatics.Title).toBe(
                UnboundComponentWithStatics.Title,
            );
        });

        it('should expose a ref to the bound component instance', () => {
            const boundComponentRef = React.createRef<BoundComponent>();
            mount(<Component name="test" ref={boundComponentRef} />);

            const BoundClass = (boundComponentRef as any).current
                ._reactInternalFiber.child.type;
            expect(BoundClass.prototype.constructor.name).toBe(
                'BoundComponent',
            );
        });

        it('should expose a reference to the unbound component instance', () => {
            const unboundComponentRef = React.createRef<UnboundComponent>();
            mount(<Component name="test" unboundRef={unboundComponentRef} />);

            const UnboundClass = (unboundComponentRef as any).current
                ._reactInternalFiber.elementType;
            expect(UnboundClass.prototype.constructor.name).toBe(
                'UnboundComponent',
            );
        });
    });
});
