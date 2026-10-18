import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import { AppText, EmptyState, ErrorState, InlineMessage, Row, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import type { FeedPost } from '@/features/community/community-repository';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { categoryLabel } from '@/features/community/moderation-policy';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { formatDate } from '@/utils/format';

const STATUS = { pending: '검토 대기', visible: '공개 중', hidden: '숨김 처리', removed: '운영자 삭제' } as const;

function MyPosts() {
  const router = useRouter();
  const c = useColors();
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const load = useCallback(() => {
    communityRepository.listMyPosts().then(setPosts).catch((e) => setError(toUserMessage(e)));
  }, []);
  useFocusEffect(load);

  const remove = async (p: FeedPost) => {
    setDeleting(p.id);
    setFailed(null);
    try {
      await communityRepository.deleteMyPost(p);
      setPosts((list) => list?.filter((x) => x.id !== p.id) ?? null);
    } catch (e) {
      setFailed(`${toUserMessage(e)} 삭제를 다시 시도해 주세요. (일부 파일만 지워진 경우에도 재시도하면 정리돼요)`);
    } finally {
      setDeleting(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!posts) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScreenScroll>
      {failed ? <InlineMessage tone="error" message={failed} /> : null}
      {posts.length === 0 ? (
        <EmptyState title="올린 게시물이 없어요" message="저장·공유 화면에서 사진 한 장을 커뮤니티에 공개할 수 있어요." />
      ) : (
        posts.map((p) => (
          <Row key={p.id} gap={spacing.sm} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Pressable onPress={() => router.push(`/community/post/${p.id}`)} accessibilityRole="button" accessibilityLabel={`${categoryLabel(p.category)} 게시물, ${STATUS[p.moderationStatus]}, 공감 ${p.likeCount}개`}>
              <Image source={{ uri: p.thumbUrl }} style={styles.thumb} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">{categoryLabel(p.category)}</AppText>
              <AppText variant="caption" tone={p.moderationStatus === 'visible' ? 'success' : 'warning'}>{STATUS[p.moderationStatus]}</AppText>
              <AppText variant="caption" tone="tertiary">{formatDate(p.createdAt)} · 공감 {p.likeCount}</AppText>
            </View>
            <SecondaryButton compact label="삭제" onPress={() => remove(p)} loading={deleting === p.id} />
          </Row>
        ))
      )}
    </ScreenScroll>
  );
}

export default function MyPostsScreen() {
  return (
    <CommunityGate requireAuth>
      <MyPosts />
    </CommunityGate>
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.xs, borderRadius: radius.card, borderWidth: 1 },
  thumb: { width: 64, height: 80, borderRadius: radius.photo },
});
