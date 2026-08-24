// Placeholder events until we wire a CEF cubby or DDC event stream as the source.
// Shape mirrors what a real `/api/v1/activity?wallet={address}` would return.

type ReadKind = 'agent_read' | 'agent_write';
type CapKind = 'capability_grant' | 'capability_revoke';
type DdcKind = 'ddc_upload' | 'ddc_download';
type GenericKind = 'event';
export type DataEventKind = ReadKind | CapKind | DdcKind | GenericKind;

export type DataEvent = {
  id: string;
  kind: DataEventKind;
  actor: string; // app/agent that performed the action
  target: string; // resource path / cubby key / CID
  bytes?: number;
  at: string; // ISO timestamp
};

export const sampleDataEvents: DataEvent[] = [
  {
    id: 'evt_01',
    kind: 'agent_read',
    actor: 'Hiring Intelligence',
    target: 'cubby/hr-candidate-profiles/martijn',
    at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: 'evt_02',
    kind: 'capability_grant',
    actor: 'Proofi · health-demo',
    target: 'credential/linkedin-verified · 7d',
    at: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
  },
  {
    id: 'evt_03',
    kind: 'ddc_upload',
    actor: 'Vibeboard',
    target: 'CID baf...kx9 · 412 KB',
    bytes: 412 * 1024,
    at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'evt_04',
    kind: 'agent_write',
    actor: 'Rocky',
    target: 'cubby/firm-intel/cere-2026-q2',
    at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'evt_05',
    kind: 'ddc_download',
    actor: 'Cere Wallet',
    target: 'CID baf...j2v · 1.2 MB',
    bytes: 1.2 * 1024 * 1024,
    at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: 'evt_06',
    kind: 'capability_revoke',
    actor: 'You',
    target: 'old-marketing-app · all',
    at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
  },
];

export const friendlyAge = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return `${d} d ago`;
};

// Best-effort mapper from the vault `StreamEvent` shape to the
// `DataEvent` shape this list renders. The vault hasn't published a strict
// schema yet, so we tolerate a few likely field names.
export type RemoteStreamEvent = {
  id?: string;
  kind?: string;
  type?: string;
  agentId?: string;
  agentName?: string;
  scope?: string;
  cubby?: string;
  alias?: string;
  cid?: string;
  bytes?: number;
  at?: string;
  timestamp?: string;
};

const KIND_MAP: Record<string, DataEventKind> = {
  read: 'agent_read',
  agent_read: 'agent_read',
  write: 'agent_write',
  agent_write: 'agent_write',
  upload: 'ddc_upload',
  ddc_upload: 'ddc_upload',
  download: 'ddc_download',
  ddc_download: 'ddc_download',
  grant: 'capability_grant',
  capability_grant: 'capability_grant',
  revoke: 'capability_revoke',
  capability_revoke: 'capability_revoke',
};

// Heuristic: a vault stream event has a `type` like `dc.text`, `lens.extract.completed`,
// etc., plus a `role` (`source`/`user`/`agent`). We map these to our display kinds so the
// real list isn't filtered to zero entries.
function inferKind(r: any): DataEventKind {
  const explicit = (r.kind || '').toLowerCase();
  if (KIND_MAP[explicit]) return KIND_MAP[explicit];
  const role = (r.role || '').toLowerCase();
  if (role === 'agent') return 'agent_write';
  if (role === 'user' || role === 'source') return 'agent_read';
  return 'event';
}

export function streamToDataEvents(remote: any[]): DataEvent[] {
  return remote.map((r, i): DataEvent => {
    const at = r.at || r.timestamp || r.createdAt || new Date().toISOString();
    const kind = inferKind(r);
    const eventType = r.type || r.kind || 'event';
    const targetIdRaw = r.target || r.cubby || r.alias || r.cid || r.context;
    let target = '';
    if (r.cubby || r.alias) {
      target = `cubby/${r.scope ? r.scope + '/' : ''}${r.cubby || r.alias}`;
    } else if (r.cid) {
      target = `CID ${String(r.cid).slice(0, 12)}…${r.bytes ? ` · ${formatBytes(r.bytes)}` : ''}`;
    } else if (targetIdRaw) {
      target = String(targetIdRaw);
    } else if (r.context) {
      target = `${r.scope || 'scope'}/${r.context}`;
    } else {
      target = eventType;
    }
    const actor =
      r.agentName ||
      r.agentId ||
      (r.role === 'user' ? 'You' : r.role === 'agent' ? 'Agent' : r.role === 'source' ? 'External' : eventType);
    return {
      id: r.id || r.eventId || `evt_${at}_${i}`,
      kind,
      actor,
      target,
      bytes: r.bytes,
      at,
    };
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
