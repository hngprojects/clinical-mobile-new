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
            <ValidationItem label="Password must have 8characters" isValid={has8Chars} />
            <ValidationItem label="Password must one upper case" isValid={hasUpper} />
            <ValidationItem label="Password must one special character" isValid={hasNumber} />
          </View>
        )}

        <Button
          label={isPending ? 'Logging in...' : 'Login'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          style={{ 
            marginTop: spacing.xs, 
            height: 56,
            backgroundColor: isPending || passwordValue.length === 0 ? '#F5F5F5' : colors.primary
          }}
          textColor={isPending || passwordValue.length === 0 ? '#9CA3AF' : '#FFFFFF'}
        />

        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
          <Typography variant="body2" color="textSecondary" style={{ paddingHorizontal: 16 }}>
            or
          </Typography>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
        </View>

        <View style={{ gap: spacing.md }}>
          <Button
            label="Google"
            variant="outline"
            onPress={() => {}}
            style={styles.socialIconButton}
            leftIcon={
              <Image
                source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png' }}
                style={{ width: 20, height: 20 }}
              />
            }
            textColor="#4B5563"
          />

          <Button
            label="Continue as guest"
            variant="outline"
            onPress={() => {}}
            style={styles.socialIconButton}
            textColor="#4B5563"
          />
        </View>
      </View>
    </View>
  );
}

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.validationItem}>
      <Typography
        variant="body2"
        style={{
          color: '#6B7280',
          fontSize: 13,
        }}
      >
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
    marginBottom: 16,
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
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
});
