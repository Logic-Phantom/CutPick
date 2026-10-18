import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';

import { BRAND_NAME, BrandMark, fonts, launch, useReducedMotion } from '@/design-system';

/** Shortest time the launch screen stays up, so the intro can finish on fast starts. */
const MIN_VISIBLE_MS = 1300;
const EXIT_MS = 360;

/**
 * Launch screen shown over the app on cold start (Expo Go and dev builds show the app icon as the
 * native splash, so this is what people actually see). Deliberately quiet: the icon settles in,
 * the wordmark and tagline fade up, a thin coral line runs while loading, then everything fades
 * once the app is ready. Honors Reduce Motion (no movement, just a fade).
 */
export function LaunchOverlay({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const exit = useSharedValue(0);
  const intro = useSharedValue(reduced ? 1 : 0);
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), reduced ? 500 : MIN_VISIBLE_MS);
    if (!reduced) intro.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    return () => clearTimeout(t);
  }, [reduced, intro]);

  useEffect(() => {
    if (!ready || !minElapsed || started.current) return;
    started.current = true;
    exit.set(withTiming(1, { duration: EXIT_MS, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(() => setGone(true), EXIT_MS + 40);
    return () => clearTimeout(t);
  }, [ready, minElapsed, exit]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.get() }));

  if (gone) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} pointerEvents={ready && minElapsed ? 'none' : 'auto'} accessible accessibilityLabel={`${BRAND_NAME} 불러오는 중`} accessibilityRole="progressbar">
      <StatusBar style="light" />
      <View style={styles.stage}>
        <FadeUp intro={intro} from={0} to={0.55} distance={6} scale>
          <BrandMark size={88} />
        </FadeUp>
        <FadeUp intro={intro} from={0.25} to={0.8} distance={10}>
          <Text style={styles.wordmark} maxFontSizeMultiplier={1.2}>{BRAND_NAME}</Text>
        </FadeUp>
        <FadeUp intro={intro} from={0.45} to={1} distance={8}>
          <Text style={styles.tagline} maxFontSizeMultiplier={1.4}>고민은 줄이고, 베스트 컷만 픽</Text>
        </FadeUp>
      </View>
      <Loader reduced={reduced} />
    </Animated.View>
  );
}

/** Normalized progress of `t` within [from, to]. */
function seg(t: number, from: number, to: number): number {
  'worklet';
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

function FadeUp({ intro, from, to, distance, scale, children }: { intro: SharedValue<number>; from: number; to: number; distance: number; scale?: boolean; children: ReactNode }) {
  const anim = useAnimatedStyle(() => {
    const p = seg(intro.get(), from, to);
    return { opacity: p, transform: [{ translateY: (1 - p) * distance }, { scale: scale ? 0.94 + 0.06 * p : 1 }] };
  });
  return <Animated.View style={anim}>{children}</Animated.View>;
}

const TRACK = 96;
const BEAM = 32;

function Loader({ reduced }: { reduced: boolean }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (!reduced) x.set(withRepeat(withSequence(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }), withDelay(120, withTiming(0, { duration: 0 }))), -1, false));
  }, [reduced, x]);
  const beam = useAnimatedStyle(() => ({ transform: [{ translateX: -BEAM + x.get() * (TRACK + BEAM) }] }));
  return (
    <View style={styles.loaderWrap} pointerEvents="none">
      <View style={styles.track}>
        <Animated.View style={[styles.beam, beam]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: launch.background, zIndex: 1000, elevation: 1000, alignItems: 'center', justifyContent: 'center' },
  stage: { alignItems: 'center', gap: 14 },
  wordmark: { fontFamily: fonts.brand, fontSize: 38, lineHeight: 46, letterSpacing: -1, color: launch.text, marginTop: 8 },
  tagline: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: launch.muted, letterSpacing: 0.1 },
  loaderWrap: { position: 'absolute', bottom: 72, alignItems: 'center' },
  track: { width: TRACK, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  beam: { position: 'absolute', top: 0, bottom: 0, width: BEAM, backgroundColor: launch.point, borderRadius: 1 },
});
