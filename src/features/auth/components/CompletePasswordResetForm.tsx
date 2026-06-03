import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { CompletePasswordResetRequest } from '../api/auth.types';
import {
  CompletePasswordResetFormData,
  completePasswordResetSchema,
} from '../schemas/auth.schemas';
import { isPasswordPolicyMet } from '../utils/passwordPolicy';

import { PasswordValidationList } from './PasswordValidationList';

interface CompletePasswordResetFormProps {
  mutation: {
    mutate: (data: CompletePasswordResetRequest) => void;
    isPending: boolean;
  };
  resetToken: string;
}

export function CompletePasswordResetForm({ mutation, resetToken }: CompletePasswordResetFormProps) {
  const { spacing } = useTheme();
  const { mutate: completeReset, isPending } = mutation;
  const [showPassword, setShowPassword] = useState(false);
  const confirmPasswordRef = useRef<any>(null);

  const { control, handleSubmit, watch } = useForm<CompletePasswordResetFormData>({
    resolver: zodResolver(completePasswordResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const isPasswordValid = isPasswordPolicyMet(passwordValue);
  const passwordsMatch = confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;
  const isDisabled = isPending || !isPasswordValid || !passwordsMatch;

  const onSubmit = (formData: CompletePasswordResetFormData) => {
    completeReset({ token: resetToken, newPassword: formData.password });
  };

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <FormField
        control={control}
        name="password"
        label="New password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="Enter your new password"
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        submitBehavior="submit"
        rightIcon={
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#1B1B1B"
            />
          </Pressable>
        }
      />

      <PasswordValidationList password={passwordValue} variant="full" />

      <FormField
        ref={confirmPasswordRef}
        control={control}
        name="confirmPassword"
        label="Confirm password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="Confirm your new password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      {confirmPasswordValue.length > 0 && <PasswordMatchHint isValid={passwordsMatch} />}

      <Button
        label="Reset password"
        loadingLabel="Resetting password"
        loadingIndicatorColor="#1565C0"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isDisabled}
        style={styles.submitButton}
      />
    </View>
  );
}

function PasswordMatchHint({ isValid }: { isValid: boolean }) {
  return (
    <View style={styles.validationItem}>
      <Ionicons
        name={isValid ? 'checkmark' : 'close'}
        size={14}
        color={isValid ? '#10B981' : '#767676'}
      />
      <Typography style={[styles.validationText, isValid && styles.validationTextValid]}>
        Passwords must match
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  validationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  validationText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    letterSpacing: -0.13,
    lineHeight: 19.5,
  },
  validationTextValid: {
    color: '#10B981',
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 16,
  },
});
