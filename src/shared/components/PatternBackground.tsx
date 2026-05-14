import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { ClinsightLogo } from './ClinsightLogo';

const { width: W, height: H } = Dimensions.get('window');

const PATTERN_COLS = 5;
const PATTERN_ROWS = 12;
const CELL_W = W / PATTERN_COLS;
const CELL_H = H / (PATTERN_ROWS - 2);

interface PatternBackgroundProps {
  opacity?: number;
  color?: string;
  backgroundColor?: string;
}

export function PatternBackground({
  opacity = 0.04,
  color = '#0D6DDB',
  backgroundColor = '#FFFFFF',
}: PatternBackgroundProps) {
  return (
    <View style={[styles.container, { backgroundColor }]} pointerEvents="none">
      {Array.from({ length: PATTERN_ROWS }).map((_, row) => (
        <View key={row} style={[styles.patternRow, { height: CELL_H }]}>
          {Array.from({ length: PATTERN_COLS + 1 }).map((_, col) => (
            <View key={col} style={[styles.patternCell, { width: CELL_W, height: CELL_H }]}>
              <ClinsightLogo size={50} color={color} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternRow: {
    flexDirection: 'row',
  },
  patternCell: {
    opacity: 0.04, // Very subtle as per design
    alignItems: 'center',
    justifyContent: 'center',
  },
});
