import React, { forwardRef, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput as RNTextInput } from 'react-native';

import { FormField } from '@/shared/components';
import { AppTextInputProps } from '@/shared/components/TextInput';

import { PasswordVisibilityToggle } from './PasswordVisibilityToggle';

interface PasswordFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<
  AppTextInputProps,
  'placeholder' | 'returnKeyType' | 'onSubmitEditing' | 'blurOnSubmit' | 'onFocus' | 'required'
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  textContentType?: 'password' | 'newPassword';
}

function PasswordFieldInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  {
    control,
    name,
    label,
    textContentType = 'password',
    required = true,
    ...inputProps
  }: PasswordFieldProps<TFieldValues, TName>,
  ref: React.ForwardedRef<RNTextInput>,
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      ref={ref}
      control={control}
      name={name}
      label={label}
      required={required}
      secureTextEntry={!showPassword}
      textContentType={textContentType}
      {...inputProps}
      rightIcon={
        <PasswordVisibilityToggle
          visible={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />
      }
    />
  );
}

type PasswordFieldComponent = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: PasswordFieldProps<TFieldValues, TName> & {
    ref?: React.ForwardedRef<RNTextInput>;
  },
) => React.ReactElement;

export const PasswordField = forwardRef(PasswordFieldInner) as PasswordFieldComponent;
