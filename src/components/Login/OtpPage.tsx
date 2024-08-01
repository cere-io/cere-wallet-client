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
  Fade,
} from '@cere-wallet/ui';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { reportError } from '~/reporting';
import { AuthApiService } from '~/api/auth-api.service';
import { CereWhiteLogo, PoweredBy } from '~/components';
import { useAppContextStore } from '~/hooks';

const TIME_LEFT = 60; // seconds before next otp request
const SPAM_NOTICE_TIME = 30; // seconds before spam notice

interface OtpProps {
  email?: string;
  busy?: boolean;
  code?: string;
  onRequestResend: () => unknown | Promise<unknown>;
  onRequestLogin: (idToken: string) => void | Promise<void>;
}

const validationSchema = yup
  .object({
    code: yup.string().required('Code is required field').length(6),
  })
  .required();

export const OtpPage = ({ email, onRequestLogin, onRequestResend, busy = false, code }: OtpProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [spamNotice, setSpamNotice] = useState(false);
  const [otpAccepted, setOtpAccepted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LEFT);
  const { isGame } = useTheme();
  const appStore = useAppContextStore();

  const verifyScreenSettings = appStore?.whiteLabel?.verifyScreenSettings;

  const {
    control,
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

  useEffect(() => {
    if (code) {
      setFormValue('code', code);
    }
  }, [setFormValue, code]);

  const onSubmit: SubmitHandler<any> = async () => {
    const value = getFormValues('code');
    const token = await AuthApiService.getTokenByEmail(email!, value);

    if (!token) {
      return setError('code', { message: 'The code is wrong, please try again' });
    }

    setOtpAccepted(true);

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
    setTimeLeft(TIME_LEFT);
    await onRequestResend();
  };

  useEffect(() => {
    let timer = timeLeft ? setTimeout(() => setTimeLeft(timeLeft - 1), 1000) : undefined;

    /**
     * Show spam notice if time left is less than SPAM_NOTICE_TIME and keep it visible after resend
     */
    if (timeLeft < SPAM_NOTICE_TIME) {
      setSpamNotice(true);
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

  const verifyScreenMainTitle = useMemo(() => {
    return verifyScreenSettings?.verifyScreenMainTitle || 'Verify email';
  }, [verifyScreenSettings?.verifyScreenMainTitle]);

  const cereWalletIcon = useMemo(() => {
    if (isGame) {
      return <CereWhiteLogo />;
    }
    if (verifyScreenSettings?.hideIconInHeader) {
      return;
    }
    return <CereIcon />;
  }, [isGame, verifyScreenSettings?.hideIconInHeader]);

  const verifyScreenMainText = useMemo(() => {
    if (isGame) {
      return 'Access your account using the code sent to your email';
    }
    return verifyScreenSettings?.verifyScreenMainText || 'Access CERE using code sent to your email';
  }, [isGame, verifyScreenSettings?.verifyScreenMainText]);

  return (
    <Stack minHeight={520}>
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
            {verifyScreenMainTitle}
          </Typography>
          {cereWalletIcon}
        </Stack>
        <Typography variant="body2" color={isGame ? 'primary.light' : 'text.secondary'}>
          {verifyScreenMainText}
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
        <Controller
          name="code"
          control={control}
          render={({ field }) => <OtpInput {...field} errorMessage={errors?.code?.message} />}
        />

        {errors.root && (
          <Alert variant="outlined" severity="warning" sx={{ marginY: 1 }}>
            {errors.root?.message}
          </Alert>
        )}

        <LoadingButton loading={isSubmitting || busy} variant="contained" size="large" type="submit">
          {errors.root ? 'Retry' : 'Verify'}
        </LoadingButton>
        {timeLeft ? (
          <Typography lineHeight={2} align="center" color={isGame ? 'primary.light' : 'text.secondary'}>
            Resend verification code in <strong>{timeLeft}</strong> seconds
          </Typography>
        ) : (
          <Typography lineHeight={2} align="center" color={isGame ? 'primary.light' : 'text.secondary'}>
            Did not receive a code?{' '}
            <Button
              variant="text"
              size="small"
              onClick={handleResend}
              sx={{
                fontSize: isGame ? '16px' : '14px',
                color: isGame ? 'rgba(243, 39, 88, 1)' : 'primary.main',
              }}
            >
              Resend code
            </Button>
          </Typography>
        )}

        {spamNotice && !otpAccepted && (
          <Fade in>
            <Alert variant="standard" severity="info">
              If you didn’t get the verification email please check your Spam folder.
            </Alert>
          </Fade>
        )}
      </Stack>

      {verifyScreenSettings?.poweredBySection && <PoweredBy />}
    </Stack>
  );
};
