/**
 * Bounded-concurrency work queue with progress, cancellation and per-item failure isolation.
 * Pure TypeScript so it can be unit tested without native modules.
 */
export interface QueueProgress {
  processed: number;
  failed: number;
  total: number;
}

export interface QueueOptions<T, R> {
  items: T[];
  concurrency: number;
  worker: (item: T) => Promise<R>;
  onResult?: (item: T, result: R) => void | Promise<void>;
  onError?: (item: T, error: unknown) => void | Promise<void>;
  onProgress?: (p: QueueProgress) => void;
  /** Yield to the JS event loop between items so the UI stays responsive. */
  yieldBetweenItems?: boolean;
}

export class CancelToken {
  private _cancelled = false;
  cancel(): void {
    this._cancelled = true;
  }
  get cancelled(): boolean {
    return this._cancelled;
  }
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function runQueue<T, R>(opts: QueueOptions<T, R>, token = new CancelToken()): Promise<QueueProgress & { cancelled: boolean }> {
  const { items, worker } = opts;
  const total = items.length;
  let next = 0;
  let processed = 0;
  let failed = 0;
  const concurrency = Math.max(1, Math.min(opts.concurrency, total || 1));

  const report = () => opts.onProgress?.({ processed, failed, total });

  async function lane(): Promise<void> {
    while (!token.cancelled) {
      const idx = next++;
      if (idx >= total) return;
      const item = items[idx];
      try {
        const result = await worker(item);
        if (token.cancelled) return;
        processed++;
        await opts.onResult?.(item, result);
      } catch (err) {
        if (token.cancelled) return;
        processed++;
        failed++;
        await opts.onError?.(item, err);
      }
      report();
      if (opts.yieldBetweenItems !== false) await tick();
    }
  }

  report();
  await Promise.all(Array.from({ length: concurrency }, lane));
  return { processed, failed, total, cancelled: token.cancelled };
}
