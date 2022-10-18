import { Button, Stack, Typography, Link, TextField, CereIcon, FormControl } from '@cere-wallet/ui';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthApiService } from '~/api/auth-api.service';
import { useNavigate } from 'react-router-dom';

interface LogInProps {
  variant?: 'signin' | 'signup';
}

const validationSchema = yup
  .object({
    email: yup.string().required('Email is required field').email('Wrong email format'),
  })
  .required();

export const LoginPage = ({ variant = 'signin' }: LogInProps) => {
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
      navigate('/login/otp', { state: { email: value } });
    } else {
      console.error('OtpPage sending error');
    }
  };

  return (
    <Stack
      direction="column"
      spacing="16px"
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
          name="email"
          label="Email"
          variant="outlined"
        />
      </FormControl>
      <Typography variant="caption2" color="text.secondary">
        By using your Cere wallet you automatically agree to our <Link href="#">Terms & Conditions</Link> and{' '}
        <Link href="#">Privacy Policy</Link>
      </Typography>
      <Button variant="contained" size="large" type="submit">
        Sign {variant === 'signin' ? 'In' : 'Up'}
      </Button>
    </Stack>
  );
};
