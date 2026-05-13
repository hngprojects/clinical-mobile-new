import React, { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { InsightItemCard } from './InsightItemCard';
import { InsightSearchBar } from './InsightSearchBar';

export function InsightScreen() {
  const { spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [insightTitle, setInsightTitle] = useState('Hormone Health Discussion');

  return (
    <Screen scrollable>
      <View style={{ gap: spacing.md }}>
        <InsightSearchBar value={query} onChangeText={setQuery} />
        <InsightItemCard
          title={insightTitle}
          subtitle="2 mins ago"
          onRename={(next) => setInsightTitle(next)}
        />
      </View>
    </Screen>
  );
}
