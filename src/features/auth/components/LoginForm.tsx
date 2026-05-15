import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, Pressable, Image } from 'react-native';

import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { LoginFormData, loginSchema } from '../schemas/auth.schemas';

export function LoginForm({ mutation }: { mutation: any }) {
  const { spacing, colors } = useTheme();
  const { mutate: login, isPending } = mutation;
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const onSubmit = (data: LoginFormData) => login(data);

  // Validation checks
  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  return (
    <View style={styles.container}>
      <View style={{ gap: spacing.md }}>
        <FormField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="chioma@gmail.com"
        />

        <View>
          <FormField
            control={control}
            name="password"
            label="Password"
            secureTextEntry={!showPassword}
            textContentType="password"
            placeholder="Enter your password"
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
          <Pressable style={styles.forgotPassword} onPress={() => {}}>
            <Typography
              variant="body2"
              color={colors.primary}
              style={{
                fontWeight: '400',
                textDecorationLine: 'underline',
                lineHeight: 21,
                letterSpacing: -0.14,
              }}
            >
              Forgot Password?
            </Typography>
          </Pressable>
        </View>

        {passwordValue.length > 0 && (
          <View style={styles.validationList}>
            <ValidationItem label="At least 8 characters" isValid={has8Chars} />
            <ValidationItem label="At least one uppercase letter" isValid={hasUpper} />
            <ValidationItem label="At least one number" isValid={hasNumber} />
          </View>
        )}

        <Button
          label={isPending ? 'Logging in...' : 'Login'}
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

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
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

        <Button
          label="Continue as guest"
          variant="ghost"
          onPress={() => {}}
          style={{ marginTop: spacing.sm }}
          textColor={colors.textSecondary}
        />
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  validationList: {
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
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
