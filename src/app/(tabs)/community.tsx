import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toUserMessage } from '@/domain/errors';
import { AppText, BrandHeader, ErrorState, FilterChip, GhostButton, InlineMessage, SecondaryButton, elevation, radius, spacing, useColors } from '@/design-system';
import type { FeedPost } from '@/features/community/community-repository';
import { HeartButton } from '@/features/community/components/HeartButton';
import { COMMUNITY_LIMITS, categoryLabel, type PostCategory } from '@/features/community/moderation-policy';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { PhotoTagPill, ShowcaseCard } from '@/features/showcase/components/ShowcaseCard';
import { SHOWCASE_FILTERS, showcaseFor } from '@/features/showcase/showcase-photos';
import { useCommunitySession } from '@/hooks/use-community-session';

function PostCard({ post, width, onOpen, onLike }: { post: FeedPost; width: number; onOpen: () => void; onLike: () => void }) {
  const c = useColors();
  return (
    <View style={[styles.card, elevation.card, { width, backgroundColor: c.surface }]}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${post.authorHandle}의 ${categoryLabel(post.category)} 사진, 공감 ${post.likeCount}개. 탭하면 상세 보기`}>
        <View style={[styles.photo, { height: width * 0.95, backgroundColor: c.photoPlaceholder }]}>
          <Image source={{ uri: post.thumbUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} />
          <View style={styles.pillSpot}>
            <PhotoTagPill label={categoryLabel(post.category)} />
          </View>
        </View>
      </Pressable>
      <View style={styles.cardFoot}>
        <View style={[styles.avatar, { backgroundColor: c.pointSoft }]}>
          <AppText variant="caption" style={{ color: c.pointText, fontWeight: '700' }}>{post.authorHandle.slice(0, 1).toUpperCase()}</AppText>
        </View>
        <AppText variant="caption" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>{post.authorHandle}</AppText>
        <HeartButton liked={post.likedByMe} count={post.likeCount} onPress={onLike} />
      </View>
    </View>
  );
}

export default function CommunityTab() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { session, configured, loading } = useCommunitySession();
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ended, setEnded] = useState(false);

  const load = useCallback(async (cat: PostCategory | null) => {
    if (!configured) return;
    setError(null);
    try {
      const list = await communityRepository.listFeed({ category: cat, limit: COMMUNITY_LIMITS.feedPageSize });
      setPosts(list);
      setEnded(list.length < COMMUNITY_LIMITS.feedPageSize);
    } catch (e) {
      setError(toUserMessage(e));
    }
  }, [configured]);

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

  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const tile = (width - spacing.md * 2 - spacing.sm * (cols - 1)) / cols;
  const samples = showcaseFor(category);
  const feedEmpty = configured && posts != null && posts.length === 0 && !error;

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.xs }}>
      <View style={styles.headRow}>
        <BrandHeader style={{ flex: 1 }} />
        {configured ? (
          session ? <SecondaryButton compact label="내 게시물" onPress={() => router.push('/community/my-posts')} /> : <GhostButton compact label="로그인" onPress={() => router.push('/community/account')} />
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
        <FilterChip label="전체" selected={category == null} onPress={() => setCategory(null)} role="radio" />
        {SHOWCASE_FILTERS.map((cat) => (
          <FilterChip key={cat.id} label={cat.label} selected={category === cat.id} onPress={() => setCategory(cat.id)} role="radio" />
        ))}
      </ScrollView>
      <AppText variant="caption" tone="tertiary">사진에 하트로 공감하는 곳이에요. 댓글·DM·외모 평가·순위는 없어요.</AppText>
      {!configured ? (
        <InlineMessage tone="info" title="커뮤니티 서버 연결 전이에요" message="지금은 CutPick이 준비한 베스트샷 샘플만 보여요. 사진 선택·분석·추천·저장은 서버 없이 그대로 쓸 수 있어요." />
      ) : null}
      {error ? <ErrorState message={error} onRetry={() => load(category)} /> : null}
      {configured && (loading || (posts == null && !error)) ? <ActivityIndicator style={{ marginTop: spacing.md }} /> : null}
      {feedEmpty ? <InlineMessage tone="info" message="아직 게시물이 없어요. 추천 결과에서 사진을 눌러 '커뮤니티에 공유'를 고르면 바로 여기에 보여요." /> : null}
    </View>
  );

  const footer = (
    <View style={{ gap: spacing.sm, marginTop: posts?.length ? spacing.lg : 0 }}>
      {loadingMore ? <ActivityIndicator /> : null}
      <View style={styles.sectionRow}>
        <Ionicons name="sparkles" size={18} color={c.point} />
        <AppText variant="sectionTitle" style={{ flex: 1 }}>CutPick 베스트샷 샘플</AppText>
        <AppText variant="caption" tone="tertiary">{samples.length}장</AppText>
      </View>
      <View style={styles.grid}>
        {samples.map((p) => (
          <ShowcaseCard key={p.id} photo={p} width={tile} onPress={() => router.push(`/showcase/${p.id}`)} />
        ))}
      </View>
      <AppText variant="caption" tone="tertiary">샘플은 소유자가 제공한 예시 사진이며 실제 사용자 게시물이 아니에요(작성자·하트 없음).</AppText>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={configured ? posts ?? [] : []}
        keyExtractor={(p) => p.id}
        numColumns={cols}
        key={cols}
        columnWrapperStyle={{ gap: spacing.sm }}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl }}
        refreshControl={configured ? <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(category); setRefreshing(false); }} /> : undefined}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item }) => <PostCard post={item} width={tile} onOpen={() => router.push(`/community/post/${item.id}`)} onLike={() => toggleLike(item)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { borderRadius: radius.tile },
  photo: { borderTopLeftRadius: radius.tile, borderTopRightRadius: radius.tile, overflow: 'hidden' },
  pillSpot: { position: 'absolute', left: spacing.xs, bottom: spacing.xs },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingLeft: spacing.sm, paddingRight: spacing.xxs, paddingVertical: spacing.xxs },
  avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
