import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';

import type { PhotoAsset } from '@/domain/models';
import {
  AppText, BottomBar, Card, GhostButton, InlineMessage, PhotoThumbnail, PrimaryButton, ProgressPanel, SecondaryButton, spacing, successFeedback, useColors, type ProgressStep,
} from '@/design-system';
import { cancelAnalysis, getJob, isRunning, needsAnalysis, startAnalysis, subscribeJob, type JobState } from '@/features/image-analysis/analysis-runner';
import { HEURISTIC_CAPABILITIES } from '@/features/image-analysis/heuristic-provider';
import { listPhotos } from '@/features/project-library/project-repository';
import { CapabilityList } from '@/features/image-analysis/components/CapabilityList';

function buildSteps(job: JobState | null, pendingLeft: number): ProgressStep[] {
  const stage = job?.stage ?? (pendingLeft === 0 ? 'done' : 'idle');
  const order = ['checking', 'quality', 'grouping', 'done'];
  const idx = order.indexOf(stage as string);
  const st = (i: number): ProgressStep['state'] => {
    if (stage === 'cancelled') return i <= 1 ? (i === 0 ? 'done' : 'cancelled') : 'waiting';
    if (stage === 'idle') return 'waiting';
    if (idx > i || stage === 'done') return 'done';
    return idx === i ? 'active' : 'waiting';
  };
  return [
    { id: 'checking', label: '사진 확인', state: st(0) },
    { id: 'quality', label: '썸네일 준비 · 흐림/노출/대비/색 분석', state: st(1) },
    { id: 'grouping', label: '비슷한 사진 묶기', state: st(2) },
  ];
}

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const [job, setJob] = useState<JobState | null>(getJob(id));
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const lastRefresh = useRef(0);
  const [showScope, setShowScope] = useState(false);

  const refresh = useCallback(async () => {
    setPhotos(await listPhotos(id));
  }, [id]);

  useEffect(() => {
    const off = subscribeJob(id, (s) => {
      setJob(s);
      const now = Date.now();
      if (now - lastRefresh.current > 700 || s.stage === 'done' || s.stage === 'cancelled') {
        lastRefresh.current = now;
        refresh();
      }
      if (s.stage === 'done') successFeedback();
    });
    (async () => {
      const list = await listPhotos(id);
      setPhotos(list);
      if (!isRunning(id) && list.some(needsAnalysis)) startAnalysis(id);
    })();
    return off;
  }, [id, refresh]);

  const counts = useMemo(() => {
    const pending = photos.filter(needsAnalysis).length;
    const failed = photos.filter((p) => p.analysisStatus === 'failed').length;
    const done = photos.length - pending - failed;
    return { done, failed, pending };
  }, [photos]);

  const running = job ? ['checking', 'quality', 'grouping'].includes(job.stage) : false;
  const finished = !running && counts.pending === 0;
  const cols = width >= 600 ? 6 : 4;
  const tile = (width - spacing.md * 2 - spacing.xxs * (cols - 1)) / cols;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={cols}
        key={cols}
        columnWrapperStyle={{ gap: spacing.xxs }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs, paddingBottom: 140 }}
        initialNumToRender={24}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <ProgressPanel
              steps={buildSteps(job, counts.pending)}
              processed={running && job ? job.processed : counts.done + counts.failed}
              total={running && job ? job.total : photos.length}
              failed={running && job ? job.failed : counts.failed}
            />
            {job?.stage === 'cancelled' ? <InlineMessage tone="warning" message="분석을 멈췄어요. 이미 분석한 사진은 유지되고, 이어서 분석할 수 있어요." /> : null}
            {finished && counts.failed > 0 ? (
              <InlineMessage tone="warning" title={`${counts.failed}장 분석 실패`} message="파일에 접근할 수 없거나 형식을 읽지 못했어요. 성공한 사진으로 추천을 받을 수 있고, 실패한 사진만 다시 시도할 수 있어요." />
            ) : null}
            {finished && job?.msPerPhoto ? (
              <AppText variant="caption" tone="tertiary">이번 분석 측정값: 사진당 약 {job.msPerPhoto}ms (이 기기·이 사진 기준)</AppText>
            ) : null}
            <GhostButton
              compact
              icon={showScope ? 'chevron-up' : 'information-circle-outline'}
              label={showScope ? '분석 범위 접기' : '무엇을 분석하나요?'}
              onPress={() => setShowScope(!showScope)}
              style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
            />
            {showScope ? (
              <Card>
                <CapabilityList caps={HEURISTIC_CAPABILITIES} />
              </Card>
            ) : null}
            <AppText variant="sectionTitle">사진 {photos.length}장</AppText>
          </View>
        }
        renderItem={({ item, index }) => (
          <PhotoThumbnail
            uri={item.thumbnailUri}
            size={tile}
            accessibilityLabel={`사진 ${index + 1}, ${item.analysisStatus === 'done' ? '분석 완료' : item.analysisStatus === 'failed' ? '분석 실패' : '분석 대기'}`}
            topRight={item.analysisStatus === 'failed' ? { kind: 'failed' } : item.analysisStatus !== 'done' ? { kind: 'pending' } : null}
          />
        )}
      />
      <BottomBar>
        {running ? (
          <SecondaryButton label="분석 멈추기" icon="stop-circle-outline" onPress={() => cancelAnalysis(id)} style={{ flex: 1 }} testID="analysis-cancel" />
        ) : counts.pending > 0 ? (
          <PrimaryButton label="이어서 분석" icon="play" onPress={() => startAnalysis(id)} style={{ flex: 1 }} />
        ) : (
          <>
            {counts.failed > 0 ? <SecondaryButton label="실패만 재시도" onPress={() => startAnalysis(id, { retryFailed: true })} style={{ flex: 1 }} compact /> : null}
            <PrimaryButton
              label="추천 보기"
              icon="sparkles-outline"
              disabled={counts.done === 0}
              onPress={() => router.replace(`/recommendations/${id}`)}
              style={{ flex: 1.4 }}
              testID="analysis-to-recs"
            />
          </>
        )}
      </BottomBar>
    </View>
  );
}
