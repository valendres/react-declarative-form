declare namespace jest {
    interface Matchers<R> {
        toHaveInputValue: (value: any) => object;
        toHaveValidatorData: (response: any) => object;
    }

    interface Expect {
        toHaveInputValue: (wrapper: any, value: any) => object;
        toHaveValidatorData: (wrapper: any, validatorData: any) => object;
    }
}
