import { useEffect, useState } from 'react';
import { useAccountStore, bumpActivity } from '~/hooks';
import { getVaultClient } from '~/api/vault-client';
import { getVaultIdentity, subscribeVaultIdentity } from '~/api/vault-identity';
import { useSyncExternalStore } from 'react';

export type StreamProbe = {
  scope: string;
  context: string;
  status?: string;
  eventCount?: number;
  firstSeen?: string;
  lastSeen?: string;
  error?: string;
  fetchedEvents?: number;
  fetchError?: string;
  rawShape?: string;
};

export type VaultDiagnostics = {
  vaultId: string | null;
  vaultName?: string;
  scopes: string[];
  streams: StreamProbe[];
  loading: boolean;
  error: string | null;
};

const initial: VaultDiagnostics = {
  vaultId: null,
  scopes: [],
  streams: [],
  loading: true,
  error: null,
};

function describeShape(value: any): string {
  if (value == null) return String(value);
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).slice(0, 6);
    return `object{${keys.join(',')}}`;
  }
  return typeof value;
}

export const useVaultDiagnostics = (): VaultDiagnostics & { refresh: () => void } => {
  const accountStore = useAccountStore();
  const pk = accountStore.privateKey ?? null;
  const overridePub = useSyncExternalStore(
    subscribeVaultIdentity,
    () => getVaultIdentity()?.publicKeyHex ?? null,
    () => null,
  );
  const [state, setState] = useState<VaultDiagnostics>(initial);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!pk) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    (async () => {
      try {
        const client: any = await getVaultClient(pk);
        const rec = await client.current();
        if (cancelled) return;
        const scopesList = (await client.scopes.list(rec.vaultId)) as any[];
        const scopeNames = scopesList.map((s) => s.name).filter(Boolean) as string[];

        const allStreams: StreamProbe[] = [];
        for (const scope of scopeNames) {
          try {
            const sl = (await client.streams.list(rec.vaultId, scope)) as { items?: any[] };
            for (const s of sl.items || []) {
              const probe: StreamProbe = {
                scope,
                context: s.context,
                status: s.status,
                eventCount: s.eventCount,
                firstSeen: s.firstSeen,
                lastSeen: s.lastSeen,
              };
              // Also fetch the actual events so we can show whether the
              // events endpoint returns what its eventCount metadata claims.
              try {
                const ev = (await client.streams.events(rec.vaultId, scope, s.context)) as any;
                const items = Array.isArray(ev) ? ev : ev?.items || ev?.events || [];
                probe.fetchedEvents = Array.isArray(items) ? items.length : 0;
                probe.rawShape = describeShape(ev);
              } catch (fe: any) {
                probe.fetchError = fe?.message || String(fe);
              }
              allStreams.push(probe);
            }
          } catch (e: any) {
            allStreams.push({ scope, context: '?', error: e?.message || String(e) });
          }
        }
        if (cancelled) return;
        setState({
          vaultId: rec.vaultId,
          vaultName: rec.name,
          scopes: scopeNames,
          streams: allStreams,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (!cancelled) setState({ ...initial, loading: false, error: err?.message || String(err) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pk, overridePub, version]);

  return {
    ...state,
    refresh: () => {
      setVersion((v) => v + 1);
      bumpActivity();
    },
  };
};
