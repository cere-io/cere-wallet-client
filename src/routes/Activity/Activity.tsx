import { useMemo, useState } from 'react';
import { Stack, Typography, Alert, Card, CardContent, Button, TextField, MenuItem, Select, Box } from '@cere-wallet/ui';
import { ActivityList, DataActivityList } from '~/components';
import { streamToDataEvents } from '~/components/DataActivityList/sampleEvents';
import { useActivity, useScopes, useAgents, useAccountStore, useVaultDiagnostics } from '~/hooks';
import { publishEvent } from '~/hooks/useVaultApi';
import { demoActivity } from '~/api/vault-demo';

const SAMPLE_DC_TEXT = JSON.stringify(
  {
    candidate_id: 'demo-deal-001',
    candidate_name: 'Devnet Demo',
    transcript: 'Prospect: Budget approved Q3, need CTO buy-in. Rep: will set up CTO call.',
    role: 'Enterprise',
    fleet_name: 'gtm-default-v1',
    stream_name: 'stream-source',
  },
  null,
  2,
);

export const Activity = () => {
  const activity = useActivity();
  const scopes = useScopes();
  const agents = useAgents();
  const accountStore = useAccountStore();
  const diag = useVaultDiagnostics();
  const events = activity.notFound
    ? streamToDataEvents(demoActivity)
    : activity.data
    ? streamToDataEvents(activity.data)
    : null;

  const scopeOptions = useMemo(
    () => ((scopes.data || []) as any[]).map((s) => s?.name || s?.scope).filter(Boolean) as string[],
    [scopes.data],
  );
  const agentOptions = useMemo(
    () => ((agents.data || []) as any[]).map((a) => a?.agentId).filter(Boolean) as string[],
    [agents.data],
  );

  const [scope, setScope] = useState('default');
  const [agentTarget, setAgentTarget] = useState<string>('');
  const [eventType, setEventType] = useState('dc.text');
  const [contextName, setContextName] = useState('stream-source');
  const [payload, setPayload] = useState(SAMPLE_DC_TEXT);
  const [publishState, setPublishState] = useState<{ status: 'idle' | 'busy' | 'ok' | 'err'; msg?: string }>({
    status: 'idle',
  });

  const canPublish = !activity.notFound && !!accountStore.privateKey;

  const handlePublish = async () => {
    if (!accountStore.privateKey) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch (e: any) {
      setPublishState({ status: 'err', msg: `Invalid JSON: ${e.message}` });
      return;
    }
    setPublishState({ status: 'busy' });
    try {
      const res = await publishEvent(accountStore.privateKey, scope || 'default', {
        type: eventType,
        role: 'user',
        target: agentTarget ? `agent:${agentTarget}` : undefined,
        context: contextName || undefined,
        payload: parsed,
      });
      const rejected = res.rejected || [];
      if (rejected.length) {
        setPublishState({ status: 'err', msg: `Rejected: ${JSON.stringify(rejected)}` });
      } else {
        setPublishState({ status: 'ok', msg: `Accepted ${(res.accepted || []).length} event(s) — refreshing…` });
        // Backend may need a moment to index. Give it 1.5s then refetch
        // both the activity feed and the diagnostics panel so eventCount
        // updates too.
        window.setTimeout(() => {
          activity.refresh();
          diag.refresh();
        }, 1500);
      }
    } catch (e: any) {
      setPublishState({ status: 'err', msg: e?.message || 'Publish failed' });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h2">Your data</Typography>
          <Typography variant="body2" color="text.secondary">
            Every read, write, grant, and revoke against your vault.
          </Typography>
        </Stack>
        <Button variant="outlined" size="small" onClick={() => activity.refresh()} disabled={activity.loading}>
          {activity.loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Stack>

      {activity.notFound && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Showing example activity until your vault is claimed. None of the events below are real.
        </Alert>
      )}

      {activity.error && !activity.notFound && (
        <Alert severity="warning">
          Vault API unreachable — showing example activity until it's back. ({activity.error.message})
        </Alert>
      )}

      <Card>
        {activity.loading && !events ? (
          <Stack alignItems="center" py={6}>
            <Typography variant="caption" color="text.caption">
              Loading…
            </Typography>
          </Stack>
        ) : events && events.length === 0 ? (
          <Stack alignItems="center" py={5} spacing={1.5} px={4}>
            <Typography variant="subtitle1">No activity yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 520 }}>
              Vault is connected and agents are subscribed, but no events have been published into your scopes yet. Use
              the publish box below to fire a test event, or have your agent runner / marketplace playground send one.
            </Typography>
            <Typography variant="caption" color="text.caption" sx={{ textAlign: 'center' }}>
              Devnet note: a known Redis OOM sometimes drops <code>XADD</code>s on publish — if a test event doesn't
              show up, that's the cluster, not the wallet.
            </Typography>
          </Stack>
        ) : (
          // Cap the visible window to ~5 rows; the rest scroll. Each row is
          // roughly 64px tall — 360px keeps the page tight while still
          // showing a clear "there's more below" affordance.
          <Box
            sx={{
              maxHeight: 360,
              overflowY: 'auto',
              // hide the inner List's outline since the Card already provides it
              '& .MuiList-root': { border: 0, borderRadius: 0 },
            }}
          >
            <DataActivityList events={events ?? undefined} />
          </Box>
        )}
      </Card>

      {canPublish && (
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1">Vault status</Typography>
                  <Typography variant="caption" color="text.caption">
                    Live snapshot of <code>vaults.current</code> + <code>scopes.list</code> + <code>streams.list</code>
                  </Typography>
                </Stack>
                <Button variant="text" size="small" onClick={() => diag.refresh()} disabled={diag.loading}>
                  {diag.loading ? 'Probing…' : 'Re-probe'}
                </Button>
              </Stack>

              {diag.error ? (
                <Alert severity="error">{diag.error}</Alert>
              ) : (
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: '0.78rem',
                      letterSpacing: 0,
                    }}
                  >
                    vaultId: {diag.vaultId || '—'}
                    {diag.vaultName ? `  ·  name: ${diag.vaultName}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.caption">
                    scopes: {diag.scopes.length === 0 ? '(none)' : diag.scopes.join(', ')}
                  </Typography>
                  {diag.streams.length === 0 ? (
                    <Typography variant="caption" color="text.caption">
                      streams: (no streams returned by streams.list — publish hasn't created one, or it was rejected
                      server-side e.g. Redis OOM)
                    </Typography>
                  ) : (
                    <Stack
                      sx={{
                        mt: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.25,
                        overflow: 'hidden',
                      }}
                    >
                      {diag.streams.map((s, i) => (
                        <Stack
                          key={`${s.scope}-${s.context}-${i}`}
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderTop: i === 0 ? 0 : '1px solid',
                            borderColor: 'divider',
                            fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.74rem',
                          }}
                        >
                          <Typography variant="caption" sx={{ minWidth: 80 }}>
                            {s.scope}
                          </Typography>
                          <Typography variant="caption" sx={{ flex: 1, color: 'text.primary' }}>
                            {s.context}
                          </Typography>
                          <Typography variant="caption" sx={{ minWidth: 80, textAlign: 'right' }}>
                            list: {s.eventCount ?? '?'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              minWidth: 96,
                              textAlign: 'right',
                              color: s.fetchError
                                ? 'error.main'
                                : (s.fetchedEvents ?? 0) === 0 && (s.eventCount ?? 0) > 0
                                ? 'warning.main'
                                : 'text.secondary',
                            }}
                          >
                            fetched: {s.fetchError ? 'err' : s.fetchedEvents ?? '?'}
                          </Typography>
                          {s.rawShape && (
                            <Typography variant="caption" color="text.caption" sx={{ minWidth: 130 }}>
                              {s.rawShape}
                            </Typography>
                          )}
                          {s.lastSeen && (
                            <Typography variant="caption" color="text.caption">
                              {new Date(s.lastSeen).toLocaleTimeString()}
                            </Typography>
                          )}
                          {(s.error || s.fetchError) && (
                            <Typography variant="caption" sx={{ color: 'error.main' }}>
                              {s.error || s.fetchError}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {canPublish && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Publish test event</Typography>
                <Typography variant="caption" color="text.caption">
                  Fires <code>events.publish(vaultId, scope, envelope)</code> against your live vault. Connected agents
                  with a matching subscription pick it up.
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Select
                  size="small"
                  fullWidth
                  value={scope}
                  onChange={(e) => setScope(e.target.value as string)}
                  displayEmpty
                >
                  {scopeOptions.length === 0 && <MenuItem value="default">default</MenuItem>}
                  {scopeOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  size="small"
                  fullWidth
                  displayEmpty
                  value={agentTarget}
                  onChange={(e) => setAgentTarget(e.target.value as string)}
                >
                  <MenuItem value="">No specific target (broadcast)</MenuItem>
                  {agentOptions.map((id) => {
                    const alias = id.split(':')[1] || id;
                    return (
                      <MenuItem key={id} value={id}>
                        {alias}
                      </MenuItem>
                    );
                  })}
                </Select>

                <TextField
                  size="small"
                  fullWidth
                  label="Event type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                />
              </Stack>

              <TextField
                size="small"
                fullWidth
                label="Context (stream name)"
                helperText="Existing stream where the event lands. `stream-source` matches the GTM agent's input stream."
                value={contextName}
                onChange={(e) => setContextName(e.target.value)}
              />

              <TextField
                multiline
                minRows={6}
                maxRows={14}
                fullWidth
                label="Payload (JSON)"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                sx={{
                  '& textarea': {
                    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.78rem',
                    letterSpacing: 0,
                  },
                }}
              />

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button variant="contained" disabled={publishState.status === 'busy'} onClick={handlePublish}>
                  {publishState.status === 'busy' ? 'Publishing…' : 'Publish event'}
                </Button>
                {publishState.status === 'ok' && (
                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                    {publishState.msg}
                  </Typography>
                )}
                {publishState.status === 'err' && (
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    {publishState.msg}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack spacing={0.5}>
        <Typography variant="h3">On-chain</Typography>
        <Typography variant="body2" color="text.secondary">
          CERE transfers and contract calls signed by this wallet.
        </Typography>
      </Stack>
      <ActivityList />
    </Stack>
  );
};
