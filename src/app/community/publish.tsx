import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import type { PhotoAsset } from '@/domain/models';
import { AppText, BottomBar, Card, FilterChip, InlineMessage, PrimaryButton, Row, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { COMMUNITY_LIMITS, POST_CATEGORIES, STYLE_TAGS, type PostCategory, type StyleTag } from '@/features/community/moderation-policy';
import { publishPhoto } from '@/features/community/post-service';
import { getPhoto } from '@/features/project-library/project-repository';

const CONSENTS = [
  { id: 'public', text: '이 사진은 CutPick 커뮤니티의 다른 사용자에게 공개돼요.' },
  { id: 'copy', text: '공개된 사진은 다른 사람이 저장하거나 캡처할 수 있고, 삭제해도 완전히 회수되지 않을 수 있어요.' },
  { id: 'rights', text: '내가 찍었거나 올릴 권리가 있는 사진이며, 사진 속 다른 사람의 동의를 받았어요.' },
  { id: 'rules', text: '노출·혐오·타인 개인정보가 담긴 사진은 올리지 않아요. 위반 시 숨김·계정 제한될 수 있어요.' },
] as const;

function Checkbox({ checked, label, onPress }: { checked: boolean; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} style={styles.check}>
      <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={24} color={checked ? c.accent : c.textSecondary} />
      <AppText variant="secondary" style={{ flex: 1 }}>{label}</AppText>
    </Pressable>
  );
}

function PublishForm({ photoId }: { photoId: string }) {
  const router = useRouter();
  const c = useColors();
  const [photo, setPhoto] = useState<PhotoAsset | null>(null);
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [tags, setTags] = useState<StyleTag[]>([]);
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | 'pending' | 'visible'>(null);

  useEffect(() => {
    getPhoto(photoId).then(setPhoto).catch(() => setPhoto(null));
  }, [photoId]);

  const allAgreed = CONSENTS.every((x) => agreed[x.id]);
  const toggleTag = (t: StyleTag) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : tags.length >= COMMUNITY_LIMITS.maxStyleTags ? tags : [...tags, t]);

  const publish = async () => {
    if (!photo || !category) return;
    setBusy(true);
    setError(null);
    try {
      const post = await publishPhoto(photo, category, tags);
      setDone(post.moderationStatus === 'visible' ? 'visible' : 'pending');
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <ScreenScroll>
        <InlineMessage
          tone="success"
          title="게시했어요"
          message={done === 'pending' ? '운영자 검토 후 피드에 보여요. 내 게시물에서 상태를 확인하거나 삭제할 수 있어요.' : '피드에 공개됐어요.'}
        />
        <PrimaryButton label="내 게시물 보기" onPress={() => router.replace('/community/my-posts')} />
        {router.canGoBack() ? <SecondaryButton label="추천 결과로 돌아가기" icon="arrow-back" onPress={() => router.back()} /> : null}
      </ScreenScroll>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenScroll withBottomBar>
        <View style={[styles.preview, { backgroundColor: c.photoPlaceholder }]}>
          {photo?.thumbnailUri ? <Image source={{ uri: photo.thumbnailUri }} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
        </View>
        <Card>
          <View style={{ gap: spacing.xxs }}>
            <AppText variant="bodyStrong">업로드되는 것</AppText>
            <AppText variant="secondary">· 이 사진 한 장의 공유용 사본 (긴 변 {COMMUNITY_LIMITS.imageMaxSide}px JPEG)과 작은 미리보기</AppText>
            <AppText variant="secondary">· 고른 카테고리와 스타일 태그</AppText>
            <AppText variant="bodyStrong" style={{ marginTop: spacing.xs }}>업로드되지 않는 것</AppText>
            <AppText variant="secondary">· 원본 파일, 위치(GPS)·촬영기기 등 EXIF 정보, 프로젝트의 다른 사진, 분석 기록, 취향 정보</AppText>
            <AppText variant="bodyStrong" style={{ marginTop: spacing.xs }}>공개 후</AppText>
            <AppText variant="secondary">· 운영자 검토가 끝나면 피드에 최신순으로 보여요. 검토 중에는 나만 볼 수 있어요.</AppText>
            <AppText variant="secondary">· 내 게시물에서 언제든 삭제할 수 있어요. 받은 하트도 함께 지워져요.</AppText>
          </View>
        </Card>

        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">카테고리</AppText>
          <Row wrap gap={spacing.xs}>
            {POST_CATEGORIES.map((ct) => <FilterChip key={ct.id} label={ct.label} selected={category === ct.id} onPress={() => setCategory(ct.id)} role="radio" />)}
          </Row>
        </View>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">스타일 태그 (최대 {COMMUNITY_LIMITS.maxStyleTags}개, 선택)</AppText>
          <Row wrap gap={spacing.xs}>
            {STYLE_TAGS.map((t) => <FilterChip key={t.id} label={t.label} selected={tags.includes(t.id)} onPress={() => toggleTag(t.id)} />)}
          </Row>
          <AppText variant="caption" tone="tertiary">자유 문구·댓글은 지원하지 않아요.</AppText>
        </View>

        <Card>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="bodyStrong">공개 전 확인 (모두 필요)</AppText>
            {CONSENTS.map((x) => <Checkbox key={x.id} checked={!!agreed[x.id]} label={x.text} onPress={() => setAgreed({ ...agreed, [x.id]: !agreed[x.id] })} />)}
          </View>
        </Card>
        {error ? <InlineMessage tone="error" message={error} /> : null}
      </ScreenScroll>
      <BottomBar>
        <PrimaryButton label="동의하고 공개하기" icon="cloud-upload-outline" onPress={publish} disabled={!photo || !category || !allAgreed} loading={busy} style={{ flex: 1 }} testID="publish-submit" />
      </BottomBar>
    </View>
  );
}

export default function PublishScreen() {
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  return (
    <CommunityGate requireAuth>
      <PublishForm photoId={photoId} />
    </CommunityGate>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.photo, overflow: 'hidden' },
  check: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start', minHeight: 44, paddingVertical: spacing.xxs },
});
