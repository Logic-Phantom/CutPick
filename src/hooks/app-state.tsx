import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { LearnedWeights, UserPreference } from '@/domain/models';
import { loadLearnedWeights, loadPreference, savePreference } from '@/features/onboarding/local-preference-repository';
import { defaultPreference } from '@/features/onboarding/preference-schema';
import { emptyLearnedWeights } from '@/features/preferences/personalization';

interface AppState {
  ready: boolean;
  dbError: boolean;
  preference: UserPreference;
  learned: LearnedWeights;
  updatePreference: (patch: Partial<UserPreference>) => Promise<void>;
  reload: () => Promise<void>;
  setLearned: (w: LearnedWeights) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [preference, setPreference] = useState<UserPreference>(defaultPreference());
  const [learned, setLearned] = useState<LearnedWeights>(emptyLearnedWeights());

  const reload = useCallback(async () => {
    try {
      const [p, l] = await Promise.all([loadPreference(), loadLearnedWeights()]);
      setPreference(p);
      setLearned(l);
      setDbError(false);
    } catch {
      setDbError(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([loadPreference(), loadLearnedWeights()])
      .then(([p, l]) => {
        if (!alive) return;
        setPreference(p);
        setLearned(l);
      })
      .catch(() => alive && setDbError(true))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const updatePreference = useCallback(async (patch: Partial<UserPreference>) => {
    const next = { ...preference, ...patch, preferenceUpdatedAt: new Date().toISOString() };
    setPreference(next);
    await savePreference(next);
  }, [preference]);

  const value = useMemo(() => ({ ready, dbError, preference, learned, updatePreference, reload, setLearned }), [ready, dbError, preference, learned, updatePreference, reload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState outside provider');
  return v;
}
