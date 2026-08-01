import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreenHeader, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { legalHeroStyles } from '../constants';
import type { LegalDocumentItem } from '../types';

import { LegalAccordionList } from './LegalAccordionList';

const heroPattern = require('../../../../assets/images/Circle.png');

interface LegalDocumentScreenProps {
  navTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  items: LegalDocumentItem[];
}

export function LegalDocumentScreen({
  navTitle,
  heroTitle,
  heroSubtitle,
  items,
}: LegalDocumentScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <AppScreenHeader title={navTitle} onBack={() => router.back()} />

      <View style={[styles.fill, { backgroundColor: colors.background }]} pointerEvents="box-none">
        <View style={legalHeroStyles.hero} pointerEvents="none">
          <Image source={heroPattern} style={legalHeroStyles.heroPattern} resizeMode="cover" />
          <Typography style={legalHeroStyles.heroTitle}>{heroTitle}</Typography>
          <Typography style={legalHeroStyles.heroSubtitle}>{heroSubtitle}</Typography>
        </View>

        <LegalAccordionList items={items} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
