export type TruncateProps = {
  text: string;
  maxLength?: number;
  endingLength?: number;
};

export const Truncate = ({
  text,
  maxLength = text.length,
  endingLength = Math.round(maxLength / 2),
}: TruncateProps) => {
  if (maxLength >= text.length) {
    return <>{text}</>;
  }

  const ending = text.slice(-endingLength);
  const truncated = text.slice(0, maxLength - endingLength);

  return <>{[truncated, ending].filter(Boolean).join('...')}</>;
};
