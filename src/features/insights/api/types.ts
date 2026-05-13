import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

export interface InsightItemCardProps {
  title: string;
  subtitle: string;
  onMenuPress?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
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
