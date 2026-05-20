import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import type { InsightListItem } from '../api/types';
import { useInsightList } from '../hooks/useInsightList';

import { InsightListEmpty } from './InsightListEmpty';
import { InsightListRenderItem } from './InsightListRenderItem';
import { InsightSearchBar } from './InsightSearchBar';

export function InsightScreen() {
  const { spacing } = useTheme();
  const {
    query,
    setQuery,
    items,
    filtered,
    isSearching,
    addDemoInsight,
    renameInsight,
    deleteInsight,
  } = useInsightList();

  const hasActiveQuery = query.trim().length > 0;
  const isSearchActive = hasActiveQuery && items.length > 0;

  const listData = useMemo(
    () => (isSearching && hasActiveQuery ? [] : filtered),
    [filtered, hasActiveQuery, isSearching],
  );

  const renderItem: ListRenderItem<InsightListItem> = useCallback(
    ({ item }) => (
      <InsightListRenderItem item={item} onRename={renameInsight} onDelete={deleteInsight} />
    ),
    [deleteInsight, renameInsight],
  );

  const listEmpty = useMemo(
    () => (
      <InsightListEmpty
        hasAnyItems={items.length > 0}
        isSearchActive={isSearchActive}
        isSearching={isSearching}
        onUploadPress={addDemoInsight}
      />
    ),
    [addDemoInsight, isSearchActive, isSearching, items.length],
  );

  const listEmptyVisible = listData.length === 0;

  return (
    <Screen scrollable={false} padding>
      <View style={styles.screenBody}>
        <Typography variant="h2" color="#000000" style={{ marginBottom: spacing.md }}>
          Insights
        </Typography>
        <View style={{ marginBottom: spacing.md }}>
          <InsightSearchBar value={query} onChangeText={setQuery} />
        </View>
        <FlatList
          style={styles.list}
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={listEmptyVisible ? listEmpty : undefined}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={
            listEmptyVisible ? styles.emptyContent : { paddingBottom: spacing.lg }
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
