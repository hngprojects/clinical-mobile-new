import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_HORIZONTAL_PADDING } from '../constants';

import { ProfileSettingsHeader } from './ProfileSettingsHeader';

const schema = z.object({
  email: z.string().email('Enter a valid email address').min(1, 'Email is required'),
});

type FormData = z.infer<typeof schema>;

export function ChangeEmailNewAddressScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const currentEmail = useAuthStore((s) => s.user?.email ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  useFocusEffect(
    useCallback(() => {
      reset({ email: '' });
    }, [reset]),
  );

  const onContinue = (data: FormData) => {
    router.push({
      pathname: '/(main)/change-email-password',
      params: { email: data.email },
    });
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
              New Email Address
            </Typography>
            <Typography variant="body1" color={colors.textSecondary}>
              Your current email is{' '}
              <Typography variant="body1" color={colors.text} style={styles.currentEmail}>
                {currentEmail}
              </Typography>
              . Enter the new address below.
            </Typography>
          </View>

          <FormField
            control={control}
            name="email"
            label="New Email Address"
            placeholder="Enter new email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onContinue)}
          />

          <Button
            label="Continue"
            onPress={handleSubmit(onContinue)}
            disabled={!isValid}
            style={[styles.button, !isValid && { backgroundColor: colors.border }]}
            textColor={isValid ? '#FFFFFF' : colors.textSecondary}
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
  currentEmail: { fontFamily: 'Inter_600SemiBold' },
  button: { borderRadius: 12 },
});
