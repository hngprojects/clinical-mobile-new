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
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

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
            <Typography variant="body2" color="primary" style={{ fontWeight: '500' }}>
              Forgot Password?
            </Typography>
          </Pressable>
        </View>

        {passwordValue.length > 0 && (
          <View style={styles.validationList}>
            <ValidationItem label="Password must have 8characters" isValid={has8Chars} />
            <ValidationItem label="Password must one upper case" isValid={hasUpper} />
            <ValidationItem label="Password must one special character" isValid={hasSpecial} />
          </View>
        )}

        <Button
          label={isPending ? 'Logging in...' : 'Login'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          style={{ marginTop: spacing.xs }}
        />

        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Typography variant="body2" color="textSecondary" style={{ paddingHorizontal: 10 }}>
            or
          </Typography>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Button
          label="Google"
          variant="outline"
          onPress={() => {}}
          style={styles.socialButton}
          leftIcon={
            <Image
              source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png' }}
              style={{ width: 24, height: 24 }}
            />
          }
        />

        <Button
          label="Continue as guest"
          variant="outline"
          onPress={() => {}}
          style={{ borderColor: '#E5E7EB' }}
        />
      </View>
    </View>
  );
}

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.validationItem}>
      <Typography variant="body2" style={{ color: colors.textSecondary, fontSize: 13 }}>
        {isValid ? '✓' : '✕'} {label}
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
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
});
