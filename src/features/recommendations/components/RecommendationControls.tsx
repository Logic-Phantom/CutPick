import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { PlatformId } from '@/domain/models';
import { AppText, Card, FilterChip, GhostButton, IconButton, Row, spacing, useColors } from '@/design-system';
import { PLATFORM_LABELS, purposesFor, type AspectOption, type PlatformPurpose } from '@/features/platforms/platform-profiles';
import { activePresets, getPreset, isPresetStale } from '@/features/style-presets/preset-registry';

const PLATFORMS: PlatformId[] = ['instagram', 'tiktok', 'kakaotalk'];

export interface RecommendationControlsProps {
  purpose: PlatformPurpose;
  aspect: AspectOption;
  target: number;
  selectedCount: number;
  presetId: string;
  onPlatform: (p: PlatformId) => void;
  onPurpose: (id: string) => void;
  onAspect: (id: string) => void;
  onTarget: (n: number) => void;
  onPreset: (id: string) => void;
}

/**
 * Progressive disclosure: a one-line summary (platform, purpose, ratio, preset) with the
 * count stepper always visible; the full settings expand on demand so photos stay on screen.
 */
export function RecommendationControls(p: RecommendationControlsProps) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const single = p.purpose.maxCount === 1;
  const preset = getPreset(p.presetId);
  return (
    <Card>
      <View style={{ gap: spacing.sm }}>
        <Row gap={spacing.sm} style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {PLATFORM_LABELS[p.purpose.platform]} · {p.purpose.label}
            </AppText>
            <AppText variant="secondary" tone="secondary" numberOfLines={2}>
              {p.aspect.label} · {preset.name}
            </AppText>
          </View>
          {!single ? (
            <Row gap={0}>
              <IconButton icon="remove" label="한 장 줄이기" onPress={() => p.onTarget(p.target - 1)} disabled={p.target <= p.purpose.minCount} />
              <AppText variant="numeric" accessibilityLabel={`선택된 사진 ${p.selectedCount}장, 목표 ${p.target}장`} style={{ minWidth: 56, textAlign: 'center' }}>
                {p.selectedCount}/{p.target}
              </AppText>
              <IconButton icon="add" label="한 장 늘리기" onPress={() => p.onTarget(p.target + 1)} disabled={p.target >= p.purpose.maxCount} />
            </Row>
          ) : null}
        </Row>
        <GhostButton compact icon={open ? 'chevron-up' : 'options-outline'} label={open ? '설정 접기' : '플랫폼·비율·프리셋 바꾸기'} onPress={() => setOpen(!open)} testID="rec-settings-toggle" />

        {open ? (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="플랫폼">
              {PLATFORMS.map((pl) => (
                <FilterChip key={pl} label={PLATFORM_LABELS[pl]} selected={p.purpose.platform === pl} onPress={() => p.onPlatform(pl)} role="radio" testID={`platform-${pl}`} />
              ))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll} accessibilityLabel="게시 목적">
              {purposesFor(p.purpose.platform).map((pu) => (
                <FilterChip key={pu.id} label={pu.label} selected={p.purpose.id === pu.id} onPress={() => p.onPurpose(pu.id)} role="radio" testID={`purpose-${pu.id}`} />
              ))}
            </ScrollView>
            <AppText variant="secondary" tone="secondary">{p.purpose.description}</AppText>

            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <AppText variant="caption" tone="secondary">비율</AppText>
            <View style={styles.wrap}>
              {p.purpose.aspects.map((a) => (
                <FilterChip key={a.id} label={a.label} selected={p.aspect.id === a.id} onPress={() => p.onAspect(a.id)} role="radio" />
              ))}
            </View>
            {p.purpose.platformMaxCount && p.purpose.maxCount > 1 ? (
              <AppText variant="caption" tone="tertiary">
                플랫폼 최대 {p.purpose.platformMaxCount}장 ({p.purpose.platformMaxVerification === 'secondary-source' ? '2차 출처, 공식 확인 필요' : '공식 안내 기준'} · docs/PLATFORM_RULES.md)
              </AppText>
            ) : null}

            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <AppText variant="caption" tone="secondary">감성 프리셋 · 사진에 필터를 입히지 않고 추천 순위만 조정해요</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll} accessibilityLabel="감성 프리셋">
              {activePresets().map((pr) => (
                <FilterChip key={pr.id} label={pr.name + (isPresetStale(pr) ? ' (검토 필요)' : '')} selected={p.presetId === pr.id} onPress={() => p.onPreset(pr.id)} role="radio" />
              ))}
            </ScrollView>
            <AppText variant="caption" tone="tertiary">{preset.description} · 검증되지 않은 가설 프리셋이에요.</AppText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  hscroll: { gap: spacing.xs, paddingRight: spacing.md },
  divider: { height: StyleSheet.hairlineWidth },
});
