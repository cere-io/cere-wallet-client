import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  SecurityIcon,
  Stack,
  styled,
  Typography,
  useIsMobile,
} from '@cere-wallet/ui';

import { PageHeader } from '~/components';

const DecorIconButton = styled(IconButton)(() => ({
  width: 36,
  height: 36,
  '& > svg': {
    width: 16,
  },
}));

export const Settings = () => {
  const isMobile = useIsMobile();
  return (
    <>
      <PageHeader title="Settings" />

      <Box maxWidth="md">
        <Card>
          <CardContent>
            <Grid spacing={1} direction="row" alignItems="center" container>
              <Grid item>
                <Box maxWidth="sm">
                  <Stack direction="row" gap={2} alignItems="center">
                    <DecorIconButton variant="filled" size="medium">
                      <SecurityIcon />
                    </DecorIconButton>
                    <Typography variant="body1" fontWeight="semibold">
                      Authentication & Security
                    </Typography>
                  </Stack>
                  <Box marginTop="16px">
                    <Typography variant="body2" color="text.secondary">
                      Click the button bellow to manage your Authentication & Security settings and you will be
                      redirecting to the OpenLogin settings
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid flexGrow={1} marginTop={isMobile ? 3 : 0} item>
                <Button fullWidth href="https://app.openlogin.com" variant="outlined">
                  Go to OpenLogin settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
