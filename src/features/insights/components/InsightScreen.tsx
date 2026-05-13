import React from 'react';
import { View } from 'react-native';

import { Screen } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { InsightItemCard } from './InsightItemCard';

export function InsightScreen() {
  const { spacing } = useTheme();

  return (
    <Screen scrollable>
      <View style={{ gap: spacing.md }}>
        <InsightItemCard
          title="Hormone Health Discussion"
          subtitle="2 mins ago"
          onMenuPress={() => undefined}
        />
      </View>
    </Screen>
  );
}
