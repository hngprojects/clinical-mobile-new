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
        {label}
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

  const rules = [
    { label: 'At least 8 characters', isValid: checks.has8Chars },
    { label: 'At least one uppercase letter', isValid: checks.hasUpper },
    { label: 'At least one lowercase letter', isValid: checks.hasLower },
    { label: 'At least one number', isValid: checks.hasNumber },
    { label: 'At least one special character', isValid: checks.hasSpecial },
  ];

  if (variant === 'compact') {
    const unmetRules = rules.filter((rule) => !rule.isValid);
    if (unmetRules.length === 0) return null;
    return (
      <View
        style={styles.validationList}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Password requirements, ${unmetRules.length} not met`}
      >
        {unmetRules.map((rule) => (
          <ValidationItem key={rule.label} label={rule.label} isValid={rule.isValid} />
        ))}
      </View>
    );
  }

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
