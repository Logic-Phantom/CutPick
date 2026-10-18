import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { CutpickProject } from '@/domain/models';
import { AppText, Card, EmptyState, ErrorState, InlineMessage, PrimaryButton, ScreenScroll, SectionHeader, radius, spacing, useColors } from '@/design-system';
import { listProjects } from '@/features/project-library/project-repository';
import { CONTEXT_LABELS } from '@/features/project-library/contexts';
import { useAppState } from '@/hooks/app-state';
import { formatDate } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const { dbError } = useAppState();
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

  return (
    <ScreenScroll topInset>
      <View style={{ gap: spacing.xxs }}>
        <AppText variant="screenTitle">컷픽</AppText>
        <AppText variant="body" tone="secondary">
          고른 사진만 기기 안에서 분석해 올릴 사진 묶음을 추천해요.
        </AppText>
      </View>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <View style={styles.ctaHead}>
            <View style={[styles.ctaIcon, { backgroundColor: c.accentSoft }]}>
              <Ionicons name="sparkles-outline" size={22} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">사진 고르고 추천받기</AppText>
              <AppText variant="secondary" tone="secondary">사진은 서버로 올라가지 않아요.</AppText>
            </View>
          </View>
          <PrimaryButton label="새 프로젝트 시작" icon="add" onPress={() => router.push('/project/new')} testID="home-new-project" />
        </View>
      </Card>

      {dbError ? <InlineMessage tone="error" message="로컬 저장소를 열지 못했어요. 앱을 다시 실행해 주세요." /> : null}

      <View>
        <SectionHeader title="최근 프로젝트" />
        {error ? (
          <ErrorState message="프로젝트 목록을 불러오지 못했어요." onRetry={load} />
        ) : projects == null ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} />
        ) : projects.length === 0 ? (
          <EmptyState
            title="아직 프로젝트가 없어요"
            message="여행, 카페, OOTD처럼 묶음 단위로 프로젝트를 만들고 사진을 골라 보세요."
          />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {projects.map((p) => (
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
                  <AppText variant="secondary" tone="secondary" numberOfLines={1}>
                    {CONTEXT_LABELS[p.sourceContext]} · {p.photoCount ?? 0}장 · {formatDate(p.updatedAt)}
                  </AppText>
                  {p.isSample ? (
                    <AppText variant="caption" tone="warning">샘플(합성 이미지)</AppText>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  ctaHead: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  ctaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.card, borderWidth: 1, minHeight: 72 },
  cover: { width: 56, height: 56, borderRadius: radius.photo, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
