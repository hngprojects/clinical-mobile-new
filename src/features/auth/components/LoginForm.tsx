import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Button, FormField, Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { LoginFormData, loginSchema } from '../schemas/auth.schemas';

import { PasswordField } from './PasswordField';

interface LoginFormProps {
  mutation: {
    mutate: (data: LoginFormData) => void;
    isPending: boolean;
  };
  onForgotPassword?: () => void;
  onContinueAsGuest?: () => void;
  onInteract?: () => void;
}

export function LoginForm({
  mutation,
  onForgotPassword,
  onContinueAsGuest,
  onInteract,
}: LoginFormProps) {
  const { colors, spacing } = useTheme();
  const { mutate: login, isPending } = mutation;
  const passwordRef = useRef<any>(null);

  const {
    startGoogleAuth,
    isPending: isGooglePending,
    error: googleError,
    clearError: clearGoogleError,
  } = useGoogleAuth('signin');

  useEffect(() => {
    if (googleError) {
      const t = setTimeout(clearGoogleError, 5000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [googleError, clearGoogleError]);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' }) ?? '';
  const onSubmit = (data: LoginFormData) => login(data);

  const handleSocialPress = async (provider: string) => {
    if (provider === 'Google') {
      await startGoogleAuth();
    } else {
      alert(`${provider} login is coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ gap: spacing.md }}>
        <FormField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="Enter your email"
          onFocus={onInteract}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />

        <View>
          <PasswordField
            ref={passwordRef}
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            onFocus={onInteract}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
          <Pressable style={styles.forgotPassword} onPress={onForgotPassword}>
            <Typography variant="body2" color={colors.primary} style={styles.forgotPasswordText}>
              Forgot Password?
            </Typography>
          </Pressable>
        </View>

        <Button
          label={isPending ? 'Logging in...' : 'Login'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          disabled={isPending || passwordValue.length === 0}
          style={{ marginTop: 32 }}
        />

        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
          <Typography style={styles.separatorText}>or</Typography>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
        </View>

        <Toast visible={!!googleError} message={googleError ?? ''} variant="error" />

        <View style={{ gap: 16 }}>
          <Button
            label={isGooglePending ? 'Connecting...' : 'Google'}
            variant="outline"
            onPress={() => handleSocialPress('Google')}
            isLoading={isGooglePending}
            style={styles.socialIconButton}
            leftIcon={
              !isGooglePending && (
                <Image
                  source={require('../../../../assets/images/auth/Google.png')}
                  style={{ width: 24, height: 24 }}
                />
              )
            }
            textColor={colors.textSecondary}
          />

          <Button
            label="Continue as guest"
            variant="outline"
            onPress={onContinueAsGuest}
            style={styles.socialIconButton}
            textColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  line: {
    flex: 1,
    height: 1,
  },
  separatorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 16,
  },
  separatorText: {
    color: '#767676',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  socialIconButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D0D0',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
});
