import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CutpickProject } from '@/domain/models';
import { AppText, EmptyState, IconButton, ScreenScroll, SegmentTabs, contentMaxWidth, elevation, radius, spacing, useColors } from '@/design-system';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { pickedChoiceCards } from '@/features/onboarding/choice-cards';
import { getStyleCard } from '@/features/onboarding/style-cards';
import { STYLE_TAG_META } from '@/features/preferences/taste-profile';
import { listProjects } from '@/features/project-library/project-repository';
import { dailyPicks, showcaseById } from '@/features/showcase/showcase-photos';
import { useAppState } from '@/hooks/app-state';
import { useCommunitySession } from '@/hooks/use-community-session';

type Section = 'projects' | 'taste';

const COVER = showcaseById('showcase-02')!;

/** 내 정보 tab: local profile (counts are real local data), taste summary, projects, settings entry. */
export default function MeTab() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { preference } = useAppState();
  const { session, configured } = useCommunitySession();
  const [projects, setProjects] = useState<CutpickProject[]>([]);
  const [handle, setHandle] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('projects');

  useFocusEffect(
    useCallback(() => {
      listProjects().then(setProjects).catch(() => setProjects([]));
      if (configured && session) communityRepository.getMyProfile().then((p) => setHandle(p?.handle ?? null)).catch(() => setHandle(null));
      else setHandle(null);
    }, [configured, session]),
  );

  const pick = useMemo(() => dailyPicks()[0], []);
  const tasteCards = [
    ...preference.styleCardIds.map(getStyleCard).filter((x): x is NonNullable<typeof x> => !!x).map((x) => ({ key: x.id, title: x.title, source: x.source })),
    ...pickedChoiceCards(preference).map((x) => ({ key: `${x.stepId}-${x.optionId}`, title: x.title, source: x.source })),
  ];
  const tasteLabels = preference.styleTags.map((t) => STYLE_TAG_META[t].label);
  const photoTotal = projects.reduce((n, p) => n + (p.photoCount ?? 0), 0);
  const stats = [
    { label: '프로젝트', value: projects.length },
    { label: '고른 사진', value: photoTotal },
    { label: '취향 카드', value: tasteCards.length },
  ];

  const inner = Math.min(width, contentMaxWidth) - spacing.md * 2;
  const tile = (inner - spacing.xs * 2) / 3;
  const coverHeight = insets.top + 196;

  return (
    <ScreenScroll contentContainerStyle={{ paddingTop: 0, paddingHorizontal: 0, gap: spacing.lg, paddingBottom: spacing.xxl + insets.bottom }}>
      <View style={{ height: coverHeight }}>
        <Image source={COVER.source} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        <LinearGradient colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.45)']} style={StyleSheet.absoluteFill} />
        <View style={[styles.coverActions, { top: insets.top + spacing.xs }]}>
          <IconButton icon="settings-outline" tone="onPhoto" label="설정" onPress={() => router.push('/settings')} testID="me-settings" />
        </View>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: c.pointSoft }]}>
            {handle ? <AppText variant="title" style={{ color: c.pointText }}>{handle.slice(0, 1).toUpperCase()}</AppText> : <Ionicons name="person" size={34} color={c.point} />}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="title" style={styles.white} numberOfLines={1}>{handle ?? 'CutPick 사용자'}</AppText>
            <AppText variant="secondary" style={[styles.white, { opacity: 0.92 }]} numberOfLines={2}>
              {tasteLabels.length ? `${tasteLabels.slice(0, 3).join(' · ')} 사진을 좋아해요` : '나만의 베스트샷을 찾는 중이에요'}
            </AppText>
          </View>
        </View>
      </View>

      <View style={[styles.stats, elevation.card, { backgroundColor: c.surface, marginTop: -spacing.xl - spacing.lg }]} accessible accessibilityLabel={stats.map((s) => `${s.label} ${s.value}`).join(', ')}>
        {stats.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
            <AppText variant="numeric">{s.value}</AppText>
            <AppText variant="caption" tone="tertiary">{s.label}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.pad}>
        <Pressable
          onPress={() => router.push('/onboarding/edit')}
          accessibilityRole="button"
          accessibilityLabel={`나의 사진 취향: ${tasteLabels.length ? tasteLabels.join(', ') : '아직 고르지 않음'}. 탭하면 취향 수정`}
          style={({ pressed }) => [styles.taste, { backgroundColor: c.pointSoft, opacity: pressed ? 0.9 : 1 }]}
          testID="me-taste">
          <View style={[styles.tasteIcon, { backgroundColor: c.surface }]}>
            <Ionicons name="color-palette-outline" size={22} color={c.point} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyStrong">나의 사진 취향</AppText>
            <AppText variant="caption" tone="secondary" numberOfLines={1}>{tasteLabels.length ? tasteLabels.slice(0, 4).join(' · ') : '사진 3장만 고르면 추천에 반영돼요'}</AppText>
          </View>
          <AppText variant="caption" tone="secondary">{tasteLabels.length ? '취향 보기' : '고르기'}</AppText>
          <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
        </Pressable>
      </View>

      <View style={[styles.pad, { gap: spacing.sm }]}>
        <SegmentTabs<Section> tabs={[{ id: 'projects', label: '내 프로젝트' }, { id: 'taste', label: '취향 사진' }]} value={section} onChange={setSection} />
        {section === 'projects' ? (
          projects.length ? (
            <View style={styles.grid}>
              {projects.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/project/${p.id}`)} accessibilityRole="button" accessibilityLabel={`${p.title}, 사진 ${p.photoCount ?? 0}장`} style={[styles.tile, { width: tile, height: tile * 1.2, backgroundColor: c.photoPlaceholder }]}>
                  {p.coverUri ? <Image source={{ uri: p.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="images-outline" size={22} color={c.textTertiary} />}
                  <View style={styles.tileBadge}>
                    <Ionicons name="images" size={11} color="#FFFFFF" />
                    <AppText variant="caption" style={styles.white}>{p.photoCount ?? 0}</AppText>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState title="아직 프로젝트가 없어요" message="사진을 고르면 베스트샷과 올릴 순서를 추천해 드려요." actionLabel="사진 추천 시작" onAction={() => router.push('/project/new')} />
          )
        ) : tasteCards.length ? (
          <View style={styles.grid}>
            {tasteCards.map((t) => (
              <View key={t.key} style={[styles.tile, { width: tile, height: tile * 1.25, backgroundColor: c.photoPlaceholder }]} accessible accessibilityLabel={t.title}>
                <Image source={t.source} style={StyleSheet.absoluteFill} contentFit="cover" />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="고른 취향 사진이 없어요" message="마음에 드는 사진 스타일을 고르면 여기에 모여요." actionLabel="사진 취향 고르기" onAction={() => router.push('/onboarding/edit')} />
        )}
      </View>

      {pick ? (
        <View style={styles.pad}>
          <Pressable onPress={() => router.push(`/showcase/${pick.id}`)} accessibilityRole="button" accessibilityLabel={`오늘의 한 컷: ${pick.title}. 탭하면 보기`} style={({ pressed }) => [styles.daily, elevation.card, { backgroundColor: c.surface, opacity: pressed ? 0.92 : 1 }]}>
            <Ionicons name="sparkles" size={18} color={c.point} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label">오늘의 한 컷</AppText>
              <AppText variant="caption" tone="tertiary" numberOfLines={1}>{pick.title} — 이런 컷을 찍어 보세요</AppText>
            </View>
            <Image source={pick.source} style={styles.dailyThumb} contentFit="cover" accessible={false} />
            <View style={[styles.go, { backgroundColor: c.accent }]}>
              <AppText variant="caption" style={{ color: c.textOnAccent, fontWeight: '700' }}>보기</AppText>
            </View>
          </Pressable>
        </View>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  white: { color: '#FFFFFF' },
  pad: { paddingHorizontal: spacing.md },
  coverActions: { position: 'absolute', right: spacing.sm, flexDirection: 'row' },
  profile: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.xl + spacing.lg + spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', marginHorizontal: spacing.md, borderRadius: radius.card, paddingVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  taste: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card },
  tasteIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tile: { borderRadius: radius.photo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tileBadge: { position: 'absolute', right: 6, bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: radius.chip, paddingHorizontal: 6, paddingVertical: 2 },
  daily: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card },
  dailyThumb: { width: 44, height: 44, borderRadius: radius.photo },
  go: { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.chip },
});
