import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useReducedMotion } from '../theme';
import { bottomBarMaxHeight, radius, spacing } from '../tokens';
import { AppText } from './AppText';
import { IconButton } from './Buttons';

/** Scrollable screen body. Adds bottom padding when a BottomBar overlays it. */
export function ScreenScroll({ children, withBottomBar, topInset, ...rest }: ScrollViewProps & { children: ReactNode; withBottomBar?: boolean; topInset?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        padding: spacing.md,
        paddingTop: topInset ? insets.top + spacing.md : spacing.md,
        gap: spacing.lg,
        paddingBottom: (withBottomBar ? bottomBarMaxHeight + spacing.lg : spacing.xxl) + insets.bottom,
      }}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      {...rest}>
      {children}
    </ScrollView>
  );
}

/** Fixed bottom action area within thumb reach; respects safe area and stays short. */
export function BottomBar({ children }: { children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { backgroundColor: c.surfaceElevated, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {children}
    </View>
  );
}

export function BottomSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reduced ? 'none' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} onPress={onClose} accessibilityLabel="닫기" accessibilityRole="button" />
      <View style={[styles.sheet, { backgroundColor: c.surfaceElevated, paddingBottom: insets.bottom + spacing.md }]} accessibilityViewIsModal>
        <View style={styles.sheetHead}>
          <AppText variant="sectionTitle" style={{ flex: 1 }}>{title}</AppText>
          <IconButton icon="close" label="닫기" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.md }} style={{ maxHeight: 560 }}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function Row({ children, gap = spacing.xs, wrap, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: object }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  sheetHead: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
});
