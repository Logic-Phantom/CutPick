import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { CutpickProject } from '@/domain/models';
import { AppText, Card, EmptyState, ErrorState, GhostButton, InlineMessage, PrimaryButton, ScreenScroll, SectionHeader, StepDots, TagList, elevation, radius, spacing, useColors, type IconName } from '@/design-system';
import { listProjects } from '@/features/project-library/project-repository';
import { CONTEXT_LABELS } from '@/features/project-library/contexts';
import { useAppState } from '@/hooks/app-state';
import { formatDate } from '@/utils/format';

const FEATURES: { label: string; icon: IconName }[] = [
  { label: '기기 안에서 분석', icon: 'lock-closed-outline' },
  { label: '비슷한 컷 정리', icon: 'copy-outline' },
  { label: '올릴 순서 추천', icon: 'list-outline' },
];

const FLOW: { icon: IconName; title: string; body: string }[] = [
  { icon: 'images-outline', title: '사진 고르기', body: '올리고 싶은 묶음을 직접 골라요' },
  { icon: 'scan-outline', title: '기기 안에서 분석', body: '선명도·노출·구도·색감을 측정해요' },
  { icon: 'sparkles-outline', title: '베스트샷 추천', body: '이유와 함께 올릴 순서를 제안해요' },
];

function projectMeta(p: CutpickProject): string {
  return `${CONTEXT_LABELS[p.sourceContext]} · ${p.photoCount ?? 0}장 · ${formatDate(p.updatedAt)}`;
}

/** 사진 추천 tab: start the pick → analyze → recommend flow and reopen past projects. */
export default function RecommendTab() {
  const router = useRouter();
  const c = useColors();
  const { preference } = useAppState();
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
      <View style={styles.titleRow}>
        <AppText variant="screenTitle" style={{ flex: 1 }}>사진 추천</AppText>
        <StepDots step={1} labels={['사진 고르기', '분석', '추천 결과']} />
      </View>
      <AppText variant="body" tone="secondary" style={{ marginTop: -spacing.sm }}>선택한 사진을 분석해서{'\n'}SNS에 올리기 좋은 베스트샷을 추천해드려요.</AppText>

      <Card style={elevation.raised}>
        <View style={{ gap: spacing.md }}>
          {FLOW.map((f, i) => (
            <View key={f.title} style={styles.flowRow}>
              <View style={[styles.flowIcon, { backgroundColor: c.pointSoft }]}>
                <Ionicons name={f.icon} size={20} color={c.point} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{i + 1}. {f.title}</AppText>
                <AppText variant="caption" tone="tertiary">{f.body}</AppText>
              </View>
            </View>
          ))}
          <PrimaryButton label="새 프로젝트 시작" icon="add" onPress={() => router.push('/project/new')} testID="home-new-project" />
          <TagList tags={FEATURES} label="주요 기능" />
        </View>
      </Card>

      {noTaste ? (
        <InlineMessage
          tone="info"
          message="마음에 드는 사진 스타일을 3개 이상 고르면 추천 순서에 반영돼요."
          action={<GhostButton compact label="사진 취향 고르기" icon="images-outline" onPress={() => router.push('/onboarding/edit')} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} testID="home-taste" />}
        />
      ) : null}

      {latest ? (
        <Pressable
          onPress={() => router.push(`/project/${latest.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`이어서 하기: ${latest.title}, ${projectMeta(latest)}${latest.isSample ? ', 샘플 프로젝트' : ''}`}
          style={({ pressed }) => [styles.hero, elevation.card, { backgroundColor: c.surface, opacity: pressed ? 0.92 : 1 }]}
          testID="home-continue">
          <View style={[styles.heroCover, { backgroundColor: c.photoPlaceholder }]}>
            {latest.coverUri ? <Image source={{ uri: latest.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} /> : <Ionicons name="images-outline" size={32} color={c.textTertiary} />}
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
      ) : null}

      {latest && rest.length === 0 && !error ? null : (
        <View>
          <SectionHeader title={latest ? '다른 프로젝트' : '최근 프로젝트'} />
          {error ? (
            <ErrorState message="프로젝트 목록을 불러오지 못했어요." onRetry={load} />
          ) : projects == null ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} />
          ) : projects.length === 0 ? (
            <EmptyState title="아직 프로젝트가 없어요" message="첫 프로젝트를 만들면 여기에서 이어서 볼 수 있어요. 사진 없이 샘플로 체험할 수도 있어요." />
          ) : (
            <View style={{ gap: spacing.xs }}>
              {rest.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/project/${p.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.title}, 사진 ${p.photoCount ?? 0}장${p.isSample ? ', 샘플 프로젝트' : ''}`}
                  style={({ pressed }) => [styles.row, elevation.card, { backgroundColor: pressed ? c.surfaceSunken : c.surface }]}>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radius.card },
  heroCover: { aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.card, minHeight: 72 },
  cover: { width: 56, height: 56, borderRadius: radius.photo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
