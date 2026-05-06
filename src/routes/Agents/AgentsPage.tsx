import { Card, CardContent, Stack, Typography, Button, AppsIcon, Alert, styled } from '@cere-wallet/ui';
import { alpha } from '@mui/material';
import { PageHeader } from '~/components';
import { useAgents, useAccountStore } from '~/hooks';
import { revokeAgent } from '~/hooks/useVaultApi';
import { demoAgents } from '~/api/vault-demo';
import { claimVaultForWallet, ClaimProgress } from '~/api/vault-claim';
import { useState, useCallback } from 'react';

type AgentGrant = {
  agentId: string;
  agentName?: string;
  scope?: string;
  permissions?: string[];
  status?: 'live' | 'expiring' | 'revoked' | 'expired';
  lastUsedAt?: string;
  expiresAt?: string;
};

type DotTone = 'live' | 'expiring' | 'revoked';

const tone = (status?: AgentGrant['status']): DotTone => {
  if (status === 'revoked' || status === 'expired') return 'revoked';
  if (status === 'expiring') return 'expiring';
  return 'live';
};

const StatusDot = styled('span')<{ tone: DotTone }>(({ theme, tone }) => {
  const c =
    tone === 'live'
      ? theme.palette.success.main
      : tone === 'expiring'
      ? theme.palette.warning.main
      : theme.palette.error.main;
  return {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: c,
    boxShadow: `0 0 0 4px ${alpha(c, 0.18)}`,
    display: 'inline-block',
  };
});

const friendlyAge = (iso?: string) => {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  const m = Math.round(Math.abs(ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return `${d} d ago`;
};

const expiresIn = (iso?: string) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms < 0) return 'expired';
  const d = Math.round(ms / 86400000);
  if (d > 0) return `expires in ${d} d`;
  const h = Math.round(ms / 3600000);
  return `expires in ${h} hr`;
};

export const AgentsPage = () => {
  const { data, loading, error, notFound } = useAgents();
  const accountStore = useAccountStore();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<{ status: 'idle' | 'running' | 'error'; message?: string }>({
    status: 'idle',
  });

  const vaultId = accountStore.getAccount('ed25519')?.address;
  const privateKey = accountStore.privateKey;

  const handleClaim = useCallback(async () => {
    if (!privateKey) return;
    setClaimState({ status: 'running', message: 'preparing…' });
    try {
      await claimVaultForWallet(privateKey, undefined, (e: ClaimProgress) => {
        setClaimState({ status: 'running', message: (e as any).kind || 'working…' });
      });
      window.location.reload();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('vault claim failed', err);
      setClaimState({ status: 'error', message: err?.message || 'Claim failed' });
    }
  }, [privateKey]);

  const handleRevoke = useCallback(
    async (agentId: string) => {
      if (!vaultId || !privateKey) return;
      setRevoking(agentId);
      try {
        await revokeAgent(privateKey, vaultId, agentId);
        window.location.reload();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('revoke failed', e);
        setRevoking(null);
      }
    },
    [privateKey, vaultId],
  );

  const list = notFound ? (demoAgents as AgentGrant[]) : ((data ?? []) as AgentGrant[]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Agents & access"
        rightElement={
          <Button variant="contained" size="small" startIcon={<AppsIcon />}>
            Connect agent
          </Button>
        }
      />
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
        Every agent that holds a capability to read or write your data, scoped and reversible. Revoke any time.
      </Typography>

      {notFound && (
        <Card>
          <CardContent>
            <Stack spacing={1.5} alignItems="flex-start" py={1.5}>
              <Typography variant="h3">Claim your vault</Typography>
              <Typography variant="body2" color="text.secondary">
                Your wallet doesn't have a vault yet on this network. Claim one to start connecting agents and storing
                data. The vault is keyed to your Cere Network address — only this wallet can read or grant access.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleClaim}
                  disabled={claimState.status === 'running' || !privateKey}
                >
                  {claimState.status === 'running' ? 'Claiming…' : 'Claim my vault'}
                </Button>
                {claimState.status === 'running' && claimState.message && (
                  <Typography variant="caption" color="text.caption">
                    {claimState.message}
                  </Typography>
                )}
              </Stack>
              {claimState.status === 'error' && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  Claim failed: {claimState.message}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {error && !notFound && <Alert severity="warning">Vault API unreachable. ({error.message})</Alert>}

      {loading && !data && (
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.caption">
              Loading…
            </Typography>
          </CardContent>
        </Card>
      )}

      {notFound && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Showing example agents until your vault is claimed. None of these have actual access yet.
        </Alert>
      )}

      {!loading && !error && !notFound && list.length === 0 && (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={0.5} py={4}>
              <Typography variant="subtitle1">No agents connected</Typography>
              <Typography variant="caption" color="text.caption">
                Browse the marketplace to grant scoped access to your vault.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack spacing={1.5}>
        {list.map((a) => {
          const t = tone(a.status);
          const last = friendlyAge(a.lastUsedAt) || expiresIn(a.expiresAt);
          const [pubkey, alias] = (a.agentId || '').split(':');
          const display = a.agentName || alias || a.agentId;
          const isOpen = expanded === a.agentId;
          return (
            <Card key={a.agentId}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Stack flex={1} spacing={0.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <StatusDot tone={t} />
                      <Typography variant="subtitle1">{display}</Typography>
                      {a.scope && (
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontWeight: 600,
                          }}
                        >
                          {a.scope}
                        </Typography>
                      )}
                    </Stack>
                    {pubkey && alias && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: '0.72rem',
                          color: 'text.caption',
                          letterSpacing: 0,
                        }}
                      >
                        {pubkey.slice(0, 12)}…{pubkey.slice(-6)}
                      </Typography>
                    )}
                    {last && (
                      <Typography variant="caption" color="text.caption">
                        {last}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => setExpanded(isOpen ? null : a.agentId)}>
                      {isOpen ? 'Hide' : 'Details'}
                    </Button>
                    {t !== 'revoked' && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={revoking === a.agentId}
                        onClick={() => handleRevoke(a.agentId)}
                      >
                        {revoking === a.agentId ? 'Revoking…' : 'Revoke'}
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {isOpen && (
                  <Stack spacing={1.25} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <DetailRow label="Agent ID" mono value={a.agentId} />
                    {alias && <DetailRow label="Alias" value={alias} />}
                    {pubkey && <DetailRow label="Service pubkey" mono value={pubkey} />}
                    {a.scope && <DetailRow label="Scope" value={a.scope} />}
                    {a.status && <DetailRow label="Status" value={a.status} />}
                    {(a.permissions || []).length > 0 && (
                      <DetailRow label="Permissions" value={(a.permissions || []).join(', ')} />
                    )}
                    {a.lastUsedAt && <DetailRow label="Last used" value={new Date(a.lastUsedAt).toLocaleString()} />}
                    {a.expiresAt && <DetailRow label="Expires" value={new Date(a.expiresAt).toLocaleString()} />}
                  </Stack>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
};

const DetailRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 2 }}>
    <Typography
      variant="caption"
      color="text.caption"
      sx={{ minWidth: 130, textTransform: 'uppercase', letterSpacing: '0.04em' }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        flex: 1,
        wordBreak: 'break-all',
        ...(mono && {
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.78rem',
          letterSpacing: 0,
        }),
      }}
    >
      {value}
    </Typography>
  </Stack>
);
