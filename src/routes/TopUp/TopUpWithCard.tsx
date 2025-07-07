import { useState, useEffect } from 'react';
import {
  Divider,
  LoadingButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@cere-wallet/ui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useAccountStore } from '~/hooks';
import { API_BASE_URL, COINGECKO_API_URL } from '../../constants';

const MANUAL_TOPUP_MAX_LIMIT = 3; // Maximum manual topup limit in USD

export const TopUpWithCard = () => {
  const accountStore = useAccountStore();
  const [usdAmount, setUsdAmount] = useState('');
  const [cereAmount, setCereAmount] = useState('');
  const [cerePrice, setCerePrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(COINGECKO_API_URL);
        const data = await response.json();
        setCerePrice(data['cere-network'].usd);
      } catch (error) {
        console.error('Failed to fetch CERE price:', error);
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchPrice();
  }, []);

  const handleUsdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usd = event.target.value;
    setUsdAmount(usd);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    if (cerePrice && usd) {
      setCereAmount((parseFloat(usd) / cerePrice).toFixed(2));
    } else {
      setCereAmount('');
    }
  };

  const handleCereChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cere = event.target.value;
    setCereAmount(cere);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    if (cerePrice && cere) {
      setUsdAmount((parseFloat(cere) * cerePrice).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const handleTopUp = async () => {
    if (!usdAmount || parseFloat(usdAmount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    const amount = parseFloat(usdAmount);
    if (amount > MANUAL_TOPUP_MAX_LIMIT) {
      setError(`Manual topup limit is $${MANUAL_TOPUP_MAX_LIMIT} USD. Please enter a smaller amount.`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const cereAccount = accountStore.accounts.find((account) => account.type === 'ed25519');
      const accountId = cereAccount?.address || accountStore.selectedAccount?.address || accountStore.account?.address;

      const response = await fetch(`${API_BASE_URL}/top-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(usdAmount) * 100), // Convert to cents
          account_id: accountId,
          origin: window.location.origin, // Send the origin to determine redirect URLs
        }),
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error) {
      console.error('Top-up failed:', error);
      setError('An error occurred during top-up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Top up with Credit/Debit Card</Typography>

      <Alert severity="info">
        <Typography variant="body2">
          Manual topup limit: ${MANUAL_TOPUP_MAX_LIMIT} USD for Testing purpose on Devnet.
        </Typography>
      </Alert>

      <Stack component={Paper} spacing={2} padding={3}>
        <Typography variant="subtitle1">Enter the amount you wish to add to your balance.</Typography>

        <TextField
          label="Amount (USD)"
          placeholder="10.00"
          type="number"
          value={usdAmount}
          onChange={handleUsdChange}
          disabled={isLoading || isPriceLoading}
          error={!!error || !!(usdAmount && parseFloat(usdAmount) > MANUAL_TOPUP_MAX_LIMIT)}
          helperText={error || `Maximum: $${MANUAL_TOPUP_MAX_LIMIT} USD`}
          inputProps={{
            max: MANUAL_TOPUP_MAX_LIMIT,
            step: 0.01,
          }}
        />

        <Divider>
          <Typography variant="caption" color="text.secondary">
            {isPriceLoading
              ? 'Fetching live rate...'
              : cerePrice
              ? `1 CERE ≈ $${cerePrice.toFixed(4)} USD`
              : 'Rate unavailable'}
          </Typography>
        </Divider>

        <TextField
          label="Amount (CERE)"
          placeholder="100.00"
          type="number"
          value={cereAmount}
          onChange={handleCereChange}
          disabled={isLoading || isPriceLoading || !cerePrice}
        />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Select Payment Method
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              sx={{
                borderColor: paymentMethod === 'stripe' ? 'primary.main' : 'grey.300',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: paymentMethod === 'stripe' ? 'primary.main' : 'grey.400',
                },
              }}
              onClick={() => setPaymentMethod('stripe')}
            >
              {paymentMethod === 'stripe' && (
                <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 8, right: 8 }} />
              )}
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <img src="/stripe.png" alt="Stripe" height="24" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Credit/Debit Cards
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card
              variant="outlined"
              sx={{
                borderColor: 'grey.300',
                cursor: 'not-allowed',
                opacity: 0.6,
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <img src="/paypal.png" alt="PayPal" height="24" />
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  Coming soon
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <LoadingButton
          variant="contained"
          size="large"
          loading={isLoading}
          onClick={handleTopUp}
          disabled={
            isPriceLoading || !usdAmount || parseFloat(usdAmount) <= 0 || parseFloat(usdAmount) > MANUAL_TOPUP_MAX_LIMIT
          }
          sx={{ mt: 2 }}
        >
          Top Up
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default TopUpWithCard;
