import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Image, StyleSheet, TextInput as RNTextInput, View } from 'react-native';

import { Button, FormField, Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { RegisterFormData, registerSchema } from '../schemas/auth.schemas';

import { PasswordField } from './PasswordField';
import { PasswordValidationList } from './PasswordValidationList';

interface RegisterFormProps {
  mutation: {
    mutate: (data: RegisterFormData) => void;
    isPending: boolean;
  };
  onContinueAsGuest?: () => void;
}

export function RegisterForm({ mutation, onContinueAsGuest }: RegisterFormProps) {
  const { spacing, colors } = useTheme();
  const { mutate: register, isPending } = mutation;
  const {
    startGoogleAuth,
    isPending: isGooglePending,
    error: googleError,
    clearError: clearGoogleError,
  } = useGoogleAuth('signup');

  useEffect(() => {
    if (!googleError) return undefined;

    const timer = setTimeout(clearGoogleError, 5000);
    return () => clearTimeout(timer);
  }, [googleError, clearGoogleError]);

  const lastNameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const { control, handleSubmit, formState } = useForm<RegisterFormData>({
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

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' }) ?? '';
  const onSubmit = (data: RegisterFormData) => {
    register(data);
  };

  const handleSocialPress = async (provider: string) => {
    if (provider === 'Google') {
      await startGoogleAuth();
    } else {
      alert(`${provider} registration is coming soon!`);
    }
  };

  const isDisabled = isPending || !formState.isValid;

  return (
    <View style={styles.container}>
      <Toast visible={!!googleError} message={googleError ?? ''} variant="error" />

      <View style={{ gap: spacing.md }}>
        <FormField
          control={control}
          name="firstName"
          label="First Name"
          placeholder="Enter your name"
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          blurOnSubmit={false}
        />
        <FormField
          ref={lastNameRef}
          control={control}
          name="lastName"
          label="Last Name"
          placeholder="Enter your name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />
        <FormField
          ref={emailRef}
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="Enter your email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />

        <View>
          <PasswordField
            ref={passwordRef}
            control={control}
            name="password"
            label="Password"
            textContentType="newPassword"
            placeholder="Enter your password"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            blurOnSubmit={false}
          />
          <PasswordValidationList password={passwordValue} variant="full" />
        </View>

        <PasswordField
          ref={confirmPasswordRef}
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          textContentType="newPassword"
          placeholder="Retype your password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />

        <Button
          label="Continue"
          loadingLabel="Continuing..."
          loadingIndicatorColor="#1565C0"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          disabled={isDisabled}
          style={{ marginTop: 32 }}
        />

        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
          <Typography
            style={{
              paddingHorizontal: 16,
              color: '#767676',
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
          >
            or
          </Typography>
          <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
        </View>

        <View style={{ gap: 16 }}>
          <Button
            label="Google"
            loadingLabel="Signing up with Google"
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialIconButton: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
});
