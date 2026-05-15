import React, { forwardRef } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput as RNTextInput } from 'react-native';

import { AppTextInputProps, TextInput } from './TextInput';

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<AppTextInputProps, 'value' | 'onChangeText'> {
  control: Control<TFieldValues>;
  name: TName;
}

export const FormField = forwardRef<RNTextInput, any>(
  <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { control, name, label, ...inputProps }: FormFieldProps<TFieldValues, TName>,
    ref: React.ForwardedRef<RNTextInput>
  ) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <TextInput
            ref={ref}
            label={label}
            value={value as string}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            {...inputProps}
          />
        )}
      />
    );
  }
);

FormField.displayName = 'FormField';
