import type { LearnedWeights, PreferenceEvent, UserPreference } from '@/domain/models';
import { PERSONALIZATION } from '@/domain/recommendation-policy';
import { getDb, kvDelete, kvGet, kvSet } from '@/infrastructure/database/db';
import { applyEvent, emptyLearnedWeights, recomputeWeights } from '@/features/preferences/personalization';
import { newId } from '@/utils/id';

import { migratePreference, resetTaste } from './preference-schema';

const PREF_KEY = 'preference.v1';
const LEARNED_KEY = 'learned.v1';

export async function loadPreference(): Promise<UserPreference> {
  return migratePreference(await kvGet<unknown>(PREF_KEY));
}

export async function savePreference(pref: UserPreference): Promise<void> {
  await kvSet(PREF_KEY, { ...pref, preferenceUpdatedAt: new Date().toISOString() });
}

/** Clears explicit taste choices (see resetTaste) but keeps onboarding marked as seen. */
export async function resetPreference(): Promise<UserPreference> {
  const fresh = resetTaste(await loadPreference());
  await kvSet(PREF_KEY, fresh);
  return fresh;
}

export async function loadLearnedWeights(): Promise<LearnedWeights> {
  return (await kvGet<LearnedWeights>(LEARNED_KEY)) ?? emptyLearnedWeights();
}

/** Records an explicit user action and updates learned weights. Keeps at most maxEvents rows. */
export async function recordPreferenceEvent(event: Omit<PreferenceEvent, 'id' | 'createdAt'>): Promise<LearnedWeights> {
  const pref = await loadPreference();
  const current = await loadLearnedWeights();
  if (!pref.personalizationEnabled) return current;
  const full: PreferenceEvent = { ...event, id: newId('ev_'), createdAt: new Date().toISOString() };
  const db = await getDb();
  await db.runAsync('INSERT INTO preference_events (id, type, features_json, preset_id, created_at) VALUES (?, ?, ?, ?, ?)', full.id, full.type, JSON.stringify(full.features), full.presetId ?? null, full.createdAt);
  const countRow = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM preference_events');
  let next: LearnedWeights;
  if ((countRow?.n ?? 0) > PERSONALIZATION.maxEvents) {
    await db.runAsync('DELETE FROM preference_events WHERE id IN (SELECT id FROM preference_events ORDER BY created_at ASC LIMIT ?)', (countRow!.n - PERSONALIZATION.maxEvents));
    next = recomputeWeights(await listPreferenceEvents());
  } else {
    next = applyEvent(current, full);
  }
  await kvSet(LEARNED_KEY, next);
  return next;
}

export async function listPreferenceEvents(): Promise<PreferenceEvent[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; type: string; features_json: string | null; preset_id: string | null; created_at: string }>('SELECT * FROM preference_events ORDER BY created_at ASC');
  return rows.map((r) => ({ id: r.id, type: r.type as PreferenceEvent['type'], features: r.features_json ? JSON.parse(r.features_json) : null, presetId: r.preset_id, createdAt: r.created_at }));
}

export async function clearLearning(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM preference_events');
  await kvDelete(LEARNED_KEY);
}
