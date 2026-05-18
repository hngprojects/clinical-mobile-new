import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (fileName: string, fileSize: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function UploadBottomSheet({ visible, onClose, onUpload }: UploadBottomSheetProps) {
  const { colors } = useTheme();
  
  // Start off-screen (bottom of screen)
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  // Track visual sheet height dynamically
  const [sheetHeight, setSheetHeight] = useState(380);

  // Initialize PanResponder for swipe-to-dismiss gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only activate swipe responder if:
        // 1. The user drags downwards (dy > 0)
        // 2. The gesture started within the measured sheet boundaries
        const touchStartedInSheet = evt.nativeEvent.pageY > (SCREEN_HEIGHT - sheetHeight - 20);
        return touchStartedInSheet && Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderGrant: () => {
        // Prepare responder
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow dragging downwards
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down far enough or swiped down fast, dismiss
        if (gestureState.dy > 100 || gestureState.vy > 0.4) {
          handleDismiss();
        } else {
          // Otherwise, snap back up with a premium spring animation
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Gentle slide-in up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset slide position when hidden
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  const handleDismiss = () => {
    // Smooth slide-down out animation before letting the parent hide the modal
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const dismissAndUpload = (fileName: string, fileSize: string) => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      onUpload(fileName, fileSize);
    });
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
        const fileSize = asset.fileSize 
          ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB` 
          : '1.2MB';
        
        dismissAndUpload(fileName, fileSize);
      }
    } catch (err) {
      console.warn('Camera error:', err);
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
        const fileSize = asset.fileSize 
          ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB` 
          : '1.5MB';
        
        dismissAndUpload(fileName, fileSize);
      }
    } catch (err) {
      console.warn('Photo library error:', err);
    }
  };

  const handleBrowseFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.name;
        const fileSize = file.size 
          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB` 
          : '0.8MB';

        dismissAndUpload(fileName, fileSize);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />
        <Animated.View
          {...panResponder.panHandlers}
          onLayout={(event) => {
            setSheetHeight(event.nativeEvent.layout.height);
          }}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          
          <Typography variant="h2" align="center" style={styles.sheetTitle}>
            Upload Your Lab Result
          </Typography>
          
          <Typography variant="body1" align="center" color={colors.textSecondary} style={styles.sheetSubtitle}>
            Choose how you would like to upload your report to get started
          </Typography>

          <View style={styles.optionsContainer}>
            <Pressable
              onPress={handleTakePhoto}
              style={({ pressed }) => [
                styles.optionRow,
                { 
                  borderColor: colors.border, 
                  backgroundColor: pressed ? colors.surfaceMuted : 'transparent' 
                }
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="camera" size={24} color="#0284C7" />
              </View>
              <View style={styles.optionTextContainer}>
                <Typography style={styles.optionTitle}>Take Photo</Typography>
                <Typography variant="body2" color={colors.textSecondary}>Use camera to capture report</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handlePhotoLibrary}
              style={({ pressed }) => [
                styles.optionRow,
                { 
                  borderColor: colors.border, 
                  backgroundColor: pressed ? colors.surfaceMuted : 'transparent' 
                }
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="images" size={24} color="#22C55E" />
              </View>
              <View style={styles.optionTextContainer}>
                <Typography style={styles.optionTitle}>Photo Library</Typography>
                <Typography variant="body2" color={colors.textSecondary}>Select from gallery images</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handleBrowseFiles}
              style={({ pressed }) => [
                styles.optionRow,
                { 
                  borderColor: colors.border, 
                  backgroundColor: pressed ? colors.surfaceMuted : 'transparent' 
                }
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#EEF2F6' }]}>
                <Ionicons name="document-text" size={24} color="#64748B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Typography style={styles.optionTitle}>Browse Files</Typography>
                <Typography variant="body2" color={colors.textSecondary}>Choose PDF, PNG or JPEG files</Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  sheetHandle: {
    width: 60,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#C7C7C7',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: '85%',
    marginBottom: 12,
  },
  optionsContainer: {
    alignSelf: 'stretch',
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
