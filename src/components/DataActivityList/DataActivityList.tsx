import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  EastIcon,
  SouthEastIcon,
  TopUpIcon,
  TransferIcon,
  CheckCircleIcon,
  CancelIcon,
} from '@cere-wallet/ui';
import { sampleDataEvents, DataEvent, DataEventKind, friendlyAge } from './sampleEvents';

const KIND_META: Record<
  DataEventKind,
  { title: string; verb: string; icon: JSX.Element; tone: 'success' | 'warn' | 'neutral' | 'info' }
> = {
  agent_read: { title: 'Agent read', verb: 'read', icon: <SouthEastIcon />, tone: 'info' },
  agent_write: { title: 'Agent write', verb: 'wrote to', icon: <EastIcon />, tone: 'info' },
  capability_grant: { title: 'Access granted', verb: 'granted access to', icon: <CheckCircleIcon />, tone: 'success' },
  capability_revoke: { title: 'Access revoked', verb: 'revoked', icon: <CancelIcon />, tone: 'warn' },
  ddc_upload: { title: 'DDC upload', verb: 'uploaded', icon: <TopUpIcon />, tone: 'info' },
  ddc_download: { title: 'DDC download', verb: 'downloaded', icon: <TransferIcon />, tone: 'info' },
  event: { title: 'Event', verb: 'fired', icon: <EastIcon />, tone: 'neutral' },
};

const TONE_COLOR: Record<'success' | 'warn' | 'neutral' | 'info', string> = {
  success: 'success.main',
  warn: 'warning.main',
  neutral: 'text.secondary',
  info: 'primary.main',
};

export type DataActivityListProps = {
  events?: DataEvent[];
  limit?: number;
};

export const DataActivityList = ({ events = sampleDataEvents, limit }: DataActivityListProps) => {
  const list = limit ? events.slice(0, limit) : events;
  return (
    <List variant="outlined">
      {list.map((event, index) => {
        const meta = KIND_META[event.kind];
        const isLast = index === list.length - 1;
        return (
          <ListItem key={event.id} divider={!isLast}>
            <ListItemIcon variant="outlined" sx={{ color: TONE_COLOR[meta.tone] }}>
              {meta.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={0.75} alignItems="baseline" flexWrap="wrap">
                  <Typography variant="subtitle2">{event.actor}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {meta.verb}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: '0.78rem',
                      color: 'text.primary',
                      wordBreak: 'break-all',
                    }}
                  >
                    {event.target}
                  </Typography>
                </Stack>
              }
              secondary={`${meta.title} · ${friendlyAge(event.at)}`}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
