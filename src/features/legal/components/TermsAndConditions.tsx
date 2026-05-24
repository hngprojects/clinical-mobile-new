import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { terms } from '../../onboarding/data/TandC';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CHEVRON_DURATION = 250;

type TermItem = (typeof terms)[number];

interface TermAccordionItemProps {
  item: TermItem;
  isOpen: boolean;
  onToggle: () => void;
}

function TermAccordionItem({ item, isOpen, onToggle }: TermAccordionItemProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 1 : 0, {
      duration: CHEVRON_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isOpen, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  return (
    <View style={[styles.termCard, { borderBottomColor: colors.borderSubtle }]}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={({ pressed }) => [styles.headerRow, pressed && styles.headerRowPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.title}
      >
        <Typography variant="body1" style={styles.termTitle}>
          {item.title}
        </Typography>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Animated.View>
      </Pressable>

      {isOpen ? (
        <View style={styles.termBody}>
          {item.content ? (
            <Typography variant="body2" color={colors.textSecondary} style={styles.paragraph}>
              {item.content}
            </Typography>
          ) : null}

          {item.subcontent ? (
            <Typography variant="body2" color={colors.textSecondary} style={styles.paragraph}>
              {item.subcontent}
            </Typography>
          ) : null}

          {item.bulletTop ? (
            <Typography variant="body2" color={colors.textSecondary} style={styles.paragraph}>
              {item.bulletTop}
            </Typography>
          ) : null}

          {item.bullets && item.bullets.length > 0 ? (
            <View style={styles.bulletList}>
              {item.bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    style={styles.bulletMarker}
                  >
                    •
                  </Typography>
                  {typeof bullet === 'string' ? (
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      style={styles.bulletText}
                    >
                      {bullet}
                    </Typography>
                  ) : (
                    <View style={styles.bulletInlineRow}>
                      <Typography variant="body2" color={colors.textSecondary}>
                        {bullet.label}:
                      </Typography>
                      <Typography variant="body2" style={styles.bulletValue}>
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
}

export function TermsAndConditions() {
  const { spacing } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    terms.length > 0 ? { [terms[0].title]: true } : {},
  );

  const toggle = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((state) => ({ ...state, [key]: !state[key] }));
  }, []);

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {terms.map((item) => (
        <TermAccordionItem
          key={item.title}
          item={item}
          isOpen={!!expanded[item.title]}
          onToggle={() => toggle(item.title)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  termCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletMarker: {
    marginRight: 10,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    lineHeight: 21,
  },
  bulletInlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  bulletValue: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  bulletList: {
    marginTop: 4,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 44,
  },
  headerRowPressed: {
    opacity: 0.6,
  },
  termTitle: {
    flex: 1,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  termBody: {
    marginTop: 16,
    gap: 12,
  },
  paragraph: {
    lineHeight: 21,
  },
});
