import {
  LoadingButton,
  Stack,
  Typography,
  Link,
  TextField,
  CereIcon,
  CereWhiteIcon,
  FormControl,
  IconButton,
  GoogleIcon,
  FacebookIcon,
  Divider,
  styled,
  useTheme,
} from '@cere-wallet/ui';
import { getGlobalStorage } from '@cere-wallet/storage';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthApiService } from '~/api/auth-api.service';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getTokenWithFacebook, getTokenWithGoogle } from './auth.service';
import { useEffect, useMemo } from 'react';
import { SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { useAppContextStore } from '~/hooks';
import { AppContextBanner } from '../AppContextBanner';

interface LogInProps {
  variant?: 'signin' | 'signup';
  onRequestLogin: (idToken: string) => void | Promise<void>;
}

const validationSchema = yup
  .object({
    email: yup.string().required('Email is required field').email('Wrong email format'),
  })
  .required();

export const CereWhiteLogo = styled(CereWhiteIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(48),
}));

const Banner = styled(AppContextBanner)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius * 2,
}));

export const LoginPage = ({ variant = 'signin', onRequestLogin }: LogInProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signText = `Sign ${variant === 'signin' ? 'In' : 'Up'}`;
  const { isGame } = useTheme();
  const store = useAppContextStore();

  const skipLoginIntro = Boolean(store.whiteLabel?.skipLoginIntro);
  const connectScreenSettings = store?.whiteLabel?.connectScreenSettings;

  useEffect(() => {
    const isSignUp = location.pathname.endsWith('signup');

    getGlobalStorage().setItem('showProductTour', isSignUp.toString());
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
      email: searchParams.get('email') || '',
    },
  });

  const connectScreenMainTitle = useMemo(() => {
    if (isGame) {
      return 'Sign up';
    }
    return connectScreenSettings?.connectScreenMainTitle || 'Cere wallet';
  }, [isGame, connectScreenSettings?.connectScreenMainTitle]);

  const cereWalletIcon = useMemo(() => {
    if (isGame) {
      return <CereWhiteLogo />;
    }
    if (connectScreenSettings?.hideIconInHeader) {
      return;
    }
    return <CereIcon />;
  }, [isGame, connectScreenSettings?.hideIconInHeader]);

  const connectScreenMainText = useMemo(() => {
    if (isGame) {
      return "Creating an account is easy! Fill in your email, confirm & claim your spot on the leaderboard! As a sign-up bonus you'll receive 10 credits to continue playing for free";
    }
    return (
      connectScreenSettings?.connectScreenMainText || 'Send and receive any currency or simply top up with your card.'
    );
  }, [isGame, connectScreenSettings?.connectScreenMainText]);

  const poweredBySection = useMemo(() => {
    if (!connectScreenSettings?.poweredBySection) {
      return;
    }
    return (
      <Stack spacing={2} marginTop={8} direction="row" alignItems="center" justifyContent="center">
        <Typography sx={{ marginRight: '8px' }} variant="body2" color="text.secondary">
          Powered by Cere Wallet
        </Typography>
        <CereIcon />
      </Stack>
    );
  }, [connectScreenSettings?.poweredBySection]);

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
      onRequestLogin(token);
    } else {
      console.error('Google authorization error');
    }
  };

  const onFacebookAuth = async () => {
    const fbToken = await getTokenWithFacebook();
    const token = await AuthApiService.getTokenBySocial(fbToken);
    if (token) {
      onRequestLogin(token);
    } else {
      console.error('Facebook authorization error');
    }
  };

  return (
    <Stack
      direction="column"
      spacing={3}
      alignItems="stretch"
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h2" flex={1} color={isGame ? '#FFF' : 'text.primary'}>
          {connectScreenMainTitle}
        </Typography>
        {cereWalletIcon}
      </Stack>
      <Typography variant="body2" color={isGame ? 'primary.light' : 'text.secondary'}>
        {connectScreenMainText}
      </Typography>

      <Banner hideBackButton variant="banner" placement="content" />

      <FormControl>
        <TextField
          {...register('email')}
          error={!!errors?.email?.message}
          helperText={errors.email?.message}
          required
          autoFocus
          name="email"
          label={isGame ? '' : 'Email'}
          autoCorrect="off"
          hiddenLabel={isGame}
          placeholder={isGame ? 'sample-address@gmail.com' : ''}
          autoCapitalize="off"
          type="email"
          variant="outlined"
          sx={{
            input: isGame ? { color: 'rgba(255, 255, 255, 1)' } : '',
            '& fieldset': isGame ? { border: 'none' } : '',
          }}
        />
      </FormControl>
      <Typography variant="caption" color={isGame ? 'primary.light' : 'text.secondary'}>
        By using your {isGame ? 'account' : 'Cere wallet'} you automatically agree to our{' '}
        <Link color={isGame ? 'primary.light' : 'primary.main'} href="#">
          Terms & Conditions
        </Link>{' '}
        and{' '}
        <Link color={isGame ? 'primary.light' : 'primary.main'} href="#">
          Privacy Policy
        </Link>
      </Typography>
      <LoadingButton loading={isSubmitting} variant="contained" size="large" type="submit">
        {isGame || skipLoginIntro ? 'Continue' : signText}
      </LoadingButton>
      {!!SUPPORTED_SOCIAL_LOGINS.length && (
        <>
          <Divider>Or</Divider>
          <Stack direction="row" justifyContent="center" spacing={2}>
            {SUPPORTED_SOCIAL_LOGINS.includes('google') && (
              <IconButton size="large" variant="outlined" onClick={onGoogleAuth}>
                <GoogleIcon />
              </IconButton>
            )}

            {SUPPORTED_SOCIAL_LOGINS.includes('facebook') && (
              <IconButton size="large" variant="outlined" onClick={onFacebookAuth}>
                <FacebookIcon />
              </IconButton>
            )}
          </Stack>
        </>
      )}
      {poweredBySection}
    </Stack>
  );
};
