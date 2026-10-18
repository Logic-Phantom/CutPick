import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import type { UserPreference } from '@/domain/models';
import {
  AppText, BottomBar, Card, FilterChip, GhostButton, InlineMessage, PrimaryButton, ScreenScroll, SecondaryButton, SelectablePhotoCard, StepHeader,
  contentMaxWidth, spacing, tapFeedback, useColors, type IconName,
} from '@/design-system';
import { useAppState } from '@/hooks/app-state';

import { VISUAL_STEP_CHIPS, WIZARD_STEPS, patchFor, selectedFor, stepById, styleCardsPatch, type OnboardingStep, type WizardStepId } from '../preference-schema';
import { STYLE_CATEGORIES, STYLE_SELECTION_LIMITS, cardsInCategory, selectedCountByCategory, styleSelectionStatus, toggleStyleCard, type StyleCategoryId } from '../style-cards';

type Mode = 'first-run' | 'edit';
type Category = StyleCategoryId | 'all';

const STEP_NAMES: Record<WizardStepId, string> = {
  styles: '사진 취향',
  preferredFoodAngles: '음식 각도',
  preferredPortraitAndOOTDAngles: '인물·OOTD 구도',
  retouch: '보정 정도',
  preferredPlatformPurposes: '올릴 곳',
  privacy: '개인정보',
};

const PRIVACY_POINTS: { icon: IconName; text: string }[] = [
  { icon: 'images-outline', text: '직접 고른 사진만 불러오고, 사진 보관함 전체를 훑지 않아요.' },
  { icon: 'phone-portrait-outline', text: '분석은 기기 안에서 이뤄지고 원본 사진은 수정·삭제하지 않아요.' },
  { icon: 'trash-outline', text: '취향과 분석 기록은 기기에만 저장되고 설정에서 언제든 지울 수 있어요.' },
  { icon: 'people-outline', text: '커뮤니티 공개는 별도 화면에서 사진마다 따로 동의를 받아요.' },
];

/** Values of one wizard step, used to discard a step's unsaved edits on "skip". */
function stepSnapshot(id: WizardStepId, pref: UserPreference): Partial<UserPreference> {
  if (id === 'styles') return { styleCardIds: pref.styleCardIds, styleTags: pref.styleTags, preferredComposition: pref.preferredComposition, preferredColorMood: pref.preferredColorMood, preferredSubjects: pref.preferredSubjects };
  if (id === 'privacy') return {};
  const step = stepById(id);
  return patchFor(step, selectedFor(step, pref));
}

/**
 * Taste wizard. Step 1 picks reference photos (2-column cards, category filter, 3–8 picks);
 * the remaining steps are short chip questions. Every step can be skipped, progress is saved after
 * each step, and the same component serves first run and Settings → 취향 수정.
 */
export function OnboardingWizard({ mode }: { mode: Mode }) {
  const { ready } = useAppState();
  const c = useColors();
  // The draft is seeded from the stored preference, so wait until it has loaded
  // (otherwise a restart on this route would start from defaults and overwrite saved picks).
  if (!ready) return <ActivityIndicator style={{ flex: 1, backgroundColor: c.background }} />;
  return <Wizard mode={mode} />;
}

