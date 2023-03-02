import {
  LoadingButton,
  Stack,
  Typography,
  Link,
  TextField,
  CereIcon,
  FormControl,
  IconButton,
  GoogleIcon,
  FacebookIcon,
  Divider,
} from '@cere-wallet/ui';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthApiService } from '~/api/auth-api.service';
import { useLocation, useNavigate } from 'react-router-dom';
import { createNextUrl, getTokenWithFacebook, getTokenWithGoogle } from './auth.service';
import { useEffect } from 'react';

interface LogInProps {
  variant?: 'signin' | 'signup';
}

const validationSchema = yup
  .object({
    email: yup.string().required('Email is required field').email('Wrong email format'),
  })
  .required();

export const LoginPage = ({ variant = 'signin' }: LogInProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isSignUp = location.pathname.endsWith('signup');
    localStorage.setItem('showProductTour', isSignUp.toString());
  }, [location.pathname]);

  const {
    register,
    handleSubmit,
    getValues: getFormValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<any> = async () => {
    const value = getFormValues('email');

    if (await AuthApiService.sendOtp(value)) {
      navigate(
        { ...location, pathname: '/authorize/otp' },
        {
          state: { email: value },
        },
      );
    } else {
      console.error('OtpPage sending error');
    }
  };

  const onGoogleAuth = async () => {
    const googleToken = await getTokenWithGoogle();
    const token = await AuthApiService.getTokenBySocial(googleToken);
    if (token) {
      window.location.href = createNextUrl(token);
    } else {
      console.error('Google authorization error');
    }
  };

  const onFacebookAuth = async () => {
    const fbToken = await getTokenWithFacebook();
    const token = await AuthApiService.getTokenBySocial(fbToken);
    if (token) {
      window.location.href = createNextUrl(token);
    } else {
      console.error('Facebook authorization error');
    }
  };

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
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h2" flex={1}>
          CERE wallet
        </Typography>
        <CereIcon />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Send and receive any currency or simply top up with your card.
      </Typography>
      <FormControl>
        <TextField
          {...register('email')}
          error={!!errors?.email?.message}
          helperText={errors.email?.message}
          required
          autoFocus
          name="email"
          label="Email"
          autoCorrect="off"
          autoCapitalize="off"
          type="email"
          variant="outlined"
        />
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        By using your Cere wallet you automatically agree to our <Link href="#">Terms & Conditions</Link> and{' '}
        <Link href="#">Privacy Policy</Link>
      </Typography>
      <LoadingButton loading={isSubmitting} variant="contained" size="large" type="submit">
        Sign {variant === 'signin' ? 'In' : 'Up'}
      </LoadingButton>
      <Divider>Or</Divider>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <IconButton size="large" variant="outlined" onClick={onGoogleAuth}>
          <GoogleIcon />
        </IconButton>
        <IconButton size="large" variant="outlined" onClick={onFacebookAuth}>
          <FacebookIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};
