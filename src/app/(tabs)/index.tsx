import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import type { CutpickProject } from '@/domain/models';
import { AppText, BrandHeader, FilterChip, IconButton, InlineMessage, ScreenScroll, contentMaxWidth, elevation, radius, spacing, useColors } from '@/design-system';
import type { PostCategory } from '@/features/community/moderation-policy';
import { listProjects } from '@/features/project-library/project-repository';
import { CONTEXT_LABELS } from '@/features/project-library/contexts';
import { DailyPickBanner } from '@/features/showcase/components/DailyPickBanner';
import { ShowcaseCard } from '@/features/showcase/components/ShowcaseCard';
import { SHOWCASE_FILTERS, dailyPicks, showcaseFor } from '@/features/showcase/showcase-photos';
import { useAppState } from '@/hooks/app-state';
import { formatDate } from '@/utils/format';

const HOME_GRID_MAX = 8;

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { dbError } = useAppState();
  const [latest, setLatest] = useState<CutpickProject | null>(null);
  const [category, setCategory] = useState<PostCategory | null>(null);

  useFocusEffect(
    useCallback(() => {
      listProjects()
        .then((p) => setLatest(p[0] ?? null))
        .catch(() => setLatest(null));
    }, []),
  );

  const picks = useMemo(() => dailyPicks(), []);
  const shots = showcaseFor(category).slice(0, HOME_GRID_MAX);
  const inner = Math.min(width, contentMaxWidth) - spacing.md * 2;
  const tile = (inner - spacing.sm) / 2;

  return (
    <ScreenScroll topInset>
      <View style={styles.header}>
        <BrandHeader style={{ flex: 1 }} />
        <IconButton icon="person-circle-outline" size={30} label="내 정보" onPress={() => router.navigate('/me')} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }} style={{ marginHorizontal: -spacing.md }}>
        <View style={{ width: spacing.md - spacing.xs }} />
        <FilterChip label="추천" selected={category == null} onPress={() => setCategory(null)} role="radio" />
        {SHOWCASE_FILTERS.map((f) => (
          <FilterChip key={f.id} label={f.label} selected={category === f.id} onPress={() => setCategory(f.id)} role="radio" />
        ))}
        <View style={{ width: spacing.md - spacing.xs }} />
      </ScrollView>

      <DailyPickBanner picks={picks} width={inner} onOpen={(p) => router.push(`/showcase/${p.id}`)} />

      {dbError ? <InlineMessage tone="error" message="로컬 저장소를 열지 못했어요. 앱을 다시 실행해 주세요." /> : null}

      <Pressable
        onPress={() => (latest ? router.push(`/project/${latest.id}`) : router.push('/project/new'))}
        accessibilityRole="button"
        accessibilityLabel={latest ? `이어서 하기: ${latest.title}` : '내 사진으로 베스트샷 찾기'}
        style={({ pressed }) => [styles.cta, elevation.card, { backgroundColor: c.surface, opacity: pressed ? 0.92 : 1 }]}
        testID={latest ? 'home-continue' : 'home-new-project'}>
        <View style={[styles.ctaIcon, { backgroundColor: c.pointSoft }]}>
          {latest?.coverUri ? <Image source={{ uri: latest.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="sparkles" size={22} color={c.point} />}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>{latest ? latest.title : '내 사진으로 베스트샷 찾기'}</AppText>
          <AppText variant="caption" tone="tertiary" numberOfLines={1}>
            {latest ? `이어서 하기 · ${CONTEXT_LABELS[latest.sourceContext]} · ${latest.photoCount ?? 0}장 · ${formatDate(latest.updatedAt)}` : '고른 사진만 기기 안에서 분석해 올릴 사진을 추천해요'}
          </AppText>
        </View>
        <View style={[styles.go, { backgroundColor: c.accent }]}>
          <AppText variant="caption" style={{ color: c.textOnAccent, fontWeight: '700' }}>{latest ? '이어서' : '시작'}</AppText>
          <Ionicons name="chevron-forward" size={14} color={c.textOnAccent} />
        </View>
      </Pressable>

      <View style={{ gap: spacing.sm }}>
        <View style={styles.sectionRow}>
          <Ionicons name="sparkles" size={20} color={c.point} />
          <AppText variant="sectionTitle" style={{ flex: 1 }}>베스트샷 둘러보기</AppText>
          <Pressable onPress={() => router.navigate('/community')} accessibilityRole="link" hitSlop={10} style={styles.more}>
            <AppText variant="caption" tone="tertiary">전체보기</AppText>
            <Ionicons name="chevron-forward" size={14} color={c.textTertiary} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {shots.map((p) => (
            <ShowcaseCard key={p.id} photo={p} width={tile} onPress={() => router.push(`/showcase/${p.id}`)} />
          ))}
        </View>
        <AppText variant="caption" tone="tertiary">샘플은 CutPick이 준비한 예시 사진이에요. 커뮤니티 게시물이 아니에요.</AppText>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.card },
  ctaIcon: { width: 48, height: 48, borderRadius: radius.photo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  go: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.chip },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
