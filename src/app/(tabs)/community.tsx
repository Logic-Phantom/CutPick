import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toUserMessage } from '@/domain/errors';
import { AppText, EmptyState, ErrorState, FilterChip, GhostButton, Row, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import type { FeedPost } from '@/features/community/community-repository';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { HeartButton } from '@/features/community/components/HeartButton';
import { COMMUNITY_LIMITS, POST_CATEGORIES, categoryLabel, type PostCategory } from '@/features/community/moderation-policy';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { useCommunitySession } from '@/hooks/use-community-session';

function Feed() {
  const router = useRouter();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { session } = useCommunitySession();
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ended, setEnded] = useState(false);

  const load = useCallback(async (cat: PostCategory | null) => {
    setError(null);
    try {
      const list = await communityRepository.listFeed({ category: cat, limit: COMMUNITY_LIMITS.feedPageSize });
      setPosts(list);
      setEnded(list.length < COMMUNITY_LIMITS.feedPageSize);
    } catch (e) {
      setError(toUserMessage(e));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(category);
    }, [load, category]),
  );

  const loadMore = async () => {
    if (!posts?.length || ended || loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await communityRepository.listFeed({ category, before: posts[posts.length - 1].createdAt, limit: COMMUNITY_LIMITS.feedPageSize });
      setPosts([...posts, ...more]);
      setEnded(more.length < COMMUNITY_LIMITS.feedPageSize);
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = async (p: FeedPost) => {
    if (!session) {
      router.push('/community/account');
      return;
    }
    const optimistic = { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) };
    setPosts((list) => list?.map((x) => (x.id === p.id ? optimistic : x)) ?? null);
    try {
      if (p.likedByMe) await communityRepository.unlike(p.id);
      else await communityRepository.like(p.id);
    } catch (e) {
      setPosts((list) => list?.map((x) => (x.id === p.id ? p : x)) ?? null);
      setError(toUserMessage(e));
    }
  };

  const cols = width >= 700 ? 3 : 2;
  const tile = (width - spacing.md * 2 - spacing.xs * (cols - 1)) / cols;

  return (
    <FlatList
      data={posts ?? []}
      keyExtractor={(p) => p.id}
      numColumns={cols}
      key={cols}
      columnWrapperStyle={{ gap: spacing.xs }}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(category); setRefreshing(false); }} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <View style={{ gap: spacing.sm, marginBottom: spacing.xs }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            <FilterChip label="전체" selected={category == null} onPress={() => setCategory(null)} role="radio" />
            {POST_CATEGORIES.map((cat) => (
              <FilterChip key={cat.id} label={cat.label} selected={category === cat.id} onPress={() => setCategory(cat.id)} role="radio" />
            ))}
          </ScrollView>
          {error ? <ErrorState message={error} onRetry={() => load(category)} /> : null}
        </View>
      }
      ListEmptyComponent={
        posts == null && !error ? (
          <ActivityIndicator style={{ marginTop: spacing.xl }} />
        ) : !error ? (
          <EmptyState title="아직 게시물이 없어요" message="추천 결과의 저장·공유 화면에서 마음에 드는 사진을 공개할 수 있어요." />
        ) : undefined
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : undefined}
      renderItem={({ item }) => (
        <View style={{ width: tile, gap: spacing.xxs }}>
          <Pressable onPress={() => router.push(`/community/post/${item.id}`)} accessibilityRole="button" accessibilityLabel={`${item.authorHandle}의 ${categoryLabel(item.category)} 사진, 공감 ${item.likeCount}개. 탭하면 상세 보기`}>
            <View style={[styles.img, { width: tile, height: tile * 1.25, backgroundColor: c.photoPlaceholder }]}>
              <Image source={{ uri: item.thumbUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
            </View>
          </Pressable>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" numberOfLines={1}>@{item.authorHandle}</AppText>
              <AppText variant="caption" tone="tertiary">{categoryLabel(item.category)}</AppText>
            </View>
            <HeartButton liked={item.likedByMe} count={item.likeCount} onPress={() => toggleLike(item)} />
          </Row>
        </View>
      )}
    />
  );
}

export default function CommunityTab() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { session, configured } = useCommunitySession();
  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingTop: insets.top + spacing.md }}>
      <View style={{ paddingHorizontal: spacing.md, gap: spacing.xxs, marginBottom: spacing.sm }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText variant="screenTitle">커뮤니티</AppText>
          {configured ? (
            session ? <SecondaryButton compact label="내 게시물" onPress={() => router.push('/community/my-posts')} /> : <GhostButton compact label="로그인" onPress={() => router.push('/community/account')} />
          ) : null}
        </Row>
        <AppText variant="secondary" tone="secondary">사진에 하트로 공감하는 곳이에요. 댓글·DM·외모 평가·순위는 없어요.</AppText>
      </View>
      <CommunityGate>
        <Feed />
      </CommunityGate>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { borderRadius: radius.photo, overflow: 'hidden' },
});
