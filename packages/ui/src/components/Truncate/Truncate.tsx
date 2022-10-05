export type TruncateProps = {
  text: string;
  maxLength?: number;
  endingLength?: number;
  variant?: 'text' | 'email' | 'hex';
};

const getDefaultEndingLength = ({ text, variant, maxLength = text.length }: TruncateProps) => {
  if (variant === 'hex') {
    return 4;
  }

  if (variant === 'email') {
    const [, domain] = text.split('@');

    return domain.length + 1;
  }

  return Math.round(maxLength / 2);
};

export const Truncate = ({
  text,
  variant = 'text',
  maxLength = text.length,
  endingLength = getDefaultEndingLength({ text, variant, maxLength }),
}: TruncateProps) => {
  if (maxLength >= text.length) {
    return <>{text}</>;
  }

  const ending = text.slice(-endingLength);
  const truncated = text.slice(0, maxLength - endingLength);

  return <>{[truncated, ending].filter(Boolean).join('...')}</>;
};
