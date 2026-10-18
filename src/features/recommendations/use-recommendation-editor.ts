import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CutpickProject, PhotoAsset, PlatformId, RecommendationSet } from '@/domain/models';
import { RECOMMENDATION_VERSION } from '@/domain/recommendation-policy';
import { buildCaption } from '@/features/captions/caption-templates';
import { recordPreferenceEvent } from '@/features/onboarding/local-preference-repository';
import { featureSnapshot } from '@/features/preferences/personalization';
import { clampCount, getPurpose, purposesFor } from '@/features/platforms/platform-profiles';
import { defaultPurposeFor } from '@/features/project-library/contexts';
import { getProject, getRecommendationSet, latestRecommendationSet, listPhotos, saveRecommendationSet, updateProject } from '@/features/project-library/project-repository';
import { useAppState } from '@/hooks/app-state';
import { newId } from '@/utils/id';

import { moveItem } from './carousel-ordering';
import { recommend, type RecommendOutput } from './engine';

interface EditState {
  pinned: string[];
  excluded: string[];
  order: string[];
  groupReps: Record<string, string>;
}

const EMPTY_EDIT: EditState = { pinned: [], excluded: [], order: [], groupReps: {} };

/**
 * Holds the editable recommendation for one project + purpose.
 * Every user edit is persisted locally; bulk actions can be undone.
 */
