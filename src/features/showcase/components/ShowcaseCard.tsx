import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, elevation, radius, spacing, useColors } from '@/design-system';
import { categoryLabel } from '@/features/community/moderation-policy';

import type { ShowcasePhoto } from '../showcase-photos';

/** "# 카페" pill drawn on top of a photo. */
export function PhotoTagPill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <AppText variant="caption" style={{ color: '#1D1D22', fontWeight: '700' }}># {label}</AppText>
    </View>
  );
}

/**
 * Feed card for a bundled best-shot sample: photo, category pill, title and a "CutPick 샘플" line.
 * No author handle or heart count — samples are not community posts (D-051).
 */
export function ShowcaseCard({ photo, width, onPress }: { photo: ShowcasePhoto; width: number; onPress: () => void }) {
  const c = useColors();
  const cat = categoryLabel(photo.category);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`샘플 사진, ${cat}, ${photo.title}. 탭하면 찍는 팁 보기`}
      style={({ pressed }) => [styles.card, elevation.card, { width, backgroundColor: c.surface, opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.photo, { height: width * 0.78, backgroundColor: c.photoPlaceholder }]}>
        <Image source={photo.source} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} accessible={false} />
        <View style={styles.pillSpot}>
          <PhotoTagPill label={cat} />
        </View>
      </View>
      <View style={styles.body}>
        <AppText variant="label" numberOfLines={1}>{photo.title}</AppText>
        <View style={styles.meta}>
          <Ionicons name="sparkles" size={12} color={c.point} />
          <AppText variant="caption" tone="tertiary" numberOfLines={1} style={{ flex: 1 }}>CutPick 샘플</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.tile },
  photo: { borderTopLeftRadius: radius.tile, borderTopRightRadius: radius.tile, overflow: 'hidden' },
  pillSpot: { position: 'absolute', left: spacing.xs, bottom: spacing.xs },
  pill: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.chip, paddingHorizontal: spacing.xs + 2, paddingVertical: 3 },
  body: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs, paddingBottom: spacing.sm, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
