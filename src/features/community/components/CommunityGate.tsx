import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';

import { EmptyState } from '@/design-system';
import { useCommunitySession } from '@/hooks/use-community-session';

/**
 * Renders children only when the backend is configured (and, if required, the user is signed in).
 * Never shows a fake feed when the backend is missing.
 */
export function CommunityGate({ children, requireAuth }: { children: ReactNode; requireAuth?: boolean }) {
  const router = useRouter();
  const { configured, session, loading } = useCommunitySession();
  if (!configured) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="커뮤니티 서버가 연결되지 않았어요"
        message="이 빌드에는 커뮤니티 백엔드 설정이 없어요. 사진 선택·분석·추천·저장은 서버 없이 그대로 사용할 수 있어요."
      />
    );
  }
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (requireAuth && !session) {
    return (
      <EmptyState
        icon="person-circle-outline"
        title="로그인이 필요해요"
        message="게시·공감·신고·차단은 커뮤니티 계정으로 로그인한 뒤 이용할 수 있어요."
        actionLabel="로그인하기"
        onAction={() => router.push('/community/account')}
      />
    );
  }
  return <>{children}</>;
}
