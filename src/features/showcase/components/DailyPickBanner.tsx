import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { AppText, elevation, radius, spacing } from '@/design-system';

import type { ShowcasePhoto } from '../showcase-photos';

/**
 * "오늘의 픽" hero: swipeable sample photos with a dark gradient so the white text stays readable
 * on any photo. Counter shows the real position ("1 / 5").
 */
export function DailyPickBanner({ picks, width, onOpen }: { picks: ShowcasePhoto[]; width: number; onOpen: (p: ShowcasePhoto) => void }) {
  const [index, setIndex] = useState(0);
  const height = Math.round(Math.min(width * 0.62, 260));
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(Math.max(0, Math.min(picks.length - 1, i)));
  };
  return (
    <View style={[styles.wrap, elevation.raised, { width, height }]}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32} style={styles.clip}>
        {picks.map((p) => (
          <Pressable key={p.id} onPress={() => onOpen(p)} accessibilityRole="button" accessibilityLabel={`오늘의 픽, ${p.title}. ${p.tip} 탭하면 자세히 보기`} style={{ width, height }}>
            <Image source={p.source} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
            <LinearGradient colors={['rgba(10,30,60,0.62)', 'rgba(10,30,60,0.25)', 'rgba(0,0,0,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }} style={StyleSheet.absoluteFill} />
            <View style={styles.content}>
              <View style={styles.kicker}>
                <Ionicons name="sparkles" size={14} color="#FFB59E" />
                <AppText variant="caption" style={styles.white}>오늘의 픽</AppText>
              </View>
              <AppText variant="title" style={[styles.white, { maxWidth: '78%' }]} numberOfLines={2}>{p.title}</AppText>
              <AppText variant="secondary" style={[styles.white, { opacity: 0.9, maxWidth: '72%' }]} numberOfLines={2}>{p.tip}</AppText>
              <View style={styles.cta}>
                <AppText variant="caption" style={styles.white}>지금 보러가기</AppText>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.counter} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AppText variant="caption" style={styles.white}>{index + 1} / {picks.length}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.card, backgroundColor: '#24303F' },
  clip: { borderRadius: radius.card, overflow: 'hidden' },
  content: { flex: 1, padding: spacing.lg, gap: spacing.xs, justifyContent: 'center' },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  white: { color: '#FFFFFF' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 7, borderRadius: radius.chip, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)' },
  counter: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: radius.chip, paddingHorizontal: spacing.xs, paddingVertical: 2 },
});
