import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View, Pressable, Image } from 'react-native';

import { Button, FormField, Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useRegister } from '../hooks/useRegister';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';

interface RegisterFormProps {
  onContinueAsGuest?: () => void;
}

export function RegisterForm({ onContinueAsGuest }: RegisterFormProps) {
  const { spacing, colors } = useTheme();
  const { mutate: register, isPending, error, reset: resetError } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [registerToastVisible, setRegisterToastVisible] = useState(false);

  const { startGoogleAuth, isPending: isGooglePending, error: googleError, clearError: clearGoogleError } = useGoogleAuth('signup');

  useEffect(() => {
    if (error) {
      setRegisterToastVisible(true);
      const t = setTimeout(() => setRegisterToastVisible(false), 5000);
      return () => clearTimeout(t);
    }
    setRegisterToastVisible(false);
  }, [error]);

  useEffect(() => {
    if (googleError) {
      const t = setTimeout(clearGoogleError, 5000);
      return () => clearTimeout(t);
    }
  }, [googleError, clearGoogleError]);

  const lastNameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const { control, handleSubmit } = useForm<RegisterFormData>({
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
  const onSubmit = (data: RegisterFormData) => { resetError(); register(data); };

  function getRegisterErrorMessage(err: { message?: string; status?: number } | null): string {
    if (!err) return '';
    const msg = err.message?.toLowerCase() ?? '';
    if (err.status === 0 || msg.includes('timeout') || msg.includes('network')) {
      return 'Connection failed. Please check your network and try again.';
    }
    if (msg.includes('exist') || msg.includes('already') || msg.includes('taken')) {
      return 'An account with this email already exists.';
    }
    return err.message || 'Something went wrong. Please try again.';
  }

  const handleSocialPress = async (provider: string) => {
    if (provider === 'Google') {
      await startGoogleAuth();
    } else {
      alert(`${provider} registration is coming soon!`);
    }
  };

  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <FormField
        control={control}
        name="firstName"
        label="First name"
        placeholder="Enter your name"
        returnKeyType="next"
        onSubmitEditing={() => lastNameRef.current?.focus()}
        submitBehavior="submit"
      />
      <FormField
        ref={lastNameRef}
        control={control}
        name="lastName"
        label="Last name"
        placeholder="Enter your name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        submitBehavior="submit"
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
        submitBehavior="submit"
      />
      <FormField
        ref={passwordRef}
        control={control}
        name="password"
        label="Password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="Enter your password"
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

      {passwordValue.length > 0 &&
        !(has8Chars && hasUpper && hasLower && hasNumber && hasSpecial) && (
          <View style={styles.validationList}>
            <ValidationItem label="Password must have at least 8 characters" isValid={has8Chars} />
            <ValidationItem
              label="Password must have at least one uppercase letter"
              isValid={hasUpper}
            />
            <ValidationItem
              label="Password must have at least one lowercase letter"
              isValid={hasLower}
            />
            <ValidationItem label="Password must have at least one number" isValid={hasNumber} />
            <ValidationItem
              label="Password must have at least one special character"
              isValid={hasSpecial}
            />
          </View>
        )}

      <FormField
        ref={confirmPasswordRef}
        control={control}
        name="confirmPassword"
        label="Confirm password"
        secureTextEntry={!showPassword}
        textContentType="newPassword"
        placeholder="Retype your password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <Toast visible={registerToastVisible} message={getRegisterErrorMessage(error)} variant="error" />

      <Button
        label="Continue"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isPending || passwordValue.length === 0}
        style={{ marginTop: spacing.xs }}
      />

      <View style={styles.separatorContainer}>
        <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
        <Typography variant="body2" color="textSecondary" style={{ paddingHorizontal: 16 }}>
          or
        </Typography>
        <View style={[styles.line, { backgroundColor: '#F0F0F0' }]} />
      </View>

      <Toast visible={!!googleError} message={googleError ?? ''} variant="error" />

      <View style={{ gap: spacing.md }}>
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
    marginTop: -8,
    marginBottom: 8,
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
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
});
