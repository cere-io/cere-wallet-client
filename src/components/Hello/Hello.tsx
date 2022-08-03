import { Box } from '@cere-wallet/ui';

export type HelloProps = {
  counter: number;
};

const Hello = ({ counter }: HelloProps) => {
  return (
    <Box
      sx={{
        fontSize: '40px',
        textAlign: 'center',
        marginTop: '100px',
      }}
    >
      Cere wallet client {counter}
    </Box>
  );
};

export default Hello;
