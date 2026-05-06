// Vault API client — agent-marketplace.compute.dev.ddcdragon.com
// Uses the wallet's existing AuthenticationStore-issued bearer token.
// In dev we route through CRA's setupProxy.js (relative path) to sidestep
// CORS; in prod the wallet would share the marketplace origin.

export const VAULT_AUDIENCE = 'https://agent-marketplace.compute.dev.ddcdragon.com';
const VAULT_BASE = '/vault/api/v1';

export type Scope = {
  scope: string;
  alias?: string;
  cluster?: string;
  sizeBytes?: number;
  lastWriteAt?: string;
  agentCount?: number;
};

export type AgentGrant = {
  agentId: string;
  agentName?: string;
  scope?: string;
  permissions?: string[];
  status?: 'live' | 'expiring' | 'revoked' | 'expired';
  issuedAt?: string;
  expiresAt?: string;
  lastUsedAt?: string;
};

export type StreamEvent = {
  id: string;
  kind: string;
  agentId?: string;
  agentName?: string;
  scope?: string;
  cubby?: string;
  cid?: string;
  bytes?: number;
  at: string;
};

class VaultApiError extends Error {
  constructor(public status: number, public path: string, message: string) {
    super(message);
  }
}

async function call<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${VAULT_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new VaultApiError(res.status, path, text || res.statusText);
  }

  return res.json() as Promise<T>;
}

export const VaultApi = {
  scopes: (vaultId: string, token: string) => call<Scope[]>(`/vaults/${vaultId}/scopes`, token),

  agents: (vaultId: string, token: string) => call<AgentGrant[]>(`/vaults/${vaultId}/agents`, token),

  streams: (vaultId: string, scope: string, token: string) =>
    call<StreamEvent[]>(`/vaults/${vaultId}/scopes/${encodeURIComponent(scope)}/streams`, token),

  cubbyQuery: <T = unknown>(
    vaultId: string,
    scope: string,
    agentId: string,
    alias: string,
    body: unknown,
    token: string,
  ) =>
    call<T>(
      `/vaults/${vaultId}/scopes/${encodeURIComponent(scope)}/agents/${agentId}/cubbies/${encodeURIComponent(
        alias,
      )}/query`,
      token,
      { method: 'POST', body: JSON.stringify(body) },
    ),

  revokeAgent: (vaultId: string, agentId: string, token: string) =>
    call<void>(`/vaults/${vaultId}/agents/${agentId}`, token, { method: 'DELETE' }),

  marketplaceAgent: (agentId: string, token: string) =>
    call<{ id: string; name: string; description?: string; verified?: boolean }>(
      `/marketplace/agents/${agentId}`,
      token,
    ),
};

export { VaultApiError, VAULT_BASE };
