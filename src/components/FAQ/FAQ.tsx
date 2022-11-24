import { Stack, StackProps, styled, Typography } from '@cere-wallet/ui';

import { FAQSection } from './FAQSection';

export type FAQProps = StackProps & {
  title?: string;
};

const Wrapper = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.neutral.light,
  borderRadius: 16,
  padding: theme.spacing(2),
  margin: 0,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

export const FAQ = ({ title, children, ...props }: FAQProps) => (
  <Wrapper {...props}>
    {title && <Typography variant="h3">{title}</Typography>}

    {children}
  </Wrapper>
);

FAQ.Section = FAQSection;
