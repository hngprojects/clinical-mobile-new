import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { HomeIcon } from '@/shared/components/icons/HomeIcon';
import { InsightsIcon } from '@/shared/components/icons/InsightsIcon';
import { useTheme } from '@/shared/theme';

function ProfileTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.avatarTab,
        {
          backgroundColor: focused ? colors.primary : colors.cardBackground,
          borderWidth: focused ? 2 : 0,
          borderColor: colors.primary,
        },
      ]}
    >
      <Ionicons name="person" size={14} color={focused ? '#FFFFFF' : color} />
    </View>
  );
}

export default function MainLayout() {
  const { colors } = useTheme();
  const { isLoggedIn } = useAuthSession();

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <InsightsIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <ProfileTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  avatarTab: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
