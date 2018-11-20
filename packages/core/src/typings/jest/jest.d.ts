declare namespace jest {
    interface Matchers<R> {
        toHaveInputValue: (value: any) => object;
        toHaveResponse: (response: any) => object;
    }

    interface Expect {
        toHaveInputValue: (wrapper: any, value: any) => object;
        toHaveResponse: (wrapper: any, response: any) => object;
    }
}
