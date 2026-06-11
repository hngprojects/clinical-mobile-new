import { Platform } from 'react-native';

export const MIN_TOUCH_TARGET = Platform.select({ ios: 44, android: 48, default: 48 }) ?? 48;

export const MIN_TAP_SPACING = 8;

export const MAX_FONT_SIZE_MULTIPLIER = 2;

export const a11yRoles = {
  button: 'button',
  link: 'link',
  header: 'header',
  image: 'image',
  text: 'text',
  search: 'search',
  switch: 'switch',
  menuitem: 'menuitem',
  tab: 'tab',
  alert: 'alert',
  none: 'none',
} as const;

export type A11yRole = (typeof a11yRoles)[keyof typeof a11yRoles];
