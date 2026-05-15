import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, Pressable, Image } from 'react-native';

import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { LoginFormData, loginSchema } from '../schemas/auth.schemas';

export function LoginForm({ 
  mutation, 
  onInteract 
}: { 
  mutation: any; 
  onInteract?: () => void; 
}) {
  const { spacing, colors } = useTheme();
  const { mutate: login, isPending } = mutation;
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<any>(null);

  const { control, handleSubmit, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const onSubmit = (data: LoginFormData) => login(data);

  const handleSocialPress = (provider: string) => {
    alert(`${provider} login is coming soon!`);
  };

  // Validation checks
  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  return (
    <View style={styles.container}>
      <View>
        <FormField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="chioma@gmail.com"
          onFocus={onInteract}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />

        <View style={{ marginTop: 16 }}>
          <FormField
            ref={passwordRef}
            control={control}
            name="password"
            label="Password"
            secureTextEntry={!showPassword}
            textContentType="password"
            placeholder="Enter your password"
            onFocus={onInteract}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
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
                marginTop: 6,
              }}
            >
              Forgot Password?
            </Typography>
          </Pressable>
        </View>

        {passwordValue.length > 0 && !(has8Chars && hasUpper && hasNumber) && (
          <View style={styles.validationList}>
            <ValidationItem label="Password must have at least 8 characters" isValid={has8Chars} />
            <ValidationItem label="Password must have at least one uppercase letter" isValid={hasUpper} />
            <ValidationItem label="Password must have at least one number" isValid={hasNumber} />
          </View>
        )}

        <Button
          label={isPending ? 'Logging in...' : 'Login'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          style={{ 
            marginTop: 32, 
            height: 45,
            borderRadius: 12,
            backgroundColor: isPending || passwordValue.length === 0 ? '#F5F5F5' : colors.primary
          }}
          textColor={isPending || passwordValue.length === 0 ? '#767676' : '#FFFFFF'}
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
            variant="outline"
            onPress={() => handleSocialPress('Google')}
            style={styles.socialIconButton}
            leftIcon={
              <Image
                source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png' }}
                style={{ width: 24, height: 24 }}
              />
            }
            textColor="#5E5E5E"
          />

          <Button
            label="Continue as guest"
            variant="outline"
            onPress={() => handleSocialPress('Guest')}
            style={styles.socialIconButton}
            textColor="#5E5E5E"
          />
        </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  validationList: {
    gap: 4,
    marginTop: 8,
    marginBottom: 0,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    height: 52, // Based on input field height usually, but let's keep it consistent
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
});
