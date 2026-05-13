import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

export interface InsightItemCardProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  onRename?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export interface InsightMenuAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InsightSearchBarProps extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder'
> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}
