import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText, EmptyState, ScreenScroll, spacing } from '@/design-system';
import { LEGAL_DOCS } from '@/features/legal/documents';

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const d = LEGAL_DOCS[doc];
  if (!d) return <EmptyState title="문서를 찾을 수 없어요" message="설정 화면에서 다시 열어 주세요." />;
  return (
    <ScreenScroll>
      <Stack.Screen options={{ title: d.title }} />
      <AppText variant="caption" tone="tertiary">최종 수정 {d.updatedAt}</AppText>
      {d.sections.map((s) => (
        <View key={s.heading} style={{ gap: spacing.xxs }}>
          <AppText variant="sectionTitle">{s.heading}</AppText>
          <AppText variant="body" selectable>{s.body}</AppText>
        </View>
      ))}
    </ScreenScroll>
  );
}
