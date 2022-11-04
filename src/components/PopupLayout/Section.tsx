import { Link, Button, StackProps, Collapse, styled, Box, Stack } from '@cere-wallet/ui';
import { useCallback, useState } from 'react';

export type SectionProps = StackProps & {
  collapsible?: boolean;
  collapseLabel?: string;
  expandLabel?: string;
};

const Container = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export const Section = ({
  collapsible = false,
  collapseLabel = 'Less details',
  expandLabel = 'More details',
  children,
  ...props
}: SectionProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const expand = useCallback(() => setOpen(true), []);
  const collapse = useCallback(() => setOpen(false), []);

  if (!collapsible) {
    return (
      <Container>
        <Stack {...props}>{children}</Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Box marginLeft="-14px">
        {open ? (
          <Button size="small" component={Link} onClick={collapse}>
            {collapseLabel}
          </Button>
        ) : (
          <Button size="small" component={Link} onClick={expand}>
            {expandLabel}
          </Button>
        )}
      </Box>

      <Collapse in={open}>
        <Stack marginTop={1} {...props}>
          {children}
        </Stack>
      </Collapse>

      {open && (
        <Box display="flex" justifyContent="flex-end" marginTop={2} marginRight="-14px">
          <Button size="small" component={Link} onClick={collapse}>
            {collapseLabel}
          </Button>
        </Box>
      )}
    </Container>
  );
};
