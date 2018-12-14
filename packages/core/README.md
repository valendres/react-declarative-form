# @react-declarative-form/core
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
    npm i @react-declarative-form/core --save
    ```
2. Create bound form components using [`bind() HOC`](#bind-hoc)
3. Use bound form components within a `<Form />` component.

## How does it work?
Each bound component registers itself with the closest `<Form />` ancestor, allowing for event bubbling and cross-field validator. This is done using the [React 16.3 context API](https://reactjs.org/blog/2018/03/29/react-v-16-3.html). The value and validator state of the wrapped components is directly controlled by the [`bind() HOC`](#bind-hoc). Because the HOC is only concerned with its own wrapped component, then only that component will be re-rendered upon value change, assuming it is not part of a validator trigger. However, if the component does belong to a validator trigger, then the related components will also be validated and re-rendered. When the setValue function is called, the component is validated using the new value.

## Table of Contents

<!-- toc -->

- [Documentation](#documentation)
  * [API](#api)
    + [`<Form />`](#form)
      - [Form API](#form-api)
      - [Form Props](#form-props)
    + [`bind HOC`](#bind-hoc)
      - [Wrapped component props](#wrapped-component-props)
      - [Higher order component props](#higher-order-component-props)
  * [Validator rules](#validator-rules)
    + [Built-in validator rules](#built-in-validator-rules)
    + [Adding custom validator rules](#adding-custom-validator-rules)
  * [Types](#types)
  * [Examples](#examples)
    + [Example: Adding additional validator rules](#example-adding-additional-validator-rules)
    + [Example: Form Binding HOC](#example-form-binding-hoc)
    + [Example: Form Usage](#example-form-usage)
- [Authors](#authors)

<!-- tocstop -->

## Documentation

### API

#### `<Form/>`
`<Form>` is a component that is to be used in place of a regular HTML form component. It supports event handlers as props, and programmatic control (accessed via ref).

##### Form API

###### `submit(): void`
Programmatically submit form

###### `getValue(componentName: string): any`
Retrieves the current value for a component. Note: if the value is an object, it will be frozen. Objects used by the form should not be mutated.

###### `getValues(): ValueMap`
Retrieves current values for all components

###### `clear(): void`
Clears the form. The value and validator for each form component will be set to undefined. Note: this will have no effect if the valueProp has been provided.

###### `reset(): void`
Resets the form to the initialValue prop for each form component. If the initialValue prop has not been provided, the new value will be undefined. Note: this will have no effect if the valueProp has been provided.

###### `validate(componentName?: string | string[]): void`
Validates specified component(s). If no component names are provided, all components within the form will be validated.

###### `isValid(): boolean`
Executes validator rules on all components. True will be returned if all components are valid.

###### `setResponse(componentName: string, response: ValidatorResponse): void`
Inject a custom validator response on a form component.

###### `setResponses(responses: {[componentName: string]: ValidatorResponse}): void`
Injects custom validator responses on form components.

##### Form Props

| Name              | Type                                        | Required | Description                                                                                                                                                     |
| ----------------- | ------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onChange`        | (componentName: string, value: any) => void | false    | Called when the value of a bound form component has been changed. The new value is provided.                                                                    |
| `onBlur`          | (componentName: string, value: any) => void | false    | Called when a bound form component has been blurred. The current value is provided.                                                                             |
| `onFocus`         | (componentName: string, value: any) => void | false    | Called when a bound form component has been focused. The current value is provided.                                                                             |
| `onSubmit`        | (values: ValueMap) => void                  | false    | Called when the form is programmatically submitted, or a button with `type="submit"` is clicked. The current values for all bound form components are provided. |
| `onValidSubmit`   | (values: ValueMap) => void                  | false    | Called after `onSubmit` if all bound form components are valid. The current values for all bound form components are provided.                                  |
| `onInvalidSubmit` | (values: ValueMap) => void                  | false    | Called after `onSubmit` at least 1 bound form component is invalid. The current values for all bound form components are provided.                              |


#### `bind HOC`
Using the `bind()` higher order component allows **@react-declarative-form/core** to manage the form component value and validator state. Refer to [Example: Form Binding HOC](#example-form-binding-hoc) to get a better understanding of how these props can be used.

##### Wrapped component props
These props will be available to the wrapped component. The *injected* variables will always be provided to the wrapped component, even if the the the consumer did not provide them. However, a number of these props are *overridable*, meaning the consumer can override the HOC provided value.

| Name               | Type                 | Required | Injected | Overridable | Description                                       |
| ------------------ | -------------------- | -------- | -------- | ----------- | ------------------------------------------------- |
| `name`             | string               | true     | false    | true        | Unique form component identifier                  |
| `required`         | boolean              | false    | false    | true        | Whether or not a value is required                |
| `pristine`         | boolean              | false    | true     | true        | Whether or not the value has been modified        |
| `validatorMessage` | string               | false    | true     | true        | Validator message to be displayed as help text    |
| `validatorContext` | ValidatorContext     | false    | true     | true        | Validator context: danger, warning, success       |
| `onBlur`           | React.EventHandler   | false    | true     | true        | Should be called when component has been blurred  |
| `onFocus`          | React.EventHandler   | false    | true     | true        | Should be called when component has been focused  |
| `value`            | any                  | false    | true     | true        | Current form component value                      |
| `setValue`\*       | (value: any) => void | -        | true     | false       | Should be called when component value has changed |

\* ***Note:** this prop can not be overridden, providing it will have no effect.*

##### Higher order component props
These props are only used by the HOC and are not passed to the wrapped component.

| Name                | Type           | Required | Description |
| ------------------- | -------------- | -------- | ----------- |
| `validatorRules`    | ValidatorRules | false    | -           |
| `validatorMessages` | any            | false    | -           |
| `validatorTrigger`  | string         | false    | -           |
| `defaultValue`      | any            | false    | -           |

### Validator rules
Validator rules are executed sequentially (in the order in which they are defined) until a validator response has been returned, or all rules have been executed. If no rule has returned a validator response, then a response with Success context will be returned.

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

\* ***Note:** using the custom key allows consumers to define a custom validator rule. This is useful when one-off custom validator logic is required. Ideally, validator rules should be designed for reusability.*

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
) => ValidatorResponse;

interface ValidatorRuleMap {
    readonly [name: string]: ValidatorRule;
}

interface ValidatorResponse {
    readonly key?: string;
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
            validatorContext,
            validatorMessage,
            pristine,
            ...restProps
        } = this.props;

        const hasError = validatorContext === ValidatorContext.Danger;

        return (
            <MaterialTextField
                {...restProps}
                id={name}
                name={name}
                value={value || ''}
                onChange={this.handleChange}
                error={!pristine && hasError}
                helperText={!pristine && validatorMessage}
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
