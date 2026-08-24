// Demo fixtures shown when the connected wallet has no claimed vault yet
// (vault API returns 404). The marketplace UI does the same thing — see
// `demo-wallet` / `your-vault` in agent-marketplace.compute.dev.ddcdragon.com.
// Anything rendered from these is tagged with a "preview" pill so it's
// never confused with real vault data.

export const demoScopes = [
  { name: 'health', displayName: 'Health' },
  { name: 'conversation', displayName: 'Conversation' },
];

export const demoAgents = [
  {
    agentId: 'agent.health-coach.v0_7_1',
    agentName: 'Health Coach',
    scope: 'health',
    permissions: ['read', 'write'],
    status: 'live',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    agentId: 'agent.dating-coach.v0_3_0',
    agentName: 'Dating Coach',
    scope: 'conversation',
    permissions: ['read', 'write'],
    status: 'live',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    agentId: 'agent.team-meeting-memory.v1_0_2',
    agentName: 'Team Meeting Memory',
    scope: 'conversation',
    permissions: ['read', 'write'],
    status: 'expiring',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

// Shape matches the StreamEvent → DataEvent mapper in components/DataActivityList/sampleEvents.ts
export const demoActivity = [
  {
    id: 'evt_demo_1',
    kind: 'agent_read',
    agentId: 'agent.health-coach.v0_7_1',
    agentName: 'Health Coach',
    scope: 'health',
    cubby: 'sleep/2026-week-18',
    at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'evt_demo_2',
    kind: 'agent_write',
    agentName: 'Dating Coach',
    scope: 'conversation',
    cubby: 'date-debrief/2026-05-04',
    at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'evt_demo_3',
    kind: 'capability_grant',
    agentName: 'Team Meeting Memory',
    scope: 'conversation',
    at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];
