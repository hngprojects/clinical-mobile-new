import { Feather, Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
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
  
  // Primary Sheet State & Animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [sheetHeight, setSheetHeight] = useState(300);

  // Secondary Options Sheet State & Animation
  const [showOptions, setShowOptions] = useState(false);
  const optionsSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [optionsHeight, setOptionsHeight] = useState(380);

  // Primary Sheet PanResponder (Swipe to dismiss)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touchStartedInSheet = evt.nativeEvent.pageY > (SCREEN_HEIGHT - sheetHeight - 20);
        return touchStartedInSheet && Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.4) {
          handleDismiss();
        } else {
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

  // Secondary Options Sheet PanResponder (Swipe to dismiss)
  const optionsPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touchStartedInOptions = evt.nativeEvent.pageY > (SCREEN_HEIGHT - optionsHeight - 20);
        return touchStartedInOptions && Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          optionsSlideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.4) {
          handleDismissOptions();
        } else {
          Animated.spring(optionsSlideAnim, {
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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      setShowOptions(false);
      optionsSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim, optionsSlideAnim]);

  useEffect(() => {
    if (showOptions) {
      Animated.timing(optionsSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      optionsSlideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [showOptions, optionsSlideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleDismissOptions = () => {
    Animated.timing(optionsSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowOptions(false);
    });
  };

  const dismissAllAndUpload = (fileName: string, fileSize: string) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(optionsSlideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowOptions(false);
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
        
        dismissAllAndUpload(fileName, fileSize);
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
        
        dismissAllAndUpload(fileName, fileSize);
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

        dismissAllAndUpload(fileName, fileSize);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const handleUploadClick = () => {
    setShowOptions(true);
  };

  return (
    <>
      {/* Primary Bottom Sheet: Original Upload Design */}
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
            
            <View style={styles.contentContainer}>
              <Typography style={styles.sheetTitle}>
                Upload Your Lab Result
              </Typography>
              
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
                }
              ]}
            >
              <Feather name="upload" size={18} color="#FFFFFF" />
              <Typography style={styles.uploadButtonText}>Upload Result</Typography>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Secondary Bottom Sheet: Premium Options Source Selector */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={handleDismissOptions}
      >
        <View style={styles.container}>
          <Pressable style={styles.backdrop} onPress={handleDismissOptions} />
          
          <Animated.View
            {...optionsPanResponder.panHandlers}
            onLayout={(event) => {
              setOptionsHeight(event.nativeEvent.layout.height);
            }}
            style={[
              styles.sheet,
              styles.optionsSheet,
              {
                backgroundColor: colors.surface,
                transform: [{ translateY: optionsSlideAnim }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            
            <Typography variant="h2" align="center" style={styles.optionsSheetTitle}>
              Select Upload Source
            </Typography>
            
            <Typography variant="body1" align="center" color={colors.textSecondary} style={styles.optionsSheetSubtitle}>
              Choose how you would like to select your report
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

            <Button
              label="Cancel"
              variant="outline"
              onPress={handleDismissOptions}
              style={styles.cancelButton}
            />
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
  optionsSheet: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 64,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#C7C7C7',
    marginBottom: 32,
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
  optionsSheetTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionsSheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  optionsContainer: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
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
  cancelButton: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 14,
  },
});
