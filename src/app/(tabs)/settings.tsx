import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppSwitch, AppText, BottomSheet, BrandWordmark, Card, DangerButton, Divider, InlineMessage, ListRow, Row, ScreenScroll, SecondaryButton, SectionHeader, radius, spacing, useColors, type IconName,
} from '@/design-system';
import { HEURISTIC_CAPABILITIES } from '@/features/image-analysis/heuristic-provider';
import { CapabilityList } from '@/features/image-analysis/components/CapabilityList';
import { clearLearning, resetPreference } from '@/features/onboarding/local-preference-repository';
import { pickedChoiceCards } from '@/features/onboarding/choice-cards';
import { ONBOARDING_STEPS, selectedFor } from '@/features/onboarding/preference-schema';
import { getStyleCard } from '@/features/onboarding/style-cards';
import { describeLearned, emptyLearnedWeights } from '@/features/preferences/personalization';
import { STYLE_TAG_META } from '@/features/preferences/taste-profile';
import { deleteAllProjects } from '@/features/project-library/project-repository';
import { useAppState } from '@/hooks/app-state';
import { useCommunitySession } from '@/hooks/use-community-session';
import { wipeAllLocalData } from '@/infrastructure/database/db';
import { deleteAllAppFiles, derivedStorageBytes } from '@/infrastructure/file-storage/app-files';
import { formatBytes } from '@/utils/format';

function LinkRow({ icon, label, href }: { icon: IconName; label: string; href: Href }) {
  const router = useRouter();
  return <ListRow icon={icon} label={label} onPress={() => router.push(href)} />;
}

const THUMB = 48;
const MAX_THUMBS = 5;
const SUMMARY_MAX = 6;

type Confirm = 'projects' | 'all' | 'taste' | 'learning' | null;

