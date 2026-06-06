import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useRequestEmailChange } from '@/features/auth/hooks/useRequestEmailChange';
import { Button, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_HORIZONTAL_PADDING } from '../constants';

import { PasswordField } from '../../auth/components/PasswordField';
import { ProfileSettingsHeader } from './ProfileSettingsHeader';

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function ChangeEmailPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { mutate: requestEmailChange, isPending, reset: resetMutation } = useRequestEmailChange();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
    mode: 'onChange',
  });

  useFocusEffect(
    useCallback(() => {
      reset({ password: '' });
      resetMutation();
    }, [reset, resetMutation]),
  );

  const onContinue = (data: FormData) => {
    requestEmailChange(
      { email: email ?? '', password: data.password },
      {
        onSuccess: (response) => {
          router.push({
            pathname: '/(profile)/change-email-otp',
            params: {
              email: email ?? '',
              expiresInSeconds: String(response.expiresInSeconds ?? 120),
            },
          });
        },
        onError: (error) => {
          Alert.alert(
            'Could not send verification code',
            error.message || 'Please check your password and try again.',
          );
        },
      },
    );
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <ProfileSettingsHeader title="Change Email" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={[styles.fill, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <Typography variant="h1" style={styles.pageTitle}>
              Confirm Your Password
            </Typography>
            <Typography variant="body1" color={colors.textSecondary}>
              Enter your password to send a verification code to{' '}
              <Typography variant="body1" color={colors.text} style={styles.newEmail}>
                {email}
              </Typography>
              .
            </Typography>
          </View>

          <PasswordField
            control={control}
            name="password"
            label="Current Password"
            placeholder="Enter your password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onContinue)}
          />

          <Button
            label="Send Verification Code"
            loadingLabel="Sending code..."
            onPress={handleSubmit(onContinue)}
            isLoading={isPending}
            disabled={!isValid || isPending}
            style={[styles.button, (!isValid || isPending) && { backgroundColor: colors.border }]}
            textColor={isValid && !isPending ? '#FFFFFF' : colors.textSecondary}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  titleBlock: { gap: 6 },
  pageTitle: { fontWeight: '700', fontFamily: 'Inter_700Bold' },
  newEmail: { fontFamily: 'Inter_600SemiBold' },
  button: { borderRadius: 12 },
});
