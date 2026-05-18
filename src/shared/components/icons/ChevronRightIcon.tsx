import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronRightIconProps {
  size?: number;
  color?: string;
}

export function ChevronRightIcon({ size = 18, color = '#1B1B1B' }: ChevronRightIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M6.75 4.5C6.75 4.5 11.25 7.81418 11.25 9C11.25 10.1859 6.75 13.5 6.75 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
