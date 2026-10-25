import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import { logError, toUserMessage } from '@/domain/errors';
import type { CutpickProject, PhotoAsset, RecommendationSet } from '@/domain/models';
import {
  AppText, BottomBar, Card, EmptyState, FilterChip, GhostButton, IconButton, InlineMessage, PrimaryButton, Row, ScreenScroll, SecondaryButton, SectionHeader, fonts, radius, spacing, successFeedback, useColors,
} from '@/design-system';
import { buildCaption } from '@/features/captions/caption-templates';
import { exportPhotos, IS_EXPO_GO_ANDROID, IS_WEB, saveToLibrary, shareFile, type ExportedFile } from '@/features/export-share/export-service';
import { centerCropRect, cropOffset, shiftCrop } from '@/features/platforms/crop';
import { getAspect, getPurpose } from '@/features/platforms/platform-profiles';
import { getProject, latestRecommendationSet, listPhotos, saveRecommendationSet } from '@/features/project-library/project-repository';

type Msg = { tone: 'success' | 'error' | 'info' | 'warning'; text: string } | null;

const OFFSETS = [
  { v: -1, label: '앞쪽' },
  { v: 0, label: '가운데' },
  { v: 1, label: '뒤쪽' },
];

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const [project, setProject] = useState<CutpickProject | null>(null);
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [set, setSet] = useState<RecommendationSet | null | undefined>(undefined);
  const [files, setFiles] = useState<ExportedFile[] | null>(null);
  // Files already written to the photo library, so a retry after a partial save does not duplicate them.
  const [savedUris, setSavedUris] = useState<ReadonlySet<string>>(new Set());
  const [busy, setBusy] = useState<'export' | 'save' | string | null>(null);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [captionMsg, setCaptionMsg] = useState<Msg>(null);
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    (async () => {
      const [p, list, s] = await Promise.all([getProject(id), listPhotos(id), latestRecommendationSet(id)]);
      setProject(p);
      setPhotos(list);
      setSet(s);
    })().catch(() => setSet(null));
  }, [id]);

  const persist = useCallback((next: RecommendationSet) => {
    setSet(next);
    setFiles(null); // crops/caption changed → previous export is stale
    saveRecommendationSet({ ...next, updatedAt: new Date().toISOString() }).catch(() => {});
  }, []);

  if (set === undefined) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.background }} />;
  if (!set || !project) {
    return <EmptyState title="저장할 추천 결과가 없어요" message="추천 화면에서 사진 묶음을 먼저 만들어 주세요." actionLabel="추천 화면으로" onAction={() => router.replace(`/recommendations/${id}`)} />;
  }

  const purpose = getPurpose(set.purposeId);
  const aspect = getAspect(purpose, set.aspectId);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const ordered = set.orderedPhotoIds.map((x) => byId.get(x)).filter((p): p is PhotoAsset => !!p);
  const tileW = Math.min(220, (width - spacing.md * 2) * 0.62);

  const cropFor = (p: PhotoAsset) => set.cropPreferences.find((cp) => cp.photoId === p.id && cp.aspect === aspect.id)?.rect ?? centerCropRect(p.width, p.height, aspect.ratio);
  const offsetFor = (p: PhotoAsset) => cropOffset(cropFor(p), p.width, p.height, aspect.ratio);
  const setOffset = (p: PhotoAsset, v: number) => {
    const rect = shiftCrop(centerCropRect(p.width, p.height, aspect.ratio), v);
    const others = set.cropPreferences.filter((cp) => !(cp.photoId === p.id && cp.aspect === aspect.id));
    persist({ ...set, cropPreferences: [...others, { photoId: p.id, aspect: aspect.id, rect }] });
  };

  const doExport = async (): Promise<ExportedFile[] | null> => {
    setMsg(null);
    setBusy('export');
    try {
      const out = await exportPhotos({ projectId: id, photos, orderedIds: ordered.map((p) => p.id), purpose, aspect, crops: set.cropPreferences, onProgress: (d, t) => setProgress([d, t]) });
      setFiles(out);
      return out;
    } catch (e) {
      logError('export', e);
      setMsg({ tone: 'error', text: `${toUserMessage(e)} 원본 사진은 프로젝트에 그대로 있어요.` });
      return null;
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  const doSave = async () => {
    const out = files ?? (await doExport());
    if (!out) return;
    const pending = out.filter((f) => !savedUris.has(f.uri));
    if (pending.length === 0) {
      setMsg({ tone: 'info', text: `${out.length}장 모두 이미 사진 앱에 저장했어요.` });
      return;
    }
    setBusy('save');
    try {
      const n = await saveToLibrary(pending);
      const next = new Set([...savedUris, ...pending.slice(0, n).map((f) => f.uri)]);
      setSavedUris(next);
      const done = out.filter((f) => next.has(f.uri)).length;
      if (done === out.length) {
        successFeedback();
        setMsg({ tone: 'success', text: `${done}장을 순서대로 사진 앱에 저장했어요. 파일 이름에 순번이 붙어 있어요.` });
      } else {
        setMsg({ tone: 'warning', text: `${out.length}장 중 ${done}장만 저장됐어요. 다시 누르면 남은 ${out.length - done}장만 저장해요.` });
      }
    } catch (e) {
      logError('save-library', e);
      setMsg({ tone: 'error', text: `${toUserMessage(e)} 아래에서 한 장씩 공유할 수도 있어요.` });
    } finally {
      setBusy(null);
    }
  };

  const doShare = async (f: ExportedFile) => {
    setBusy(f.photoId);
    try {
      await shareFile(f);
    } catch (e) {
      logError('share', e);
      setMsg({ tone: 'error', text: toUserMessage(e) });
    } finally {
      setBusy(null);
    }
  };

  const copyCaption = async () => {
    try {
      await Clipboard.setStringAsync(set.captionDraft);
      setCaptionMsg({ tone: 'success', text: '캡션을 복사했어요.' });
    } catch {
      setCaptionMsg({ tone: 'error', text: '복사하지 못했어요. 글자를 길게 눌러 직접 복사해 주세요.' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenScroll withBottomBar>
        {project.isSample ? <InlineMessage tone="warning" message="샘플(무료 라이선스 사진) 프로젝트예요." /> : null}
        <View>
          <SectionHeader title={`${purpose.label} · ${ordered.length}장`} subtitle={`${aspect.label} · 게시 순서대로 미리보기`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}>
            {ordered.map((p, i) => {
              const r = cropFor(p);
              const ratio = aspect.ratio ?? (p.width && p.height ? p.width / p.height : 1);
              const h = tileW / ratio;
              return (
                <View key={p.id} style={{ width: tileW, gap: spacing.xxs }}>
                  <View style={[styles.cropFrame, { width: tileW, height: h, backgroundColor: c.photoPlaceholder }]} accessible accessibilityLabel={`${i + 1}번째 사진 크롭 미리보기`}>
                    {p.thumbnailUri ? (
                      <Image
                        source={{ uri: p.thumbnailUri }}
                        style={{ position: 'absolute', width: tileW / r.width, height: h / r.height, left: (-r.x * tileW) / r.width, top: (-r.y * h) / r.height }}
                        contentFit="fill"
                      />
                    ) : null}
                    <View style={[styles.num, { backgroundColor: c.selected }]}>
                      <AppText variant="caption" style={{ color: c.selectedText, fontWeight: '700' }}>{i + 1}</AppText>
                    </View>
                  </View>
                  {aspect.ratio && (r.width < 0.999 || r.height < 0.999 || offsetFor(p) !== 0) ? (
                    <Row gap={spacing.xxs} wrap>
                      {OFFSETS.map((o) => (
                        <FilterChip key={o.v} label={o.label} selected={offsetFor(p) === o.v} onPress={() => setOffset(p, o.v)} role="radio" />
                      ))}
                    </Row>
                  ) : (
                    <AppText variant="caption" tone="tertiary">자르지 않아요</AppText>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <Card>
          <View style={{ gap: spacing.xs }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="bodyStrong">캡션 초안</AppText>
              <Row gap={0}>
                <IconButton
                  icon="refresh"
                  label="다른 문구"
                  onPress={() => {
                    const v = variant + 1;
                    setVariant(v);
                    persist({ ...set, captionDraft: buildCaption(project.title, project.sourceContext, v) });
                  }}
                />
                <IconButton icon="copy-outline" label="캡션 복사" onPress={copyCaption} testID="caption-copy" />
              </Row>
            </Row>
            <TextInput
              multiline
              value={set.captionDraft}
              onChangeText={(t) => persist({ ...set, captionDraft: t })}
              accessibilityLabel="캡션 편집"
              style={[styles.caption, { color: c.textPrimary, borderColor: c.border, backgroundColor: c.surfaceSunken }]}
              maxLength={2200}
            />
            <AppText variant="caption" tone="tertiary">템플릿 기반 초안이에요. 해시태그는 실시간 트렌드가 아닌 고정 목록이에요.</AppText>
            {captionMsg ? <InlineMessage tone={captionMsg.tone} message={captionMsg.text} /> : null}
          </View>
        </Card>

        <InlineMessage tone="info" title="공유 안내" message={purpose.shareGuide} />

        {busy === 'export' && progress ? <AppText variant="secondary" tone="secondary">내보내는 중 {progress[0]}/{progress[1]}</AppText> : null}
        {msg ? <InlineMessage tone={msg.tone} message={msg.text} /> : null}
        {IS_WEB ? <InlineMessage tone="warning" message="웹 미리보기에서는 사진 앱 저장과 공유 시트를 지원하지 않아요. iOS/Android 앱에서 사용해 주세요." /> : null}
        {IS_EXPO_GO_ANDROID ? <InlineMessage tone="info" message="Expo Go(Android) 테스트 환경에서는 사진 앱 저장이 막혀 있어요. '파일 만들기' 후 아래 '한 장씩 공유'를 이용해 주세요. 정식 앱에서는 저장할 수 있어요." /> : null}

        {files ? (
          <View style={{ gap: spacing.xs }}>
            <SectionHeader title="한 장씩 공유" subtitle="목적 앱이 여러 장 공유를 지원하지 않을 때 사용하세요." />
            {files.map((f, i) => (
              <Row key={f.fileName} gap={spacing.sm} style={[styles.fileRow, { borderColor: c.border, backgroundColor: c.surface }]}>
                <Image source={{ uri: f.uri }} style={styles.fileThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <AppText variant="secondary" numberOfLines={1}>{i + 1}. {f.fileName}</AppText>
                  <AppText variant="caption" tone="tertiary">{f.width}×{f.height}</AppText>
                </View>
                <SecondaryButton compact label="공유" icon="share-outline" onPress={() => doShare(f)} loading={busy === f.photoId} disabled={IS_WEB} />
              </Row>
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          <SectionHeader title="CutPick 커뮤니티" subtitle="선택한 사진 한 장을 하트 공감 피드에 공개할 수 있어요. 별도 동의 화면이 나와요." />
          <GhostButton compact icon="heart-outline" label="첫 번째 사진 공개하기" onPress={() => ordered[0] && router.push({ pathname: '/community/publish', params: { photoId: ordered[0].id } })} />
        </View>
      </ScreenScroll>
      <BottomBar>
        <SecondaryButton label={files ? '다시 만들기' : '파일 만들기'} onPress={doExport} loading={busy === 'export'} disabled={!!busy && busy !== 'export'} compact style={{ flex: 1 }} />
        <PrimaryButton label="순번대로 사진 앱에 저장" icon="download-outline" onPress={doSave} loading={busy === 'save'} disabled={(!!busy && busy !== 'save') || IS_WEB || IS_EXPO_GO_ANDROID} style={{ flex: 1.6 }} testID="export-save" />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  cropFrame: { borderRadius: radius.photo, overflow: 'hidden' },
  num: { position: 'absolute', top: 6, left: 6, minWidth: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  caption: { minHeight: 110, borderWidth: 1, borderRadius: radius.button, padding: spacing.sm, fontSize: 16, fontFamily: fonts.regular, textAlignVertical: 'top' },
  fileRow: { padding: spacing.xs, borderWidth: 1, borderRadius: radius.button },
  fileThumb: { width: 48, height: 48, borderRadius: radius.photo },
});
