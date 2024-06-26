# Cere Wallet SDK

`Cere Wallet SDK` package includes API to integrate the wallet into a web application.
The main task of the `SDK` is to set up the wallet `IFRAME` on the host window and organize the cross window communication between the host window and the `IFRAME`.
The `SDK` provides minimal API to control the wallet. These methods are basically thin wrappers around `JSON RPC` calls to the wallet client (running in the `IFRAME`) via the configured communication channel. For security reasons, `SDK` does not have access to the user private key, so all wallet relate tasks are performed only on the `IFRAME` side.

# Installation

Using `NPM`:

```bash
npm install @cere/embed-wallet --save
```

Using `yarn`:

```bash
yarn add @cere/embed-wallet
```

# API

- [EmbedWallet](#embedwallet)
  - [status](#status)
  - [provider](#provider)
  - [isReady](#isready)
  - [init()](#init)
  - [connect()](#connect)
  - [disconnect()](#disconnect)
  - [subscribe()](#subscribe)
  - [getSigner()](#getsigner)
  - [getUserInfo()](#getuserinfo)
  - [getAccounts()](#getaccounts)
  - [showWallet()](#showwallet)
  - [setContext()](#setcontext)

## EmbedWallet

The `SDK` constructor does not accepts any arguments.

```ts
import { EmbedWallet } from '@cere/embed-wallet';

const wallet = new EmbedWallet();
```

### status

A read-only property holding current wallet status. It might be one of the following:

- `not-ready` - the wallet instance is not yet initialized
- `ready` - the wallet instance is initialized and the wallet client is ready to accept JSON RPC calls
- `connecting` - a user is being connected (user authentication and key reconstruction is in progress)
- `connected` - a user has connected his wallet and ready to make actions (signing transactions, getting addresses, etc...)
- `disconnecting` - the connected user is disconnecting after `disconnect()` call
- `errored` - an error occurred during some of the SDK operations

```ts
console.log(wallet.status); // `not-ready`
await wallet.init(...);
console.log(wallet.status); // `ready`
```

### isReady

A read-only property holding a promise that resolves when the wallet instance is initialized.

```ts
await wallet.isReady;

console.log(`Status: ${wallet.status}`); // `ready`, `connected` or `errored`
```

### provider

A read-only property holding a [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) compatible provider instance. This provider can be used with any tools witch support the specification: ethers, web3.

```ts
import { providers } from 'ethers';

const provider = new providers.Web3Provider(wallet.provider);
const signer = provider.getSigner();
const address = await signer.getAddress();
console.log(`Address: ${address}`);
```

### init()

This method initializes the wallet SDK. It also performs the following tasks:

- Adds the wallet IFRAME and wait the wallet client to be loaded
- Configures the communication channel
- Tries to rehydrate a previous user session from browser local storage
- Adds the wallet widget to the host window

```ts
await wallet.init({
  env: 'dev',
  popupMode: 'modal',
  network: {
    host: 'matic',
  },
  context: {
    app: {
      name: 'DApp name',
      url: window.origin,
      logoUrl: '...',
    },
  },
});

console.log(wallet.status); // `ready` or `connected` in case of successful session rehydration
```

#### Parameters

- `env` - the wallet client environment. Can be one of the following:
  - `local` - will load the wallet IFRAME from the local machine (`http://localhost:4050`). Needed for the wallet client development
  - `dev` - will load the wallet IFRAME from `dev` environment (`https://wallet.dev.cere.io`)
  - `stage` - will load the wallet IFRAME from `stage` environment (`https://wallet.stg.cere.io`)
  - `prod` - will load the wallet IFRAME from the production environment (`https://wallet.cere.io`)
- `popupMode` - tells in which UX mode transaction signing popups should be opened. Can be one of the following:
  - `popup` - will use browser popups
  - `modal` - will use overlay modals
- `network` - the network to connect the wallet provider to. The interface has the following structure:
  - `host` - `JSON RPC` url or a preset name: `matic`, `mumbai`, etc...
  - `chainId` - chainId for the network
  - `networkName` - name of the network to be shown on UI
  - `blockExplorer` - block explorer URL to be used in the wallet UI to create links to transactions or accounts
  - `ticker` - Default currency ticker of the network (e.g: MATIC)
  - `tickerName` - Name for currency ticker (e.g: `Matic`)
- `context` - default wallet context, can be overridden with [setContext()](#setcontext) method
- `connectOptions` - default connect configuration, can be overridden with [connect()](#connect) method arguments

### connect()

This method initiates user authentication and private key reconstruction. It accepts the following configuration object:

- `idToken` - And `ID Token` generated by an authorized token provider (eg. `Davinci` or `LiveOne` identity services)
- `mode` - the UX mode in which the build in authentication flow should be started. Can be one of the following:
  - `redirect` - the entire page will be redirected to the authentication screen and returned back to the app after completion
  - `popup` - a browser popup window will be opened with the authentication UI in it
- `redirectUrl` - in case the `mode` option is set to `redirect`, it is possible to provide `redirectUrl` which indicates where to redirect the user after successful authentication.

```ts
await wallet.connect({
  idToken: '...', // If the token is valid then authentication UI will be skipped
  mode: 'redirect',
  redirectUrl: 'https://my-domain.io/user/home',
});
```

### disconnect()

This method disconnects currently connected user

```ts
await wallet.disconnect();
console.log(wallet.status); // `ready`
```

### subscribe()

This method allows to subscribe to the wallet events. Currently supported events are the following:

- `status-update` - this event is triggered on all status updates

The method returns `unsubscribe` function.

```ts
const unsubscribe = wallet.subscribe('status-update', () => {
  console.log(wallet.status);
});
//...
unsubscribe(); // Stop listening for events
```

### getSigner()

This methods returns a universal signer instance for the given wallet account

#### Parameters

- `address` - Optional account address (Optional)
- `type` - Optional type of an account (eg, `ethereum`, `solana`)
- `accountIndex` - Optional account index (Default: `0`)


```ts
const signer = await wallet.getSigner({ type: 'solana' });
const signature = await signer.signMessage('Hello, world!');
   
console.log(signature);
```

### getUserInfo()

This methods returns information about currently connected user. The following user info is returned:

- `email` - user email address
- `name` - the user name (only available in case of social login `Google` or `Facebook`)
- `profileImage` - the user avatar (only available in case of social login `Google` or `Facebook`)
- `isNewUser` - `true` if the user connects his wallet to the DApp for the first time, otherwise `false`

```ts
const userInfo = await wallet.getUserInfo();
console.log(userInfo);

{
  email: '...',
  name: '...',
  profileImage: '...',
  isNewUser: true
}
```

### getAccounts()

This method returns an array of all available user accounts. The items in this array have the following structure:

- `address` - the account address
- `type` - type of the account. Currently supported types are: `ethereum` and `ed25519` (`Polkadot`)
- `name` - the account name (currently user `email` is used)

```ts
const accounts = await wallet.getAccounts();
console.log(accounts);

[
  { type: 'ethereum', address: '5F3sa...YjQX', name: 'user@cere.io' },
  { type: 'ed25519', address: '0x71CR...976F', name: 'user@cere.io' },
];
```

### showWallet()

This methods opens the wallet client UI in a new browser window. Accepts `path` as an optional first argument (`home`, `topup`, `settings`)

```ts
await wallet.showWallet('home');
```

### setContext()

Using this method developer can override default wallet context provided during the initialization.

```ts
await wallet.setContext({
  app: {
    name: 'DApp name',
    url: '...',
    logoUrl: '...',
  },
  banner: {...}, // Marketplace specific banner context
  whiteLabel: {...} // White label configuration
});
```
