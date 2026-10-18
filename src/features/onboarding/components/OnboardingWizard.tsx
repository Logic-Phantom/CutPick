import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { UserPreference } from '@/domain/models';
import { AppText, BottomBar, Card, FilterChip, GhostButton, InlineMessage, PrimaryButton, Row, ScreenScroll, SecondaryButton, spacing, tapFeedback, useColors } from '@/design-system';
import { useAppState } from '@/hooks/app-state';

import { ONBOARDING_STEPS, type OnboardingStep } from '../preference-schema';

type Mode = 'first-run' | 'edit';

function selectedFor(step: OnboardingStep, pref: UserPreference): string[] {
  if (step.id === 'retouch') return pref.preferredFilterStrength ? [pref.preferredFilterStrength] : [];
  return pref[step.id];
}

function patchFor(step: OnboardingStep, values: string[]): Partial<UserPreference> {
  if (step.id === 'retouch') return { preferredFilterStrength: (values[0] as UserPreference['preferredFilterStrength']) ?? null };
  return { [step.id]: values } as Partial<UserPreference>;
}

/**
 * Short preference wizard: one topic per screen, every step skippable, saved after each step
 * so quitting midway keeps earlier answers. No photo upload is required.
 */
export function OnboardingWizard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const c = useColors();
  const { preference, updatePreference } = useAppState();
  const totalSteps = ONBOARDING_STEPS.length + 1; // + privacy summary
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<UserPreference>(preference);
  const [saving, setSaving] = useState(false);

  const step = ONBOARDING_STEPS[index] as OnboardingStep | undefined;
  const values = useMemo(() => (step ? selectedFor(step, draft) : []), [step, draft]);

  const toggle = (id: string) => {
    if (!step) return;
    tapFeedback();
    const next = step.multi ? (values.includes(id) ? values.filter((v) => v !== id) : [...values, id]) : values[0] === id ? [] : [id];
    setDraft({ ...draft, ...patchFor(step, next) });
  };

  const finish = async (skipped: boolean) => {
    setSaving(true);
    await updatePreference({ ...draft, onboardingCompleted: !skipped || preference.onboardingCompleted, onboardingSkipped: skipped && !preference.onboardingCompleted });
    setSaving(false);
    if (mode === 'edit') router.back();
    else router.replace('/');
  };

  const goNext = async () => {
    if (saving) return; // ignore double taps while the step is being saved
    setSaving(true);
    try {
      // Persist progress after every step.
      await updatePreference({ ...draft });
    } finally {
      setSaving(false);
    }
    if (index + 1 >= totalSteps) await finish(false);
    else setIndex(index + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenScroll withBottomBar topInset={mode === 'first-run'}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="caption" tone="secondary" accessibilityLabel={`${totalSteps}단계 중 ${index + 1}단계`}>
            {index + 1} / {totalSteps}
          </AppText>
          {mode === 'first-run' ? <GhostButton compact label="전체 건너뛰기" onPress={() => finish(true)} testID="onboarding-skip-all" /> : null}
        </Row>
        <View style={[styles.progress, { backgroundColor: c.surfaceSunken }]}>
          <View style={{ width: `${((index + 1) / totalSteps) * 100}%`, height: '100%', backgroundColor: c.accent, borderRadius: 2 }} />
        </View>

        {step ? (
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xxs }}>
              <AppText variant="screenTitle">{step.title}</AppText>
              <AppText variant="body" tone="secondary">{step.subtitle}</AppText>
            </View>
            <View style={styles.chips} accessibilityRole={step.multi ? undefined : 'radiogroup'}>
              {step.options.map((o) => (
                <FilterChip key={o.id} label={o.label} selected={values.includes(o.id)} onPress={() => toggle(o.id)} role={step.multi ? 'checkbox' : 'radio'} testID={`chip-${step.id}-${o.id}`} />
              ))}
            </View>
            <AppText variant="caption" tone="tertiary">{step.multi ? '여러 개 선택 가능 · 선택하지 않아도 돼요' : '하나만 선택 · 선택하지 않아도 돼요'}</AppText>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <AppText variant="screenTitle">사진은 내 기기에만</AppText>
            <Card>
              <View style={{ gap: spacing.sm }}>
                <AppText variant="body">· 직접 고른 사진만 불러오고, 사진 보관함 전체를 훑지 않아요.</AppText>
                <AppText variant="body">· 분석은 기기 안에서 이뤄지고 원본 사진은 수정·삭제하지 않아요.</AppText>
                <AppText variant="body">· 취향과 분석 기록은 기기에만 저장되고 설정에서 언제든 지울 수 있어요.</AppText>
                <AppText variant="body">· 커뮤니티 공개는 별도 화면에서 사진마다 따로 동의를 받아요.</AppText>
              </View>
            </Card>
            <InlineMessage tone="info" message="현재 버전은 흐림·노출·대비·해상도·색 통계와 비슷한 사진 묶기를 분석해요. 얼굴·표정·눈 감김은 분석하지 않아요." />
          </View>
        )}
      </ScreenScroll>
      <BottomBar>
        <SecondaryButton label="이전" onPress={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} compact style={{ flex: 1 }} />
        {step ? <SecondaryButton label="건너뛰기" onPress={() => setIndex(index + 1)} compact style={{ flex: 1 }} /> : null}
        <PrimaryButton label={step ? '다음' : mode === 'edit' ? '저장' : '시작하기'} onPress={goNext} loading={saving} compact style={{ flex: 1.4 }} testID="onboarding-next" />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { height: 4, borderRadius: 2, overflow: 'hidden' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
