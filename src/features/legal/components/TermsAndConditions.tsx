import React, { useCallback, useState } from 'react';
import { FlatList, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';
import { terms } from '../../onboarding/data/TandC';

export function TermsAndConditions() {
  const { spacing, colors } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    terms.length > 0 ? { [terms[0].title]: true } : {},
  );

  const toggle = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((state) => ({ ...state, [key]: !state[key] }));
  }, []);

  const renderItem = ({ item }: { item: (typeof terms)[0] }) => {
    const isOpen = !!expanded[item.title];

    return (
      <View style={styles.termCard}>
        <Pressable
          onPress={() => toggle(item.title)}
          style={styles.headerRow}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          accessibilityLabel={item.title}
        >
          <Typography style={styles.termTitle}>{item.title}</Typography>
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            style={isOpen ? styles.chevronUp : styles.chevronDown}
          >
            <Path
              d="M15 6L9 12L15 18"
              stroke="#141B34"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        {isOpen ? (
          <View style={styles.termBody}>
            {item.content ? (
              <Typography variant="body1" style={{ marginBottom: spacing.sm, ...styles.text }}>
                {item.content}
              </Typography>
            ) : null}

            {item.subcontent ? (
              <Typography variant="body1" style={{ marginBottom: spacing.sm, ...styles.text }}>
                {item.subcontent}
              </Typography>
            ) : null}

            {item.bulletTop ? (
              <Typography variant="body1" style={{ marginBottom: spacing.sm, ...styles.text }}>
                {item.bulletTop}
              </Typography>
            ) : null}

            {item.bullets && item.bullets.length > 0 ? (
              <View style={{ marginTop: spacing.xs }}>
                {item.bullets.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Typography variant="body1" style={{ marginRight: 10, color: '#6A6A6A' }}>
                      •
                    </Typography>
                    {typeof bullet === 'string' ? (
                      <Typography variant="body1" style={{ color: '#6A6A6A', flex: 1 }}>
                        {bullet}
                      </Typography>
                    ) : (
                      <View style={styles.bulletInlineRow}>
                        <Typography variant="body1" style={{ color: '#6A6A6A' }}>
                          {bullet.label}:
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{ fontWeight: '600', color: colors.text, marginLeft: 6 }}
                        >
                          {bullet.value}
                        </Typography>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <FlatList
      data={terms}
      keyExtractor={(it) => it.title}
      contentContainerStyle={styles.content}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  termCard: {
    width: '100%',
    paddingHorizontal: 30,
  },
  content: {
    paddingBottom: 48,
    paddingTop: 24,
  },
  separator: {
    height: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletInlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 40,
  },
  termTitle: {
    color: '#000000',
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  termBody: {
    marginTop: 20,
  },
  chevronDown: {
    transform: [{ rotate: '-90deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '90deg' }],
  },
  text: {
    color: '#6A6A6A',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },
});
