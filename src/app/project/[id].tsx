import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import type { CutpickProject, PhotoAsset } from '@/domain/models';
import {
  AppText, BottomBar, BottomSheet, Card, DangerButton, ErrorState, GhostButton, InlineMessage, PhotoThumbnail, PrimaryButton, Row, SecondaryButton, radius, spacing, useColors,
} from '@/design-system';
import { needsAnalysis } from '@/features/image-analysis/analysis-runner';
import { CONTEXT_LABELS } from '@/features/project-library/contexts';
import { deleteProject, getProject, listPhotos, updateProject } from '@/features/project-library/project-repository';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const [project, setProject] = useState<CutpickProject | null | undefined>(undefined);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [groupsOnly, setGroupsOnly] = useState(false);

  const load = useCallback(() => {
    Promise.all([getProject(id), listPhotos(id)])
      .then(([p, list]) => {
        setProject(p);
        setPhotos(list);
      })
      .catch(() => setProject(null));
  }, [id]);
  useFocusEffect(load);

  const stats = useMemo(() => {
    const pending = photos.filter(needsAnalysis).length;
    const failed = photos.filter((p) => p.analysisStatus === 'failed').length;
    const groups = new Set(photos.map((p) => p.duplicateGroupId).filter(Boolean)).size;
    return { done: photos.length - pending - failed, failed, pending, groups };
  }, [photos]);

  const shown = useMemo(() => {
    if (!groupsOnly) return photos;
    return [...photos.filter((p) => p.duplicateGroupId)].sort((a, b) => (a.duplicateGroupId! < b.duplicateGroupId! ? -1 : a.duplicateGroupId! > b.duplicateGroupId! ? 1 : a.importIndex - b.importIndex));
  }, [photos, groupsOnly]);

  if (project === undefined) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.background }} />;
  if (project === null) return <ErrorState message="프로젝트를 찾을 수 없어요. 이미 삭제됐을 수 있어요." onRetry={() => router.back()} retryLabel="돌아가기" />;

  const cols = width >= 600 ? 6 : 4;
  const tile = (width - spacing.md * 2 - spacing.xxs * (cols - 1)) / cols;
  const groupIndex = new Map<string, number>();
  shown.forEach((p) => p.duplicateGroupId && !groupIndex.has(p.duplicateGroupId) && groupIndex.set(p.duplicateGroupId, groupIndex.size + 1));

  const saveName = async () => {
    const t = name.trim();
    if (t) await updateProject(id, { title: t });
    setRenaming(false);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ title: project.title }} />
      <FlatList
        data={shown}
        keyExtractor={(p) => p.id}
        numColumns={cols}
        key={cols}
        columnWrapperStyle={{ gap: spacing.xxs }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xxs, paddingBottom: 140 }}
        initialNumToRender={28}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            {project.isSample ? <InlineMessage tone="warning" message="샘플(합성 이미지) 프로젝트예요." /> : null}
            <Card>
              <View style={{ gap: spacing.xs }}>
                {renaming ? (
                  <Row gap={spacing.xs}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      autoFocus
                      maxLength={40}
                      onSubmitEditing={saveName}
                      accessibilityLabel="새 프로젝트 이름"
                      style={[styles.input, { color: c.textPrimary, borderColor: c.borderStrong, backgroundColor: c.surfaceSunken }]}
                    />
                    <SecondaryButton compact label="저장" onPress={saveName} />
                  </Row>
                ) : (
                  <Row style={{ justifyContent: 'space-between' }}>
                    <AppText variant="sectionTitle" style={{ flex: 1 }} numberOfLines={2}>{project.title}</AppText>
                    <GhostButton compact label="이름 변경" onPress={() => { setName(project.title); setRenaming(true); }} />
                  </Row>
                )}
                <AppText variant="secondary" tone="secondary">
                  {CONTEXT_LABELS[project.sourceContext]} · 사진 {photos.length}장 · 분석 {stats.done}장{stats.failed ? ` · 실패 ${stats.failed}장` : ''} · 비슷한 사진 그룹 {stats.groups}개
                </AppText>
              </View>
            </Card>
            {stats.pending > 0 ? <InlineMessage tone="info" message={`아직 분석하지 않은 사진이 ${stats.pending}장 있어요.`} action={<GhostButton compact label="분석 이어하기" onPress={() => router.push(`/analysis/${id}`)} />} /> : null}
            <Row gap={spacing.xs} wrap>
              <SecondaryButton compact label={groupsOnly ? '모든 사진 보기' : `비슷한 사진 그룹만 (${stats.groups})`} icon="copy-outline" onPress={() => setGroupsOnly(!groupsOnly)} disabled={!stats.groups && !groupsOnly} />
            </Row>
            <AppText variant="caption" tone="tertiary">사진을 탭하면 크게 보고, 장면 태그를 붙이거나 프로젝트에서 뺄 수 있어요. 원본 사진은 삭제되지 않아요.</AppText>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: spacing.xl }}>
            <DangerButton label="프로젝트 삭제" icon="trash-outline" onPress={() => setConfirmDelete(true)} compact />
          </View>
        }
        renderItem={({ item, index }) => (
          <PhotoThumbnail
            uri={item.thumbnailUri}
            size={tile}
            onPress={() => router.push(`/photo/${item.id}`)}
            accessibilityLabel={`사진 ${index + 1}${item.duplicateGroupId ? `, 비슷한 사진 그룹 ${groupIndex.get(item.duplicateGroupId)}` : ''}${item.analysisStatus === 'failed' ? ', 분석 실패' : ''}`}
            bottomLeft={item.duplicateGroupId ? { kind: 'group', value: groupIndex.get(item.duplicateGroupId) } : null}
            topRight={item.analysisStatus === 'failed' ? { kind: 'failed' } : item.analysisStatus !== 'done' ? { kind: 'pending' } : null}
          />
        )}
      />
      <BottomBar>
        <PrimaryButton label="추천 보기" icon="sparkles-outline" onPress={() => router.push(`/recommendations/${id}`)} disabled={stats.done === 0} style={{ flex: 1 }} testID="project-recs" />
      </BottomBar>
      <BottomSheet visible={confirmDelete} title="프로젝트를 삭제할까요?" onClose={() => setConfirmDelete(false)}>
        <AppText variant="body">프로젝트, 분석 기록, 썸네일, 내보내기 파일이 이 기기에서 삭제돼요. 사진 앱의 원본 사진과 이미 저장한 사진은 삭제되지 않아요.</AppText>
        <DangerButton
          label="삭제"
          icon="trash"
          onPress={async () => {
            await deleteProject(id);
            setConfirmDelete(false);
            router.dismissTo('/');
          }}
          testID="project-delete-confirm"
        />
        <SecondaryButton label="취소" onPress={() => setConfirmDelete(false)} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: radius.button, paddingHorizontal: spacing.sm, fontSize: 16 },
});