export default function SettingsScreen() {
  const router = useRouter();
  const c = useColors();
  const { preference, learned, updatePreference, reload, setLearned } = useAppState();
  const { configured, session } = useCommunitySession();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [done, setDone] = useState<string | null>(null);
  const [bytes, setBytes] = useState(0);

  useFocusEffect(useCallback(() => setBytes(derivedStorageBytes()), []));

  const pickedCards = [
    ...preference.styleCardIds.map(getStyleCard).filter((x): x is NonNullable<typeof x> => !!x).map((x) => ({ key: x.id, title: x.title, source: x.source })),
    ...pickedChoiceCards(preference).map((x) => ({ key: `${x.stepId}-${x.optionId}`, title: x.title, source: x.source })),
  ];
  const styleLabels = preference.styleTags.map((t) => STYLE_TAG_META[t].label);
  const chipLabels = ONBOARDING_STEPS.flatMap((s) => selectedFor(s, preference).map((v) => s.options.find((o) => o.id === v)?.label).filter(Boolean) as string[]);
  const tasteSummary = [...new Set([...styleLabels, ...chipLabels])];
  // Keep the card short: picked styles first; other answers collapse into a count.
  const mainLabels = styleLabels.length ? styleLabels : chipLabels.slice(0, SUMMARY_MAX);
  const extraAnswers = tasteSummary.length - mainLabels.length;

  const run = async () => {
    const what = confirm;
    setConfirm(null);
    if (what === 'projects') {
      await deleteAllProjects();
      setDone('모든 프로젝트와 썸네일·내보내기 파일을 삭제했어요. 원본 사진은 그대로예요.');
    } else if (what === 'all') {
      await deleteAllProjects();
      deleteAllAppFiles();
      await wipeAllLocalData();
      await reload();
      setDone('이 기기의 CutPick 데이터를 모두 삭제했어요.');
      router.replace('/onboarding');
      return;
    } else if (what === 'taste') {
      await resetPreference();
      await reload();
      setDone('취향 선택을 초기화했어요.');
    } else if (what === 'learning') {
      await clearLearning();
      setLearned(emptyLearnedWeights());
      setDone('학습 기록을 삭제했어요.');
    }
    setBytes(derivedStorageBytes());
  };

  const CONFIRM_TEXT: Record<Exclude<Confirm, null>, { title: string; body: string }> = {
    projects: { title: '모든 프로젝트 삭제', body: '프로젝트, 분석 기록, 썸네일, 내보내기 파일이 삭제돼요. 사진 앱의 원본 사진은 삭제되지 않아요.' },
    all: { title: '모든 로컬 데이터 삭제', body: '프로젝트, 취향, 학습 기록, 설정이 모두 삭제되고 첫 화면으로 돌아가요. 원본 사진과 커뮤니티 게시물은 영향받지 않아요.' },
    taste: { title: '취향 초기화', body: '고른 사진 취향과 온보딩 답변이 모두 지워지고, 추천에 더 이상 반영되지 않아요. 개인화 스위치와 학습 기록은 그대로예요.' },
    learning: { title: '학습 기록 삭제', body: '유지·제외·고정 기록과 학습된 가중치를 지워요.' },
  };

  return (
    <ScreenScroll topInset>
      <AppText variant="screenTitle">설정</AppText>
      {done ? <InlineMessage tone="success" message={done} /> : null}

      <View>
        <SectionHeader title="내 취향" subtitle="기기 안에만 저장되고 추천 순서에 반영돼요." />
        <Card>
          <View style={{ gap: spacing.sm }}>
            {pickedCards.length ? (
              <View style={styles.thumbs} accessible accessibilityLabel={`고른 사진 취향 ${pickedCards.length}개: ${pickedCards.map((p) => p.title).join(', ')}`}>
                {pickedCards.slice(0, MAX_THUMBS).map((p) => (
                  <Image key={p.key} source={p.source} style={[styles.thumb, { backgroundColor: c.photoPlaceholder }]} contentFit="cover" />
                ))}
                {pickedCards.length > MAX_THUMBS ? (
                  <View style={[styles.thumb, styles.more, { backgroundColor: c.surfaceSunken }]}>
                    <AppText variant="label" tone="secondary">+{pickedCards.length - MAX_THUMBS}</AppText>
                  </View>
                ) : null}
              </View>
            ) : null}
            <AppText variant="body" tone={tasteSummary.length ? 'primary' : 'secondary'}>
              {tasteSummary.length ? mainLabels.join(' · ') : preference.onboardingSkipped ? '취향 설정을 건너뛰었어요. 사진 몇 장만 고르면 추천에 반영돼요.' : '선택한 취향이 없어요.'}
            </AppText>
            {extraAnswers > 0 ? <AppText variant="caption" tone="tertiary">그 밖의 답변 {extraAnswers}개 · 취향 수정에서 볼 수 있어요</AppText> : null}
            <Row gap={spacing.xs} wrap>
              <SecondaryButton compact label={tasteSummary.length ? '취향 수정' : '취향 설정하기'} icon="create-outline" onPress={() => router.push('/onboarding/edit')} testID="settings-edit-taste" />
              <SecondaryButton compact label="초기화" onPress={() => setConfirm('taste')} disabled={!tasteSummary.length} />
            </Row>
          </View>
        </Card>
      </View>

      <View>
        <SectionHeader title="개인화" />
        <Card>
          <View style={{ gap: spacing.sm }}>
            <Row gap={spacing.sm}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">사용 기록으로 개인화</AppText>
                <AppText variant="secondary" tone="secondary">추천에서 직접 유지·제외·고정한 사진의 밝기·색 경향만 반영해요. 커뮤니티 하트는 쓰지 않아요.</AppText>
              </View>
              <AppSwitch value={preference.personalizationEnabled} onValueChange={(v) => updatePreference({ personalizationEnabled: v })} accessibilityLabel="사용 기록으로 개인화" />
            </Row>
            <Divider />
            {describeLearned(learned).map((l) => <AppText key={l} variant="secondary" tone="secondary">· {l}</AppText>)}
            <SecondaryButton compact label="학습 기록 삭제" onPress={() => setConfirm('learning')} disabled={learned.eventCount === 0} style={{ alignSelf: 'flex-start' }} />
          </View>
        </Card>
      </View>

      <View>
        <SectionHeader title="데이터 관리" />
        <Card>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="secondary" tone="secondary">앱이 만든 썸네일·내보내기 파일: {formatBytes(bytes)}</AppText>
            <DangerButton compact label="모든 프로젝트 삭제" onPress={() => setConfirm('projects')} />
            <DangerButton compact label="모든 로컬 데이터 삭제" onPress={() => setConfirm('all')} testID="settings-wipe" />
          </View>
        </Card>
      </View>

      <View>
        <SectionHeader title="커뮤니티" />
        <Card padded={false}>
          {configured ? (
            <>
              <LinkRow icon="person-circle-outline" label={session ? '커뮤니티 계정' : '커뮤니티 로그인'} href="/community/account" />
              {session ? <LinkRow icon="images-outline" label="내 게시물" href="/community/my-posts" /> : null}
              {session ? <LinkRow icon="ban-outline" label="차단한 계정" href="/community/blocked-users" /> : null}
            </>
          ) : (
            <View style={{ padding: spacing.md }}>
              <AppText variant="secondary" tone="secondary">이 빌드에는 커뮤니티 서버가 설정되지 않았어요. 로컬 기능은 모두 사용할 수 있어요.</AppText>
            </View>
          )}
          <LinkRow icon="people-outline" label="커뮤니티 가이드라인" href="/legal/guidelines" />
        </Card>
      </View>

      <View>
        <SectionHeader title="정보" />
        <Card padded={false}>
          <LinkRow icon="shield-checkmark-outline" label="개인정보 처리방침" href="/legal/privacy" />
          <Divider inset={spacing.md + 20 + spacing.sm} />
          <LinkRow icon="document-text-outline" label="이용약관" href="/legal/terms" />
          <Divider inset={spacing.md + 20 + spacing.sm} />
          <LinkRow icon="image-outline" label="이미지 출처" href="/legal/image-credits" />
        </Card>
      </View>

      <Card>
        <CapabilityList caps={HEURISTIC_CAPABILITIES} />
      </Card>
      <View style={styles.footer}>
        <BrandWordmark size={18} />
        <AppText variant="caption" tone="tertiary">{Constants.expoConfig?.version ?? ''} · 오픈소스 라이선스: THIRD_PARTY_NOTICES.md</AppText>
      </View>

      <BottomSheet visible={confirm != null} title={confirm ? CONFIRM_TEXT[confirm].title : ''} onClose={() => setConfirm(null)}>
        <AppText variant="body">{confirm ? CONFIRM_TEXT[confirm].body : ''}</AppText>
        <DangerButton label="삭제" onPress={run} testID="settings-confirm" />
        <SecondaryButton label="취소" onPress={() => setConfirm(null)} />
      </BottomSheet>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  thumbs: { flexDirection: 'row', gap: spacing.xxs, flexWrap: 'wrap' },
  thumb: { width: THUMB, height: THUMB * 1.25, borderRadius: radius.photo, overflow: 'hidden' },
  more: { alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
});
