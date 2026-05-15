import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, Pressable, Image } from 'react-native';

import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useRegister } from '../hooks/useRegister';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';

export function RegisterForm() {
  const { spacing, colors } = useTheme();
  const { mutate: register, isPending, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const onSubmit = (data: RegisterFormData) => register(data);

  // Password validation logic
  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <View style={styles.flex}>
          <FormField control={control} name="firstName" label="First name" placeholder="John" />
        </View>
        <View style={styles.flex}>
          <FormField control={control} name="lastName" label="Last name" placeholder="Doe" />
        </View>
      </View>

      <FormField
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="john@example.com"
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="••••••••"
        rightIcon={
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        }
      />

      {passwordValue.length > 0 && (
        <View style={styles.validationList}>
          <ValidationItem label="At least 8 characters" isValid={has8Chars} />
          <ValidationItem label="At least one uppercase letter" isValid={hasUpper} />
          <ValidationItem label="At least one number" isValid={hasNumber} />
        </View>
      )}

      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="••••••••"
      />

      {error && (
        <Typography variant="body2" color="#EF4444" align="center" style={{ fontWeight: '500' }}>
          {error.message}
        </Typography>
      )}

      <Button
        label="Create Account"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        style={{ marginTop: spacing.xs, height: 56 }}
      />

      <View style={styles.separatorContainer}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Typography variant="body2" color="textSecondary" style={{ paddingHorizontal: 16 }}>
          or continue with
        </Typography>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Pressable style={[styles.socialIconButton, { flex: 1 }]}>
          <Image
            source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png' }}
            style={{ width: 24, height: 24 }}
          />
          <Typography variant="body2" style={{ fontWeight: '600', marginLeft: 8 }}>Google</Typography>
        </Pressable>

        <Pressable style={[styles.socialIconButton, { flex: 1, backgroundColor: '#000000' }]}>
          <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
          <Typography variant="body2" style={{ fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>Apple</Typography>
        </Pressable>
      </View>
    </View>
  );
}

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.validationItem}>
      <Ionicons
        name={isValid ? 'checkmark-circle' : 'close-circle-outline'}
        size={16}
        color={isValid ? '#10B981' : colors.textSecondary}
        style={{ marginRight: 8 }}
      />
      <Typography
        variant="body2"
        style={{
          color: isValid ? colors.text : colors.textSecondary,
          fontSize: 13,
          fontWeight: isValid ? '500' : '400',
        }}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  validationList: {
    gap: 8,
    marginTop: -8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
});
