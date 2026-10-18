import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { CutpickProject } from '@/domain/models';
import { AppText, BrandLockup, Card, EmptyState, ErrorState, GhostButton, InlineMessage, PrimaryButton, ScreenScroll, SectionHeader, elevation, radius, spacing, useColors, type IconName } from '@/design-system';
import { listProjects } from '@/features/project-library/project-repository';
import { CONTEXT_LABELS } from '@/features/project-library/contexts';
import { useAppState } from '@/hooks/app-state';
import { formatDate } from '@/utils/format';

const FEATURES: { label: string; icon: IconName }[] = [
  { label: '기기 안에서 분석', icon: 'lock-closed-outline' },
  { label: '비슷한 컷 정리', icon: 'copy-outline' },
  { label: '올릴 순서 추천', icon: 'list-outline' },
];

function projectMeta(p: CutpickProject): string {
  return `${CONTEXT_LABELS[p.sourceContext]} · ${p.photoCount ?? 0}장 · ${formatDate(p.updatedAt)}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const { dbError, preference } = useAppState();
  const [projects, setProjects] = useState<CutpickProject[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    listProjects()
      .then((p) => {
        setProjects(p);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useFocusEffect(load);

  const latest = projects?.[0] ?? null;
  const rest = projects?.slice(1) ?? [];
  const noTaste = preference.styleCardIds.length === 0;

  return (
    <ScreenScroll topInset>
      <View style={{ gap: spacing.sm }}>
        <BrandLockup size={30} />
        <AppText variant="body" tone="secondary">고른 사진만 기기 안에서 분석해 올릴 사진을 추천해요.</AppText>
        <View style={styles.pills}>
          {FEATURES.map((p) => (
            <View key={p.label} style={[styles.pill, { borderColor: c.border }]}>
              <Ionicons name={p.icon} size={14} color={c.textSecondary} />
              <AppText variant="caption" tone="secondary">{p.label}</AppText>
            </View>
          ))}
        </View>
      </View>

      {dbError ? <InlineMessage tone="error" message="로컬 저장소를 열지 못했어요. 앱을 다시 실행해 주세요." /> : null}

      {latest ? (
        <View style={{ gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push(`/project/${latest.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`이어서 하기: ${latest.title}, ${projectMeta(latest)}${latest.isSample ? ', 샘플 프로젝트' : ''}`}
            style={({ pressed }) => [styles.hero, elevation.raised, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.92 : 1 }]}
            testID="home-continue">
            <View style={[styles.heroCover, { backgroundColor: c.photoPlaceholder }]}>
              {latest.coverUri ? (
                <Image source={{ uri: latest.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
              ) : (
                <Ionicons name="images-outline" size={32} color={c.textTertiary} />
              )}
            </View>
            <View style={styles.heroBody}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="caption" style={{ color: c.pointText }}>이어서 하기</AppText>
                <AppText variant="sectionTitle" numberOfLines={2}>{latest.title}</AppText>
                <AppText variant="secondary" tone="secondary" numberOfLines={2}>{projectMeta(latest)}</AppText>
                {latest.isSample ? <AppText variant="caption" tone="warning">샘플(무료 라이선스 사진)</AppText> : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.textTertiary} />
            </View>
          </Pressable>
          <PrimaryButton label="새 프로젝트 시작" icon="add" onPress={() => router.push('/project/new')} testID="home-new-project" />
        </View>
      ) : (
        <Card style={elevation.raised}>
          <View style={{ gap: spacing.md }}>
            <View style={[styles.ctaIcon, { backgroundColor: c.surfaceSunken }]}>
              <Ionicons name="images-outline" size={24} color={c.textPrimary} />
            </View>
            <View style={{ gap: spacing.xxs }}>
              <AppText variant="title">사진 고르고 추천받기</AppText>
              <AppText variant="secondary" tone="secondary">여행·카페·OOTD처럼 묶음 단위로 사진을 고르면 올릴 순서까지 추천해요. 사진은 서버로 올라가지 않아요.</AppText>
            </View>
            <PrimaryButton label="새 프로젝트 시작" icon="add" onPress={() => router.push('/project/new')} testID="home-new-project" />
          </View>
        </Card>
      )}

      {noTaste ? (
        <InlineMessage
          tone="info"
          message="마음에 드는 사진 스타일을 3개 이상 고르면 추천 순서에 반영돼요."
          action={<GhostButton compact label="사진 취향 고르기" icon="images-outline" onPress={() => router.push('/onboarding/edit')} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} testID="home-taste" />}
        />
      ) : null}

      {latest && rest.length === 0 && !error ? null : (
      <View>
        <SectionHeader title={latest ? '다른 프로젝트' : '최근 프로젝트'} />
        {error ? (
          <ErrorState message="프로젝트 목록을 불러오지 못했어요." onRetry={load} />
        ) : projects == null ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} />
        ) : projects.length === 0 ? (
          <EmptyState title="아직 프로젝트가 없어요" message="첫 프로젝트를 만들면 여기에서 이어서 볼 수 있어요." />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {rest.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/project/${p.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${p.title}, 사진 ${p.photoCount ?? 0}장${p.isSample ? ', 샘플 프로젝트' : ''}`}
                style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.surfaceSunken : c.surface, borderColor: c.border }]}>
                <View style={[styles.cover, { backgroundColor: c.photoPlaceholder }]}>
                  {p.coverUri ? <Image source={{ uri: p.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="images-outline" size={20} color={c.textTertiary} />}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>{p.title}</AppText>
                  <AppText variant="secondary" tone="secondary" numberOfLines={1}>{projectMeta(p)}</AppText>
                  {p.isSample ? <AppText variant="caption" tone="warning">샘플(무료 라이선스 사진)</AppText> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  // No overflow:hidden on the hero itself so the iOS shadow isn't clipped; the cover clips instead.
  hero: { borderRadius: radius.card, borderWidth: 1 },
  heroCover: { aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderTopLeftRadius: radius.card - 1, borderTopRightRadius: radius.card - 1 },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  ctaIcon: { width: 48, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.chip, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.card, borderWidth: 1, minHeight: 72 },
  cover: { width: 56, height: 56, borderRadius: radius.photo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
