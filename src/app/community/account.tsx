import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import { AppText, BottomSheet, Card, Checkbox, DangerButton, InlineMessage, PrimaryButton, ScreenScroll, SecondaryButton, fonts, radius, spacing, useColors } from '@/design-system';
import type { CommunityProfile } from '@/features/community/community-repository';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '@/features/community/social-auth';
import { validateHandle } from '@/features/community/moderation-policy';
import { COMMUNITY_MIN_AGE } from '@/features/legal/policy-texts';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { useCommunitySession } from '@/hooks/use-community-session';

function Field(props: React.ComponentProps<typeof TextInput>) {
  const c = useColors();
  return <TextInput placeholderTextColor={c.textTertiary} {...props} style={[styles.input, { color: c.textPrimary, borderColor: c.borderStrong, backgroundColor: c.surface }]} />;
}

/**
 * Brand-colored sign-in buttons, text only (no logos bundled). Kakao: container #FEE500 with
 * 85% black label per Kakao's login button guide; Google: neutral white/outlined button.
 */
function SocialButton({ provider, label, onPress, loading, disabled }: { provider: SocialProviderId; label: string; onPress: () => void; loading: boolean; disabled: boolean }) {
  const c = useColors();
  const kakao = provider === 'kakao';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={`social-${provider}`}
      style={({ pressed }) => [
        styles.social,
        kakao ? { backgroundColor: '#FEE500', borderColor: '#FEE500' } : { backgroundColor: '#FFFFFF', borderColor: c.borderStrong },
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {loading ? <ActivityIndicator color="#191919" /> : <AppText variant="bodyStrong" style={{ color: kakao ? 'rgba(0,0,0,0.85)' : '#1F1F1F' }}>{label}</AppText>}
    </Pressable>
  );
}

function Account() {
  const router = useRouter();
  const { session } = useCommunitySession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [profile, setProfile] = useState<CommunityProfile | null | undefined>(undefined);
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [socialProviders, setSocialProviders] = useState<SocialProviderId[]>([]);
  const [ageConsent, setAgeConsent] = useState(false);

  // Buttons appear only for providers switched on in the Supabase dashboard.
  useEffect(() => {
    if (session) return;
    communityRepository.listSocialProviders().then(setSocialProviders).catch(() => setSocialProviders([]));
  }, [session]);

  useEffect(() => {
    if (!session) return; // signed-out UI does not read `profile`
    communityRepository.getMyProfile().then((p) => {
      setProfile(p);
      if (p) setHandle(p.handle);
    }).catch((e) => setError(toUserMessage(e)));
  }, [session]);

  const wrap = (key: string, fn: () => Promise<void>) => async () => {
    setBusy(key);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (!session) {
    return (
      <ScreenScroll>
        <Checkbox
          checked={ageConsent}
          label={`만 ${COMMUNITY_MIN_AGE}세 이상이며, 이용약관과 개인정보 처리방침(일본 서버로의 국외 이전 포함)에 동의해요.`}
          onPress={() => setAgeConsent(!ageConsent)}
          testID="account-age-consent"
        />
        {!ageConsent ? <AppText variant="caption" tone="tertiary">만 {COMMUNITY_MIN_AGE}세 미만은 커뮤니티 계정을 만들 수 없어요. 사진 분석·추천은 로그인 없이 그대로 쓸 수 있어요.</AppText> : null}
        {socialProviders.length ? (
          <View style={{ gap: spacing.xs }}>
            {SOCIAL_PROVIDERS.filter((p) => socialProviders.includes(p.id)).map((p) => (
              <SocialButton
                key={p.id}
                provider={p.id}
                label={p.label}
                loading={busy === p.id}
                disabled={!ageConsent || (!!busy && busy !== p.id)}
                onPress={wrap(p.id, async () => { await communityRepository.signInWithProvider(p.id); })}
              />
            ))}
            <AppText variant="caption" tone="tertiary" align="center">또는 이메일로</AppText>
          </View>
        ) : null}
        <AppText variant="body" tone="secondary">이메일로 받은 인증 코드로 로그인해요. 비밀번호는 쓰지 않아요. 계정은 커뮤니티 기능에만 쓰여요.</AppText>
        <Field value={email} onChangeText={setEmail} placeholder="이메일" keyboardType="email-address" autoCapitalize="none" autoComplete="email" accessibilityLabel="이메일" />
        {codeSent ? (
          <>
            <Field value={code} onChangeText={setCode} placeholder="인증 코드" keyboardType="number-pad" autoComplete="one-time-code" accessibilityLabel="인증 코드" maxLength={10} />
            <PrimaryButton label="확인" onPress={wrap('verify', async () => { await communityRepository.verifyEmailCode(email, code); })} loading={busy === 'verify'} disabled={code.trim().length < 6} />
            <SecondaryButton label="코드 다시 받기" onPress={wrap('send', async () => { await communityRepository.sendEmailCode(email); setInfo('코드를 다시 보냈어요.'); })} loading={busy === 'send'} compact />
          </>
        ) : (
          <PrimaryButton label="인증 코드 받기" onPress={wrap('send', async () => { await communityRepository.sendEmailCode(email); setCodeSent(true); setInfo('메일로 받은 코드를 입력해 주세요.'); })} loading={busy === 'send'} disabled={!ageConsent || !/^\S+@\S+\.\S+$/.test(email)} />
        )}
        {info ? <InlineMessage tone="info" message={info} /> : null}
        {error ? <InlineMessage tone="error" message={error} /> : null}
        <SecondaryButton compact label="이용약관" onPress={() => router.push('/legal/terms')} />
        <SecondaryButton compact label="개인정보 처리방침" onPress={() => router.push('/legal/privacy')} />
      </ScreenScroll>
    );
  }

  const handleError = handle ? validateHandle(handle) : null;

  return (
    <ScreenScroll>
      <Card>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">공개 핸들</AppText>
          <AppText variant="secondary" tone="secondary">게시물에 @핸들만 표시돼요. 실명이나 이메일은 공개되지 않아요.</AppText>
          <Field value={handle} onChangeText={(t) => setHandle(t.toLowerCase())} placeholder="예: my.cuts" autoCapitalize="none" accessibilityLabel="공개 핸들" maxLength={20} />
          {handleError ? <AppText variant="caption" tone="error">{handleError}</AppText> : null}
          <PrimaryButton
            label={profile ? '핸들 저장' : '프로필 만들기'}
            onPress={wrap('profile', async () => { const p = await communityRepository.upsertMyProfile(handle, null); setProfile(p); setInfo('저장했어요.'); })}
            loading={busy === 'profile'}
            disabled={!handle || !!handleError}
            compact
          />
          {profile === null ? <InlineMessage tone="info" message="게시하려면 먼저 핸들을 만들어 주세요." /> : null}
        </View>
      </Card>
      {info ? <InlineMessage tone="success" message={info} /> : null}
      {error ? <InlineMessage tone="error" message={error} /> : null}
      <SecondaryButton label="내 게시물" onPress={() => router.push('/community/my-posts')} compact />
      <SecondaryButton label="차단한 계정" onPress={() => router.push('/community/blocked-users')} compact />
      <SecondaryButton label="로그아웃" onPress={wrap('logout', () => communityRepository.signOut())} loading={busy === 'logout'} compact />
      <DangerButton label="계정 삭제" icon="trash-outline" onPress={() => setConfirmDelete(true)} compact />

      <BottomSheet visible={confirmDelete} title="계정을 삭제할까요?" onClose={() => setConfirmDelete(false)}>
        <AppText variant="body">서버에 올린 모든 공유 이미지, 게시물, 하트, 차단 기록, 프로필, 로그인 계정이 삭제돼요. 내가 낸 신고는 작성자 정보 없이 운영 기록으로만 남아요. 기기 안의 프로젝트와 사진은 그대로예요.</AppText>
        <DangerButton
          label="영구 삭제"
          onPress={wrap('delete', async () => {
            await communityRepository.deleteAccount();
            setConfirmDelete(false);
            router.back();
          })}
          loading={busy === 'delete'}
        />
        {error ? <InlineMessage tone="error" message={`${error} 일부만 삭제됐다면 다시 시도하면 이어서 정리돼요.`} /> : null}
        <SecondaryButton label="취소" onPress={() => setConfirmDelete(false)} />
      </BottomSheet>
    </ScreenScroll>
  );
}

export default function AccountScreen() {
  return (
    <CommunityGate>
      <Account />
    </CommunityGate>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderWidth: 1, borderRadius: radius.button, paddingHorizontal: spacing.md, fontSize: 16, fontFamily: fonts.regular },
  social: { minHeight: 48, borderWidth: 1, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
});
