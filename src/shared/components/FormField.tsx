import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import { AppTextInputProps, TextInput } from './TextInput';

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Omit<AppTextInputProps, 'value' | 'onChangeText'> {
  control: Control<TFieldValues>;
  name: TName;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  ...inputProps
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextInput
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
