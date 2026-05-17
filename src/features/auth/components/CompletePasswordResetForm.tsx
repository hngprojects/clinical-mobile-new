import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import {
  CompletePasswordResetFormData,
  completePasswordResetSchema,
} from '../schemas/auth.schemas';

interface CompletePasswordResetFormProps {
  mutation: any;
  resetToken: string;
}

export function CompletePasswordResetForm({
  mutation,
  resetToken,
}: CompletePasswordResetFormProps) {
  const { colors, spacing } = useTheme();
  const { mutate: completeReset, isPending } = mutation;
  const [showPassword, setShowPassword] = useState(false);
  const confirmPasswordRef = useRef<any>(null);

  const { control, handleSubmit, watch } = useForm<CompletePasswordResetFormData>({
    resolver: zodResolver(completePasswordResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const isDisabled = isPending || passwordValue.length === 0;
  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = (formData: CompletePasswordResetFormData) => {
    completeReset({ token: resetToken, password: formData.password });
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
        blurOnSubmit={false}
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

      {passwordValue.length > 0 && !(has8Chars && hasUpper && hasNumber) && (
        <View style={styles.validationList}>
          <ValidationItem label="Password must have at least 8 characters" isValid={has8Chars} />
          <ValidationItem
            label="Password must have at least one uppercase letter"
            isValid={hasUpper}
          />
          <ValidationItem label="Password must have at least one number" isValid={hasNumber} />
        </View>
      )}

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

      <Button
        label="Reset password"
        loadingLabel="Resetting password"
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

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <View style={styles.validationItem}>
      <Typography
        style={{
          color: isValid ? '#10B981' : '#767676',
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          lineHeight: 19.5,
          letterSpacing: -0.13,
        }}
      >
        {isValid ? '✓' : '✕'} {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  validationList: {
    gap: 4,
    marginTop: 8,
    marginBottom: 0,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    height: 45,
    borderRadius: 12,
    marginTop: 16,
  },
});
