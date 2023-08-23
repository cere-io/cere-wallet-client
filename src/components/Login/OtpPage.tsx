import {
  LoadingButton,
  Button,
  Stack,
  Typography,
  TextField,
  CereIcon,
  OtpInput,
  Alert,
  useTheme,
} from '@cere-wallet/ui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { reportError } from '~/reporting';
import { AuthApiService } from '~/api/auth-api.service';
import { CereWhiteLogo } from '~/components';

interface OtpProps {
  email?: string;
  onRequestLogin: (idToken: string) => void | Promise<void>;
}

const validationSchema = yup
  .object({
    code: yup.string().required('Code is required field').length(6),
  })
  .required();

export const OtpPage = ({ email, onRequestLogin }: OtpProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { isGame } = useTheme();

  const {
    register,
    handleSubmit,
    setError,
    getValues: getFormValues,
    formState: { errors, isSubmitting },
    setValue: setFormValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      code: '',
    },
  });

  const onSubmit: SubmitHandler<any> = async () => {
    const value = getFormValues('code');
    const token = await AuthApiService.getTokenByEmail(email!, value);

    if (!token) {
      return setError('code', { message: 'The code is wrong, please try again' });
    }

    try {
      await onRequestLogin(token);
    } catch (error) {
      if (error instanceof Error) {
        setError('root', { message: error.message });
      }

      reportError(error);
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    await AuthApiService.sendOtp(email!);
  };

  useEffect(() => {
    let timer = timeLeft ? setTimeout(() => setTimeLeft(timeLeft - 1), 1000) : undefined;

    return () => {
      clearTimeout(timer);
    };
  }, [timeLeft]);

  useEffect(() => {
    if (!email) {
      navigate({ ...location, pathname: '/authorize' });
    }
  }, [email, location, navigate]);

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="stretch"
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="h2" flex={1} color={isGame ? 'primary.light' : 'text.secondary'}>
          Verify email
        </Typography>
        {isGame ? <CereWhiteLogo /> : <CereIcon />}
      </Stack>
      <Typography variant="body2" color={isGame ? 'primary.light' : 'text.secondary'}>
        {isGame ? 'Access your wallet using the code sent to your email' : 'Access CERE using code sent to your email'}
      </Typography>
      <TextField
        value={email}
        variant="outlined"
        disabled={true}
        sx={{
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: isGame ? 'rgba(245, 250, 252, 1)' : '',
          },
        }}
      />
      <Typography variant="body2" color={isGame ? '#FFF' : 'text.secondary'} align={isGame ? 'center' : 'left'}>
        Verification code
      </Typography>
      <OtpInput
        {...register('code')}
        onChange={(val) => setFormValue('code', val)}
        errorMessage={errors?.code?.message}
      />

      {errors.root && (
        <Alert variant="outlined" severity="warning" sx={{ marginY: 1 }}>
          {errors.root?.message}
        </Alert>
      )}

      <LoadingButton loading={isSubmitting} variant="contained" size="large" type="submit">
        {errors.root ? 'Retry' : 'Verify'}
      </LoadingButton>
      {timeLeft ? (
        <Typography variant="body1" align="center" color={isGame ? 'primary.light' : 'text.secondary'}>
          Resend verification code in <strong>{timeLeft}</strong> seconds
        </Typography>
      ) : (
        <Typography variant="body1" align="center" color={isGame ? 'primary.light' : 'text.secondary'}>
          Did not receive a code?{' '}
          <Button
            variant="text"
            onClick={handleResend}
            sx={{
              color: isGame ? 'rgba(243, 39, 88, 1)' : 'primary.main',
            }}
          >
            Resend code
          </Button>
        </Typography>
      )}
    </Stack>
  );
};
