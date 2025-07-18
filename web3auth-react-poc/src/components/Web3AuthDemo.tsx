import React, { useState, useEffect, useCallback } from 'react';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { AuthAdapter } from '@web3auth/auth-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_ADAPTERS, UX_MODE_TYPE } from '@web3auth/base';
import { ethers } from 'ethers';
import axios from 'axios';
import { subkey } from '@toruslabs/openlogin-subkey';

// Configuration - Use the same values from your main app
const CONFIG = {
  CLIENT_ID: 'BEQEos1d_yDAJiO_oCXyD8lnLugjpByRODzKDv1dgcOCwqRQ1R47y7Y1eliyxFD7TsAYZ0xXJHf0fC4drBb__UM',
  NETWORK: 'cyan',
  VERIFIER: 'cere-wallet-stage',
  CHAIN_ID: '0x13882', // Polygon Amoy testnet
  RPC_URL: 'https://rpc-amoy.polygon.technology',
  API_BASE_URL: 'https://api.wallet.stage.cere.io'
};

// REAL getScopedKey implementation from your old codebase!
const getScopedKey = (key: string) => {
  const scopedKey = subkey(key.padStart(64, '0'), Buffer.from(CONFIG.CLIENT_ID, 'base64'));
  return scopedKey.padStart(64, '0');
};

interface AuthResult {
  email: string;
  name?: string;
  address: string;
  verifier: string;
  verifierId: string;
  typeOfLogin: string;
  isMfaEnabled?: boolean;
}

// Extended user info interface to include missing properties
interface ExtendedUserInfo {
  email?: string;
  name?: string;
  profileImage?: string;
  verifier?: string;
  verifierId?: string;
  typeOfLogin?: string;
  isMfaEnabled?: boolean;
}

