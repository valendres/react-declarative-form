
<h1 align="center">@react-declarative-form/core</h1>

<div align="center">
<img src="https://www.peterweller.com.au:9000/api/project_badges/measure?project=react-declarative-form&metric=alert_status"/>

<img src="https://www.peterweller.com.au:9000/api/project_badges/measure?project=react-declarative-form&metric=coverage"/>

<img src="https://www.peterweller.com.au:9000/api/project_badges/measure?project=react-declarative-form&metric=vulnerabilities"/>

<img src="https://www.peterweller.com.au:9000/api/project_badges/measure?project=react-declarative-form&metric=sqale_rating"/>

<span>For more info, see <a href="https://www.peterweller.com.au:9000/dashboard?id=react-declarative-form">SonarQube project stats</a>.</span>
</div>

## Overview
**@react-declarative-form/core** is the core of a simple-to-use declarative valadation library. It is designed to make building forms easy; allowing consumers to specify validator requirements on individual form components, and let the library do the heavy lifting.

### Requirements
This library requires the following:
* The `<Form />` component from **@react-declarative-form/core** is used instead of a html `<form/>`.
* Managed form components have been created using the [`bind() HOC`](#bind-hoc). See [Example: Form Binding HOC](#example-form-binding-hoc).
* The managed form components are  descendants of a `<Form />` component. See [Example: Form Usage](#example-form-usage).

## Getting started
1. Add **@react-declarative-form/core** to your project.
    ```
    yarn add @react-declarative-form/core
    ```
2. Create bound form components using [`bind() HOC`](#bind-hoc)
3. Use bound form components within a `<Form />` component.

## How does it work?
Each bound component registers itself with the closest `<Form />` ancestor which allows the form to manage the value, pristine & validator state. This is done using the [React 16.3 context API](https://reactjs.org/blog/2018/03/29/react-v-16-3.html). While the form manages the component state, each component is updated individually on an as needed basis to minimise unnecessary renders. If a components value is changed, then only that component will be re-rendered, assuming it is not part of a validator trigger. However, if the component does belong to a validator trigger, then the related components will also be validated and re-rendered. When the setValue function is called, the component is validated using the new value.

## Table of Contents

<!-- toc -->

- [Overview](#overview)
  - [Requirements](#requirements)
- [Getting started](#getting-started)
- [How does it work?](#how-does-it-work)
- [Table of Contents](#table-of-contents)
- [Documentation](#documentation)
  - [Form component](#form-component)
    - [Form Props](#form-props)
    - [Form API](#form-api)
      - [Func: submit](#func-submit)
      - [Func: clear](#func-clear)
      - [Func: reset](#func-reset)
      - [Func: validate](#func-validate)
      - [Func: isValid](#func-isvalid)
      - [Func: isPristine](#func-ispristine)
      - [Func: getValidatorData](#func-getvalidatordata)
      - [Func: getValue](#func-getvalue)
      - [Func: getValues](#func-getvalues)
      - [Func: setValidatorData](#func-setvalidatordata)
      - [Func: setValue](#func-setvalue)
      - [Func: setValues](#func-setvalues)
  - [bind HOC](#bind-hoc)
    - [Bound component props](#bound-component-props)
    - [Higher order component props](#higher-order-component-props)
    - [bind HOC API](#bind-hoc-api)
      - [Func: clear](#func-clear-1)
      - [Func: reset](#func-reset-1)
      - [Func: validate](#func-validate-1)
      - [Func: isValid](#func-isvalid-1)
      - [Func: isPristine](#func-ispristine-1)
      - [Func: getValidatorData](#func-getvalidatordata-1)
      - [Func: getValue](#func-getvalue-1)
      - [Func: setValidatorData](#func-setvalidatordata-1)
      - [Func: setValue](#func-setvalue-1)
  - [Validator rules](#validator-rules)
    - [Built-in validator rules](#built-in-validator-rules)
    - [Adding additional validator rules](#adding-additional-validator-rules)
  - [Types](#types)
  - [Examples](#examples)
    - [Example: Adding validator rules](#example-adding-validator-rules)
    - [Example: Form Binding HOC](#example-form-binding-hoc)
    - [Example: Form Usage](#example-form-usage)
- [Authors](#authors)

<!-- tocstop -->

## Documentation

### Form component
`<Form>` is a component that is to be used in place of a regular HTML form component. It supports event handlers as props, and programmatic control (accessed via ref).

#### Form Props

| Name               | Type                                        | Required | Description                                                                                                                                                     |
| ------------------ | ------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onChange`         | (componentName: string, value: any) => void | false    | Called when the value of a bound form component has been changed. The new value is provided.                                                                    |
| `onBlur`           | (componentName: string, value: any) => void | false    | Called when a bound form component has been blurred. The current value is provided.                                                                             |
| `onFocus`          | (componentName: string, value: any) => void | false    | Called when a bound form component has been focused. The current value is provided.                                                                             |
| `onSubmit`         | (values: ValueMap) => void                  | false    | Called when the form is programmatically submitted, or a button with `type="submit"` is clicked. The current values for all bound form components are provided. |
| `onValidSubmit`    | (values: ValueMap) => void                  | false    | Called after `onSubmit` if all bound form components are valid. The current values for all bound form components are provided.                                  |
| `onInvalidSubmit`  | (values: ValueMap) => void                  | false    | Called after `onSubmit` at least 1 bound form component is invalid. The current values for all bound form components are provided.                              |
| `withHiddenSubmit` | boolean                                     | false    | Whether a hidden submit button should be included in the form.                                                                                                  |
| `sticky`           | boolean                                     | false    | Whether the form component values should be sticky and retain their value in between component unmounts and mounts.                                             |
| `initialValues`    | ValueMap                                    | false    | Initial values to be provided to the bound form components. This is useful for populating the form without having to manage all form values.                    |

#### Form API
##### Func: submit
`submit(): { isValid: boolean, values: ValueMap }`

Programatically submit the form. If you don't want to manually call this, a button with type submit should be provided to the form. This can be provided in your form implementation, or automatically using the `withHiddenSubmit` prop on the Form.

**Returns:** an object with 2 properties:
* `isValid`: whether the entire form was valid when submitting
* `values`: all of the form values at the time of submission

##### Func: clear
`clear(componentName?: string | string[]): Promise<void>`

Clears the specified component(s) by setting their value to null. If no component names are provided, all components within the form will be cleared.

**Params:**
* `componentName`: component name(s) to be cleared

**Returns:** a promise which is resolved once the react components have been re-rendered

##### Func: reset
`reset(componentName?: string | string[]): Promise<void>`

Resets the specified component(s) by unsetting their value, validator and pristine state. If no component names are provided, all components within the form will be reset.

**Params:**
* `componentName`: component name(s) to be reset

**Returns:** a promise which is resolved once the react components have been re-rendered

##### Func: validate
`validate(componentName?: string | string[]): Promise<void>`

Validates specified component(s) by executing the validator and updating the components to reflect their validator state. If no component names are provided, all components within the form will be validated.

**Params:**
* `componentName`: component name(s) to be reset

**Returns:** a promise which is resolved once the react components have been re-rendered.

##### Func: isValid
`isValid(componentName?: string | string[]): boolean`

Determines if all the specified component(s) are valid by executing the validator using the components current value. If no component names are provided, all components within the form will be tested.

**Params:**
* `componentName`: component name(s) to be tested

**Returns:** a boolean flag to indicate whether all the components are valid

**Note:** if validatorData is being managed, the provided validatorData.context will
be used instead of executing the validator.

##### Func: isPristine
`isPristine(componentName?: string | string[]): boolean`

Determines if all the specified component(s) are pristine - the component has not been modified by the user or by programatically calling setValue. If no component names are provided, all components within the form will checked.

**Params:**
* `componentName`: component name(s) to be tested

**Returns:** a boolean flag to indicate whether all the components are pristine

##### Func: getValidatorData
`getValidatorData(componentName: string): ValidatorData`

Returns the components current validatorData. There are 2 ways a components validator data can be retrieved (in order of precedence):
1. *externally managed validatorData* prop provided to the component
2. *internally managed validatorData* state when the user changes input

**Params:**
* `componentName`: name of the component to get validator data for

**Returns:** component validator data if exists, otherwise an object with undefined context and message will be returned.

##### Func: getValue
`getValue(componentName: string): any`

Returns the value of the specified component. There are four ways a component value can be provied (in order of precedence):
1. *externally managed* value prop provided to the component
2. *internally managed* state value when the user changes input
3. *initialValues* provided to the form component
4. *defaultValue* specified on individual form component

**Params:**
* `componentName`: name of the component to get value for

**Returns:** component value

**Note**: the form values should not be mutated

##### Func: getValues
`getValues(componentNames?: string[]): ValueMap`

Gets the values of the provided component names using the same logic as `getValue`.

**Params:**
* `componentNames`: component names to retrieve values for

**Returns:** an object with componentName:value pairs

##### Func: setValidatorData
`setValidatorData(componentName: string, data: ValidatorData): Promise<void>`

Sets the component internally managed validatorData & updates the component to reflect its new state.

**Params:**
* `componentName`: name of the component which should be updated
* `validatorData`: the new validator data to be stored in Form state

**Returns:** a promise which is resolved once the react component has been re-rendered.

##### Func: setValue
`setValue(componentName: string, value: any, pristine: boolean = false): Promise<void>`

Sets the component internally managed state value & updates the component validatorData using the provided value. By default, the components pristine state will be set to `false` to indicate that the component has been modified.

**Params:**
* `componentName`: name of the component to set value for
* `value`: the new value to be stored in Form state
* `pristine`: the new pristine state when setting this value (default: false).

**Returns:** a promise which is resolved once the react component has been re-rendered.

##### Func: setValues
`setValues(values: ValueMap, pristine?: boolean): Promise<void>`

Sets the components internally managed state values & updates their component validatorData using the provided values. By default, the components pristine state will be set to `false` to indicate that the components have been modified.

**Params:**
* `values`: the values to be saved in Form state (componentName:value map)

**Returns:** a promise which is resolved once the react components have been re-rendered.

### bind HOC
Using the `bind()` higher order component allows **@react-declarative-form/core** to manage the form component value and validator state. Refer to [Example: Form Binding HOC](#example-form-binding-hoc) to get a better understanding of how these props can be used.

#### Bound component props
These props will be available to the bound component. The *injected* variables will always be provided to the bound component, even if the the the consumer did not provide them. However, a number of these props are *overridable*, meaning the consumer can override the HOC provided value.

| Name            | Type                 | Required | Injected | Overridable | Description                                                        |
| --------------- | -------------------- | -------- | -------- | ----------- | ------------------------------------------------------------------ |
| `name`          | string               | true     | false    | true        | Unique form component identifier                                   |
| `required`      | boolean              | false    | false    | true        | Whether or not a value is required                                 |
| `pristine`      | boolean              | false    | true     | true        | Whether or not the value has been modified                         |
| `validatorData` | ValidatorData        | false    | true     | true        | Data which reflects the current validator state for the component. |
| `onBlur`        | React.EventHandler   | false    | true     | true        | Should be called when component has been blurred                   |
| `onFocus`       | React.EventHandler   | false    | true     | true        | Should be called when component has been focused                   |
| `value`         | any                  | false    | true     | true        | Current form component value                                       |
| `setValue`      | (value: any) => void | -        | true     | false       | Should be called when component value has changed                  |

***Notes***
1. `ValidatorData` is an object: `{ message: string, context: ValidatorContext }`.
2. `ValidatorContext` is an enum which expects strings: `danger`, `warning` & `success`.
3. `setValue` can not be overridden, providing it will have no effect.

#### Higher order component props
These props are only used by the HOC and are not passed to the wrapped component.

| Name                | Type           | Required | Description                                                                                    |
| ------------------- | -------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `validatorRules`    | ValidatorRules | false    | Validation rules which should be applied to the component                                      |
| `validatorMessages` | any            | false    | Custom validator messages for specific validator rules                                         |
| `validatorTrigger`  | string         | false    | Triggers validator to execute on the specified component names when this component is modified |
| `defaultValue`      | any            | false    | Default value to be applied if the component does not have a managed, state or initial value   |

#### bind HOC API
##### Func: clear
`clear(): Promise<void>`

Clears the scomponent by setting its value to null.

**Returns:** a promise which is resolved once the react component has been re-rendered

##### Func: reset
`reset(): Promise<void>`

Resets the component by unsetting its value, validator and pristine state.

**Returns:** a promise which is resolved once the react component has been re-rendered

##### Func: validate
`validate(): Promise<void>`

Validates the component by executing the validator and updating the component to reflect its new validator state. If no component names are provided,

**Returns:** a promise which is resolved once the react component has been re-rendered

##### Func: isValid
`isValid(): boolean`

Determines if the component is valid by executing the validator using the components current value.

**Returns:** a boolean flag to indicate whether the component is valid

##### Func: isPristine
`isPristine(): boolean`
Determines if the component is pristine - the component has not been modified by the user or by programatically calling setValue.

**Returns:** a boolean flag to indicate whether the component is pristine

##### Func: getValidatorData
`getValidatorData(): ValidatorData`

Returns the components current validatorData. There are 2 ways a components validator data can be retrieved (in order of precedence):
1. *externally managed validatorData* prop provided to the component
2. *internally managed validatorData* state when the user changes input

**Returns:** component validator data

***Note:** If the component has no validatorData, then an object with undefined context & message will be returned.*

##### Func: getValue
`getValue(): any`

Returns the value of the component. There are four ways a component value can be provied (in order of precedence):
1. *externally managed* value prop provided to the component
2. *internally managed* state value when the user changes input
3. *initialValues* provided to the form component
4. *defaultValue* specified on individual form component

**Returns:** component value

***Note:** the form values should not be mutated*

##### Func: setValidatorData
`setValidatorData(data: ValidatorData): Promise<void>`

Sets the component internally managed validatorData & updates the component to reflect its new state.

**Params:**
* `validatorData` the new validator data to be stored in Form state

**Returns:** a promise which is resolved once the react component has been re-rendered.

##### Func: setValue
`setValue(value: any, pristine?: boolean): Promise<void>`

Sets the component internally managed state value & updates the component validatorData using the provided value. By default, the components pristine state will be set to `false` to indicate that the component has been modified.

**Params:**
* `value` the new value to be stored in Form state
* `pristine` the new pristine state when setting this value (default: false).

**Returns:** a promise which is resolved once the react component has been re-rendered.

### Validator rules
Validator rules are executed sequentially (in the order in which they are defined) until validator data has been returned, or all rules have been executed. If no rule has returned validator data, then a data object with Success context will be returned.

#### Built-in validator rules
The following validator rules are built-in. By default, they will only return ValidatorContext.Danger if the a value is defined and it fails to pass the test. However, this behaviour can be customized by overriding built-in rules. See the [Adding additional validator rules](#adding-additional-validator-rules) section for more information. Additional built-in validator rules will be added in the future.

| Name            | Criteria      | Description                                              |
| --------------- | ------------- | -------------------------------------------------------- |
| `minValue`      | number        | Input is >= to the specified minimum value               |
| `maxValue`      | number        | Input is <= to the specified maximum value               |
| `isDivisibleBy` | number        | Input is divisible by the specified number               |
| `isInteger`     | boolean       | Input is an integer                                      |
| `isDecimal`     | boolean       | Input is a decimal number                                |
| `isNumeric`     | boolean       | Input is numeric characters only [0-9]+                  |
| `minLength`     | number        | Input length is at least the specified length            |
| `maxLength`     | number        | Input length is at most the specified length             |
| `isLength`      | number        | Input length equals the specified length                 |
| `isLowercase`   | boolean       | Input is all lowercase characters                        |
| `isUppercase`   | boolean       | Input is all uppercase characters                        |
| `matches`       | RegExp        | Input matches the specified regex pattern                |
| `isEmail`       | boolean       | Input is a valid email address                           |
| `isUrl`         | boolean       | Input is a valid url                                     |
| `isCreditCard`  | boolean       | Input is a valid credit card number                      |
| `isHexColor`    | boolean       | Input is a valid hexadecimal color                       |
| `isIP`          | boolean       | Input is a valid IPv4 or IPv6 address                    |
| `isPort`        | boolean       | Input is a valid port number                             |
| `eqTarget`      | string        | Input value is == to target input value                  |
| `gtTarget`      | string        | Input value is > to target input value                   |
| `gteTarget`     | string        | Input value is >= to target input value                  |
| `ltTarget`      | string        | Input value is < to target input value                   |
| `lteTarget`     | string        | Input value is <= to target input value                  |
| `custom`        | ValidatorRule | Custom validator rule. It is executed before other rules |

***Note:** using the custom key allows consumers to define a custom validator rule. This is useful when one-off custom validator logic is required. Ideally, validator rules should be designed for reusability.*

#### Adding additional validator rules
Adding additional validator rules can be done using the addValidatorRule function. An example can be found in [Example: Adding validator rules](#example-adding-validator-rules).

`addValidatorRule: (key: string, rule: ValidatorRule) => void`

***Note:** If a rule with the same key exists already, it will be overridden - this includes built-in rules.*

### Types

```Typescript
enum ValidatorContext {
    Danger = 'danger',
    Warning = 'warning',
    Success = 'success',
}

type ValidatorRule = (
    key: string,
    values: ValueMap,
    criteria?: any,
) => ValidatorData;

interface ValidatorRuleMap {
    readonly [name: string]: ValidatorRule;
}

interface ValidatorData {
    readonly name?: string;
    readonly context: ValidatorContext;
    readonly message?: string;
}

interface ValueMap {
    [name: string]: any;
}
```

### Examples

#### Example: Adding validator rules
```Typescript
// validatorConfig.ts
import {
    addValidatorRule,
    isDefined,
    ValidatorContext,
    ValueMap,
} from '@react-declarative-form/core';

addValidatorRule(
    'containsCat',
    (componentName: string, values: ValueMap, criteria: boolean) => {
        const value = values[componentName];
        const pattern = /\bcat\b/i;

        if (isDefined(value) && !pattern.test(value)) {
            return {
                context: ValidatorContext.Danger,
                message: 'Needs more Cat.',
            };
        }
    },
);
```

#### Example: Form Binding HOC
Using the bind HOC with the TextField component provided by [material-ui](https://v0.material-ui.com/#/components/text-field)
```Typescript
import * as React from 'react';
import {
    bind,
    BoundComponentProps,
    ValidatorContext,
} from '@react-declarative-form/core';
import  {
    TextField as MaterialTextField
    TextFieldProps as MaterialTextFieldProps
} from '@material-ui/core';

export interface TextFieldProps
    extends MaterialTextFieldProps, BoundComponentProps
{
    name: string;
    label?: string;
}

export class UnboundTextField extends React.Component<TextFieldProps> {
    public render() {
        const {
            name,
            value,
            setValue,
            onChange,
            validatorData,
            pristine,
            ...restProps
        } = this.props;

        const hasError = validatorData.context === ValidatorContext.Danger;

        return (
            <MaterialTextField
                {...restProps}
                id={name}
                name={name}
                value={value || ''}
                onChange={this.handleChange}
                error={!pristine && hasError}
                helperText={!pristine && validatorData.message}
            />
        );
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange, setValue } = this.props;
        setValue(event.currentTarget.value);
        if (onChange) onChange(event);
    };
}

export const TextField = bind<TextFieldProps>(UnboundTextField);
```

#### Example: Form Usage
Using the bound TextField component inside a Form.
```Typescript
import * as React from 'react';
import { Form, ValueMap } from '@react-declarative-form/core';
import { Button, TextField } from 'view/components';

export interface RegistrationFormProps {}

export class RegistrationForm extends React.Component<RegistrationFormProps> {
    public render() {
        return (
            <Form onValidSubmit={this.handleValidSubmit}>
                <TextField
                    name="email"
                    label="Email"
                    validatorRules={{
                        isEmail: true,
                    }}
                    required
                />
                <TextField
                    name="password"
                    label="Password"
                    validatorTrigger={['password-confirm']}
                    validatorRules={{
                        minLength: 8,
                    }}
                    type="password"
                    required
                />
                <TextField
                    name="password-confirm"
                    label="Confirm password"
                    validatorRules={{
                        eqTarget: 'password',
                    }}
                    validatorMessages={{
                        eqTarget: 'Must match password',
                    }}
                    type="password"
                    required
                />
                <TextField
                    name="favourite-animal"
                    label="Favourite animal"
                    validatorRules={{
                        // Custom validator rule, see: "Adding custom validator rules"
                        containsCat: true,
                    }}
                    required
                />
                <Button title="Submit" type="submit" />
            </Form>
        );
    }

    private handleValidSubmit = (values: ValueMap) => {
        console.log('Successfully submitted form :)', values);
    };
}

```

## Authors
* Peter Weller [@peterweller_](https://twitter.com/peterweller_)
