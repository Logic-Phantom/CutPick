import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';

import { BRAND_NAME, BrandMark, brand, darkColors, fonts, useReducedMotion } from '@/design-system';

/** Shortest time the launch screen stays up, so the intro animation can finish on fast starts. */
const MIN_VISIBLE_MS = 1700;
const EXIT_MS = 420;

const LETTER_COLORS = darkColors.wordmark;
const CORNERS = [
  { key: 'tl', color: brand.cyan, dx: -1, dy: -1 },
  { key: 'tr', color: brand.pink, dx: 1, dy: -1 },
  { key: 'bl', color: brand.mint, dx: -1, dy: 1 },
  { key: 'br', color: brand.violet, dx: 1, dy: 1 },
] as const;

/**
 * Branded launch screen shown over the app on cold start (Expo Go and dev builds show the app icon
 * as the native splash, so this is what people actually see). Viewfinder corners snap into focus
 * around the logo, the wordmark rises letter by letter, then everything fades once the app is
 * ready. Honors Reduce Motion (no movement, just a fade).
 */
export function LaunchOverlay({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion();
  const [gone, setGone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const exit = useSharedValue(0);
  const intro = useSharedValue(reduced ? 1 : 0);
  const loop = useSharedValue(0);
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), reduced ? 600 : MIN_VISIBLE_MS);
    if (!reduced) {
      intro.set(withTiming(1, { duration: 1300, easing: Easing.linear }));
      loop.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true));
    }
    return () => clearTimeout(t);
  }, [reduced, intro, loop]);

  useEffect(() => {
    if (!ready || !minElapsed || started.current) return;
    started.current = true;
    exit.set(withTiming(1, { duration: EXIT_MS, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(() => setGone(true), EXIT_MS + 40);
    return () => clearTimeout(t);
  }, [ready, minElapsed, exit]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.get() }));
  const stageStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + exit.get() * 0.08 }] }));

  if (gone) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} pointerEvents={ready && minElapsed ? 'none' : 'auto'} accessible accessibilityLabel={`${BRAND_NAME} 불러오는 중`} accessibilityRole="progressbar">
      <StatusBar style="light" />
      <Glow color={brand.blue} size={520} style={{ top: -160, left: -180 }} loop={loop} drift={[30, 24]} />
      <Glow color={brand.pink} size={460} style={{ top: -60, right: -200 }} loop={loop} drift={[-26, 30]} />
      <Glow color={brand.violet} size={560} style={{ bottom: -220, left: -80 }} loop={loop} drift={[22, -28]} />
      <Glow color={brand.cyan} size={300} style={{ bottom: 60, right: -120 }} loop={loop} drift={[-18, -16]} />

      <Animated.View style={[styles.stage, stageStyle]}>
        <View style={styles.focus}>
          {CORNERS.map((k, i) => (
            <Corner key={k.key} corner={k} index={i} intro={intro} loop={loop} />
          ))}
          <Logo intro={intro} loop={loop} />
          <Sparkle intro={intro} loop={loop} />
        </View>

        <View style={styles.wordRow}>
          {BRAND_NAME.split('').map((ch, i) => (
            <Letter key={i} ch={ch} index={i} intro={intro} />
          ))}
        </View>
        <Tagline intro={intro} />
      </Animated.View>

      <Loader reduced={reduced} />
    </Animated.View>
  );
}

/** Progress of a segment of the 0→1 intro timeline, clamped (worklet). */
function seg(t: number, from: number, to: number): number {
  'worklet';
  return Math.min(1, Math.max(0, (t - from) / (to - from)));
}

/** Ease-out-back for the "snap into focus" overshoot (worklet). */
function backOut(x: number): number {
  'worklet';
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function Glow({ color, size, style, loop, drift }: { color: string; size: number; style: ViewStyle; loop: SharedValue<number>; drift: [number, number] }) {
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: loop.get() * drift[0] }, { translateY: loop.get() * drift[1] }, { scale: 1 + loop.get() * 0.06 }] }));
  // Many faint stacked discs fake a soft radial glow without a blur dependency (few discs band visibly).
  return (
    <Animated.View pointerEvents="none" style={[styles.glow, { width: size, height: size }, style, anim]}>
      {GLOW_RINGS.map((r) => (
        <View key={r} style={{ position: 'absolute', width: size * r, height: size * r, borderRadius: (size * r) / 2, backgroundColor: color, opacity: 0.028 }} />
      ))}
    </Animated.View>
  );
}

const GLOW_RINGS = Array.from({ length: 16 }, (_, i) => 1 - i * 0.055);

const FOCUS = 176;
const ARM = 38;

