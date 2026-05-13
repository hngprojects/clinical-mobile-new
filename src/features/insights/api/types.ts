import type { StyleProp, ViewStyle } from 'react-native';

export interface InsightItemCardProps {
  title: string;
  subtitle: string;
  onMenuPress?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}
