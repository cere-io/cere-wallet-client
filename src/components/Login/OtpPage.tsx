import { Button, Stack, Typography, TextField, CereIcon, OtpInput } from '@cere-wallet/ui';
import { useEffect, useState } from 'react';
import { AuthApiService } from '~/api/auth-api.service';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createNextUrl } from './auth.service';

interface OtpProps {
  email: string;
}

const validationSchema = yup
  .object({
    code: yup.string().required('Code is required field').length(6),
  })
  .required();

export const OtpPage = ({ email }: OtpProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setError,
    getValues: getFormValues,
    formState: { errors },
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
    const token = await AuthApiService.getToken(email, value);
    if (token) {
      window.location.href = createNextUrl(token);
    } else {
      setError('code', { message: 'The code is wrong, please try again' });
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    await AuthApiService.sendOtp(email);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }

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
        <Typography variant="h2" flex={1}>
          Verify email
        </Typography>
        <CereIcon />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Access CERE using code sent to your email
      </Typography>
      <TextField value={email} variant="outlined" disabled={true} />
      <Typography variant="body2" color="text.secondary">
        Verification code
      </Typography>
      <OtpInput
        {...register('code')}
        onChange={(val) => setFormValue('code', val)}
        errorMessage={errors?.code?.message}
      />
      <Button variant="contained" size="large" type="submit">
        Verify
      </Button>
      {timeLeft ? (
        <Typography variant="body1" align="center">
          Resend verification code in <strong>{timeLeft}</strong> seconds
        </Typography>
      ) : (
        <Typography variant="body1" align="center">
          Did not receive a code?{' '}
          <Button variant="text" onClick={handleResend}>
            Resend code
          </Button>
        </Typography>
      )}
    </Stack>
  );
};