function Corner({ corner, index, intro, loop }: { corner: (typeof CORNERS)[number]; index: number; intro: SharedValue<number>; loop: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const p = backOut(seg(intro.get(), 0.05 + index * 0.04, 0.42 + index * 0.04));
    const breathe = loop.get() * 4;
    const off = (1 - p) * 34 + breathe;
    return { opacity: seg(intro.get(), 0.05 + index * 0.04, 0.2 + index * 0.04), transform: [{ translateX: corner.dx * off }, { translateY: corner.dy * off }] };
  });
  const side: ViewStyle = {
    borderColor: corner.color,
    ...(corner.dy < 0 ? { top: 0, borderTopWidth: 5 } : { bottom: 0, borderBottomWidth: 5 }),
    ...(corner.dx < 0 ? { left: 0, borderLeftWidth: 5 } : { right: 0, borderRightWidth: 5 }),
    ...(corner.dy < 0 && corner.dx < 0 ? { borderTopLeftRadius: 18 } : null),
    ...(corner.dy < 0 && corner.dx > 0 ? { borderTopRightRadius: 18 } : null),
    ...(corner.dy > 0 && corner.dx < 0 ? { borderBottomLeftRadius: 18 } : null),
    ...(corner.dy > 0 && corner.dx > 0 ? { borderBottomRightRadius: 18 } : null),
  };
  return <Animated.View style={[styles.corner, side, anim]} />;
}

function Logo({ intro, loop }: { intro: SharedValue<number>; loop: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const p = seg(intro.get(), 0.18, 0.55);
    return { opacity: p, transform: [{ scale: 0.55 + 0.45 * backOut(p) }, { translateY: -loop.get() * 4 }] };
  });
  return (
    <Animated.View style={[styles.logo, anim]}>
      <BrandMark size={112} />
    </Animated.View>
  );
}

function Sparkle({ intro, loop }: { intro: SharedValue<number>; loop: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const p = seg(intro.get(), 0.5, 0.72);
    return { opacity: p * (0.65 + loop.get() * 0.35), transform: [{ scale: backOut(p) * (0.85 + loop.get() * 0.25) }, { rotate: `${loop.get() * 25}deg` }] };
  });
  return (
    <Animated.View style={[styles.sparkle, anim]} pointerEvents="none">
      <Text style={styles.sparkleText}>✦</Text>
    </Animated.View>
  );
}

function Letter({ ch, index, intro }: { ch: string; index: number; intro: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const p = seg(intro.get(), 0.45 + index * 0.045, 0.7 + index * 0.045);
    return { opacity: p, transform: [{ translateY: (1 - backOut(p)) * 18 }] };
  });
  return (
    <Animated.View style={anim}>
      <Text style={[styles.letter, { color: LETTER_COLORS[index % LETTER_COLORS.length] }]} maxFontSizeMultiplier={1.2}>
        {ch}
      </Text>
    </Animated.View>
  );
}

function Tagline({ intro }: { intro: SharedValue<number> }) {
  const anim = useAnimatedStyle(() => {
    const p = seg(intro.get(), 0.78, 1);
    return { opacity: p, transform: [{ translateY: (1 - p) * 8 }] };
  });
  return (
    <Animated.View style={anim}>
      <Text style={styles.tagline} maxFontSizeMultiplier={1.4}>
        고민은 줄이고, 베스트 컷만 픽
      </Text>
    </Animated.View>
  );
}

const TRACK = 120;
const BEAM = 48;

function Loader({ reduced }: { reduced: boolean }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (!reduced) x.set(withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withDelay(80, withTiming(0, { duration: 0 }))), -1, false));
  }, [reduced, x]);
  const beam = useAnimatedStyle(() => ({ transform: [{ translateX: -BEAM + x.get() * (TRACK + BEAM) }] }));
  return (
    <View style={styles.loaderWrap} pointerEvents="none">
      <View style={styles.track}>
        <Animated.View style={[styles.beam, beam]}>
          <LinearGradient colors={['rgba(79,216,255,0)', brand.cyan, brand.violet, brand.pink, 'rgba(255,95,200,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: brand.navy, zIndex: 1000, elevation: 1000, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  stage: { alignItems: 'center', gap: 22 },
  focus: { width: FOCUS, height: FOCUS, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: ARM, height: ARM },
  // A light rim + violet glow lift the navy icon tile off the navy background.
  logo: { borderRadius: 27, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', shadowColor: brand.violet, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 10 } },
  sparkle: { position: 'absolute', top: 6, right: 4 },
  sparkleText: { fontSize: 26, color: brand.amber, textShadowColor: 'rgba(255,197,74,0.8)', textShadowRadius: 12 },
  wordRow: { flexDirection: 'row' },
  letter: { fontFamily: fonts.brand, fontSize: 44, lineHeight: 52, letterSpacing: -1.2 },
  tagline: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: '#B6B8CF', letterSpacing: 0.2 },
  loaderWrap: { position: 'absolute', bottom: 72, alignItems: 'center' },
  track: { width: TRACK, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  beam: { position: 'absolute', top: 0, bottom: 0, width: BEAM },
});
