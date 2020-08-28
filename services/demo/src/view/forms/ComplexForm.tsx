import * as React from 'react';
import {
    Form,
    FormProps,
    Mirror,
    ValidatorContext,
    ValidatorData,
    CustomFormField,
} from '@react-declarative-form/core';
import {
    CurrencyField,
    CurrencyFieldValues,
} from '@react-declarative-form/material-ui';
import { Grid, FormControlLabel, Switch } from '@material-ui/core';

const lessThanCurrencyField = (
    targetFieldName: keyof ComplexFormFields,
    value: string,
) => (
    currentFieldName: keyof ComplexFormFields,
    values: ComplexFormFields,
): ValidatorData => {
    debugger;
    const rules =
        Number(values[currentFieldName]) > Number(value)
            ? {
                  context: ValidatorContext.Danger,
                  message: `"${currentFieldName}" must be less than "${targetFieldName}"`,
              }
            : undefined;

    return rules;
};

const initialValues: ComplexFormFields = {
    firstAmount: undefined,
    secondAmount: undefined,
    assets: [
        { id: 'a', title: 'First asset' },
        { id: 'b', title: 'Second asset' },
        { id: 'c', title: 'Third asset' },
    ],
};

export interface ComplexFormFields {
    firstAmount: CurrencyFieldValues;
    secondAmount: CurrencyFieldValues;
    assets: {
        id: string;
        title: string;
    }[];
}

export interface ComplexFormProps extends FormProps<ComplexFormFields> {
    formRef: React.RefObject<Form<ComplexFormFields>>;
}

export const ComplexForm: React.FC<ComplexFormProps> = ({
    formRef,
    ...props
}) => {
    const [showConditionalField, setShowConditionalField] = React.useState(
        false,
    );
    const handleShowConditionalFieldCheckboxChange = React.useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >((event) => {
        setShowConditionalField(event.target.checked);
    }, []);

    return (
        <Form<ComplexFormFields>
            ref={formRef}
            initialValues={initialValues}
            {...props}
        >
            <Grid item xs={12}>
                <CustomFormField name="assets" />
                <Mirror name="assets">
                    {({ assets }: ComplexFormFields): React.ReactNode => (
                        <>
                            <CurrencyField
                                name="firstAmount"
                                label="First amount"
                                validatorRules={{
                                    minValue: 0,
                                }}
                                disabled={(assets || []).length > 5}
                                validatorTrigger={
                                    showConditionalField
                                        ? 'secondAmount'
                                        : undefined
                                }
                                required
                            />
                            <div>Assets</div>
                            <ul>
                                {(assets ?? []).map(({ id, title }) => (
                                    <li key={id}>{title}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </Mirror>
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showConditionalField}
                            onChange={handleShowConditionalFieldCheckboxChange}
                        />
                    }
                    label="Toggle conditional field"
                />
            </Grid>
            {showConditionalField && (
                <Grid item xs={12}>
                    <Mirror name="firstAmount">
                        {({
                            firstAmount,
                        }: ComplexFormFields): React.ReactNode => (
                            <CurrencyField
                                name="secondAmount"
                                label="Second amount"
                                fixedCurrencyCode={firstAmount?.code}
                                validatorRules={{
                                    minValue: 0,
                                    custom: lessThanCurrencyField(
                                        'firstAmount',
                                        firstAmount?.value as string,
                                    ),
                                }}
                            />
                        )}
                    </Mirror>
                </Grid>
            )}
        </Form>
    );
};
