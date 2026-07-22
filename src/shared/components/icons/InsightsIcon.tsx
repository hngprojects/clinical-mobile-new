import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface InsightsIconProps {
  color?: string;
  size?: number;
}

export function InsightsIcon({ color = '#5E5E5E', size = 22 }: InsightsIconProps) {
  const scale = size / 22;
  return (
    <Svg width={19 * scale} height={22 * scale} viewBox="0 0 19 22" fill="none">
      <Path
        d="M11.75 3.75L9.75 3.75C6.92157 3.75 5.50736 3.75 4.62868 4.62868C3.75 5.50736 3.75 6.92157 3.75 9.75L3.75 14.75C3.75 17.5784 3.75 18.9926 4.62868 19.8713C5.50736 20.75 6.92157 20.75 9.75 20.75H11.0931C11.9106 20.75 12.3194 20.75 12.6869 20.5978C13.0545 20.4455 13.3435 20.1565 13.9216 19.5784L16.5784 16.9216C17.1565 16.3435 17.4455 16.0545 17.5978 15.6869C17.75 15.3194 17.75 14.9106 17.75 14.0931V9.75C17.75 6.92157 17.75 5.50736 16.8713 4.62868C15.9926 3.75 14.5784 3.75 11.75 3.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.25 20.25L12.25 19.25C12.25 17.3644 12.25 16.4216 12.8358 15.8358C13.4216 15.25 14.3644 15.25 16.25 15.25L17.25 15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.75 17.75C2.09315 17.75 0.75 16.4069 0.75 14.75L0.750001 6.75C0.750001 3.92157 0.750001 2.50736 1.62868 1.62868C2.50736 0.75 3.92157 0.75 6.75 0.75L11.7504 0.75C13.4072 0.75001 14.7504 2.09319 14.7504 3.75003"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.25 11.75L11.25 11.75M7.25 7.75L14.25 7.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
