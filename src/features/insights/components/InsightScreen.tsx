import React, { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { InsightItemCard } from './InsightItemCard';
import { InsightSearchBar } from './InsightSearchBar';

export function InsightScreen() {
  const { spacing } = useTheme();
  const [query, setQuery] = useState('');

  return (
    <Screen scrollable>
      <View style={{ gap: spacing.md }}>
        <InsightSearchBar value={query} onChangeText={setQuery} />
        <InsightItemCard title="Hormone Health Discussion" subtitle="2 mins ago" />
      </View>
    </Screen>
  );
}
