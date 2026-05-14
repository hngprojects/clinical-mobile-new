import React, { useCallback, useState } from 'react';
import { FlatList, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';
import { terms } from '../../onboarding/data/TandC';

export function TermsAndConditions() {
  const { spacing, colors } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((state) => ({ ...state, [key]: !state[key] }));
  }, []);

  const renderItem = ({ item }: { item: (typeof terms)[0] }) => {
    const isOpen = !!expanded[item.title];

    return (
      <View style={styles.termCard}>
        <Pressable onPress={() => toggle(item.title)} style={styles.headerRow}>
          <Typography
            variant="h3"
            style={{ flex: 1, color: '#000000', fontSize: 18, fontWeight: '500' }}
          >
            {item.title}
          </Typography>
          <Svg width={24} height={24} viewBox="0 0 14 8" fill="none">
            {isOpen ? (
              <Path
                d="M0.75 6.74995C0.75 6.74995 5.16893 0.750013 6.75005 0.75C8.33116 0.749987 12.75 6.75 12.75 6.75"
                stroke="#141B34"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <Path
                d="M0.75 0.750046C0.75 0.750046 5.16893 6.74999 6.75005 6.75C8.33116 6.75001 12.75 0.749999 12.75 0.749999"
                stroke="#141B34"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </Pressable>

        {isOpen ? (
          <View style={{ marginTop: 13 }}>
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
                    <Typography variant="body1" style={{ marginRight: 10, color: '#5E5E5E' }}>
                      •
                    </Typography>
                    {typeof bullet === 'string' ? (
                      <Typography variant="body1" style={{ color: '#5E5E5E', flex: 1 }}>
                        {bullet}
                      </Typography>
                    ) : (
                      <View style={styles.bulletInlineRow}>
                        <Typography variant="body1" style={{ color: '#5E5E5E' }}>
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
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: spacing.lg }}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  termCard: {
    width: '100%',
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    color: '#5E5E5E',
    fontWeight: '400',
    fontSize: 18,
  },
});
