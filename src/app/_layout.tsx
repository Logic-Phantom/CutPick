import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { darkColors, lightColors } from '@/design-system';
import { needsOnboarding } from '@/features/onboarding/preference-schema';
import { AppStateProvider, useAppState } from '@/hooks/app-state';

SplashScreen.preventAutoHideAsync().catch(() => {});

function OnboardingGate() {
  const { ready, preference } = useAppState();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    const inOnboarding = segments[0] === 'onboarding';
    if (needsOnboarding(preference) && !inOnboarding) router.replace('/onboarding');
  }, [ready, preference, segments, router]);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? darkColors : lightColors;
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ ...navTheme, colors: { ...navTheme.colors, background: c.background, card: c.surface, text: c.textPrimary, primary: c.accent, border: c.border } }}>
        <AppStateProvider>
          <OnboardingGate />
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerBackButtonDisplayMode: 'minimal',
              headerStyle: { backgroundColor: c.background },
              headerTintColor: c.textPrimary,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: c.background },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '홈' }} />
            <Stack.Screen name="onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="onboarding/edit" options={{ title: '취향 수정' }} />
            <Stack.Screen name="project/new" options={{ title: '새 프로젝트' }} />
            <Stack.Screen name="project/[id]" options={{ title: '프로젝트' }} />
            <Stack.Screen name="analysis/[id]" options={{ title: '사진 분석' }} />
            <Stack.Screen name="recommendations/[id]" options={{ title: '추천 결과' }} />
            <Stack.Screen name="export/[id]" options={{ title: '저장·공유' }} />
            <Stack.Screen name="photo/[id]" options={{ title: '사진 상세', presentation: 'modal' }} />
            <Stack.Screen name="community/publish" options={{ title: '커뮤니티에 공개', presentation: 'modal' }} />
            <Stack.Screen name="community/post/[id]" options={{ title: '게시물' }} />
            <Stack.Screen name="community/my-posts" options={{ title: '내 게시물' }} />
            <Stack.Screen name="community/blocked-users" options={{ title: '차단한 계정' }} />
            <Stack.Screen name="community/account" options={{ title: '커뮤니티 계정' }} />
            <Stack.Screen name="legal/[doc]" options={{ title: '정책' }} />
          </Stack>
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
