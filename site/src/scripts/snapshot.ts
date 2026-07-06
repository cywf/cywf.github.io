import type { Snapshot } from './snapshot-shared';

type SnapshotEnvelope<T> = Partial<Snapshot<T>>;

export function readSnapshot<T>(payload: T | SnapshotEnvelope<T>): { data: T; fetchedAt?: string } {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'data' in payload) {
    const snapshot = payload as SnapshotEnvelope<T>;
    return {
      data: snapshot.data as T,
      fetchedAt: snapshot.fetchedAt,
    };
  }

  return { data: payload as T };
}

export function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
