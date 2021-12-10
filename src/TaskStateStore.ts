import { TaskResult } from './types';

export type TaskStatus = 'pending' | 'started' | 'failed' | 'aborted' | 'succeeded';
type Metrics = { elapsed?: number; start: number; end?: number };
type State = { status: TaskStatus; output?: TaskResult, change: number };

export const isEndStatus = (s: TaskStatus): boolean => s === 'failed' || s == 'aborted' || s === 'succeeded';
export const isFailedStatus = (s: TaskStatus): boolean => s === 'failed' || s == 'aborted';

export default class TaskStateStore {
  private store: Map<string, State>;
  private metrics: Map<string, Metrics>;
  private onStateChange?: (key: string) => void | undefined;

  constructor( onStateChange?: (key: string) => void) {
    this.store = new Map();
    this.metrics = new Map();
    this.onStateChange = onStateChange;
  }

  getStatesByKeys(keys: string[]): Record<string, State> {
    return keys.reduce<Record<string, State>>((acc, key) => {
      const s = this.store.get(key);
      if (s) {
        acc[key] = s;
      }
      return acc;
    }, {});
  }

  getState(key: string): State | undefined {
    return this.store.get(key);
  }

  getMetrics(key: string): Metrics | undefined {
    return this.metrics.get(key);
  }

  getAllStatuses(): string[] {
    return Array.from(this.store.values()).map((v) => v.status);
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  getAllKeysByState({ state: filterState }: { state: TaskStatus }): string[] {
    return Array.from(this.store.entries())
      .filter(([, { status: state }]) => state === filterState)
      .map(([key]) => key);
  }

  set(key: string, status: TaskStatus, output?: TaskResult): void {
    const current = this.store.get(key) || {};
    const metrics = this.metrics.get(key);
    const now = Date.now();
    switch (status) {
      case 'pending':
        this.store.set(key, { ...current, status: status, change: now });
        break;
      case 'started':
        this.store.set(key, { ...current, status: status, change: now });
        this.metrics.set(key, { ...metrics, start: Date.now() });
        break;
      case 'succeeded':
      case 'failed':
        if (!metrics) throw new Error(`Missing metrics for '${key}'`);
        this.store.set(key, { ...current, status: status, output, change: now });
        this.metrics.set(key, { ...metrics, end: Date.now(), elapsed: Date.now() - metrics.start });
        break;
      case 'aborted':
        this.store.set(key, { ...current, status: status, output, change: now });
        break;
      default:
        throw new Error(`Can not set state for key '${key}', ${status} is an invalid status`);
    }

    this.onStateChange && this.onStateChange(key);
  }
}
