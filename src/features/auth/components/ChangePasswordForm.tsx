import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput as RNTextInput, StyleSheet, View } from 'react-native';

import { Button } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { ChangePasswordRequest } from '../api/auth.types';
import { ChangePasswordFormData, changePasswordSchema } from '../schemas/auth.schemas';

import { PasswordField } from './PasswordField';
import { PasswordValidationList } from './PasswordValidationList';

interface ChangePasswordFormProps {
  mutation: {
    mutate: (
      data: ChangePasswordRequest,
      options?: { onSuccess?: () => void; onError?: (error: { message: string }) => void },
    ) => void;
    isPending: boolean;
  };
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function ChangePasswordForm({ mutation, onSuccess, onError }: ChangePasswordFormProps) {
  const { spacing } = useTheme();
  const { mutate: changePassword, isPending } = mutation;
  const newPasswordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const { control, handleSubmit, watch, formState } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  const newPasswordValue = watch('newPassword') ?? '';
  const isDisabled = isPending || !formState.isValid;

  const onSubmit = (formData: ChangePasswordFormData) => {
    changePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess,
        onError: (err) => onError?.(err.message),
      },
    );
  };

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <PasswordField
        control={control}
        name="currentPassword"
        label="Current Password"
        placeholder="Enter your current password"
        returnKeyType="next"
        onSubmitEditing={() => newPasswordRef.current?.focus()}
        blurOnSubmit={false}
      />

      <View>
        <PasswordField
          ref={newPasswordRef}
          control={control}
          name="newPassword"
          label="New Password"
          placeholder="Enter your new password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <PasswordValidationList password={newPasswordValue} variant="compact" />
      </View>

      <PasswordField
        ref={confirmPasswordRef}
        control={control}
        name="confirmNewPassword"
        label="Confirm New Password"
        placeholder="Confirm your new password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <Button
        label="Change Password"
        loadingLabel="Changing password..."
        loadingIndicatorColor="#1565C0"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isDisabled}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  submitButton: {
    borderRadius: 12,
    marginTop: 16,
  },
});
