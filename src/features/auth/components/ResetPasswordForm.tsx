import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, FormField } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { ResetPasswordFormData, resetPasswordSchema } from '../schemas/auth.schemas';

interface ResetPasswordFormProps {
  mutation: any;
}

export function ResetPasswordForm({ mutation }: ResetPasswordFormProps) {
  const { colors, spacing } = useTheme();
  const { mutate: resetPassword, isPending, reset } = mutation;

  const { control, handleSubmit, watch } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });
  const emailValue = watch('email');
  const isDisabled = isPending || emailValue.length === 0;

  const onSubmit = (formData: ResetPasswordFormData) => resetPassword(formData);

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <FormField
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none"
        placeholder="Enter your email"
        returnKeyType="done"
        onFocus={reset}
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <Button
        label="Send reset link"
        loadingLabel="Sending link"
        loadingIndicatorColor={colors.primary}
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isDisabled}
        style={[styles.submitButton, { backgroundColor: isDisabled ? '#F5F5F5' : colors.primary }]}
        textColor={isDisabled ? '#767676' : '#FFFFFF'}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  submitButton: {
    height: 45,
    borderRadius: 12,
    marginTop: 16,
  },
});
