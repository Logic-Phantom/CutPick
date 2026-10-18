import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';

import {
  AppText, BottomBar, EmptyState, ErrorState, GhostButton, IconButton, InlineMessage, PhotoThumbnail, PrimaryButton, Row, ScreenScroll, SectionHeader, spacing, tapFeedback, useColors,
} from '@/design-system';
import { needsAnalysis } from '@/features/image-analysis/analysis-runner';
import { PhotoActionSheet } from '@/features/recommendations/components/PhotoActionSheet';
import { primaryReason } from '@/features/recommendations/explanations';
import { RecommendationControls } from '@/features/recommendations/components/RecommendationControls';
import { useRecommendationEditor } from '@/features/recommendations/use-recommendation-editor';

export default function RecommendationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { project, photos, output, edit, canUndo, loadError, actions } = useRecommendationEditor(id);
  const [sheetPhotoId, setSheetPhotoId] = useState<string | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const byId = useMemo(() => new Map((photos ?? []).map((p) => [p.id, p])), [photos]);

  if (loadError) return <ErrorState message="프로젝트를 불러오지 못했어요." onRetry={actions.reload} />;
  if (!project || !photos || !output) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.background }} />;

  const single = output.target === 1;
  const analyzed = photos.filter((p) => p.analysisStatus === 'done' && !needsAnalysis(p)).length;
  const selected = output.orderedIds;
  const selectedSet = new Set(single ? output.alternatives : selected);
  const excludedSet = new Set(edit.excluded);
  const candidates = [...output.allScores.entries()]
    .filter(([pid]) => !selectedSet.has(pid))
    .sort((a, b) => b[1] - a[1])
    .map(([pid]) => byId.get(pid)!)
    .filter(Boolean);
  const excluded = edit.excluded.map((x) => byId.get(x)).filter((p): p is NonNullable<typeof p> => !!p);

  const ratio = output.aspect.ratio ?? 4 / 5;
  const bigCols = width >= 700 ? 3 : 2;
  const bigTile = (width - spacing.md * 2 - spacing.xs * (bigCols - 1)) / bigCols;
  const smallCols = width >= 700 ? 6 : 4;
  const smallTile = (width - spacing.md * 2 - spacing.xxs * (smallCols - 1)) / smallCols;

  const sheetPhoto = sheetPhotoId ? byId.get(sheetPhotoId) ?? null : null;
  const sheetDetail = output.details.find((d) => d.photoId === sheetPhotoId);
  const groupId = sheetPhoto?.duplicateGroupId ?? null;
  const groupMembers = groupId ? photos.filter((p) => p.duplicateGroupId === groupId) : [];
  const groupRep = sheetPhotoId ? output.groupRepresentative.get(sheetPhotoId) ?? null : null;
  const position = sheetPhotoId ? (single ? output.alternatives.indexOf(sheetPhotoId) : selected.indexOf(sheetPhotoId)) : -1;

  const open = (pid: string) => {
    tapFeedback();
    setSheetPhotoId(pid);
  };
  const close = () => setSheetPhotoId(null);
  const run = (fn: () => void) => () => {
    fn();
    close();
  };

  const visibleCandidates = showAllCandidates ? candidates : candidates.slice(0, smallCols * 3);
  const list = single ? output.alternatives : selected;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenScroll withBottomBar>
        {project.isSample ? <InlineMessage tone="warning" message="샘플(합성 이미지) 프로젝트예요. 분석은 실제로 실행됐지만 사진은 직접 찍은 사진이 아니에요." /> : null}
        {analyzed < photos.length ? (
          <InlineMessage
            tone="info"
            message={`${photos.length}장 중 ${analyzed}장이 최신 분석 상태예요. 분석되지 않았거나 이전 버전으로 분석된 사진은 결과가 부정확할 수 있어요.`}
            action={<GhostButton compact label="분석 계속하기" onPress={() => router.push(`/analysis/${id}`)} />}
          />
        ) : null}

        <RecommendationControls
          purpose={output.purpose}
          aspect={output.aspect}
          target={output.target}
          selectedCount={selected.length}
          presetId={output.preset.id}
          onPlatform={actions.choosePlatform}
          onPurpose={actions.choosePurpose}
          onAspect={actions.setAspect}
          onTarget={actions.setTarget}
          onPreset={actions.setPreset}
        />

        <View>
          <SectionHeader
            title={single ? `대표 후보 ${list.length}장` : `추천 묶음 ${selected.length}장`}
            subtitle={single ? '첫 번째가 선택된 사진이에요. 탭해서 바꿀 수 있어요.' : output.strategy === 'chronological' ? '첫 장은 점수가 가장 높은 사진, 나머지는 촬영 순서예요.' : output.strategy === 'manual' ? '직접 바꾼 순서를 유지하고 있어요.' : '첫 장은 대표 사진, 비슷한 사진이 이어지지 않게 배치했어요.'}
          />
          {list.length === 0 ? (
            <EmptyState
              title="추천할 사진이 없어요"
              message={excluded.length ? '모든 사진을 제외했어요. 아래에서 되돌리거나 사진을 더 추가해 보세요.' : '분석된 사진이 없어요. 분석을 먼저 진행해 주세요.'}
              actionLabel={excluded.length ? undefined : '분석하러 가기'}
              onAction={excluded.length ? undefined : () => router.push(`/analysis/${id}`)}
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
              {list.map((pid, i) => {
                const p = byId.get(pid);
                if (!p) return null;
                const d = output.details.find((x) => x.photoId === pid);
                const pinned = edit.pinned.includes(pid);
                const firstReason = d ? primaryReason(d.reasons) : undefined;
                const isChosen = single ? i === 0 : true;
                return (
                  <View key={pid} style={{ width: bigTile, gap: spacing.xxs }}>
                    <PhotoThumbnail
                      uri={p.thumbnailUri}
                      size={bigTile}
                      aspect={ratio}
                      selected={isChosen}
                      onPress={() => open(pid)}
                      accessibilityLabel={`${single ? (i === 0 ? '선택된 사진' : `후보 ${i + 1}`) : `${i + 1}번째`}${pinned ? ', 고정됨' : ''}. ${d?.reasons.map((r) => r.text).join('. ') ?? ''}. 탭하면 편집 메뉴`}
                      topLeft={single ? (i === 0 ? { kind: 'check' } : { kind: 'order', value: i + 1 }) : { kind: 'order', value: i + 1 }}
                      topRight={pinned ? { kind: 'pinned' } : null}
                      bottomLeft={p.duplicateGroupId ? { kind: 'group' } : null}
                      testID={`rec-${i}`}
                    />
                    {firstReason ? (
                      <AppText variant="caption" tone={firstReason.tone === 'caution' ? 'warning' : 'secondary'} numberOfLines={2}>
                        {firstReason.text}
                      </AppText>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          {output.aspect.ratio ? <AppText variant="caption" tone="tertiary" style={{ marginTop: spacing.xs }}>타일은 {output.aspect.label} 가운데 크롭 미리보기예요.</AppText> : null}
        </View>

        {candidates.length ? (
          <View>
            <SectionHeader title={`다른 후보 ${candidates.length}장`} subtitle="탭해서 묶음에 추가하거나 제외할 수 있어요." />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }}>
              {visibleCandidates.map((p) => (
                <PhotoThumbnail
                  key={p.id}
                  uri={p.thumbnailUri}
                  size={smallTile}
                  onPress={() => open(p.id)}
                  accessibilityLabel={`후보 사진${p.duplicateGroupId ? ', 비슷한 사진 그룹' : ''}${p.analysisStatus !== 'done' ? ', 분석 안 됨' : ''}. 탭하면 메뉴`}
                  bottomLeft={p.duplicateGroupId ? { kind: 'group' } : null}
                  topRight={p.analysisStatus === 'failed' ? { kind: 'failed' } : p.analysisStatus !== 'done' ? { kind: 'pending' } : null}
                />
              ))}
            </View>
            {candidates.length > visibleCandidates.length || showAllCandidates ? (
              <GhostButton compact label={showAllCandidates ? '접기' : `후보 ${candidates.length - visibleCandidates.length}장 더 보기`} onPress={() => setShowAllCandidates(!showAllCandidates)} />
            ) : null}
          </View>
        ) : null}

        {excluded.length ? (
          <View>
            <SectionHeader title={`제외한 사진 ${excluded.length}장`} subtitle="추천에서만 빠졌고 원본 사진은 그대로예요." />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }}>
              {excluded.map((p) => (
                <PhotoThumbnail key={p.id} uri={p.thumbnailUri} size={smallTile} dimmed topRight={{ kind: 'excluded' }} onPress={() => open(p.id)} accessibilityLabel="제외한 사진. 탭하면 되돌리기 메뉴" />
              ))}
            </View>
          </View>
        ) : null}

        <Row gap={spacing.xs} wrap>
          <GhostButton compact label="모든 편집 초기화" icon="refresh" onPress={actions.resetAll} />
          <AppText variant="caption" tone="tertiary">초기화도 되돌리기로 복구할 수 있어요.</AppText>
        </Row>
      </ScreenScroll>

      <BottomBar>
        <IconButton icon="arrow-undo" label="되돌리기" onPress={actions.undo} disabled={!canUndo} testID="rec-undo" />
        <IconButton icon="shuffle" label="다시 추천 (고정·제외는 유지)" onPress={actions.reRecommend} testID="rec-rerun" />
        <PrimaryButton label="저장·공유로" icon="share-outline" onPress={() => router.push(`/export/${id}`)} disabled={list.length === 0} style={{ flex: 1 }} testID="rec-export" />
      </BottomBar>

      <PhotoActionSheet
        photo={sheetPhoto}
        position={position}
        selectedTotal={single ? output.alternatives.length : selected.length}
        single={single}
        pinned={sheetPhotoId ? edit.pinned.includes(sheetPhotoId) : false}
        excluded={sheetPhotoId ? excludedSet.has(sheetPhotoId) : false}
        reasons={sheetDetail?.reasons ?? []}
        groupMembers={groupMembers}
        groupRepresentativeId={groupRep}
        onClose={close}
        onTogglePin={run(() => sheetPhotoId && actions.togglePin(sheetPhotoId))}
        onExclude={run(() => sheetPhotoId && actions.exclude(sheetPhotoId))}
        onRestore={run(() => sheetPhotoId && actions.restore(sheetPhotoId))}
        onAdd={run(() => sheetPhotoId && actions.add(sheetPhotoId))}
        onMove={(delta) => sheetPhotoId && actions.move(sheetPhotoId, delta)}
        onMakeCover={run(() => sheetPhotoId && actions.makeCover(sheetPhotoId))}
        onChooseSingle={run(() => sheetPhotoId && actions.chooseSingle(sheetPhotoId))}
        onSetRepresentative={(pid) => {
          if (!groupId) return;
          actions.setGroupRepresentative(groupId, pid);
          setSheetPhotoId(pid); // keep the sheet on the photo that now represents the group
        }}
        onOpenDetail={run(() => sheetPhotoId && router.push(`/photo/${sheetPhotoId}`))}
      />
    </View>
  );
}
