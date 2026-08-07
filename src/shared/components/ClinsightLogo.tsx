import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const logoSource = require('../../../assets/images/Clinsight.png');

interface ClinsightLogoProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string; // Maintained for prop interface compatibility
  style?: StyleProp<ImageStyle>;
}

export function ClinsightLogo({ size = 48, width, height, style }: ClinsightLogoProps) {
  const w = width ?? size;
  const h = height ?? size;
  return (
    <Image
      source={logoSource}
      style={[{ width: w, height: h }, style]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}
