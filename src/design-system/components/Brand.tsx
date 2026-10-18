import { Image } from 'expo-image';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColors } from '../theme';
import { fonts, spacing } from '../tokens';

export const BRAND_NAME = 'CutPick';

const LOGO = require('@/assets/images/logo.png');

/** "CutPick" wordmark: one color per letter, running through the icon's cyan → violet → pink. */
export function BrandWordmark({ size = 28, colors }: { size?: number; colors?: readonly string[] }) {
  const c = useColors();
  const palette = colors ?? c.wordmark;
  return (
    <Text
      accessibilityLabel={BRAND_NAME}
      maxFontSizeMultiplier={1.4}
      style={{ fontFamily: fonts.brand, fontSize: size, lineHeight: Math.round(size * 1.2), letterSpacing: -size * 0.03 }}>
      {BRAND_NAME.split('').map((ch, i) => (
        <Text key={i} style={{ color: palette[i % palette.length] }}>
          {ch}
        </Text>
      ))}
    </Text>
  );
}

/** The app icon as an in-app logo (rounded artwork, transparent corners). */
export function BrandMark({ size = 36 }: { size?: number }) {
  return <Image source={LOGO} style={{ width: size, height: size }} contentFit="contain" accessibilityIgnoresInvertColors accessible={false} />;
}

/** Logo + wordmark lockup used in screen headers. */
export function BrandLockup({ size = 28, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }, style]}>
      <BrandMark size={Math.round(size * 1.35)} />
      <BrandWordmark size={size} />
    </View>
  );
}
