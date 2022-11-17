import { Stack, StackProps, styled, Typography } from '@cere-wallet/ui';

import { FAQSection } from './FAQSection';

export type FAQProps = StackProps & {
  title?: string;
};

const Wrapper = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.neutral.light,
  borderRadius: theme.typography.pxToRem(16),
  padding: '1rem',
  margin: 0,
  [theme.breakpoints.up('md')]: {
    padding: `2rem`,
  },
}));

export const FAQ = ({ title, children, ...props }: FAQProps) => (
  <Wrapper {...props}>
    {title && <Typography variant="h3">{title}</Typography>}

    {children}
  </Wrapper>
);

FAQ.Section = FAQSection;
