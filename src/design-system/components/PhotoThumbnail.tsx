import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '../theme';
import { radius, spacing } from '../tokens';
import { AppText } from './AppText';

export type BadgeKind = 'order' | 'check' | 'pinned' | 'excluded' | 'group' | 'failed' | 'pending';

export interface SelectionBadgeProps {
  kind: BadgeKind;
  value?: number | string;
}

/** Badges combine shape + icon/number so state is never color-only. */
export function SelectionBadge({ kind, value }: SelectionBadgeProps) {
  const c = useColors();
  const map: Record<BadgeKind, { bg: string; fg: string; icon?: React.ComponentProps<typeof Ionicons>['name'] }> = {
    order: { bg: c.selected, fg: c.selectedText },
    check: { bg: c.selected, fg: c.selectedText, icon: 'checkmark' },
    pinned: { bg: '#111111', fg: '#FFFFFF', icon: 'pin' },
    excluded: { bg: '#111111', fg: '#FFFFFF', icon: 'eye-off' },
    group: { bg: 'rgba(0,0,0,0.6)', fg: '#FFFFFF', icon: 'copy-outline' },
    failed: { bg: c.error, fg: '#FFFFFF', icon: 'alert' },
    pending: { bg: 'rgba(0,0,0,0.55)', fg: '#FFFFFF', icon: 'time-outline' },
  };
  const s = map[kind];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]} importantForAccessibility="no-hide-descendants">
      {s.icon ? <Ionicons name={s.icon} size={13} color={s.fg} /> : null}
      {value != null ? (
        <AppText variant="caption" style={{ color: s.fg, fontWeight: '700' }} maxFontSizeMultiplier={1.3}>
          {value}
        </AppText>
      ) : null}
    </View>
  );
}

export interface PhotoThumbnailProps {
  uri?: string | null;
  size: number;
  /** width / height of the tile; defaults to square. */
  aspect?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
  selected?: boolean;
  dimmed?: boolean;
  topLeft?: SelectionBadgeProps | null;
  topRight?: SelectionBadgeProps | null;
  bottomLeft?: SelectionBadgeProps | null;
  testID?: string;
}

export function PhotoThumbnail({ uri, size, aspect = 1, onPress, onLongPress, accessibilityLabel, selected, dimmed, topLeft, topRight, bottomLeft, testID }: PhotoThumbnailProps) {
  const c = useColors();
  const height = size / aspect;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected != null ? { selected } : undefined}
      style={({ pressed }) => [{ width: size, height, opacity: pressed ? 0.85 : 1 }]}>
      <View style={[styles.frame, { backgroundColor: c.photoPlaceholder, borderColor: selected ? c.selected : 'transparent' }]}>
        {uri ? (
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={120} recyclingKey={uri} accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={22} color={c.textTertiary} />
          </View>
        )}
        {dimmed ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.55)' }]} /> : null}
        {topLeft ? <View style={styles.tl}><SelectionBadge {...topLeft} /></View> : null}
        {topRight ? <View style={styles.tr}><SelectionBadge {...topRight} /></View> : null}
        {bottomLeft ? <View style={styles.bl}><SelectionBadge {...bottomLeft} /></View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: radius.photo, overflow: 'hidden', borderWidth: 3 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, justifyContent: 'center' },
  tl: { position: 'absolute', top: spacing.xxs, left: spacing.xxs },
  tr: { position: 'absolute', top: spacing.xxs, right: spacing.xxs },
  bl: { position: 'absolute', bottom: spacing.xxs, left: spacing.xxs },
});
