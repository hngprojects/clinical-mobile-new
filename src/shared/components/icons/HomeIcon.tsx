import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
  color?: string;
  size?: number;
}

export function HomeIcon({ color = '#2563EB', size = 22 }: HomeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10.8924 0.309822L19.4876 7.09547C19.8112 7.35095 20 7.74054 20 8.15284C20 8.89685 19.3969 9.5 18.6528 9.5H18V13C18 15.8284 18 17.2426 17.1213 18.1213C16.2426 19 14.8284 19 12 19H8C5.17157 19 3.75736 19 2.87868 18.1213C2 17.2426 2 15.8284 2 13V9.5H1.34716C0.603145 9.5 0 8.89685 0 8.15284C0 7.74054 0.188798 7.35095 0.512401 7.09547L9.10756 0.309822C9.36174 0.109148 9.67615 0 10 0C10.3239 0 10.6383 0.109148 10.8924 0.309822Z"
        fill={color}
      />
      <Path
        d="M12.5 19V14.5C12.5 13.5654 12.5 13.0981 12.299 12.75C12.1674 12.522 11.978 12.3326 11.75 12.201C11.4019 12 10.9346 12 10 12C9.06538 12 8.59808 12 8.25 12.201C8.02197 12.3326 7.83261 12.522 7.70096 12.75C7.5 13.0981 7.5 13.5654 7.5 14.5V19"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
