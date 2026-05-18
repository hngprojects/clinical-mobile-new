import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Button } from './Button';
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

  // Initialize PanResponder for swipe-to-dismiss gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activate if the user drags down by more than 8 pixels
        return gestureState.dy > 8;
      },
      onPanResponderGrant: () => {
        // Optional: do any prep if needed
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging downwards
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down far enough or swiped down fast, dismiss
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
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

  const handleUploadPress = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        // Smooth transition out
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          onClose();
          onUpload(
            file.name, 
            file.size ? `${(file.size / (1024 * 1024)).toFixed(1)}MB` : '0.8MB'
          );
        });
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
            Upload your first lab report to get started
          </Typography>
          
          <Typography variant="body2" align="center" color="#7C7C7C" style={styles.sheetFormat}>
            JPEG, PDF and PNG formats up to 5-10 MB
          </Typography>

          <Button
            label="Upload Result"
            onPress={handleUploadPress}
            style={styles.uploadButton}
            leftIcon={<Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />}
          />
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
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 44,
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '85%',
  },
  sheetFormat: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  uploadButton: {
    height: 56,
    borderRadius: 14,
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
