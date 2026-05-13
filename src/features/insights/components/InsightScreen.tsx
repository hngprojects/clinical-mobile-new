import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';

import { Screen } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import type { InsightListItem } from '../api/types';
import { useInsightList } from '../hooks/useInsightList';

import { InsightListEmpty } from './InsightListEmpty';
import { InsightListRenderItem } from './InsightListRenderItem';
import { InsightSearchBar } from './InsightSearchBar';

export function InsightScreen() {
  const { spacing } = useTheme();
  const { query, setQuery, items, filtered, addDemoInsight, renameInsight, deleteInsight } =
    useInsightList();

  const renderItem: ListRenderItem<InsightListItem> = useCallback(
    ({ item }) => (
      <InsightListRenderItem item={item} onRename={renameInsight} onDelete={deleteInsight} />
    ),
    [deleteInsight, renameInsight],
  );

  const listHeader = useMemo(
    () => (
      <View style={{ marginBottom: spacing.md }}>
        <InsightSearchBar value={query} onChangeText={setQuery} />
      </View>
    ),
    [query, setQuery, spacing.md],
  );

  const listEmpty = useMemo(
    () => <InsightListEmpty hasAnyItems={items.length > 0} onUploadPress={addDemoInsight} />,
    [addDemoInsight, items.length],
  );

  return (
    <Screen scrollable={false}>
      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContent : { paddingBottom: spacing.lg }
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
