import * as React from 'react';

import { bind, BoundComponentProps } from './bind';
import { FormApi } from '../Form';
import { ValidatorResponse, ValidatorContext } from '../../types';

describe('module: bind', () => {
    const BoundComponentClass = bind(<div /> as any);

    const mockProps = (
        props: Partial<BoundComponentProps> = {},
    ): BoundComponentProps => ({
        name: 'test',
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        ...props,
    });

    const mockFormApi = (api: Partial<FormApi> = {}): FormApi => ({
        registerComponent: jest.fn(),
        unregisterComponent: jest.fn(),
        validate: jest.fn(),
        getResponse: jest.fn(),
        getInitialValue: jest.fn().mockReturnValue(undefined),
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        ...api,
    });

    describe('func: setValue', () => {
        it('should call setState with new value, response for value and set pristine to false', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            const nextValue = 'test';
            const nextResponse: ValidatorResponse = {
                key: 'test',
                context: ValidatorContext.Danger,
                message: 'Not valid!',
            };

            jest.spyOn(instance, 'getResponse').mockReturnValue(nextResponse);
            jest.spyOn(instance, 'setState');
            instance.setValue(nextValue);

            expect(instance.getResponse).toHaveBeenCalledWith(nextValue);
            expect(instance.setState).toHaveBeenCalledWith({
                value: nextValue,
                response: nextResponse,
                pristine: false,
            });
        });

        it('should call onChange with component name and new value if inside a form', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            const nextValue = 'test';

            instance.formApi = mockFormApi();
            jest.spyOn(instance, 'isInsideForm').mockReturnValue(true);
            instance.setValue(nextValue);

            expect(instance.formApi.onChange).toHaveBeenCalledWith(
                props.name,
                nextValue,
            );
        });
    });

    describe('func: handleBlur', () => {
        it('should not call formApi.onBlur if outside a form', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            instance.formApi = mockFormApi();
            jest.spyOn(instance, 'isInsideForm').mockReturnValue(false);

            instance.handleBlur();
            expect(instance.formApi.onBlur).not.toHaveBeenCalled();
            // This should always get executed
            expect(instance.props.onBlur).toHaveBeenCalled();
        });

        it('should call formApi.onBlur if inside a form', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            instance.formApi = mockFormApi();
            jest.spyOn(instance, 'isInsideForm').mockReturnValue(true);

            instance.handleBlur();
            expect(instance.formApi.onBlur).toHaveBeenCalled();
            // This should always get executed
            expect(instance.props.onBlur).toHaveBeenCalled();
        });
    });

    describe('func: handleFocus', () => {
        it('should not call formApi.onFocus if outside a form', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            instance.formApi = mockFormApi();
            jest.spyOn(instance, 'isInsideForm').mockReturnValue(false);

            instance.handleFocus();
            expect(instance.formApi.onFocus).not.toHaveBeenCalled();
            // This should always get executed
            expect(instance.props.onFocus).toHaveBeenCalled();
        });

        it('should call formApi.onFocus if inside a form', () => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            instance.formApi = mockFormApi();
            jest.spyOn(instance, 'isInsideForm').mockReturnValue(true);

            instance.handleFocus();
            expect(instance.formApi.onFocus).toHaveBeenCalled();
            // This should always get executed
            expect(instance.props.onFocus).toHaveBeenCalled();
        });
    });

    it.each([
        // Api will be undefined if outside the scope of a form
        [undefined, false],
        // Api will be defined if inside the scope of a form
        [mockFormApi(), true],
    ])(
        'should return true if a form api exists',
        (formApi: FormApi, result: boolean) => {
            const props = mockProps();
            const instance = new BoundComponentClass(props);
            instance.formApi = formApi;
            expect(instance.isInsideForm()).toBe(result);
        },
    );
});
