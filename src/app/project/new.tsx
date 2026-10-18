import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import type { SourceContext } from '@/domain/models';
import { IMPORT_LIMITS } from '@/domain/recommendation-policy';
import { AppSwitch, AppText, BottomBar, Card, FilterChip, InlineMessage, PrimaryButton, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import type { NormalizeResult } from '@/features/photo-import/asset-normalizer';
import { pickPhotos } from '@/features/photo-import/photo-picker-service';
import { loadSamplePhotos } from '@/features/photo-import/sample-photos';
import { getPurpose } from '@/features/platforms/platform-profiles';
import { CONTEXT_OPTIONS, defaultPurposeFor } from '@/features/project-library/contexts';
import { createProject } from '@/features/project-library/project-repository';
import { suggestPresetForContext } from '@/features/style-presets/preset-registry';
import { useAppState } from '@/hooks/app-state';

const REJECT_TEXT = {
  video: '동영상은 제외했어요',
  'unsupported-type': '지원하지 않는 형식이라 제외했어요',
  'too-many': `최대 ${IMPORT_LIMITS.hardMax}장까지만 불러와요`,
} as const;

export default function NewProjectScreen() {
  const router = useRouter();
  const c = useColors();
  const { preference } = useAppState();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState<SourceContext>('travel');
  const [useCaptureTime, setUseCaptureTime] = useState(false);
  const [picked, setPicked] = useState<NormalizeResult | null>(null);
  const [busy, setBusy] = useState<'pick' | 'create' | 'sample' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const purposeId = defaultPurposeFor(context, preference.preferredPlatformPurposes);

  const onPick = async () => {
    setError(null);
    setBusy('pick');
    try {
      const res = await pickPhotos({ useCaptureTime });
      if (res) setPicked(res);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const create = async (sample: boolean) => {
    setError(null);
    setBusy(sample ? 'sample' : 'create');
    try {
      const photos = sample ? await loadSamplePhotos() : picked?.accepted ?? [];
      if (!photos.length) return;
      const purpose = getPurpose(purposeId);
      const project = await createProject(
        {
          title: sample ? '샘플 체험 (합성 이미지)' : title.trim() || `${CONTEXT_OPTIONS.find((o) => o.id === context)?.label} ${new Date().toLocaleDateString('ko-KR')}`,
          sourceContext: sample ? 'travel' : context,
          selectedPlatforms: [purpose.platform],
          targetPhotoCount: purpose.defaultCount,
          stylePresetId: suggestPresetForContext(sample ? 'travel' : context),
          isSample: sample,
        },
        photos,
      );
      router.replace(`/analysis/${project.id}`);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const count = picked?.accepted.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenScroll withBottomBar>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">프로젝트 이름</AppText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="예: 부산 여행, 주말 카페"
            placeholderTextColor={c.textTertiary}
            maxLength={40}
            accessibilityLabel="프로젝트 이름"
            style={[styles.input, { color: c.textPrimary, backgroundColor: c.surface, borderColor: c.borderStrong }]}
            testID="project-title"
          />
        </View>

        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">어떤 사진인가요?</AppText>
          <View style={styles.chips}>
            {CONTEXT_OPTIONS.map((o) => (
              <FilterChip key={o.id} label={o.label} selected={context === o.id} onPress={() => setContext(o.id)} role="radio" />
            ))}
          </View>
        </View>

        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">촬영 시간 사용</AppText>
              <AppText variant="secondary" tone="secondary">켜면 사진의 촬영 시간만 읽어 연속 사진 묶기와 순서 제안에 써요. 위치(GPS) 정보는 저장하지 않아요.</AppText>
            </View>
            <AppSwitch value={useCaptureTime} onValueChange={setUseCaptureTime} accessibilityLabel="촬영 시간 사용" disabled={!!picked} />
          </View>
        </Card>

        <InlineMessage
          tone="info"
          title="고른 사진만 불러와요"
          message={`OS 사진 선택기에서 직접 고른 사진만 앱이 접근해요. 권장 ${IMPORT_LIMITS.recommendedMax}장 이하, 최대 ${IMPORT_LIMITS.hardMax}장. 많을수록 분석이 오래 걸려요(기기 측정 전).`}
        />

        {picked ? (
          <Card>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="numeric">{count}장 선택됨</AppText>
              {picked.rejected.map((r) => (
                <AppText key={r.reason} variant="secondary" tone="warning">
                  {r.count}개: {REJECT_TEXT[r.reason]}
                </AppText>
              ))}
              {count > IMPORT_LIMITS.warnAbove ? (
                <InlineMessage tone="warning" message={`${count}장은 분석에 시간이 오래 걸릴 수 있어요. 중간에 멈추고 이어서 분석할 수 있어요.`} />
              ) : null}
              {count === 0 ? <AppText variant="secondary" tone="error">불러올 수 있는 사진이 없어요. 다시 선택해 주세요.</AppText> : null}
              <SecondaryButton label="다시 선택" onPress={onPick} compact />
            </View>
          </Card>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          <AppText variant="secondary" tone="secondary">사진 없이 둘러보고 싶다면</AppText>
          <SecondaryButton label="샘플 사진으로 체험하기" icon="flask-outline" onPress={() => create(true)} loading={busy === 'sample'} disabled={!!busy && busy !== 'sample'} testID="new-sample" />
          <AppText variant="caption" tone="tertiary">샘플은 앱에 포함된 합성 이미지 18장이에요. 결과는 샘플로 표시돼요.</AppText>
        </View>

        {error ? <InlineMessage tone="error" message={error} /> : null}
      </ScreenScroll>
      <BottomBar>
        {picked && count > 0 ? (
          <PrimaryButton label={`${count}장으로 분석 시작`} icon="scan-outline" onPress={() => create(false)} loading={busy === 'create'} style={{ flex: 1 }} testID="new-create" />
        ) : (
          <PrimaryButton label="사진 선택" icon="images-outline" onPress={onPick} loading={busy === 'pick'} disabled={!!busy && busy !== 'pick'} style={{ flex: 1 }} testID="new-pick" />
        )}
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderWidth: 1, borderRadius: radius.button, paddingHorizontal: spacing.md, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
