import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { useColors } from '@/design-system';

/**
 * Web (dev preview only): the native-tabs web fallback renders a top bar that overlaps content,
 * so the preview uses a JS bottom tab bar. iOS/Android use native tabs (_layout.tsx).
 */
export default function TabsLayoutWeb() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
      }}>
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color, size }) => <Ionicons name="images-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color as string} size={size} /> }} />
    </Tabs>
  );
}