const Web3AuthDemo: React.FC = () => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [authAdapter, setAuthAdapter] = useState<AuthAdapter | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'result'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [mfaLevel, setMfaLevel] = useState<'default' | 'optional' | 'mandatory'>('optional');
  const [mfaSupported, setMfaSupported] = useState(true);
  
  // Track MFA continuation state to prevent overrides
  const [isMfaContinuation, setIsMfaContinuation] = useState(() => {
    // Check immediately on component mount if we're in MFA continuation
    const urlParams = new URLSearchParams(window.location.search);
    const isMfaRedirect = urlParams.has('login_hint') && urlParams.has('state') && urlParams.has('response_type');
    
    if (isMfaRedirect) {
      console.log('🔄 MFA continuation detected on component mount!', {
        loginHint: urlParams.get('login_hint'),
        hasState: !!urlParams.get('state'),
        url: window.location.href
      });
      
      // Store in sessionStorage immediately
      sessionStorage.setItem('mfaSetupInProgress', 'true');
      sessionStorage.setItem('mfaSetupEmail', urlParams.get('login_hint') || '');
      
      return true;
    }
    
    return false;
  });

  // Pre-fill email if we're in MFA continuation mode
  useEffect(() => {
    if (isMfaContinuation) {
      const urlParams = new URLSearchParams(window.location.search);
      const mfaEmail = urlParams.get('login_hint') || '';
      if (mfaEmail) {
        setEmail(mfaEmail);
        setError('🔄 MFA Setup Continuation: Click "Send OTP" below to get a fresh authentication code. This will complete the MFA setup process.');
        console.log('🔄 Pre-filled email for MFA continuation:', mfaEmail);
      }
    }
  }, [isMfaContinuation]);

  const addDebugInfo = useCallback((title: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { timestamp, title, data }]);
  }, []);

  const handleExistingSession = useCallback(async (web3authInstance: Web3AuthNoModal) => {
    try {
      if (!web3authInstance.connected || !web3authInstance.provider) {
        return;
      }

      const userInfo = await web3authInstance.getUserInfo() as ExtendedUserInfo;
      const privateKey = await web3authInstance.provider.request({
        method: 'eth_private_key',
      }) as string;

      // Calculate Ethereum address
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      addDebugInfo('Web3Auth Session Data', {
        userInfo,
        privateKey: privateKey.substring(0, 10) + '...',
        address,
        verifier: userInfo.verifier,
        verifierId: userInfo.verifierId,
        typeOfLogin: userInfo.typeOfLogin,
        isMfaEnabled: userInfo.isMfaEnabled
      });

      setAuthResult({
        email: userInfo.email || '',
        name: userInfo.name,
        address,
        verifier: userInfo.verifier || '',
        verifierId: userInfo.verifierId || '',
        typeOfLogin: userInfo.typeOfLogin || '',
        isMfaEnabled: userInfo.isMfaEnabled
      });

      setCurrentStep('result');

    } catch (error) {
      console.error('Failed to handle existing session:', error);
      setError('Failed to process session: ' + (error as Error).message);
      addDebugInfo('Session Error', error);
    }
  }, [addDebugInfo]);

  // Initialize Web3Auth
  useEffect(() => {
    console.log('🔧 Web3Auth initialization starting...', {
      isMfaContinuation,
      currentUrl: window.location.href,
      currentStep
    });
    
    const initWeb3Auth = async () => {
      try {
        setIsLoading(true);
        addDebugInfo('Initializing Web3Auth...');

        // Check for redirect parameters from MFA setup or OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const urlHash = window.location.hash;
        
        // Log all URL parameters for debugging
        addDebugInfo('Current URL Analysis', {
          search: window.location.search,
          hash: window.location.hash,
          pathname: window.location.pathname,
          allParams: Object.fromEntries(urlParams.entries())
        });
        
        // Check for Web3Auth redirect parameters
        if (urlParams.has('b64Params') || urlHash.includes('b64Params')) {
          addDebugInfo('Detected Web3Auth redirect parameters', {
            urlParams: Object.fromEntries(urlParams.entries()),
            hash: urlHash
          });
        }
        
        // Check for OAuth callback parameters
        if (urlParams.has('response_type') || urlParams.has('client_id') || urlParams.has('redirect_uri')) {
          addDebugInfo('Detected OAuth callback parameters', {
            responseType: urlParams.get('response_type'),
            clientId: urlParams.get('client_id'),
            redirectUri: urlParams.get('redirect_uri'),
            scope: urlParams.get('scope'),
            nonce: urlParams.get('nonce'),
            verifierIdField: urlParams.get('verifierIdField'),
            loginHint: urlParams.get('login_hint'),
            state: urlParams.get('state'),
            isMfaContinuation: isMfaContinuation
          });
          
          // Check if this is a JWT login request from auth.web3auth.io for MFA
          if (urlParams.get('login_hint') && urlParams.get('state')) {
            if (!isMfaContinuation) {
              // Only set this if not already detected during component mount
              addDebugInfo('Detected MFA JWT continuation request during init', {
                loginHint: urlParams.get('login_hint'),
                message: 'Web3Auth is requesting fresh JWT for MFA setup'
              });
              setError('🔄 MFA Setup Continuation: Click "Send OTP" below to get a fresh authentication code. This will complete the MFA setup process.');
              
              // Set MFA continuation flag to prevent other logic from overriding
              setIsMfaContinuation(true);
              
              // Store that we're in MFA setup mode
              sessionStorage.setItem('mfaSetupInProgress', 'true');
              sessionStorage.setItem('mfaSetupEmail', urlParams.get('login_hint') || '');
              
              // Pre-fill the email for user convenience
              const mfaEmail = urlParams.get('login_hint') || '';
              if (mfaEmail) {
                setEmail(mfaEmail);
                addDebugInfo('Pre-filled email for MFA continuation', { email: mfaEmail });
              }
            } else {
              addDebugInfo('MFA continuation already detected - skipping duplicate setup');
            }
            
            // Ensure we stay on email step for MFA continuation
            setCurrentStep('email');
          } else {
            // This suggests the OAuth flow was interrupted
            setError('⚠️ OAuth redirect detected but flow incomplete. Continuing with normal authentication...');
          }
        }

        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: CONFIG.CHAIN_ID,
          rpcTarget: CONFIG.RPC_URL,
          displayName: 'Polygon Amoy Testnet',
          blockExplorer: 'https://amoy.polygonscan.com',
          ticker: 'MATIC',
          tickerName: 'Polygon',
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        // Initialize Web3Auth first with just the basic configuration
        const web3authInstance = new Web3AuthNoModal({
          clientId: CONFIG.CLIENT_ID,
          web3AuthNetwork: WEB3AUTH_NETWORK.CYAN,
          chainConfig,
          privateKeyProvider,
          sessionTime: 86400,
        });

        // Create auth adapter with conditional MFA settings based on subscription plan
        const adapterSettings: any = {
          uxMode: 'redirect',
          loginConfig: {
            jwt: {
              verifier: CONFIG.VERIFIER,
              typeOfLogin: 'jwt',
              name: 'Cere',
              clientId: CONFIG.CLIENT_ID,
              jwtParameters: {
                domain: window.origin,
                verifierIdField: 'email',
                isVerifierIdCaseSensitive: false,
              },
            },
          },
        };

        // Note: mfaSettings require Scale plan or higher
        // For Growth plan, MFA will be handled through enableMFA() method after login
        // or by setting mfaLevel to 'mandatory' to force MFA during login flow

        const authAdapterInstance = new AuthAdapter({
          privateKeyProvider,
          adapterSettings,
        });

        // Configure adapter
        web3authInstance.configureAdapter(authAdapterInstance);

        addDebugInfo('Web3Auth Pre-Init Configuration', {
          clientId: CONFIG.CLIENT_ID,
          network: CONFIG.NETWORK,
          verifier: CONFIG.VERIFIER,
          chainId: CONFIG.CHAIN_ID,
          adapterName: authAdapterInstance.name,
          adapterType: authAdapterInstance.type,
          mfaLevel: mfaLevel,
          mfaSupported: mfaSupported,
        });

        // Initialize Web3Auth
        await web3authInstance.init();

        setWeb3auth(web3authInstance);
        setAuthAdapter(authAdapterInstance);
        setIsInitialized(true);

        addDebugInfo('Web3Auth Post-Init Status', {
          connected: web3authInstance.connected,
          status: authAdapterInstance.status,
          adapters: web3authInstance.connectedAdapterName,
          provider: !!web3authInstance.provider,
          mfaLevel: mfaLevel,
          mfaSupported: mfaSupported,
        });

        // Check if already connected (after redirect or existing session)
        if (web3authInstance.connected) {
          addDebugInfo('Found existing Web3Auth connection');
          
          // Only handle existing session if we're not in MFA continuation mode
          if (!isMfaContinuation) {
            await handleExistingSession(web3authInstance);
          } else {
            addDebugInfo('Skipping existing session handling due to MFA continuation');
            console.log('🔄 User already connected during MFA continuation - may need to trigger MFA setup');
            
            // If user is connected during MFA continuation, we might need to trigger MFA setup
            // Let's check if they have MFA enabled already
            try {
              const userInfo = await web3authInstance.getUserInfo() as ExtendedUserInfo;
              if (userInfo.isMfaEnabled) {
                setError('✅ MFA is already enabled for this account!');
                await handleExistingSession(web3authInstance);
              } else {
                setError('🔄 Already connected but MFA setup incomplete. Please complete fresh authentication below to enable MFA.');
                // Don't call handleExistingSession - keep the email form visible
                // User needs to complete the fresh authentication flow
              }
            } catch (error) {
              console.error('Error checking MFA status during continuation:', error);
              setError('🔄 Connected but unable to check MFA status. Please complete fresh authentication below to enable MFA.');
              // Don't call handleExistingSession - keep the email form visible
            }
          }
        } else if (urlParams.has('response_type') || urlParams.has('login_hint')) {
          // Check if we're in MFA setup continuation mode first
          const mfaSetupInProgress = sessionStorage.getItem('mfaSetupInProgress') === 'true';
          
          if (mfaSetupInProgress || isMfaContinuation) {
            // Don't override the MFA continuation message and flow
            addDebugInfo('MFA continuation in progress - maintaining flow', {
              mfaSetupInProgress: true,
              isMfaContinuation,
              message: 'User should complete authentication to finish MFA setup'
            });
          } else {
            // User returned from OAuth flow but not connected - this might be an interrupted flow
            addDebugInfo('User returned from OAuth flow but not connected', {
              suggestion: 'OAuth flow may have been interrupted or failed',
              recommendation: 'Try refreshing and logging in again'
            });
            setError('🔄 Returned from authentication but not connected. You may need to log in again.');
          }
        }

        // Clear URL parameters after processing
        if (urlParams.has('b64Params') || 
            urlHash.includes('b64Params') || 
            urlParams.has('response_type') || 
            urlParams.has('client_id')) {
          window.history.replaceState({}, document.title, window.location.pathname);
          addDebugInfo('Cleaned up URL parameters after redirect processing');
        }

      } catch (error) {
        console.error('Web3Auth initialization failed:', error);
        
        // Check if it's an MFA subscription error
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('MFA settings') && errorMessage.includes('growth plan')) {
          setMfaSupported(false);
          setMfaLevel('default');
          addDebugInfo('MFA Not Supported', {
            reason: 'Current subscription plan (Growth) does not support MFA features',
            solution: 'Upgrade to higher plan at https://dashboard.web3auth.io',
            fallback: 'MFA disabled, retrying with default authentication'
          });
          
          // Force retry with default MFA level
          setError('MFA not supported on current plan. Retrying with default authentication...');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }
        
        setError('Web3Auth initialization failed: ' + errorMessage);
        addDebugInfo('Initialization Error', {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
      } finally {
        setIsLoading(false);
        if (isMfaContinuation) {
          addDebugInfo('Initialization complete - MFA continuation flow preserved');
        }
        
        console.log('🏁 Web3Auth initialization complete:', {
          isMfaContinuation,
          currentStep,
          error,
          isInitialized: true,
          currentUrl: window.location.href
        });
      }
    };

    initWeb3Auth();
  }, [addDebugInfo, handleExistingSession, mfaLevel, mfaSupported, isMfaContinuation]);

  const sendOTP = async () => {
    if (!email) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      addDebugInfo('Sending OTP to', email);

      const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/otp/send`, {
        email: email,
        appTitle: 'Web3Auth React PoC',
        supportEmail: 'support@cere.network',
        authLink: false
      });

      if (response.data.code && response.data.code !== 'SUCCESS') {
        throw new Error(response.data.message || 'Failed to send OTP');
      }

      addDebugInfo('OTP Request Success', response.data);
      setCurrentStep('otp');

    } catch (error) {
      console.error('Failed to send OTP:', error);
      setError('Failed to send OTP: ' + (error as Error).message);
      addDebugInfo('OTP Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      addDebugInfo('Verifying OTP', { email, otp });

      // Check if we're in MFA setup continuation mode
      const mfaSetupInProgress = sessionStorage.getItem('mfaSetupInProgress') === 'true';
      const mfaSetupEmail = sessionStorage.getItem('mfaSetupEmail');
      
      if (mfaSetupInProgress && mfaSetupEmail) {
        addDebugInfo('Continuing MFA setup with fresh JWT', { 
          mfaSetupEmail,
          currentEmail: email,
          message: 'This authentication will complete the MFA setup process'
        });
        
        // If Web3Auth is already connected, logout first to allow fresh authentication
        if (web3auth && web3auth.connected) {
          addDebugInfo('Logging out existing session before fresh MFA authentication');
          try {
            await web3auth.logout();
            console.log('🔄 Logged out existing session for fresh MFA authentication');
          } catch (logoutError) {
            console.warn('Logout failed during MFA continuation, proceeding anyway:', logoutError);
            addDebugInfo('Logout warning during MFA continuation', logoutError);
          }
        }
        
        // Clear the MFA setup flags
        sessionStorage.removeItem('mfaSetupInProgress');
        sessionStorage.removeItem('mfaSetupEmail');
        
        setError('🔄 Completing MFA setup with fresh authentication...');
      }

      const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/token-by-email`, {
        email: email,
        code: otp
      });

      if (response.data.code !== 'SUCCESS') {
        throw new Error(response.data.message || 'OTP verification failed');
      }

      const idToken = response.data.data.token;
      addDebugInfo('OTP Verification Success', {
        idToken: idToken.substring(0, 20) + '...',
        response: response.data,
        mfaSetupInProgress
      });

      // Now authenticate with Web3Auth
      await authenticateWithWeb3Auth(idToken);

      // If this was for MFA setup, show completion message
      if (mfaSetupInProgress) {
        // Add a delay to allow Web3Auth to process the request and potentially show the error
        setTimeout(() => {
          setError('⚠️ MFA setup attempted but may have failed due to Growth plan limitations. If you see an error on Web3Auth, this confirms MFA requires a Scale plan or higher. The authentication was successful though!');
        }, 1000);
      }

    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setError('Failed to verify OTP: ' + (error as Error).message);
      addDebugInfo('Verification Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithWeb3Auth = async (idToken: string) => {
    try {
      if (!web3auth || !authAdapter) {
        throw new Error('Web3Auth not initialized');
      }

      if (authAdapter.status !== 'ready' && authAdapter.status !== 'connected') {
        throw new Error(`Auth adapter not ready. Status: ${authAdapter.status}`);
      }

      const loginParams: any = {
        loginProvider: 'jwt',
        extraLoginOptions: {
          verifierIdField: 'email',
          id_token: idToken,
        },
        mfaLevel: mfaLevel,
      };

      addDebugInfo('Web3Auth Login Params', { 
        ...loginParams, 
        mfaLevel,
        note: `MFA Level: ${mfaLevel} - This should trigger MFA prompts according to the level setting`
      });

      // Try to connect
      const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, loginParams);

      if (!web3authProvider) {
        throw new Error('Failed to connect to Web3Auth');
      }

      // Get user info and private key
      const userInfo = await web3auth.getUserInfo() as ExtendedUserInfo;
      const privateKey = await web3authProvider.request({
        method: 'eth_private_key',
      }) as string;

      // 🚨 KEY COMPATIBILITY ISSUE DEMONSTRATION
      // This is the CRITICAL difference between old and new implementation
      const rawWeb3AuthKey = privateKey;
      const scopedKey = getScopedKey(privateKey);
      
      // Calculate addresses for both keys to show the difference
      const rawWallet = new ethers.Wallet(rawWeb3AuthKey);
      const scopedWallet = new ethers.Wallet(scopedKey);

      addDebugInfo('🔧 KEY COMPATIBILITY FIX APPLIED', {
        rawWeb3AuthKey: rawWeb3AuthKey.substring(0, 10) + '...',
        rawAddress: rawWallet.address,
        scopedKey: scopedKey.substring(0, 10) + '...',
        scopedAddress: scopedWallet.address,
        fix: 'NOW USING scopedAddress (compatible with old system)!',
        note: 'This matches what users expect from the old Torus OpenLogin system'
      });

      // 🔧 APPLY THE FIX: Use scoped key for compatibility (like production fix)
      // This ensures users get the same wallet address as the old system
      const wallet = scopedWallet; // ← FIXED: Now using scoped key!
      const address = wallet.address;

      addDebugInfo('Authentication Success', {
        userInfo,
        privateKey: privateKey.substring(0, 10) + '...',
        address,
        verifier: userInfo.verifier,
        verifierId: userInfo.verifierId,
        typeOfLogin: userInfo.typeOfLogin,
        isMfaEnabled: userInfo.isMfaEnabled
      });

      setAuthResult({
        email: userInfo.email || '',
        name: userInfo.name,
        address,
        verifier: userInfo.verifier || '',
        verifierId: userInfo.verifierId || '',
        typeOfLogin: userInfo.typeOfLogin || '',
        isMfaEnabled: userInfo.isMfaEnabled
      });

      setCurrentStep('result');

    } catch (error) {
      console.error('Web3Auth authentication failed:', error);
      setError('Authentication failed: ' + (error as Error).message);
      addDebugInfo('Auth Error', error);
    }
  };

  const enableMFA = async () => {
    try {
      if (!web3auth || !web3auth.connected) {
        throw new Error('Web3Auth not connected');
      }

      setIsLoading(true);
      addDebugInfo('Starting Growth plan compatible MFA setup...');

      // For Growth plan: Try the simplest possible MFA enablement
      // Check if enableMFA method exists (should work on Growth plan)
      if (typeof web3auth.enableMFA === 'function') {
        addDebugInfo('Attempting simple enableMFA call...');
        setError('🔄 Attempting to enable MFA on Growth plan...');

        try {
          // Try the most basic MFA enablement without any options
          const result = await web3auth.enableMFA();
          
          addDebugInfo('MFA Enable Response', result);
          setError('✅ MFA enabled successfully! Refresh status to see the change.');
          
          // Refresh user info to get updated MFA status
          setTimeout(async () => {
            await refreshMFAStatus();
          }, 1000);
          
          return;
        } catch (enableError) {
          // If direct enableMFA fails, try alternative approaches
          addDebugInfo('Direct enableMFA failed, trying alternatives', enableError);
          
          const errorMsg = (enableError as Error).message;
          if (errorMsg.includes('growth plan') || errorMsg.includes('subscription')) {
            throw enableError; // Re-throw to be handled by main catch block
          }
          
          // If it's not a subscription error, continue to alternatives
          addDebugInfo('Trying alternative: Logout and mandatory MFA');
          setError('🔄 Direct MFA enable failed, trying alternative approach...');
        }
      }

      // Alternative 1: Force MFA through logout and mandatory setting
      addDebugInfo('Alternative approach: Setting mandatory MFA and logout');
      
      // First logout
      await web3auth.logout();
      addDebugInfo('Logged out for MFA setup');
      
      setError('✅ Logged out successfully. Please set MFA Level to "Mandatory" above and log in again - MFA will be required during login.');
      setCurrentStep('email');

    } catch (error) {
      console.error('MFA setup process failed:', error);
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('growth plan') || 
          errorMessage.includes('subscription') || 
          errorMessage.includes('Scale Plan') ||
          errorMessage.includes('not available on growth plan')) {
        setError('⚠️ Direct MFA enablement not available on Growth plan. Please try: 1) Set MFA Level to "Mandatory" above, 2) Logout, 3) Login again - MFA will be forced during login.');
        addDebugInfo('Growth Plan MFA Limitation', {
          solution: 'Use mandatory MFA during login flow',
          steps: ['Set MFA Level to Mandatory', 'Logout', 'Login again'],
          note: 'Growth plan supports MFA but not direct enablement API'
        });
      } else {
        setError('❌ MFA setup failed: ' + errorMessage);
      }
      
      addDebugInfo('MFA Setup Error Details', { 
        error: errorMessage,
        fullError: error,
        recommendation: 'Try mandatory MFA during login instead'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enableMFAAlternative = async () => {
    try {
      if (!web3auth || !authAdapter) {
        throw new Error('Web3Auth not initialized');
      }

      setIsLoading(true);
      addDebugInfo('Trying alternative MFA approach - reconnecting with MFA enabled...');
      setError('🔄 Attempting alternative MFA setup by reconnecting...');

      // First logout to clear the session
      if (web3auth.connected) {
        await web3auth.logout();
        addDebugInfo('Logged out current session');
      }

      // Try to reconnect with MFA level set to optional/mandatory
      // This might trigger the MFA setup during login
      const loginParams = {
        loginProvider: 'jwt',
        extraLoginOptions: {
          verifierIdField: 'email',
          id_token: 'NEED_FRESH_TOKEN', // We'd need a fresh token here
        },
        mfaLevel: 'optional' as any, // Force MFA during this login
      };

      addDebugInfo('Alternative MFA Setup Params', loginParams);
      setError('⚠️ Alternative approach requires a fresh JWT token. Please log out and log in again with MFA level set to "Optional" or "Mandatory".');

    } catch (error) {
      console.error('Alternative MFA setup failed:', error);
      setError('❌ Alternative MFA setup failed: ' + (error as Error).message);
      addDebugInfo('Alternative MFA Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (web3auth && web3auth.connected) {
        await web3auth.logout();
      }

      // Reset state
      setEmail('');
      setOtp('');
      setCurrentStep('email');
      setAuthResult(null);
      setError('');
      addDebugInfo('Logged out successfully');

    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed: ' + (error as Error).message);
      addDebugInfo('Logout Error', error);
    }
  };

  const showWalletUI = async () => {
    try {
      if (!web3auth || !web3auth.connected || !web3auth.provider) {
        throw new Error('Web3Auth not connected or provider not available');
      }

      addDebugInfo('Attempting to access wallet features...');
      
      // Try to trigger wallet interface through provider methods
      try {
        // Request accounts - this might show wallet UI in some cases
        await web3auth.provider.request({ method: 'eth_requestAccounts' });
        addDebugInfo('Account access successful');
      } catch (requestError) {
        addDebugInfo('Account request failed', requestError);
      }

      // Get current balance as another wallet interaction
      try {
        const accounts = await web3auth.provider.request({ method: 'eth_accounts' }) as string[];
        if (accounts && Array.isArray(accounts) && accounts.length > 0) {
          const balance = await web3auth.provider.request({ 
            method: 'eth_getBalance', 
            params: [accounts[0], 'latest'] 
          });
          addDebugInfo('Wallet Info', { accounts, balance });
        }
      } catch (balanceError) {
        addDebugInfo('Balance check failed', balanceError);
      }

    } catch (error) {
      console.error('Failed to access wallet features:', error);
      setError('Wallet features not available: ' + (error as Error).message);
      addDebugInfo('Wallet Access Error', error);
    }
  };

  const refreshMFAStatus = async () => {
    try {
      if (!web3auth || !web3auth.connected) {
        throw new Error('Web3Auth not connected');
      }

      setIsLoading(true);
      addDebugInfo('Refreshing MFA status...');

      // Get updated user info
      const updatedUserInfo = await web3auth.getUserInfo() as ExtendedUserInfo;
      
      if (authResult) {
        setAuthResult({
          ...authResult,
          isMfaEnabled: updatedUserInfo.isMfaEnabled
        });
      }
      
      addDebugInfo('MFA Status Refresh Complete', { 
        isMfaEnabled: updatedUserInfo.isMfaEnabled,
        userInfo: updatedUserInfo
      });

      setError(updatedUserInfo.isMfaEnabled 
        ? '✅ MFA is enabled for your account!' 
        : 'ℹ️ MFA is not enabled for your account'
      );

    } catch (error) {
      console.error('Failed to refresh MFA status:', error);
      setError('❌ Failed to refresh MFA status: ' + (error as Error).message);
      addDebugInfo('MFA Status Refresh Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Web3Auth JWT Authentication Demo</h1>
        
        {!isInitialized && (
          <div>
            <p>🔄 Initializing Web3Auth...</p>
            {isLoading && <p>Loading...</p>}
            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
          </div>
        )}

        {isInitialized && currentStep === 'email' && (
          <div>
            <h2>Step 1: Email Authentication</h2>
            
            {/* MFA Level Configuration */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '2px solid #4CAF50', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h3>🔒 MFA Configuration</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>
                  MFA Level: 
                  <select 
                    value={mfaLevel} 
                    onChange={(e) => setMfaLevel(e.target.value as any)}
                    style={{ marginLeft: '10px', padding: '5px' }}
                  >
                    <option value="default">Default (every 3rd login)</option>
                    <option value="optional">Optional (every login, skippable)</option>
                    <option value="mandatory">Mandatory (required after login)</option>
                  </select>
                </label>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Current setting:</strong> {mfaLevel} - 
                {mfaLevel === 'default' && ' MFA screen appears every 3rd login'}
                {mfaLevel === 'optional' && ' MFA screen appears every login but can be skipped'}
                {mfaLevel === 'mandatory' && ' MFA setup is REQUIRED after login'}
              </div>
              <div style={{ fontSize: '12px', color: mfaSupported ? '#4CAF50' : '#f44336', marginTop: '5px' }}>
                {mfaSupported ? '✅ MFA supported on current plan' : '❌ MFA settings require Scale plan, using basic MFA'}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ marginLeft: '10px', padding: '8px', width: '250px' }}
                />
              </label>
              <button 
                onClick={sendOTP} 
                disabled={!email || isLoading}
                style={{ 
                  marginLeft: '10px', 
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
            
            {/* Clear Test MFA Button */}
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              border: '2px solid #2196F3', 
              borderRadius: '8px',
              backgroundColor: '#e3f2fd'
            }}>
              <h4>🧪 MFA Test Instructions</h4>
              <p style={{ margin: '10px 0', fontSize: '14px' }}>
                To test MFA with different levels:
              </p>
              <ol style={{ fontSize: '14px', margin: '10px 0' }}>
                <li><strong>Set MFA Level</strong> above (try "Mandatory" for strongest test)</li>
                <li><strong>Click "Send OTP"</strong> and complete email verification</li>
                <li><strong>Watch for MFA prompts</strong> during or after authentication</li>
                <li><strong>Check "Authentication Result"</strong> for MFA status</li>
              </ol>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#fff3e0',
                borderRadius: '4px'
              }}>
                💡 <strong>Expected behavior:</strong><br/>
                • <strong>Default:</strong> MFA setup prompt every 3rd login<br/>
                • <strong>Optional:</strong> MFA setup prompt every login (can skip)<br/>
                • <strong>Mandatory:</strong> MFA setup REQUIRED after authentication
              </div>
            </div>
          </div>
        )}

        {currentStep === 'otp' && (
          <div>
            <h2>Step 2: OTP Verification</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>
                OTP Code:
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP from email"
                  style={{ marginLeft: '10px', padding: '8px', width: '200px' }}
                />
              </label>
              <button 
                onClick={verifyOTP} 
                disabled={!otp || isLoading}
                style={{ 
                  marginLeft: '10px', 
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
            
            <button 
              onClick={() => setCurrentStep('email')}
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Back to Email
            </button>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
          </div>
        )}

        {currentStep === 'result' && authResult && (
          <div>
            <h2>✅ Authentication Result</h2>
            
            {/* MFA Status Display */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: `2px solid ${authResult.isMfaEnabled ? '#4CAF50' : '#ff9800'}`, 
              borderRadius: '8px',
              backgroundColor: authResult.isMfaEnabled ? '#e8f5e8' : '#fff3e0'
            }}>
              <h3>🔒 MFA Status</h3>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                Status: {authResult.isMfaEnabled ? 
                  <span style={{ color: '#4CAF50' }}>✅ MFA ENABLED</span> : 
                  <span style={{ color: '#ff9800' }}>⚠️ MFA NOT ENABLED</span>
                }
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {authResult.isMfaEnabled ? 
                  'This account has Multi-Factor Authentication enabled and configured.' :
                  'This account does not have MFA enabled. You can set it up using the "Enable MFA" button below.'
                }
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p><strong>Email:</strong> {authResult.email}</p>
              <p><strong>Name:</strong> {authResult.name || 'N/A'}</p>
              <p><strong>Address:</strong> {authResult.address}</p>
              <p><strong>Verifier:</strong> {authResult.verifier}</p>
              <p><strong>Verifier ID:</strong> {authResult.verifierId}</p>
              <p><strong>Type of Login:</strong> {authResult.typeOfLogin}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={enableMFA} 
                disabled={isLoading || authResult.isMfaEnabled}
                style={{ 
                  marginRight: '10px', 
                  padding: '8px 16px',
                  backgroundColor: authResult.isMfaEnabled ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {authResult.isMfaEnabled ? 'MFA Already Enabled' : (isLoading ? 'Enabling MFA...' : 'Enable MFA')}
              </button>
              
              <button 
                onClick={refreshMFAStatus} 
                disabled={isLoading}
                style={{ 
                  marginRight: '10px', 
                  padding: '8px 16px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {isLoading ? 'Checking...' : 'Refresh MFA Status'}
              </button>

              <button 
                onClick={showWalletUI} 
                style={{ 
                  marginRight: '10px', 
                  padding: '8px 16px',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Show Wallet UI
              </button>

              <button 
                onClick={logout} 
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Logout
              </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
          </div>
        )}

        {/* Debug Information */}
        {debugInfo.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Debug Information</h3>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              border: '1px solid #ddd', 
              padding: '10px',
              backgroundColor: '#f9f9f9',
              fontSize: '12px'
            }}>
              {debugInfo.map((info, index) => (
                <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                  <strong>{info.timestamp} - {info.title}</strong>
                  {info.data && (
                    <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(info.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Web3Auth JWT Authentication Demo</h1>
      
      {!isInitialized && (
        <div>
          <p>🔄 Initializing Web3Auth...</p>
          {isLoading && <p>Loading...</p>}
          {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        </div>
      )}

      {isInitialized && currentStep === 'email' && (
        <div>
          <h2>Step 1: Email Authentication</h2>
          
          {/* MFA Level Configuration */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            border: '2px solid #4CAF50', 
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>🔒 MFA Configuration</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>
                MFA Level: 
                <select 
                  value={mfaLevel} 
                  onChange={(e) => setMfaLevel(e.target.value as any)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="default">Default (every 3rd login)</option>
                  <option value="optional">Optional (every login, skippable)</option>
                  <option value="mandatory">Mandatory (required after login)</option>
                </select>
              </label>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Current setting:</strong> {mfaLevel} - 
              {mfaLevel === 'default' && ' MFA screen appears every 3rd login'}
              {mfaLevel === 'optional' && ' MFA screen appears every login but can be skipped'}
              {mfaLevel === 'mandatory' && ' MFA setup is REQUIRED after login'}
            </div>
            <div style={{ fontSize: '12px', color: mfaSupported ? '#4CAF50' : '#f44336', marginTop: '5px' }}>
              {mfaSupported ? '✅ MFA supported on current plan' : '❌ MFA settings require Scale plan, using basic MFA'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ marginLeft: '10px', padding: '8px', width: '250px' }}
              />
            </label>
            <button 
              onClick={sendOTP} 
              disabled={!email || isLoading}
              style={{ 
                marginLeft: '10px', 
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
          
          {/* Clear Test MFA Button */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            border: '2px solid #2196F3', 
            borderRadius: '8px',
            backgroundColor: '#e3f2fd'
          }}>
            <h4>🧪 MFA Test Instructions</h4>
            <p style={{ margin: '10px 0', fontSize: '14px' }}>
              To test MFA with different levels:
            </p>
            <ol style={{ fontSize: '14px', margin: '10px 0' }}>
              <li><strong>Set MFA Level</strong> above (try "Mandatory" for strongest test)</li>
              <li><strong>Click "Send OTP"</strong> and complete email verification</li>
              <li><strong>Watch for MFA prompts</strong> during or after authentication</li>
              <li><strong>Check "Authentication Result"</strong> for MFA status</li>
            </ol>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px'
            }}>
              💡 <strong>Expected behavior:</strong><br/>
              • <strong>Default:</strong> MFA setup prompt every 3rd login<br/>
              • <strong>Optional:</strong> MFA setup prompt every login (can skip)<br/>
              • <strong>Mandatory:</strong> MFA setup REQUIRED after authentication
            </div>
          </div>
        </div>
      )}

      {currentStep === 'otp' && (
        <div>
          <h2>Step 2: OTP Verification</h2>
          <div style={{ marginBottom: '20px' }}>
            <label>
              OTP Code:
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                style={{ marginLeft: '10px', padding: '8px', width: '200px' }}
              />
            </label>
            <button 
              onClick={verifyOTP} 
              disabled={!otp || isLoading}
              style={{ 
                marginLeft: '10px', 
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
          
          <button 
            onClick={() => setCurrentStep('email')}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Back to Email
          </button>

          {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        </div>
      )}

      {currentStep === 'result' && authResult && (
        <div>
          <h2>✅ Authentication Result - WITH getScopedKey() Fix Applied</h2>
          
          {/* Compatibility Fix Status */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            border: '2px solid #4CAF50', 
            borderRadius: '8px',
            backgroundColor: '#e8f5e8'
          }}>
            <h3>🔧 Wallet Compatibility Fix Applied</h3>
            <div style={{ fontSize: '14px', color: '#2e7d32' }}>
              ✅ This wallet address now matches what the old Torus OpenLogin system would generate<br/>
              ✅ Users maintain access to existing wallets and funds<br/>
              ✅ Seamless migration from old to new system accomplished
            </div>
          </div>
          
          {/* MFA Status Display */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            border: `2px solid ${authResult.isMfaEnabled ? '#4CAF50' : '#ff9800'}`, 
            borderRadius: '8px',
            backgroundColor: authResult.isMfaEnabled ? '#e8f5e8' : '#fff3e0'
          }}>
            <h3>🔒 MFA Status</h3>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
              Status: {authResult.isMfaEnabled ? 
                <span style={{ color: '#4CAF50' }}>✅ MFA ENABLED</span> : 
                <span style={{ color: '#ff9800' }}>⚠️ MFA NOT ENABLED</span>
              }
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {authResult.isMfaEnabled ? 
                'This account has Multi-Factor Authentication enabled and configured.' :
                'This account does not have MFA enabled. You can set it up using the "Enable MFA" button below.'
              }
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p><strong>Email:</strong> {authResult.email}</p>
            <p><strong>Name:</strong> {authResult.name || 'N/A'}</p>
            <p><strong>Address:</strong> {authResult.address}</p>
            <p><strong>Verifier:</strong> {authResult.verifier}</p>
            <p><strong>Verifier ID:</strong> {authResult.verifierId}</p>
            <p><strong>Type of Login:</strong> {authResult.typeOfLogin}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={enableMFA} 
              disabled={isLoading || authResult.isMfaEnabled}
              style={{ 
                marginRight: '10px', 
                padding: '8px 16px',
                backgroundColor: authResult.isMfaEnabled ? '#ccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {authResult.isMfaEnabled ? 'MFA Already Enabled' : (isLoading ? 'Enabling MFA...' : 'Enable MFA')}
            </button>
            
            <button 
              onClick={refreshMFAStatus} 
              disabled={isLoading}
              style={{ 
                marginRight: '10px', 
                padding: '8px 16px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {isLoading ? 'Checking...' : 'Refresh MFA Status'}
            </button>

            <button 
              onClick={showWalletUI} 
              style={{ 
                marginRight: '10px', 
                padding: '8px 16px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Show Wallet UI
            </button>

            <button 
              onClick={logout} 
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Logout
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        </div>
      )}

      {/* Debug Information */}
      {debugInfo.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Debug Information</h3>
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            border: '1px solid #ddd', 
            padding: '10px',
            backgroundColor: '#f9f9f9',
            fontSize: '12px'
          }}>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
                <strong>{info.timestamp} - {info.title}</strong>
                {info.data && (
                  <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(info.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3AuthDemo;