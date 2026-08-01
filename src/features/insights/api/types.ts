import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

/** Matches `InsightItemCard` — list rows use `InsightListItem` and map `subtitle` → `timestamp`. */
export interface InsightCardModel {
  id: string;
  title: string;
  timestamp: string;
  caseId?: string;
}

export interface InsightItemCardProps {
  insight: InsightCardModel;
  /** Opens the insight detail / chat review when the card body is pressed. */
  onPress?: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExportPdf?: (id: string) => void;
}

export interface InsightRenameModalProps {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onSubmit: (newTitle: string) => void;
}

export interface InsightDeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
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

export interface InsightUploadEmptyStateProps {
  onUploadPress?: () => void;
}

export interface InsightListItem {
  id: string;
  title: string;
  subtitle: string;
  caseId?: string;
}
