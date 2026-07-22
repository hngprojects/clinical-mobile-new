import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Pressable, TextInput as RNTextInput } from 'react-native';

import { FormField } from '@/shared/components';
import { AppTextInputProps } from '@/shared/components/TextInput';

interface PasswordFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends Pick<
  AppTextInputProps,
  'placeholder' | 'returnKeyType' | 'onSubmitEditing' | 'blurOnSubmit' | 'onFocus'
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
      secureTextEntry={!showPassword}
      textContentType={textContentType}
      {...inputProps}
      rightIcon={
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#1B1B1B"
          />
        </Pressable>
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