export function useRecommendationEditor(projectId: string) {
  const { preference, learned, setLearned } = useAppState();
  const [project, setProject] = useState<CutpickProject | null>(null);
  const [photos, setPhotos] = useState<PhotoAsset[] | null>(null);
  const [purposeId, setPurposeId] = useState<string | null>(null);
  const [aspectId, setAspectId] = useState<string | null>(null);
  const [target, setTarget] = useState(6);
  const [presetId, setPresetId] = useState('natural-daily');
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT);
  const [caption, setCaption] = useState('');
  const [captionVariant, setCaptionVariant] = useState(0);
  const [history, setHistory] = useState<EditState[]>([]);
  const [loadError, setLoadError] = useState(false);
  const setIdRef = useRef<string>(newId('rs_'));
  const createdAtRef = useRef<string>(new Date().toISOString());
  const hydrated = useRef(false);
  const cropsRef = useRef<RecommendationSet['cropPreferences']>([]);

  const applySet = useCallback((set: RecommendationSet | null, proj: CutpickProject, pid: string) => {
    const purpose = getPurpose(pid);
    if (set) {
      setIdRef.current = set.id;
      createdAtRef.current = set.createdAt;
      setAspectId(set.aspectId ?? purpose.defaultAspectId);
      setTarget(clampCount(purpose, set.targetCount));
      setPresetId(set.stylePresetId);
      setEdit({ pinned: set.pinnedPhotoIds, excluded: set.excludedPhotoIds, order: set.manualOrder ?? [], groupReps: set.groupRepresentatives });
      setCaption(set.captionDraft);
      cropsRef.current = set.cropPreferences ?? [];
    } else {
      cropsRef.current = [];
      setIdRef.current = newId('rs_');
      createdAtRef.current = new Date().toISOString();
      setAspectId(purpose.defaultAspectId);
      setTarget(clampCount(purpose, purpose.platform === proj.selectedPlatforms[0] ? proj.targetPhotoCount : purpose.defaultCount));
      setPresetId(proj.stylePresetId);
      setEdit((e) => ({ ...EMPTY_EDIT, excluded: e.excluded }));
      setCaption(buildCaption(proj.title, proj.sourceContext));
    }
    setHistory([]);
  }, []);

  const load = useCallback(async () => {
    try {
      const [proj, list] = await Promise.all([getProject(projectId), listPhotos(projectId)]);
      if (!proj) {
        setLoadError(true);
        return;
      }
      setProject(proj);
      setPhotos(list);
      if (!hydrated.current) {
        const latest = await latestRecommendationSet(projectId);
        const pid = latest?.purposeId ?? defaultPurposeFor(proj.sourceContext, preference.preferredPlatformPurposes);
        setPurposeId(pid);
        applySet(latest, proj, pid);
        hydrated.current = true;
      }
    } catch {
      setLoadError(true);
    }
  }, [projectId, preference.preferredPlatformPurposes, applySet]);

  // Reload on focus: picks up scene tags edited in photo detail and caption/crops edited on the export screen.
  useFocusEffect(
    useCallback(() => {
      load();
      if (hydrated.current && purposeId) {
        getRecommendationSet(projectId, purposeId)
          .then((s) => {
            if (!s) return;
            cropsRef.current = s.cropPreferences ?? [];
            setCaption(s.captionDraft);
          })
          .catch(() => {});
      }
    }, [load, projectId, purposeId]),
  );

  const output: RecommendOutput | null = useMemo(() => {
    if (!photos || !purposeId) return null;
    return recommend({
      photos,
      purposeId,
      aspectId,
      targetCount: target,
      presetId,
      preference,
      learned,
      pinnedIds: edit.pinned,
      excludedIds: edit.excluded,
      groupRepresentatives: edit.groupReps,
      previousOrder: edit.order,
    });
  }, [photos, purposeId, aspectId, target, presetId, preference, learned, edit]);

  // Persist every change.
  useEffect(() => {
    if (!output || !project || !purposeId || !hydrated.current) return;
    const now = new Date().toISOString();
    const set: RecommendationSet = {
      id: setIdRef.current,
      projectId,
      platform: output.purpose.platform,
      purposeId,
      aspectId: output.aspect.id,
      selectedPhotoIds: output.orderedIds,
      orderedPhotoIds: output.orderedIds,
      manualOrder: edit.order,
      pinnedPhotoIds: edit.pinned,
      excludedPhotoIds: edit.excluded,
      groupRepresentatives: edit.groupReps,
      cropPreferences: cropsRef.current,
      captionDraft: caption,
      stylePresetId: presetId,
      targetCount: output.target,
      recommendationVersion: RECOMMENDATION_VERSION,
      createdAt: createdAtRef.current,
      updatedAt: now,
      details: output.details,
    };
    saveRecommendationSet(set).catch(() => {});
  }, [output, project, projectId, purposeId, edit, caption, presetId]);

  const pushEdit = useCallback((next: EditState) => {
    setHistory((h) => [...h.slice(-19), edit]);
    setEdit(next);
  }, [edit]);

  const record = useCallback(async (type: 'pin' | 'exclude' | 'keep' | 'reorder', photoId: string) => {
    const p = photos?.find((x) => x.id === photoId);
    if (!p) return;
    try {
      setLearned(await recordPreferenceEvent({ type, features: featureSnapshot(p), presetId }));
    } catch {
      // personalization is optional
    }
  }, [photos, presetId, setLearned]);

  const actions = {
    choosePlatform: async (platform: PlatformId) => {
      if (!project) return;
      const first = purposesFor(platform)[0];
      await actions.choosePurpose(first.id);
    },
    choosePurpose: async (pid: string) => {
      if (!project) return;
      setPurposeId(pid);
      const set = await getRecommendationSet(projectId, pid);
      applySet(set, project, pid);
      updateProject(projectId, { selectedPlatforms: [getPurpose(pid).platform] }).catch(() => {});
    },
    setAspect: (id: string) => setAspectId(id),
    setTarget: (n: number) => {
      if (!output) return;
      const v = clampCount(output.purpose, n);
      setTarget(v);
      updateProject(projectId, { targetPhotoCount: v }).catch(() => {});
    },
    setPreset: (id: string) => {
      setPresetId(id);
      updateProject(projectId, { stylePresetId: id }).catch(() => {});
    },
    togglePin: (photoId: string) => {
      const pinned = edit.pinned.includes(photoId) ? edit.pinned.filter((x) => x !== photoId) : [...edit.pinned, photoId];
      const excluded = edit.excluded.filter((x) => x !== photoId);
      // In automatic order (empty manual order) pinning must not move the photo.
      const order = edit.order.length === 0 || edit.order.includes(photoId) || !pinned.includes(photoId) ? edit.order : [...edit.order, photoId];
      pushEdit({ ...edit, pinned, excluded, order });
      if (pinned.includes(photoId)) record('pin', photoId);
    },
    exclude: (photoId: string) => {
      pushEdit({ ...edit, excluded: [...new Set([...edit.excluded, photoId])], pinned: edit.pinned.filter((x) => x !== photoId), order: edit.order.filter((x) => x !== photoId) });
      record('exclude', photoId);
    },
    restore: (photoId: string) => {
      pushEdit({ ...edit, excluded: edit.excluded.filter((x) => x !== photoId) });
      record('keep', photoId);
    },
    /** Puts a candidate into the set: pins it so recalculation never drops it. */
    add: (photoId: string) => {
      if (output && output.orderedIds.length >= target) {
        const v = clampCount(output.purpose, target + 1);
        setTarget(v);
      }
      pushEdit({ ...edit, pinned: [...new Set([...edit.pinned, photoId])], excluded: edit.excluded.filter((x) => x !== photoId), order: output ? [...output.orderedIds.filter((x) => x !== photoId), photoId] : edit.order });
      record('keep', photoId);
    },
    move: (photoId: string, delta: number) => {
      if (!output) return;
      const current = output.orderedIds;
      const idx = current.indexOf(photoId);
      const next = moveItem(current, idx, delta);
      if (next === current) return;
      pushEdit({ ...edit, order: next });
      record('reorder', photoId);
    },
    makeCover: (photoId: string) => {
      if (!output) return;
      const next = [photoId, ...output.orderedIds.filter((x) => x !== photoId)];
      pushEdit({ ...edit, order: next, pinned: [...new Set([...edit.pinned, photoId])] });
      record('pin', photoId);
    },
    setGroupRepresentative: (groupId: string, photoId: string) => {
      pushEdit({ ...edit, groupReps: { ...edit.groupReps, [groupId]: photoId } });
    },
    /** Recompute suggestions: keeps pins and exclusions, drops manual order. */
    reRecommend: () => pushEdit({ ...edit, order: [] }),
    /** Clears all manual edits (undoable). */
    resetAll: () => pushEdit(EMPTY_EDIT),
    undo: () => {
      if (!history.length) return;
      setEdit(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    },
    /** Single-photo purposes: make this the chosen photo. */
    chooseSingle: (photoId: string) => {
      pushEdit({ ...edit, pinned: [photoId], excluded: edit.excluded.filter((x) => x !== photoId) });
      record('pin', photoId);
    },
    setCaption,
    nextCaption: () => {
      if (!project) return;
      const v = captionVariant + 1;
      setCaptionVariant(v);
      setCaption(buildCaption(project.title, project.sourceContext, v));
    },
    reload: load,
  };

  return { project, photos, output, purposeId, presetId, edit, caption, canUndo: history.length > 0, loadError, actions };
}
