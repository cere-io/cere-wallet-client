import { ReactNode } from 'react';
import {
  Accordion,
  AccordionProps,
  AccordionDetails,
  AccordionSummary,
  ExpandMoreIcon,
  Typography,
} from '@cere-wallet/ui';

export type FAQSectionProps = Pick<AccordionProps, 'defaultExpanded'> & {
  title: string;
  children: ReactNode;
};

export const FAQSection = ({ title, children, defaultExpanded }: FAQSectionProps) => (
  <Accordion defaultExpanded={defaultExpanded}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography fontWeight="bold">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </AccordionDetails>
  </Accordion>
);