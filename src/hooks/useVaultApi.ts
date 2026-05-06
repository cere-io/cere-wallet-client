import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useAccountStore } from '~/hooks';
import { getVaultClient, invalidateVaultClient } from '~/api/vault-client';
import { getVaultIdentity, subscribeVaultIdentity } from '~/api/vault-identity';

export type AsyncState<T> = { data: T | null; loading: boolean; error: Error | null; notFound?: boolean };

const initial = <T>(): AsyncState<T> => ({ data: null, loading: true, error: null });

const isNotFound = (err: any) => err?.status === 404 || /not.found/i.test(err?.message || '');

const useIdentitySnapshot = () => {
  return useSyncExternalStore(
    subscribeVaultIdentity,
    () => getVaultIdentity()?.publicKeyHex ?? null,
    () => null,
  );
};

const usePrivateKey = (): string | null => {
  const accountStore = useAccountStore();
  return accountStore.privateKey ?? null;
};

/**
 * Resolve the caller's vault record (and therefore its real vaultId, e.g.
 * `v-4076bd…`) via `GET /api/v1/vaults`. Falls back to `notFound:true` on
 * 404 so the UI can show the Claim CTA.
 */
const useVaultRecord = (): AsyncState<{ vaultId: string; name?: string }> => {
  const pk = usePrivateKey();
  const overridePub = useIdentitySnapshot();
  const [state, setState] = useState<AsyncState<{ vaultId: string; name?: string }>>(initial());

  useEffect(() => {
    if (!pk) return;
    let cancelled = false;
    invalidateVaultClient();
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      try {
        const client = await getVaultClient(pk);
        // SDK exposes `client.vaults.current()` — falls back to fetching the
        // VaultRecord for the caller's wallet pubkey from `GET /api/v1/vaults`.
        const rec = (await (client as any).current()) as { vaultId: string; name?: string };
        if (!cancelled) setState({ data: rec, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setState({ data: null, loading: false, error: err, notFound: isNotFound(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pk, overridePub]);

  return state;
};

export const useScopes = (): AsyncState<unknown[]> => {
  const pk = usePrivateKey();
  const overridePub = useIdentitySnapshot();
  const vault = useVaultRecord();
  const [state, setState] = useState<AsyncState<unknown[]>>(initial());

  useEffect(() => {
    if (!pk) return;
    if (vault.loading) return;
    if (!vault.data) {
      setState({ data: null, loading: false, error: vault.error, notFound: vault.notFound });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      try {
        const client = await getVaultClient(pk);
        const data = (await client.scopes.list(vault.data!.vaultId)) as unknown[];
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setState({ data: null, loading: false, error: err, notFound: isNotFound(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pk, overridePub, vault.loading, vault.data, vault.error, vault.notFound]);

  return state;
};

export const useAgents = (): AsyncState<any[]> => {
  const pk = usePrivateKey();
  const overridePub = useIdentitySnapshot();
  const vault = useVaultRecord();
  const [state, setState] = useState<AsyncState<any[]>>(initial());

  useEffect(() => {
    if (!pk) return;
    if (vault.loading) return;
    if (!vault.data) {
      setState({ data: null, loading: false, error: vault.error, notFound: vault.notFound });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      try {
        const client = await getVaultClient(pk);
        const res = await client.agents.list(vault.data!.vaultId);
        const data = (res as any)?.items ?? [];
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setState({ data: null, loading: false, error: err, notFound: isNotFound(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pk, overridePub, vault.loading, vault.data, vault.error, vault.notFound]);

  return state;
};

// Module-level counter bumped to force activity / scope refetch.
// Components call `bumpActivity()` after a publish to re-fan-out the
// streams.list + streams.events calls.
let activityVersion = 0;
const versionListeners = new Set<() => void>();
export const bumpActivity = () => {
  activityVersion++;
  versionListeners.forEach((l) => l());
};
const subscribeActivity = (l: () => void) => {
  versionListeners.add(l);
  return () => versionListeners.delete(l);
};
const useActivityVersion = () =>
  useSyncExternalStore(
    subscribeActivity,
    () => activityVersion,
    () => 0,
  );

export const useActivity = (): AsyncState<any[]> & { refresh: () => void } => {
  const pk = usePrivateKey();
  const overridePub = useIdentitySnapshot();
  const vault = useVaultRecord();
  const scopes = useScopes();
  const version = useActivityVersion();
  const [state, setState] = useState<AsyncState<any[]>>(initial());

  const scopeNames = useMemo(
    () => (scopes.data || []).map((s: any) => s?.name || s?.scope).filter(Boolean) as string[],
    [scopes.data],
  );
  const scopeKeysJson = scopeNames.join('|');

  useEffect(() => {
    if (!pk || vault.loading || scopes.loading) return;
    if (!vault.data) {
      setState({ data: null, loading: false, error: vault.error, notFound: vault.notFound });
      return;
    }
    if (scopes.error) {
      setState({ data: null, loading: false, error: scopes.error });
      return;
    }
    if (!scopeNames.length) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const client = await getVaultClient(pk);
        // 1. Per scope, list streams to get the active stream contexts.
        const streamLists = await Promise.allSettled(
          scopeNames.map((scope) => client.streams.list(vault.data!.vaultId, scope) as Promise<{ items?: any[] }>),
        );
        if (cancelled) return;

        type StreamRef = { scope: string; context: string };
        const refs: StreamRef[] = [];
        for (let i = 0; i < scopeNames.length; i++) {
          const r = streamLists[i];
          if (r.status === 'fulfilled') {
            const items = ((r.value as any)?.items || []) as Array<{ context: string }>;
            for (const s of items) refs.push({ scope: scopeNames[i], context: s.context });
          }
        }

        // 2. Fan out one stream-events call per context. Falls back to summary
        // entries if a stream's events endpoint errors so the user still sees
        // SOMETHING in the feed.
        const eventBatches = await Promise.allSettled(
          refs.map(
            (ref) =>
              (client as any).streams.events(vault.data!.vaultId, ref.scope, ref.context) as Promise<{ items?: any[] }>,
          ),
        );
        if (cancelled) return;

        const merged: any[] = [];
        for (let i = 0; i < refs.length; i++) {
          const r = eventBatches[i];
          if (r.status === 'fulfilled') {
            const v = r.value as any;
            // Tolerate multiple wire shapes — array, {items}, {events}, {data}.
            const items = Array.isArray(v) ? v : v?.items || v?.events || v?.data || [];
            if (Array.isArray(items)) merged.push(...items);
          }
        }
        merged.sort(
          (a, b) => new Date(b?.at || b?.timestamp || 0).getTime() - new Date(a?.at || a?.timestamp || 0).getTime(),
        );
        setState({ data: merged, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setState({ data: null, loading: false, error: err });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pk, overridePub, scopeKeysJson, scopes.loading, scopes.error, vault.loading, vault.data, version]);

  return { ...state, refresh: bumpActivity };
};

export const revokeAgent = async (privateKey: string, _vaultIdLegacy: string, agentId: string): Promise<void> => {
  const client = await getVaultClient(privateKey);
  const rec = (await (client as any).current()) as { vaultId: string };
  await client.agents.disconnect(rec.vaultId, agentId);
};

/**
 * Publish a single event to a vault scope (marketplace playground §8 pattern).
 * Subscribed agents receive it via their stream consumer; activity appears in
 * the wallet's Data tab on the next refresh.
 */
export const publishEvent = async (
  privateKey: string,
  scope: string,
  event: { type: string; role?: 'source' | 'user' | 'agent'; target?: string; context?: string; payload: unknown },
): Promise<{ accepted: string[]; rejected: any[] }> => {
  const client = await getVaultClient(privateKey);
  const rec = (await (client as any).current()) as { vaultId: string };
  const envelope = {
    type: event.type,
    role: event.role || 'user',
    scope,
    context: event.context || `wallet-${Date.now()}`,
    target: event.target,
    payload: event.payload,
    timestamp: new Date().toISOString(),
  };
  return (await (client as any).events.publish(rec.vaultId, scope, envelope)) as {
    accepted: string[];
    rejected: any[];
  };
};

export const useVaultId = useVaultRecord;
