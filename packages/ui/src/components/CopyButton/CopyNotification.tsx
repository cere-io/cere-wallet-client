import { Paper, Snackbar, SnackbarProps, Typography, styled } from '@mui/material';
import { Stack } from '@mui/system';
import { CheckCircleIcon } from '../../icons';

export type CopyNotificationProps = Pick<SnackbarProps, 'message' | 'open'>;

const Content = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 1.5, 1, 1),
  boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1);',
}));

export const CopyNotification = ({ open, message }: CopyNotificationProps) => (
  <Snackbar
    sx={{ top: 16 }}
    open={open}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
  >
    <Content variant="outlined">
      <Stack spacing={1} direction="row" alignItems="center">
        <CheckCircleIcon fontSize="small" color="success" />
        <Typography variant="body1">{message}</Typography>
      </Stack>
    </Content>
  </Snackbar>
);
