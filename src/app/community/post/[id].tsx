import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import {
  AppText, BottomSheet, DangerButton, EmptyState, FilterChip, GhostButton, InlineMessage, PrimaryButton, Row, ScreenScroll, SecondaryButton, radius, spacing, useColors,
} from '@/design-system';
import type { FeedPost } from '@/features/community/community-repository';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { HeartButton } from '@/features/community/components/HeartButton';
import { REPORT_REASONS, categoryLabel, styleLabel, type ReportReason } from '@/features/community/moderation-policy';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { useCommunitySession } from '@/hooks/use-community-session';
import { formatDate } from '@/utils/format';

function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const c = useColors();
  const { session } = useCommunitySession();
  const [post, setPost] = useState<FeedPost | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'report-post' | 'report-user' | 'block' | 'delete' | null>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    communityRepository.getPost(id).then(setPost).catch((e) => {
      setError(toUserMessage(e));
      setPost(null);
    });
  }, [id]);
  useEffect(load, [load]);

  if (post === undefined) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!post) return <EmptyState title="게시물을 볼 수 없어요" message={error ?? '삭제됐거나, 숨김 처리됐거나, 차단 관계인 계정의 게시물이에요.'} />;

  const mine = session?.userId === post.authorId;
  const requireLogin = () => {
    if (!session) {
      router.push('/community/account');
      return true;
    }
    return false;
  };

  const toggleLike = async () => {
    if (requireLogin()) return;
    const prev = post;
    setPost({ ...post, likedByMe: !post.likedByMe, likeCount: post.likeCount + (post.likedByMe ? -1 : 1) });
    try {
      if (prev.likedByMe) await communityRepository.unlike(post.id);
      else await communityRepository.like(post.id);
    } catch (e) {
      setPost(prev);
      setError(toUserMessage(e));
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (sheet === 'report-post' && reason) {
        await communityRepository.reportPost(post.id, reason);
        setNotice('신고가 접수됐어요. 운영자가 검토해요. 여러 명이 신고한 게시물은 검토 전까지 자동으로 숨겨져요.');
      } else if (sheet === 'report-user' && reason) {
        await communityRepository.reportUser(post.authorId, reason);
        setNotice('계정 신고가 접수됐어요.');
      } else if (sheet === 'block') {
        await communityRepository.block(post.authorId);
        setSheet(null);
        router.back();
        return;
      } else if (sheet === 'delete') {
        await communityRepository.deleteMyPost(post);
        setSheet(null);
        router.back();
        return;
      }
      setSheet(null);
      setReason(null);
    } catch (e) {
      setError(`${toUserMessage(e)} 다시 시도해 주세요.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenScroll>
      <View style={[styles.img, { backgroundColor: c.photoPlaceholder }]}>
        <Image source={{ uri: post.imageUrl }} placeholder={{ uri: post.thumbUrl }} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel={`${categoryLabel(post.category)} 사진`} />
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">@{post.authorHandle}</AppText>
          <AppText variant="caption" tone="tertiary">{formatDate(post.createdAt)}</AppText>
        </View>
        <HeartButton liked={post.likedByMe} count={post.likeCount} onPress={toggleLike} disabled={post.moderationStatus !== 'visible'} />
      </Row>
      <Row wrap gap={spacing.xs}>
        <FilterChip label={categoryLabel(post.category)} selected={false} onPress={() => {}} disabled />
        {post.styleTags.map((t) => <FilterChip key={t} label={styleLabel(t)} selected={false} onPress={() => {}} disabled />)}
      </Row>
      {post.moderationStatus !== 'visible' ? (
        <InlineMessage tone="warning" message={post.moderationStatus === 'pending' ? '운영자 검토 대기 중이라 다른 사람에게는 아직 보이지 않아요.' : '이 게시물은 숨김 처리됐어요.'} />
      ) : null}
      <AppText variant="caption" tone="tertiary">하트는 사진에 대한 공감 표시예요. 사람의 외모를 평가하는 점수가 아니에요.</AppText>
      {notice ? <InlineMessage tone="success" message={notice} /> : null}
      {error ? <InlineMessage tone="error" message={error} /> : null}

      {mine ? (
        <DangerButton compact label="내 게시물 삭제" icon="trash-outline" onPress={() => setSheet('delete')} />
      ) : (
        <Row gap={spacing.xs} wrap>
          <GhostButton compact label="게시물 신고" icon="flag-outline" onPress={() => !requireLogin() && setSheet('report-post')} />
          <GhostButton compact label="계정 신고" icon="person-remove-outline" onPress={() => !requireLogin() && setSheet('report-user')} />
          <GhostButton compact label="이 계정 차단" icon="ban-outline" onPress={() => !requireLogin() && setSheet('block')} />
        </Row>
      )}

      <BottomSheet
        visible={sheet != null}
        title={sheet === 'report-post' ? '게시물 신고' : sheet === 'report-user' ? '계정 신고' : sheet === 'block' ? '이 계정을 차단할까요?' : '게시물을 삭제할까요?'}
        onClose={() => { setSheet(null); setReason(null); }}>
        {sheet === 'report-post' || sheet === 'report-user' ? (
          <>
            <AppText variant="secondary" tone="secondary">사유를 하나 골라 주세요. 신고는 서버에 저장되고 운영자가 처리 상태를 관리해요.</AppText>
            <Row wrap gap={spacing.xs}>
              {REPORT_REASONS.map((r) => <FilterChip key={r.id} label={r.label} selected={reason === r.id} onPress={() => setReason(r.id)} role="radio" />)}
            </Row>
            <PrimaryButton label="신고하기" onPress={submit} disabled={!reason} loading={busy} />
          </>
        ) : sheet === 'block' ? (
          <>
            <AppText variant="body">차단하면 서로의 게시물이 피드와 상세 화면에서 즉시 보이지 않아요. 설정의 차단한 계정 메뉴에서 언제든 해제할 수 있어요.</AppText>
            <DangerButton label="차단" onPress={submit} loading={busy} />
          </>
        ) : (
          <>
            <AppText variant="body">서버에 올린 공유용 이미지와 게시물 기록, 받은 하트가 삭제돼요. 다른 사람이 이미 저장했거나 캡처한 사본은 회수할 수 없어요.</AppText>
            <DangerButton label="삭제" onPress={submit} loading={busy} />
          </>
        )}
        <SecondaryButton label="취소" onPress={() => { setSheet(null); setReason(null); }} />
      </BottomSheet>
    </ScreenScroll>
  );
}

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <CommunityGate>
      <PostDetail id={id} />
    </CommunityGate>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.photo, overflow: 'hidden' },
});
