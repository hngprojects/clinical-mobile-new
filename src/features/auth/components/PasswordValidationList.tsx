import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';

import { getPasswordPolicyChecks } from '../utils/passwordPolicy';

type ValidationVariant = 'full' | 'compact';

interface PasswordValidationListProps {
  password: string;
  variant?: ValidationVariant;
}

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  const statusLabel = isValid ? 'Met' : 'Not met';

  return (
    <View
      style={styles.validationItem}
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${statusLabel}`}
    >
      <Ionicons
        name={isValid ? 'checkmark' : 'close'}
        size={14}
        color={isValid ? '#10B981' : '#767676'}
        accessible={false}
      />
      <Typography style={[styles.validationText, isValid && styles.validationTextValid]}>
        {isValid ? `${label} — met` : label}
      </Typography>
    </View>
  );
}

export function PasswordValidationList({
  password,
  variant = 'full',
}: PasswordValidationListProps) {
  if (password.length === 0) return null;

  const checks = getPasswordPolicyChecks(password);

  const compactRules = [
    { label: 'Password must have 8 characters', isValid: checks.has8Chars },
    { label: 'Password must have one uppercase letter', isValid: checks.hasUpper },
    { label: 'Password must have one special character', isValid: checks.hasSpecial },
  ];

  const fullRules = [
    { label: 'Password must have at least 8 characters', isValid: checks.has8Chars },
    { label: 'Password must have at least one uppercase letter', isValid: checks.hasUpper },
    { label: 'Password must have at least one special character', isValid: checks.hasSpecial },
  ];

  const rules = variant === 'compact' ? compactRules : fullRules;
  const allMet = rules.every((rule) => rule.isValid);

  if (allMet) return null;

  const unmetCount = rules.filter((rule) => !rule.isValid).length;

  return (
    <View
      style={styles.validationList}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Password requirements, ${unmetCount} not met`}
    >
      {rules.map((rule) => (
        <ValidationItem key={rule.label} label={rule.label} isValid={rule.isValid} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  validationList: {
    gap: 4,
    marginTop: 8,
  },
  validationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  validationText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: -0.13,
  },
  validationTextValid: {
    color: '#10B981',
  },
});
