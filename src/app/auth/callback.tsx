import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { toUserMessage } from '@/domain/errors';
import { ErrorState, spacing, useColors } from '@/design-system';
import { communityRepository } from '@/features/community/supabase-community-repository';

/**
 * Landing route for `cutpick://auth/callback` when the OAuth redirect opens the app directly instead
 * of returning to the browser auth session (can happen on Android). Finishes the sign-in, then
 * goes to the community account screen.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const c = useColors();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string')).toString();
    communityRepository
      .completeOAuthRedirect(`?${query}`)
      .then(() => router.replace('/community/account'))
      .catch((e) => setError(toUserMessage(e)));
    // params are read once on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.md, backgroundColor: c.background }}>
      {error ? <ErrorState message={error} onRetry={() => router.replace('/community/account')} /> : <ActivityIndicator />}
    </View>
  );
}
