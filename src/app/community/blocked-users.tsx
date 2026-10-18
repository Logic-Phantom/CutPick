import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import { AppText, EmptyState, ErrorState, InlineMessage, Row, ScreenScroll, SecondaryButton, radius, spacing, useColors } from '@/design-system';
import type { BlockedUser } from '@/features/community/community-repository';
import { CommunityGate } from '@/features/community/components/CommunityGate';
import { communityRepository } from '@/features/community/supabase-community-repository';
import { formatDate } from '@/utils/format';

function Blocked() {
  const c = useColors();
  const [list, setList] = useState<BlockedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    communityRepository.listBlocked().then(setList).catch((e) => setError(toUserMessage(e)));
  }, []);
  useFocusEffect(load);

  const unblock = async (u: BlockedUser) => {
    setBusy(u.userId);
    setOpError(null);
    try {
      await communityRepository.unblock(u.userId);
      setList((l) => l?.filter((x) => x.userId !== u.userId) ?? null);
    } catch (e) {
      setOpError(toUserMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!list) return <ActivityIndicator style={{ marginTop: 40 }} />;
  return (
    <ScreenScroll>
      <AppText variant="secondary" tone="secondary">차단한 계정과는 서로의 게시물이 보이지 않아요. 해제하면 다시 보여요.</AppText>
      {opError ? <InlineMessage tone="error" message={opError} /> : null}
      {list.length === 0 ? (
        <EmptyState icon="ban-outline" title="차단한 계정이 없어요" message="게시물 상세 화면에서 계정을 차단할 수 있어요." />
      ) : (
        list.map((u) => (
          <Row key={u.userId} gap={spacing.sm} style={[styles.row, { borderColor: c.border, backgroundColor: c.surface }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{u.handle ? `@${u.handle}` : '알 수 없는 계정'}</AppText>
              <AppText variant="caption" tone="tertiary">{formatDate(u.createdAt)} 차단</AppText>
            </View>
            <SecondaryButton compact label="차단 해제" onPress={() => unblock(u)} loading={busy === u.userId} />
          </Row>
        ))
      )}
    </ScreenScroll>
  );
}

export default function BlockedUsersScreen() {
  return (
    <CommunityGate requireAuth>
      <Blocked />
    </CommunityGate>
  );
}

const styles = StyleSheet.create({
  row: { padding: spacing.sm, borderRadius: radius.card, borderWidth: 1 },
});
