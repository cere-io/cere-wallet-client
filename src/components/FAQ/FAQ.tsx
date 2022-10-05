import { Box, BoxProps, styled, Typography } from '@cere-wallet/ui';

import { FAQSection } from './FAQSection';

export type FAQProps = BoxProps & {
  title?: string;
};

const Wrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutral.light,
  borderRadius: 16,
}));

export const FAQ = ({ title, children, ...props }: FAQProps) => (
  <Wrapper {...props}>
    {title && (
      <Typography marginLeft={2} marginTop={2} marginBottom={-1} variant="h6">
        {title}
      </Typography>
    )}

    {children}
  </Wrapper>
);

FAQ.Section = FAQSection;
