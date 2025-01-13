import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';
import { IconButton, TelegramIcon } from '@cere/ui';
import { TELEGRAM_BOT_ID, TELEGRAM_BOT_USERNAME } from '~/constants';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';

export interface TelegramUser {
  id: number;
  first_name: string;
  username: string;
  photo_url: string;
  auth_date: number;
  hash: string;
}

interface Props {
  usePic?: boolean;
  className?: string;
  cornerRadius?: number;
  requestAccess?: boolean;
  dataAuthUrl?: string;
  dataOnauth?: (x: any) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
}

export interface Options {
  bot_id: number;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
    };
    Telegram: {
      Login: {
        auth: (options: Options, dataOnauth: any) => void;
      };
    };
  }
}

export const TelegramLoginButton: React.FC<Props> = ({
  wrapperProps,
  dataAuthUrl,
  usePic = false,
  className,
  buttonSize = 'large',
  dataOnauth,
  cornerRadius,
  requestAccess = true,
}) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;

    if (typeof dataOnauth === 'undefined' && typeof dataAuthUrl === 'undefined') {
      throw new Error(
        'One of this props should be defined: dataAuthUrl (redirect URL), dataOnauth (callback fn) should be defined.',
      );
    }

    if (typeof dataOnauth === 'function') {
      window.TelegramLoginWidget = {
        dataOnauth: (user: TelegramUser) => dataOnauth(user),
      };
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', buttonSize);

    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }

    if (requestAccess) {
      script.setAttribute('data-request-access', 'write');
    }

    script.setAttribute('data-userpic', usePic.toString());

    if (typeof dataAuthUrl === 'string') {
      script.setAttribute('data-auth-url', dataAuthUrl);
    } else {
      script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    }

    script.async = true;

    ref.current.appendChild(script);
  }, [buttonSize, cornerRadius, dataOnauth, requestAccess, usePic, ref, dataAuthUrl]);

  return (
    <div className="mainclass">
      <div className="tg-main">
        <div ref={ref} style={{ display: 'none' }} />
        <div className="tg-logo1" style={{ position: 'relative' }}>
          <IconButton
            size="large"
            variant="outlined"
            onClick={() => {
              window.Telegram.Login.auth({ bot_id: TELEGRAM_BOT_ID }, dataOnauth);
              setLoading(true);
            }}
            disabled={loading}
            sx={{
              position: 'relative',
            }}
            type="submit"
          >
            <TelegramIcon />
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                }}
              >
                <CircularProgress color="inherit" />
              </Box>
            )}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

TelegramLoginButton.propTypes = {
  usePic: PropTypes.bool,
  className: PropTypes.string,
  cornerRadius: PropTypes.number,
  requestAccess: PropTypes.bool,
  wrapperProps: PropTypes.object,
  dataOnauth: PropTypes.func,
  dataAuthUrl: PropTypes.string,
  buttonSize: PropTypes.oneOf(['large', 'medium', 'small']),
};
