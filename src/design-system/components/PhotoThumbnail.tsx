import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
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
    order: { bg: c.point, fg: c.onPoint },
    check: { bg: c.point, fg: c.onPoint, icon: 'checkmark' },
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
  /** Screen-reader shortcuts (e.g. move earlier/later) so edits never require opening a menu or dragging. */
  accessibilityActions?: { name: string; label: string }[];
  onAccessibilityAction?: (name: string) => void;
  testID?: string;
}

export function PhotoThumbnail({ uri, size, aspect = 1, onPress, onLongPress, accessibilityLabel, selected, dimmed, topLeft, topRight, bottomLeft, accessibilityActions, onAccessibilityAction, testID }: PhotoThumbnailProps) {
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
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction ? (e) => onAccessibilityAction(e.nativeEvent.actionName) : undefined}
      style={({ pressed }) => [{ width: size, height, opacity: pressed ? 0.85 : 1 }]}>
      <View style={[styles.frame, { backgroundColor: c.photoPlaceholder }]}>
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
        {selected ? <View pointerEvents="none" style={[styles.ring, { borderRadius: radius.photo, borderColor: c.point }]} /> : null}
      </View>
    </Pressable>
  );
}

export interface SelectablePhotoCardProps {
  /** Bundled image (static require). */
  source: ImageProps['source'];
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  width: number;
  /** width / height of the photo area; default 4:5. */
  aspect?: number;
  /** 'radio' inside single-choice groups, 'checkbox' (default) for multi-select. */
  role?: 'checkbox' | 'radio';
  testID?: string;
}

/**
 * Large tappable photo card for multi-select (e.g. taste onboarding).
 * Selected = coral border + filled check + checked state — never color alone.
 * If the image fails to load the card still shows a placeholder and its label.
 */
export function SelectablePhotoCard({ source, title, description, selected, onPress, width, aspect = 4 / 5, role = 'checkbox', testID }: SelectablePhotoCardProps) {
  const c = useColors();
  const [failed, setFailed] = useState(false);
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      style={({ pressed }) => [{ width, gap: spacing.xs, opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.cardPhoto, { height: width / aspect, backgroundColor: c.photoPlaceholder }]}>
        {failed ? (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={26} color={c.textTertiary} />
          </View>
        ) : (
          <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
        )}
        {selected ? <View pointerEvents="none" style={[styles.ring, { borderRadius: radius.tile, borderColor: c.point, backgroundColor: c.selectedOverlay }]} /> : null}
        <View style={[styles.check, selected ? { backgroundColor: c.point, borderColor: c.point } : { backgroundColor: 'rgba(0,0,0,0.22)', borderColor: 'rgba(255,255,255,0.9)' }]} importantForAccessibility="no-hide-descendants">
          {selected ? <Ionicons name="checkmark" size={17} color={c.onPoint} /> : null}
        </View>
      </View>
      <View style={{ gap: 2, paddingHorizontal: 2 }}>
        <AppText variant="label" numberOfLines={2}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" tone="secondary" numberOfLines={2}>
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardPhoto: { borderRadius: radius.tile, overflow: 'hidden' },
  ring: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderWidth: 3 },
  check: { position: 'absolute', top: spacing.xs, right: spacing.xs, width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  frame: { flex: 1, borderRadius: radius.photo, overflow: 'hidden' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, justifyContent: 'center' },
  tl: { position: 'absolute', top: spacing.xxs, left: spacing.xxs },
  tr: { position: 'absolute', top: spacing.xxs, right: spacing.xxs },
  bl: { position: 'absolute', bottom: spacing.xxs, left: spacing.xxs },
});
