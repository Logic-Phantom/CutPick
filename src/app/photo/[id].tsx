import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { PhotoAsset, SceneTag } from '@/domain/models';
import { AppText, Card, DangerButton, ErrorState, FilterChip, InlineMessage, Row, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import { SCENE_OPTIONS as SCENES } from '@/features/project-library/contexts';
import { getPhoto, removePhotoFromProject, setSceneTags } from '@/features/project-library/project-repository';
import { formatBytes, pct } from '@/utils/format';

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexBasis: '45%', flexGrow: 1, gap: 2 }}>
      <AppText variant="caption" tone="secondary">{label}</AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const [photo, setPhoto] = useState<PhotoAsset | null | undefined>(undefined);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    getPhoto(id).then(setPhoto).catch(() => setPhoto(null));
  }, [id]);

  if (photo === undefined) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.background }} />;
  if (!photo) return <ErrorState message="사진 정보를 찾을 수 없어요." />;

  const m = photo.qualityMetrics;
  const ratio = photo.width && photo.height ? photo.width / photo.height : 1;

  const toggleTag = async (t: SceneTag) => {
    const tags = photo.sceneTags.includes(t) ? photo.sceneTags.filter((x) => x !== t) : [...photo.sceneTags, t];
    setPhoto({ ...photo, sceneTags: tags });
    await setSceneTags(photo.id, tags);
  };

  return (
    <ScreenScroll>
      <View style={[styles.imageWrap, { aspectRatio: ratio, backgroundColor: c.photoPlaceholder }]}>
        <Image source={{ uri: photo.thumbnailUri ?? photo.localUri }} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel="사진 크게 보기" />
      </View>

      <Card>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="bodyStrong">기술적 신호 (축소본 기준)</AppText>
          {m ? (
            <View style={styles.metrics}>
              <Metric label="선명도" value={pct(m.sharpnessScore)} />
              <Metric label="노출 안정도" value={pct(m.exposureScore)} />
              <Metric label="대비" value={pct(m.contrastScore)} />
              <Metric label="해상도" value={pct(m.resolutionScore)} />
              <Metric label="평균 밝기 (0~255)" value={String(Math.round(m.meanLuma))} />
              <Metric label="채도 지수" value={pct(m.colorfulness)} />
              <Metric label="색온도 경향" value={m.warmth > 0.1 ? '따뜻함' : m.warmth < -0.1 ? '차가움' : '중립'} />
              <Metric label="밝은 영역 날림" value={`${pct(m.highlightClipRatio)}%`} />
            </View>
          ) : (
            <InlineMessage tone={photo.analysisStatus === 'failed' ? 'error' : 'info'} message={photo.analysisStatus === 'failed' ? '이 사진은 분석에 실패했어요. 파일 접근이 끊겼다면 프로젝트에서 사진을 다시 선택해 주세요.' : '아직 분석되지 않았어요.'} />
          )}
          <AppText variant="caption" tone="tertiary">0~100 참고값이에요. 어둡거나 거친 사진도 의도된 연출일 수 있어요. 얼굴·표정·눈 감김은 분석하지 않아요.</AppText>
          <AppText variant="caption" tone="tertiary">
            {photo.width}×{photo.height}px · {formatBytes(photo.fileSizeBytes)}{photo.createdAt ? ` · 촬영 ${photo.createdAt.slice(0, 16).replace('T', ' ')}` : ''}{photo.duplicateGroupId ? ' · 비슷한 사진 그룹에 속함' : ''}
          </AppText>
        </View>
      </Card>

      <View style={{ gap: spacing.xs }}>
        <AppText variant="bodyStrong">장면 태그 (직접 지정)</AppText>
        <AppText variant="secondary" tone="secondary">자동 장면 분류는 지원하지 않아요. 태그를 붙이면 추천 묶음의 장면 다양성과, 취향 설정에서 고른 장면에 반영돼요.</AppText>
        <Row wrap gap={spacing.xs}>
          {SCENES.map((s) => (
            <FilterChip key={s.id} label={s.label} selected={photo.sceneTags.includes(s.id)} onPress={() => toggleTag(s.id)} />
          ))}
        </Row>
      </View>

      {confirm ? (
        <Card>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="body">이 사진을 프로젝트에서 뺄까요? 사진 앱의 원본은 그대로 남아요.</AppText>
            <Row gap={spacing.xs}>
              <SecondaryButton compact label="취소" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
              <DangerButton
                compact
                label="프로젝트에서 빼기"
                onPress={async () => {
                  await removePhotoFromProject(photo.id);
                  router.back();
                }}
                style={{ flex: 1 }}
              />
            </Row>
          </View>
        </Card>
      ) : (
        <DangerButton compact label="프로젝트에서 빼기 (원본 유지)" icon="remove-circle-outline" onPress={() => setConfirm(true)} />
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  imageWrap: { width: '100%', maxHeight: 520, borderRadius: radius.photo, overflow: 'hidden', alignSelf: 'center' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, columnGap: spacing.md },
});
