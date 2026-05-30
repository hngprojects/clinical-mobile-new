import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, View } from 'react-native';

import { Button, Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useInsightCases } from '@/features/insights/hooks/useInsightCases';
import type { InsightListItem } from '../api/types';
import { useInsightList } from '../hooks/useInsightList';

import { InsightListEmpty } from './InsightListEmpty';
import { InsightListRenderItem } from './InsightListRenderItem';
import { InsightSearchBar } from './InsightSearchBar';

export function InsightScreen() {
  const { spacing, colors } = useTheme();
  const { insightItems, isLoading, isError, refetch } = useInsightCases();
  const {
    query,
    setQuery,
    items,
    filtered,
    isSearching,
    addDemoInsight,
    renameInsight,
    deleteInsight,
  } = useInsightList(insightItems);

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
  const isInitialLoading = isLoading && items.length === 0;
  const isInitialError = isError && items.length === 0;

  return (
    <Screen scrollable={false} padding>
      <View style={styles.screenBody}>
        <Typography variant="h2" color="#000000" style={{ marginBottom: spacing.md }}>
          Insights
        </Typography>
        <View style={{ marginBottom: spacing.md }}>
          <InsightSearchBar value={query} onChangeText={setQuery} />
        </View>
        {isInitialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Typography color={colors.textSecondary} style={styles.loadingText}>
              Loading insights...
            </Typography>
          </View>
        ) : isInitialError ? (
          <View style={styles.errorState}>
            <Typography variant="h3" color={colors.text} align="center">
              Unable to load cases
            </Typography>
            <Typography color={colors.textSecondary} align="center" style={styles.errorMessage}>
              Check your connection and try again.
            </Typography>
            <Button
              label="Retry"
              onPress={() => {
                refetch();
              }}
              style={styles.retryButton}
            />
          </View>
        ) : (
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
            refreshing={isLoading}
            onRefresh={refetch}
          />
        )}
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
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  errorState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorMessage: {
    maxWidth: 280,
  },
  retryButton: {
    minWidth: 140,
    marginTop: 4,
  },
});
