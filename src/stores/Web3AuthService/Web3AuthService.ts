import { makeAutoObservable, runInAction } from 'mobx';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { AuthAdapter } from '@web3auth/auth-adapter';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { WalletServicesPlugin } from '@web3auth/wallet-services-plugin';
import {
  CHAIN_NAMESPACES,
  IProvider,
  UserInfo,
  WALLET_ADAPTERS,
  WEB3AUTH_NETWORK,
  WEB3AUTH_NETWORK_TYPE,
} from '@web3auth/base';
import { subkey } from '@toruslabs/openlogin-subkey';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { reportError } from '~/reporting';
import { SessionStore } from '../SessionStore';
import { CommonPrivateKeyProvider } from '@web3auth/base-provider';

export type LoginParams = {
  idToken?: string;
  redirectUrl?: string;
  preopenInstanceId?: string;
};

export type Web3AuthLoginResult = {
  sessionId: string;
  userInfo: {
    email: string;
    name: string;
    profileImage: string;
    typeOfLogin: string;
    verifier: string;
    verifierId: string;
  };
  permissions?: any;
};

export class Web3AuthService {
  private web3auth: Web3AuthNoModal | null = null;
  private walletServicesPlugin: WalletServicesPlugin | null = null;
  private authAdapter: AuthAdapter | null = null;
  private privateKeyProvider: EthereumPrivateKeyProvider | null = null;
  private _provider: IProvider | null = null;
  private _isInitialized = false;
  private _initPromise: Promise<void> | null = null;

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);
  }

  get provider(): IProvider | null {
    return this._provider;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get connected(): boolean {
    return this.web3auth?.connected || false;
  }

  get status(): string {
    return this.web3auth?.status || 'not_ready';
  }

  isConnectedWithoutInit(): boolean {
    return this.web3auth?.connected || false;
  }

  async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    // If initialization is already in progress, return the existing promise
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._performInit();
    return this._initPromise;
  }

  private async _performInit(): Promise<void> {
    try {
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x13882', // 80002 in hex (Polygon Amoy testnet)
        rpcTarget: 'https://rpc-amoy.polygon.technology',
        displayName: 'Polygon Amoy Testnet',
        blockExplorer: 'https://amoy.polygonscan.com',
        ticker: 'MATIC',
        tickerName: 'Polygon',
      };

      this.privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      const networkMapping: Record<string, keyof typeof WEB3AUTH_NETWORK> = {
        mainnet: 'SAPPHIRE_MAINNET',
        testnet: 'SAPPHIRE_DEVNET',
        sapphire_mainnet: 'SAPPHIRE_MAINNET',
        sapphire_devnet: 'SAPPHIRE_DEVNET',
        // Legacy mappings - use original legacy networks for old projects
        cyan: 'CYAN',
        aqua: 'AQUA',
        celeste: 'CELESTE',
      };

      // Default to SAPPHIRE_DEVNET for development/testing
      // Note: Many Web3Auth projects are configured for testnet/devnet initially
      const mappedNetwork = networkMapping[OPEN_LOGIN_NETWORK.toLowerCase()] || 'SAPPHIRE_DEVNET';

      // Debug logging
      console.log('Web3Auth Configuration:', {
        clientId: OPEN_LOGIN_CLIENT_ID,
        originalNetwork: OPEN_LOGIN_NETWORK,
        mappedNetwork,
        web3AuthNetwork: WEB3AUTH_NETWORK[mappedNetwork],
        verifier: OPEN_LOGIN_VERIFIER,
      });

      // For legacy projects on cyan/aqua/celeste, use the mapped network directly
      const actualNetwork = mappedNetwork;

      this.web3auth = new Web3AuthNoModal({
        clientId: OPEN_LOGIN_CLIENT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK[actualNetwork],
        chainConfig,
        privateKeyProvider: this.privateKeyProvider,
        sessionTime: 86400,
      });

      this.authAdapter = new AuthAdapter({
        privateKeyProvider: this.privateKeyProvider,
        adapterSettings: {
          uxMode: 'redirect',
          network: 'cyan',
          loginConfig: {
            jwt: {
              verifier: OPEN_LOGIN_VERIFIER,
              typeOfLogin: 'jwt',
              name: 'Cere',
              clientId: OPEN_LOGIN_CLIENT_ID,
              jwtParameters: {
                domain: window.origin,
                verifierIdField: 'email',
                isVerifierIdCaseSensitive: false,
              },
            },
          },
        },
      });

      this.web3auth.configureAdapter(this.authAdapter);

      this.walletServicesPlugin = new WalletServicesPlugin();
      this.web3auth.addPlugin(this.walletServicesPlugin);

      // Initialize Web3Auth first
      await this.web3auth.init();

      // Check if Web3Auth is already connected (e.g., after redirect)
      if (this.web3auth.connected) {
        console.log('Web3Auth already connected after init, skipping adapter ready check');
        runInAction(() => {
          this._isInitialized = true;
          this._initPromise = null;
        });

        // Don't process session here - let AuthorizePopupStore handle it
        return;
      }

      // Wait for adapter to be ready with better timeout handling
      const waitForAdapterReady = async (timeoutMs: number = 5000) => {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
          if (this.authAdapter && (this.authAdapter.status === 'ready' || this.authAdapter.status === 'connected')) {
            return true;
          }

          // Check every 50ms
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        return false;
      };

      const isAdapterReady = await waitForAdapterReady();
      if (!isAdapterReady) {
        throw new Error(
          `Auth adapter did not become ready within timeout. Current status: ${this.authAdapter?.status}`,
        );
      }

      runInAction(() => {
        this._isInitialized = true;
        this._initPromise = null;
      });
    } catch (error) {
      runInAction(() => {
        this._isInitialized = false;
        this._initPromise = null;
      });
      reportError(error);
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Web3Auth initialization failed:', {
          message: error.message,
          clientId: OPEN_LOGIN_CLIENT_ID,
          network: OPEN_LOGIN_NETWORK,
          verifier: OPEN_LOGIN_VERIFIER,
        });
      }
      throw new Error('Failed to initialize Web3Auth');
    }
  }

  async processExistingSession(): Promise<Web3AuthLoginResult | null> {
    try {
      if (!this.web3auth || !this.web3auth.connected) {
        return null;
      }

      // Get the provider from the existing connection
      const web3authProvider = this.web3auth.provider;
      if (!web3authProvider) {
        console.warn('Web3Auth connected but no provider available');
        return null;
      }

      runInAction(() => {
        this._provider = web3authProvider;
      });

      const userInfo = await this.web3auth.getUserInfo();

      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const rawPrivateKey = (await this.provider.request({
        method: 'eth_private_key',
      })) as string;

      // 🔧 CRITICAL FIX: Apply getScopedKey transformation for wallet compatibility
      // This ensures users get the same wallet address as the old Torus OpenLogin system
      const privateKey = getScopedKey(rawPrivateKey);

      const processedUserInfo = {
        email: userInfo.email || '',
        name: userInfo.name || '',
        profileImage: userInfo.profileImage || '',
        typeOfLogin: userInfo.typeOfLogin || 'jwt',
        verifier: userInfo.verifier || OPEN_LOGIN_VERIFIER,
        verifierId: userInfo.verifierId || userInfo.email || '',
      };

      const sessionId = await this.sessionStore.createSession(
        {
          privateKey, // Now using scoped key for compatibility
          userInfo: processedUserInfo,
        },
        { store: true },
      );

      const result = {
        userInfo: processedUserInfo,
        sessionId: sessionId || '',
        permissions: {},
      };

      console.log('Processed existing Web3Auth session:', result);
      return result;
    } catch (error) {
      reportError(error);
      console.error('Failed to process existing Web3Auth session:', error);
      return null;
    }
  }

  async login(params: LoginParams = {}): Promise<Web3AuthLoginResult> {
    try {
      // Always ensure proper initialization
      if (!this.isInitialized) {
        await this.init();
      }

      // Final verification that everything is ready
      if (!this.web3auth || !this.authAdapter) {
        throw new Error('Web3Auth components not available after initialization');
      }

      if (this.authAdapter.status !== 'ready' && this.authAdapter.status !== 'connected') {
        throw new Error(`Auth adapter not ready. Current status: ${this.authAdapter.status}`);
      }

      const loginParams = {
        loginProvider: 'jwt',
        extraLoginOptions: {
          verifierIdField: 'email',
          id_token: params.idToken,
          ...(params.redirectUrl && { redirectUrl: params.redirectUrl }),
        },
      };

      console.log('Web3Auth Login Params:', loginParams);

      const web3authProvider = await this.web3auth.connectTo(WALLET_ADAPTERS.AUTH, loginParams);

      if (!web3authProvider) {
        throw new Error('Failed to connect to Web3Auth');
      }

      runInAction(() => {
        this._provider = web3authProvider;
      });
      const userInfo = await this.web3auth.getUserInfo();

      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const rawPrivateKey = (await this.provider.request({
        method: 'eth_private_key',
      })) as string;

      // 🔧 CRITICAL FIX: Apply getScopedKey transformation for wallet compatibility
      // This ensures users get the same wallet address as the old Torus OpenLogin system
      const privateKey = getScopedKey(rawPrivateKey);

      const processedUserInfo = {
        email: userInfo.email || '',
        name: userInfo.name || '',
        profileImage: userInfo.profileImage || '',
        typeOfLogin: userInfo.typeOfLogin || 'jwt',
        verifier: userInfo.verifier || OPEN_LOGIN_VERIFIER,
        verifierId: userInfo.verifierId || userInfo.email || '',
      };

      const sessionId = await this.sessionStore.createSession(
        {
          privateKey, // Now using scoped key for compatibility
          userInfo: processedUserInfo,
        },
        { store: true },
      );

      return {
        userInfo: processedUserInfo,
        sessionId: sessionId || '',
        permissions: {},
      };
    } catch (error) {
      reportError(error);

      // Provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      } else {
        throw new Error('Login failed: Unknown error occurred');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.web3auth) {
        await this.web3auth.logout();
      }
      runInAction(() => {
        this._provider = null;
      });
    } catch (error) {
      reportError(error);
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    if (!this.web3auth) {
      return null;
    }

    try {
      const partialUserInfo = await this.web3auth.getUserInfo();

      // Transform Partial<UserInfo> to UserInfo by providing defaults
      if (!partialUserInfo) {
        return null;
      }

      return {
        email: partialUserInfo.email || '',
        name: partialUserInfo.name || '',
        profileImage: partialUserInfo.profileImage || '',
        typeOfLogin: partialUserInfo.typeOfLogin || 'jwt',
        verifier: partialUserInfo.verifier || OPEN_LOGIN_VERIFIER,
        verifierId: partialUserInfo.verifierId || partialUserInfo.email || '',
        aggregateVerifier: partialUserInfo.aggregateVerifier,
        dappShare: partialUserInfo.dappShare,
        idToken: partialUserInfo.idToken,
        oAuthIdToken: partialUserInfo.oAuthIdToken,
        oAuthAccessToken: partialUserInfo.oAuthAccessToken,
        appState: partialUserInfo.appState,
        touchIDPreference: partialUserInfo.touchIDPreference,
        isMfaEnabled: partialUserInfo.isMfaEnabled,
      };
    } catch (error) {
      reportError(error);
      return null;
    }
  }

  async enableMFA(): Promise<void> {
    if (!this.web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      // For now, we'll open the wallet services URL for MFA management
      window.open(this.walletServicesUrl, '_blank');
    } catch (error) {
      reportError(error);
      throw new Error('Failed to enable MFA');
    }
  }

  get walletServicesUrl(): string {
    return 'https://wallet.web3auth.io';
  }

  async showWalletUI() {
    if (!this.web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      // Open wallet services URL as Web3Auth v9+ doesn't have direct showWalletUI method
      window.open(this.walletServicesUrl, '_blank');
    } catch (error) {
      reportError(error);
      throw new Error('Failed to show wallet UI');
    }
  }
}

// Add the getScopedKey function from your old codebase
const getScopedKey = (key: string) => {
  const scopedKey = subkey(key.padStart(64, '0'), Buffer.from(OPEN_LOGIN_CLIENT_ID, 'base64'));
  return scopedKey.padStart(64, '0');
};
