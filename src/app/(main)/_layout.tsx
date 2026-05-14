import { Redirect, Tabs } from 'expo-router';

import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useTheme } from '@/shared/theme';

export default function MainLayout() {
  const { colors } = useTheme();
  const { isLoggedIn } = useAuthSession();

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
