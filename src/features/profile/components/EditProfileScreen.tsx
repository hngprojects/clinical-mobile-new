import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Animated, Dimensions, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button, FormField, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useUpdateProfile } from '../hooks/useUpdateProfile';

interface EditProfileForm {
  fullName: string;
  email: string;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const AVATAR_SIZE = 110;
const BADGE_SIZE = 34;

// ─── Avatar Picker Bottom Sheet ───────────────────────────────────────────────

interface AvatarPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickLibrary: () => void;
}

function AvatarPickerSheet({
  visible,
  onClose,
  onPickCamera,
  onPickLibrary,
}: AvatarPickerSheetProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      <Pressable style={styles.sheetOverlay} onPress={dismiss} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Sheet header */}
        <View style={[styles.sheetHeader, { borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.sheetHeaderSpacer} />
          <Typography variant="body1" style={styles.sheetTitle}>
            Edit profile picture
          </Typography>
          <Pressable onPress={dismiss} hitSlop={8} style={styles.sheetHeaderSpacer}>
            <Ionicons
              name="close"
              size={22}
              color={colors.text}
              style={{ alignSelf: 'flex-end' }}
            />
          </Pressable>
        </View>

        {/* Options */}
        <View
          style={[
            styles.sheetOptions,
            { backgroundColor: colors.background, borderColor: colors.borderSubtle },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => {
              dismiss();
              setTimeout(onPickCamera, 300);
            }}
          >
            <Typography variant="body1">Take photo</Typography>
            <Ionicons name="camera-outline" size={22} color={colors.text} />
          </Pressable>
          <View style={[styles.sheetDivider, { backgroundColor: colors.borderSubtle }]} />
          <Pressable
            style={({ pressed }) => [styles.sheetRow, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => {
              dismiss();
              setTimeout(onPickLibrary, 300);
            }}
          >
            <Typography variant="body1">Choose photo</Typography>
            <Ionicons name="image-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.sheetBottomPad} />
      </Animated.View>
    </Modal>
  );
}

// ─── Edit Profile Screen ──────────────────────────────────────────────────────

export function EditProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);

  const defaultValues: EditProfileForm = {
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email ?? '',
  };

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditProfileForm>({ defaultValues });

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };

  const onSubmit = (data: EditProfileForm) => {
    const parts = data.fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || firstName;
    updateProfile({ firstName, lastName }, { onSuccess: () => router.back() });
  };

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'G';

  const canSave = isDirty || avatarUri !== null;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable
          onPress={() => router.push('/(main)/profile')}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Typography variant="body1" style={styles.headerTitle}>
          Profile
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Tappable avatar */}
        <Pressable onPress={() => setShowAvatarSheet(true)} style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Typography variant="h2" color={colors.primary}>
                {initials}
              </Typography>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: colors.surface }]}>
            <Ionicons name="pencil-outline" size={15} color={colors.text} />
          </View>
        </Pressable>

        {/* Form */}
        <View style={styles.form}>
          <FormField
            control={control}
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            returnKeyType="next"
          />
          <FormField
            control={control}
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            returnKeyType="done"
          />
        </View>

        <Button
          label="Save Changes"
          onPress={handleSubmit(onSubmit)}
          disabled={!canSave}
          isLoading={isPending}
          loadingLabel="Saving..."
          style={[styles.saveButton, !canSave && { backgroundColor: colors.border }]}
          textColor={canSave ? '#FFFFFF' : colors.textSecondary}
        />
      </View>

      <AvatarPickerSheet
        visible={showAvatarSheet}
        onClose={() => setShowAvatarSheet(false)}
        onPickCamera={pickFromCamera}
        onPickLibrary={pickFromLibrary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '500' },
  headerSpacer: { width: 32 },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 36,
    gap: 28,
  },

  avatarWrapper: {
    alignSelf: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  form: { gap: 16 },

  saveButton: { borderRadius: 12 },

  // Bottom sheet
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontWeight: '500' },
  sheetHeaderSpacer: { width: 28 },
  sheetOptions: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  sheetDivider: { height: StyleSheet.hairlineWidth },
  sheetBottomPad: { height: 40 },
});
