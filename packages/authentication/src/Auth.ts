import { Web3AuthCore } from '@web3auth/core';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

const clientId = 'BC_ADg9FZiPWIIVeu74NZVOyWtK7oIz3AKI8cfWaxcVzwjIJyEnuRl6TXKYim_mMqsykwLx3WEu3BAUnSD1238k';
const network = 'testnet';
const verifier = 'cere-wallet-dev';

type AuthOptions = {
  baseUrl: string;
};

export class Auth {
  private core: Web3AuthCore;
  private adapter: OpenloginAdapter;

  constructor({ baseUrl }: AuthOptions) {
    this.core = new Web3AuthCore({
      clientId,
      chainConfig: {
        chainNamespace: 'other',
      },
    });

    this.adapter = new OpenloginAdapter({
      adapterSettings: {
        clientId,
        network,
        uxMode: 'popup',

        loginConfig: {
          jwt: {
            clientId,
            verifier,
            name: 'Cere',
            typeOfLogin: 'jwt',
            jwtParameters: {
              client_id: clientId,
              domain: baseUrl,
              verifierIdField: 'email',
              isVerifierIdCaseSensitive: false,
            },
          },
        },
      },
    });
  }

  async init() {
    this.core.configureAdapter(this.adapter);

    await this.core.init();
  }

  async logout() {
    if (this.core.status !== 'connected') {
      return;
    }

    await this.core.logout();
  }

  async login() {
    if (this.core.status !== 'connected') {
      await this.core.connectTo(this.adapter.name, {
        loginProvider: 'jwt',
      });
    }

    const userInfo = await this.core.getUserInfo();
    const privateKey = await this.core.provider?.request<string>({
      method: 'private_key',
    });

    console.log({
      userInfo,
      privateKey,
    });

    return {
      userInfo,
      privateKey,
    };
  }
}
