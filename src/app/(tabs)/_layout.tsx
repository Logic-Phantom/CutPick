import { NativeTabs } from 'expo-router/native-tabs';

import { fonts, useColors } from '@/design-system';

export default function TabsLayout() {
  const c = useColors();
  return (
    <NativeTabs backgroundColor={c.surface} tintColor={c.accent} labelStyle={{ default: { fontFamily: fonts.medium }, selected: { color: c.accent, fontFamily: fonts.semibold } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'photo.on.rectangle', selected: 'photo.fill.on.rectangle.fill' }} md="photo_library" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} md="favorite" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>설정</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
