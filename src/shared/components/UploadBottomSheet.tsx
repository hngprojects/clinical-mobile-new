import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (file: UploadedFile) => void;
  onUploadError?: (error: UploadError) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = ['PDF', 'JPG', 'JPEG', 'PNG'];

export interface UploadedFile {
  name: string;
  size: string;
  sizeBytes?: number;
  uri: string;
  mimeType?: string;
}

export type UploadErrorType = 'upload-failed' | 'file-size' | 'file-type';

export interface UploadError {
  type: UploadErrorType;
  fileName?: string;
  fileSize?: string;
}

export function UploadBottomSheet({
  visible,
  onClose,
  onUpload,
  onUploadError,
}: UploadBottomSheetProps) {
  const { colors } = useTheme();
  const [showSourceSheet, setShowSourceSheet] = useState(false);

  // Primary Sheet State & Animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const handleActiveAnim = useRef(new Animated.Value(0)).current;

  const handleColor = handleActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C7C7C7', '#9CA3AF'],
  });

  const animateHandle = (animatedValue: Animated.Value, isActive: boolean) => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 120,
      useNativeDriver: false,
    }).start();
  };

  const springSheetBack = (animatedValue: Animated.Value) => {
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  // Primary Sheet PanResponder. It is attached to the top handle only.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animateHandle(handleActiveAnim, true);
        slideAnim.stopAnimation();
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(Math.max(gestureState.dy, 0));
      },
      onPanResponderRelease: (_, gestureState) => {
        animateHandle(handleActiveAnim, false);
        if (gestureState.dy > 100 || gestureState.vy > 0.4) {
          handleDismiss();
        } else {
          springSheetBack(slideAnim);
        }
      },
      onPanResponderTerminate: () => {
        animateHandle(handleActiveAnim, false);
        springSheetBack(slideAnim);
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT); // Ensure starts off-screen
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      setShowSourceSheet(false);
    }
  }, [visible, slideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const dismissAllAndUpload = (file: UploadedFile) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      onUpload(file);
    });
  };

  const dismissAllAndError = (error: UploadError) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      onUploadError?.(error);
    });
  };

  const formatFileSize = (sizeBytes?: number, fallback = '0.8MB') =>
    sizeBytes ? `${(sizeBytes / (1024 * 1024)).toFixed(1)}MB` : fallback;

  const isOversized = (sizeBytes?: number) =>
    typeof sizeBytes === 'number' && sizeBytes > MAX_UPLOAD_SIZE_BYTES;

  const isSupportedFileType = (fileName: string, mimeType?: string) => {
    const extension = fileName.split('.').pop()?.toUpperCase();
    return (
      (mimeType ? ACCEPTED_DOCUMENT_TYPES.includes(mimeType) : false) ||
      (extension ? ACCEPTED_EXTENSIONS.includes(extension) : false)
    );
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access camera was denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'camera_photo.jpg';
        const fileSize = formatFileSize(asset.fileSize, '1.2MB');

        if (isOversized(asset.fileSize)) {
          dismissAllAndError({ type: 'file-size', fileName, fileSize });
          return;
        }

        dismissAllAndUpload({
          name: fileName,
          size: fileSize,
          sizeBytes: asset.fileSize,
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err) {
      console.warn('Camera error:', err);
      dismissAllAndError({ type: 'upload-failed' });
    }
  };

  const handlePhotoLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access photos was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'gallery_photo.jpg';
        const fileSize = formatFileSize(asset.fileSize, '1.5MB');

        if (isOversized(asset.fileSize)) {
          dismissAllAndError({ type: 'file-size', fileName, fileSize });
          return;
        }

        dismissAllAndUpload({
          name: fileName,
          size: fileSize,
          sizeBytes: asset.fileSize,
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err) {
      console.warn('Photo library error:', err);
      dismissAllAndError({ type: 'upload-failed' });
    }
  };

  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_DOCUMENT_TYPES,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);

        if (!isSupportedFileType(fileName, file.mimeType)) {
          dismissAllAndError({ type: 'file-type', fileName, fileSize });
          return;
        }

        if (isOversized(file.size)) {
          dismissAllAndError({ type: 'file-size', fileName, fileSize });
          return;
        }

        dismissAllAndUpload({
          name: fileName,
          size: fileSize,
          sizeBytes: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        });
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      dismissAllAndError({ type: 'upload-failed' });
    }
  };

  const handleUploadClick = () => {
    setShowSourceSheet(true);
  };

  const selectUploadSource = (onSelect: () => void) => {
    setShowSourceSheet(false);
    onSelect();
  };

  const handleBackdropPress = () => {
    if (showSourceSheet) {
      setShowSourceSheet(false);
      return;
    }

    handleDismiss();
  };

  // Clamp translation so sheets cannot be dragged higher than their perfect layout positions
  const translateY = slideAnim.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolateLeft: 'clamp',
  });

  return (
    <>
      {/* Primary Bottom Sheet: Original Upload Design */}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
        <View style={styles.container}>
          <Pressable style={styles.backdrop} onPress={handleBackdropPress} />

          <Animated.View
            style={[
              styles.sheet,
              showSourceSheet && styles.sourceSheetFrame,
              {
                backgroundColor: colors.surface,
                transform: [{ translateY }],
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.handleGrabArea}>
              <Animated.View style={[styles.sheetHandle, { backgroundColor: handleColor }]} />
            </View>

            {showSourceSheet ? (
              <View style={styles.sourceSheetContent}>
                <View style={styles.sourceSheetGroup}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.sourceSheetOption,
                      pressed && styles.sourceSheetOptionPressed,
                    ]}
                    onPress={() => selectUploadSource(handleTakePhoto)}
                  >
                    <Feather name="camera" size={21} color="#1B1B1B" />
                    <Typography style={styles.sourceSheetOptionText}>Take Photo</Typography>
                  </Pressable>

                  <View style={styles.sourceSheetDivider} />

                  <Pressable
                    style={({ pressed }) => [
                      styles.sourceSheetOption,
                      pressed && styles.sourceSheetOptionPressed,
                    ]}
                    onPress={() => selectUploadSource(handlePhotoLibrary)}
                  >
                    <Feather name="image" size={21} color="#1B1B1B" />
                    <Typography style={styles.sourceSheetOptionText}>Photo Library</Typography>
                  </Pressable>

                  <View style={styles.sourceSheetDivider} />

                  <Pressable
                    style={({ pressed }) => [
                      styles.sourceSheetOption,
                      pressed && styles.sourceSheetOptionPressed,
                    ]}
                    onPress={() => selectUploadSource(handleBrowseFiles)}
                  >
                    <Feather name="folder" size={21} color="#1B1B1B" />
                    <Typography style={styles.sourceSheetOptionText}>Browse Files</Typography>
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.sourceSheetCancel,
                    pressed && styles.sourceSheetOptionPressed,
                  ]}
                  onPress={() => setShowSourceSheet(false)}
                >
                  <Typography style={styles.sourceSheetCancelText}>Cancel</Typography>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.contentContainer}>
                  <Typography style={styles.sheetTitle}>Upload Your Lab Result</Typography>

                  <Typography style={styles.sheetSubtitle}>
                    Upload your first lab report to get started
                  </Typography>

                  <Typography style={styles.sheetFormat}>
                    JPEG, PDF and PNG formats up to 5-10 MB
                  </Typography>
                </View>

                <Pressable
                  onPress={handleUploadClick}
                  style={({ pressed }) => [
                    styles.uploadButton,
                    {
                      backgroundColor: pressed ? '#0F4C92' : '#1565C0',
                    },
                  ]}
                >
                  <Feather name="upload" size={18} color="#FFFFFF" />
                  <Typography style={styles.uploadButtonText}>Upload Result</Typography>
                </Pressable>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 48,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  sourceSheetFrame: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  handleGrabArea: {
    width: 120,
    height: 37,
    alignItems: 'center',
    alignSelf: 'center',
  },
  sheetHandle: {
    width: 64,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  sheetTitle: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  sheetSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.14,
    textAlign: 'center',
    color: '#494949',
  },
  sheetFormat: {
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: -0.12,
    textAlign: 'center',
    color: '#767676',
  },
  uploadButton: {
    width: 167,
    height: 45,
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
  },
  sourceSheetContent: {
    width: '100%',
  },
  sourceSheetGroup: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  sourceSheetOption: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceSheetOptionPressed: {
    backgroundColor: '#F5F5F5',
  },
  sourceSheetOptionText: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  sourceSheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  sourceSheetCancel: {
    height: 40,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceSheetCancelText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
});
