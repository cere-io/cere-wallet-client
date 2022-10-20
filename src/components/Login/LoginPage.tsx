import {
  Button,
  Stack,
  Typography,
  Link,
  TextField,
  CereIcon,
  FormControl,
  IconButton,
  GoogleIcon,
  FacebookIcon,
} from '@cere-wallet/ui';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthApiService } from '~/api/auth-api.service';
import { useLocation, useNavigate } from 'react-router-dom';
import { Divider } from '@mui/material';
import { createNextUrl, getTokenWithFacebook, getTokenWithGoogle } from './auth.service';

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

  const {
    register,
    handleSubmit,
    getValues: getFormValues,
    formState: { errors },
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
    const token = await getTokenWithGoogle();
    if (token) {
      window.location.href = createNextUrl(token);
    } else {
      console.error('Google authorization error');
    }
  };

  const onFacebookAuth = async () => {
    const token = await getTokenWithFacebook();
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
          variant="outlined"
        />
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        By using your Cere wallet you automatically agree to our <Link href="#">Terms & Conditions</Link> and{' '}
        <Link href="#">Privacy Policy</Link>
      </Typography>
      <Button variant="contained" size="large" type="submit">
        Sign {variant === 'signin' ? 'In' : 'Up'}
      </Button>
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