function Wizard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { preference, updatePreference } = useAppState();
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<UserPreference>(preference);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [showMoreChips, setShowMoreChips] = useState(false);
  const [maxNotice, setMaxNotice] = useState(false);

  const total = WIZARD_STEPS.length;
  const stepId = WIZARD_STEPS[index];
  const isLast = index + 1 >= total;
  const selectedCards = draft.styleCardIds;
  const status = styleSelectionStatus(selectedCards.length);

  const toggleCard = (id: string) => {
    const res = toggleStyleCard(selectedCards, id);
    setMaxNotice(res.blocked === 'max');
    if (res.blocked) return;
    tapFeedback();
    setDraft({ ...draft, ...styleCardsPatch(res.selected) });
  };

  const toggleChip = (step: OnboardingStep, id: string) => {
    tapFeedback();
    const values = selectedFor(step, draft);
    const next = step.multi ? (values.includes(id) ? values.filter((v) => v !== id) : [...values, id]) : values[0] === id ? [] : [id];
    setDraft({ ...draft, ...patchFor(step, next) });
  };

  const leave = () => {
    if (mode === 'edit' && router.canGoBack()) router.back();
    else router.replace('/');
  };

  const finish = async (base: UserPreference, skipped: boolean) => {
    setSaving(true);
    try {
      await updatePreference({ ...base, onboardingCompleted: !skipped || preference.onboardingCompleted, onboardingSkipped: skipped && !preference.onboardingCompleted });
    } finally {
      setSaving(false);
    }
    leave();
  };

  const goTo = (next: number) => {
    setIndex(next);
    setCategory('all');
    setShowMoreChips(false);
    setMaxNotice(false);
  };

  const goNext = async () => {
    if (saving) return; // ignore double taps while the step is being saved
    if (stepId === 'styles' && !status.canContinue) return;
    if (isLast) return finish(draft, false);
    setSaving(true);
    try {
      await updatePreference({ ...draft }); // persist progress after every step
    } finally {
      setSaving(false);
    }
    goTo(index + 1);
  };

  /** Skip this step: drop its unsaved edits (keep what was saved before) and move on. */
  const skipStep = () => {
    const reverted = { ...draft, ...stepSnapshot(stepId, preference) };
    setDraft(reverted);
    if (isLast) finish(reverted, false);
    else goTo(index + 1);
  };

  /** First run only: leave the whole setup. Earlier steps stay saved; the current step's edits are dropped. */
  const skipAll = () => finish({ ...draft, ...stepSnapshot(stepId, preference) }, true);

  const gridWidth = Math.min(width, contentMaxWidth) - spacing.md * 2;
  const cardWidth = Math.floor((gridWidth - spacing.sm) / 2);
  const cards = cardsInCategory(category);
  const counts = selectedCountByCategory(selectedCards);
  const categoryMeta = STYLE_CATEGORIES.find((x) => x.id === category);
  const chipStepId = category !== 'all' ? VISUAL_STEP_CHIPS[category] : undefined;
  const chipStep = chipStepId ? stepById(chipStepId) : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenScroll key={stepId} withBottomBar={stepId === 'styles' ? 'summary' : true} topInset={mode === 'first-run'}>
        <StepHeader
          title={STEP_NAMES[stepId]}
          step={index + 1}
          total={total}
          onBack={index > 0 ? () => goTo(index - 1) : undefined}
          onSkip={mode === 'first-run' ? skipAll : undefined}
          skipTestID="onboarding-skip-all"
        />

        {stepId === 'styles' ? (
          <View style={[styles.column, { gap: spacing.md }]}>
            <View style={{ gap: spacing.xxs }}>
              <AppText variant="title">어떤 사진 분위기가 마음에 드나요?</AppText>
              <AppText variant="body" tone="secondary">
                마음에 드는 사진을 골라 주세요. 고른 스타일을 바탕으로 사진 추천 순서를 정해요. 나중에 언제든 바꿀 수 있어요.
              </AppText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="radiogroup" accessibilityLabel="카테고리">
              {STYLE_CATEGORIES.map((cat) => {
                const n = cat.id === 'all' ? selectedCards.length : counts[cat.id];
                return (
                  <FilterChip
                    key={cat.id}
                    role="radio"
                    label={n ? `${cat.label} ${n}` : cat.label}
                    selected={category === cat.id}
                    onPress={() => {
                      setCategory(cat.id);
                      setShowMoreChips(false);
                    }}
                    testID={`style-tab-${cat.id}`}
                  />
                );
              })}
            </ScrollView>
            {categoryMeta?.hint ? <AppText variant="caption" tone="tertiary">{categoryMeta.hint}</AppText> : null}

            {cards.length === 0 ? (
              <InlineMessage tone="info" message="이 카테고리에 표시할 사진이 없어요. 다른 카테고리를 골라 주세요." />
            ) : (
              <View style={styles.grid}>
                {cards.map((card) => (
                  <SelectablePhotoCard
                    key={card.id}
                    source={card.source}
                    title={card.title}
                    description={card.description}
                    selected={selectedCards.includes(card.id)}
                    onPress={() => toggleCard(card.id)}
                    width={cardWidth}
                    testID={`style-card-${card.id}`}
                  />
                ))}
              </View>
            )}

            {chipStep ? (
              <View style={{ gap: spacing.xs }}>
                <GhostButton
                  compact
                  icon={showMoreChips ? 'chevron-up' : 'chevron-down'}
                  label={showMoreChips ? '세부 취향 접기' : '사진에 없는 세부 취향 고르기 (선택)'}
                  onPress={() => setShowMoreChips(!showMoreChips)}
                  style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
                />
                {showMoreChips ? (
                  <View style={{ gap: spacing.xs }}>
                    <AppText variant="caption" tone="tertiary">{chipStep.subtitle}</AppText>
                    <View style={styles.chips}>
                      {chipStep.options.map((o) => (
                        <FilterChip key={o.id} label={o.label} selected={selectedFor(chipStep, draft).includes(o.id)} onPress={() => toggleChip(chipStep, o.id)} testID={`chip-${chipStep.id}-${o.id}`} />
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : stepId === 'privacy' ? (
          <View style={{ gap: spacing.md }}>
            <AppText variant="title">사진은 내 기기에만</AppText>
            <Card>
              <View style={{ gap: spacing.md }}>
                {PRIVACY_POINTS.map((p) => (
                  <View key={p.icon} style={styles.point}>
                    <Ionicons name={p.icon} size={20} color={c.accent} style={{ marginTop: 2 }} />
                    <AppText variant="body" style={{ flex: 1 }}>{p.text}</AppText>
                  </View>
                ))}
              </View>
            </Card>
            <InlineMessage tone="info" message="현재 버전은 흐림·노출·대비·해상도·색 통계와 비슷한 사진 묶기를 분석해요. 얼굴·표정·눈 감김은 분석하지 않아요." />
          </View>
        ) : (
          <ChipStep step={stepById(stepId)} values={selectedFor(stepById(stepId), draft)} onToggle={(id) => toggleChip(stepById(stepId), id)} />
        )}
      </ScreenScroll>

      <BottomBar
        summary={
          stepId === 'styles' ? (
            <View style={styles.summaryRow} accessible accessibilityLiveRegion="polite" accessibilityLabel={`${status.count}개 선택. ${maxNotice ? `최대 ${STYLE_SELECTION_LIMITS.max}개까지예요. 다른 사진을 고르려면 하나를 먼저 해제해 주세요.` : status.message}`}>
              <AppText variant="bodyStrong">{status.count}개 선택</AppText>
              <AppText variant="caption" tone={maxNotice ? 'warning' : status.canContinue ? 'secondary' : 'tertiary'} numberOfLines={2} style={{ flexShrink: 1 }}>
                {maxNotice ? `최대 ${STYLE_SELECTION_LIMITS.max}개 — 하나를 해제하고 골라 주세요` : status.message}
              </AppText>
            </View>
          ) : undefined
        }>
        <SecondaryButton label="넘기기" accessibilityHint="이 단계는 저장하지 않고 다음 단계로 넘어가요" onPress={skipStep} compact style={{ flex: 1 }} testID="onboarding-skip-step" />
        <PrimaryButton
          label={isLast ? (mode === 'edit' ? '저장' : '시작하기') : '계속하기'}
          onPress={goNext}
          loading={saving}
          disabled={stepId === 'styles' && !status.canContinue}
          accessibilityHint={stepId === 'styles' && !status.canContinue ? status.message : undefined}
          compact
          style={{ flex: 1.4 }}
          testID="onboarding-next"
        />
      </BottomBar>
    </View>
  );
}

function ChipStep({ step, values, onToggle }: { step: OnboardingStep; values: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xxs }}>
        <AppText variant="title">{step.title}</AppText>
        <AppText variant="body" tone="secondary">{step.subtitle}</AppText>
      </View>
      <View style={styles.chips} accessibilityRole={step.multi ? undefined : 'radiogroup'}>
        {step.options.map((o) => (
          <FilterChip key={o.id} label={o.label} selected={values.includes(o.id)} onPress={() => onToggle(o.id)} role={step.multi ? 'checkbox' : 'radio'} testID={`chip-${step.id}-${o.id}`} />
        ))}
      </View>
      <AppText variant="caption" tone="tertiary">{step.multi ? '여러 개 선택 가능 · 선택하지 않아도 돼요' : '하나만 선택 · 선택하지 않아도 돼요'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: contentMaxWidth - spacing.md * 2, alignSelf: 'center' },
  tabs: { gap: spacing.xs, paddingRight: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  // Wraps under large text so the reason for a disabled "계속하기" is never cut off.
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: spacing.xs },
});
