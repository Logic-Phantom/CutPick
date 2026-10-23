import { NativeTabs } from 'expo-router/native-tabs';

import { fonts, useColors } from '@/design-system';

export default function TabsLayout() {
  const c = useColors();
  return (
    // Android hides unselected labels by default ('auto' with 4+ tabs); the design labels every tab.
    <NativeTabs backgroundColor={c.surface} tintColor={c.accent} labelVisibilityMode="labeled" labelStyle={{ default: { fontFamily: fonts.medium }, selected: { color: c.accent, fontFamily: fonts.semibold } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recommend">
        <NativeTabs.Trigger.Label>사진 추천</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'photo.on.rectangle', selected: 'photo.fill.on.rectangle.fill' }} md="photo_library" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} md="favorite" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label>내 정보</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
