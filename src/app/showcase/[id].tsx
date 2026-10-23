import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, EmptyState, PrimaryButton, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import { categoryLabel } from '@/features/community/moderation-policy';
import { PhotoTagPill } from '@/features/showcase/components/ShowcaseCard';
import { showcaseById } from '@/features/showcase/showcase-photos';

/** A bundled best-shot sample: the photo, why it works, and a way into the user's own flow. */
export default function ShowcaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const photo = id ? showcaseById(id) : undefined;

  if (!photo) return <EmptyState title="샘플을 찾을 수 없어요" message="목록에서 다시 골라 주세요." actionLabel="돌아가기" onAction={() => router.back()} />;

  return (
    <ScreenScroll>
      <View style={[styles.hero, { backgroundColor: c.photoPlaceholder, aspectRatio: photo.size[0] / photo.size[1] }]}>
        <Image source={photo.source} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`${categoryLabel(photo.category)} 샘플 사진, ${photo.title}`} />
        <View style={styles.pillSpot}>
          <PhotoTagPill label={categoryLabel(photo.category)} />
        </View>
      </View>

      <View style={{ gap: spacing.xs }}>
        <View style={[styles.badge, { backgroundColor: c.pointSoft }]}>
          <Ionicons name="sparkles" size={12} color={c.pointText} />
          <AppText variant="caption" style={{ color: c.pointText, fontWeight: '700' }}>이렇게 찍었어요</AppText>
        </View>
        <AppText variant="title">{photo.title}</AppText>
        <AppText variant="body" tone="secondary">{photo.tip}</AppText>
      </View>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="bodyStrong">내 사진에서도 이런 컷을 찾아볼까요?</AppText>
          <AppText variant="secondary" tone="secondary">사진을 고르면 기기 안에서 선명도·노출·대비·색감을 측정해 올리기 좋은 컷과 순서를 추천해요. 사진은 서버로 올라가지 않아요.</AppText>
          <PrimaryButton label="내 사진으로 베스트샷 찾기" icon="sparkles" onPress={() => router.push('/project/new')} />
          <SecondaryButton label="다른 샘플 보기" onPress={() => router.back()} />
        </View>
      </Card>

      <AppText variant="caption" tone="tertiary">CutPick 샘플 · 프로젝트 소유자 제공 이미지(설정 → 이미지 출처). 실제 사용자 게시물이 아니에요.</AppText>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', borderRadius: radius.card, overflow: 'hidden' },
  pillSpot: { position: 'absolute', left: spacing.sm, bottom: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: spacing.xs + 2, paddingVertical: 4, borderRadius: radius.chip },
});
