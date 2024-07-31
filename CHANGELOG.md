## Release Notes:

### vNext

-

### v1.41.0

- Send OTP email with context specific values

### v1.40.0

- Improve login speed by saving permissions to BE in background
- Add Spam notice to OTP screen if not entered for 30 sec

### v1.39.0

- Add support for externally provided email to login with
- Make it possible to change permission title and description
- Store wallet permission to connected application and don't ask on each login
- Add `Magic Link` authentication support
- Postpone GTM initialization to increase init speed
- Add transaction signing permission

### v1.38.0

- Added multi-chain signature API to the wallet client and SDK
- Let users enter an encryption password during account export

### v1.37.0

- Add support of wallet export as a JSON backup file

### v1.36.0

-  Update GTM ID from GTM-MJG54ZJ to GTM-WQ33L7GG
-  Add login complete screen to allow configuring congratulation messages from dApps
-  Send native cere address to application activity endpoint to later use it in the web-hooks

### v1.35.0

- Properly detect PnP users by removing `appId` from the filter
- Migrated to amoy

### v1.34.0

- Use Core Kit private keys for new users
- Add `loginHint` option to the wallet connect configuration

### v1.33.1

- Properly update wallet engine private key on account change

### v1.33.0

- Connect Screen Settings

### v1.32.0

- Upgrade Web3Auth libraries to support latest updates in Web3Auth infrastructure
- Add context banner support to login UI

### v1.31.0

- Switch to new Freeport Smart Contract SDK
- Refactor Assets and activity stores to reduce copy & past
- Remove usages of static token config everywhere, and fetch the data from contracts
- Fix custom assets activity capturing and decimals detection

### v1.30.0

- Add Wallet Permission System ([EIP-2255](https://eips.ethereum.org/EIPS/eip-2255)) support
- Added `initializing` wallet instance status
- Add `ed25519_signPayload` and `ed25519_signRaw` RPC methods
- Updated `@cere/embed-wallet-inject` to use new RPC methods

### v1.29.4

- Fixed deprecated API usage
- Added `skipLoginIntro` prop to white label configuration

### v1.29.3

- Fixed Matic transfer UI showing error event after successful transaction on Mainnet

### v1.29.1

- Fixed fractional Matic balance transfer issue
- Disable MFA for redirect flow by default

### v1.29.0

- Fixed the session storage flow

### v1.28.0

- Add USDT to default asset list

### v1.27.5

- Added feature flags

### v1.27.4

- Fix text in sign up popup

### v1.27.3

- Added cere-game-portal in whitelist label

### v1.27.2

- Changed auth session timeout for one week

### v1.27.1

- Changed some texts

### v1.27.0

- Add `White Label` configuration support
- Upgrade NodeJS version to v18.17.1
- [[Fix]](https://www.notion.so/cere/Wrong-OTP-code-entry-error-logged-incorrectly-2139b9953e354db4829953a6161b68ba?pvs=4)] Fix incorrect sentry reporting in case user entered wrong OTP
- Double theme

### v1.26.0

- [[Feature](https://www.notion.so/cere/Switch-DEV-frontends-to-new-infra-563be1f2c5ee4b92aa87808f3480fe22?pvs=4)] Switch URL to new infra
- [[Feature](https://www.notion.so/cere/Cere-Wallet-Achieve-99-new-users-login-success-rate-in-Cere-Wallet-20610fe9e8564934b544a28aee4dacb9?pvs=4)] Switch web3auth network to Cyan

### v1.25.1

- Fix authentication retry when it shows previous error without actual retrying

### v1.25.0

- [[Feature](https://www.notion.so/cere/Cere-Wallet-simulation-config-46f78c7d573e44f198eac83c1805e482?pvs=4)] Add simulation workflow to run critical user path
- [[Feature](https://www.notion.so/cere/Plan-for-TORUS-replacement-1304aeda9f8c468b946b8b223fb86da7?pvs=4)] Update authentication flow to reduce new users onboarding time
- [[Feature](https://www.notion.so/cere/Implement-E2E-UI-tests-for-Wallet-Client-to-check-Tor-us-fix-b6575b5474684b6cb1566926063a9254?pvs=4)] Add E2E UI tests configuration and simple login spec
- [[Fix](https://www.notion.so/cere/Missed-version-in-Cere-Wallet-IFRAME-URL-on-Stage-c647d3be181846aeb8f6d7fd908ab385?pvs=4)] Add version to the wallet IFRAME URL on Stage environment
- [[Feature](https://www.notion.so/cere/Whitehat-Wallet-Open-redirect-bypass-89bba775a9fc4db58ecbaec5a9935268)] Validate that login redirect URL is whitelisted to prevent fishing attacks

### v1.24.0

- [[Feature](https://www.notion.so/cere/User-can-t-open-Cere-wallet-page-from-the-widget-delete-button-if-possible-bf15658f37a24e91a6bf951aaa935cae)] Add `sessionNamespace` option to the Wallet SDK configuration
- [[Bug](https://www.notion.so/cere/User-can-t-open-Cere-wallet-page-from-the-widget-delete-button-if-possible-bf15658f37a24e91a6bf951aaa935cae)] Fix `Open Wallet` function in mobile WebView browsers
- [[Bug](https://www.notion.so/cere/After-interacting-with-Wallet-button-the-control-arrows-become-inactive-b4f58387f306481ead213af8cc7af364?pvs=4)] Restore focus on host window when closing the wallet widget

### v1.23.0

- Use safe `localStorage` wrapper
- Fix `Sign Out` from the wallet widget error
- Send only ETH account address to applications tracking endpoints
- Fix issue with first connect in mobile browsers

### v1.22.0

- Disable Biconomy for CERE ERC20 transfer
- Application bundle optimization to improve load speed
- Add CERE ERC20 token to default assets
- Disable OPT code auto-capitalization
- Optimize login flow to decrease time to login
- Increase assets balance pooling interval to 10 seconds

### v1.21.0

- Use OpenLogin ID Token as bearer authorization in API requests
- Update CERE Blockchain RPC URLs
- Add CERE ERC20 balance and transfer support to the SDK
- Add Biconomy support for CERE ERC20 token transfer transactions

### v1.19.0

- Analytic events
- Use OpenLogin ID Token as bearer authorization in API requests
- Update CERE Blockchain RPC URLs

### v1.18.0

- Sign out + Analytic events

### v1.17.0

- Bug fix for the session creation

### v1.16.0

- Bug fixes

### v1.15.0

- [feature] Update ss58 prefix
- [feature] Add CERE token transfer SDK method and in-wallet UI

### v1.14.0

- [feature] Add support for authentication flow in modals
- [DAV-3491] Add custom asset management

### v1.13.0

- [DAV-3719] Fix snackbar tour error in console
- [DAV-3792] Align asset transfer UI with the design
- [DAV-3734] Add in-wallet transaction modals
- [DAV-3669] Add asset transfer (ethereum)

### v1.12.0

- [DAV-3702] Fix start point for product tour
- [DAV-3767] Add GTM integration and click IDs

### v.1.11.0

- [DAV-3664] Add Native Cere token balance to UI
- [DAV-3724] Fix a console error when user closes auth popup

### v1.10.0

- [DAV-3702] Fix skipping tour
- [DAV-3674] Add collections to product tour
- [DAV-3580] Display Cere mainnet address on UI

### v1.9.0

- [DAV-3075] Add OpenLogin settings page
- [DAV-3196] Add widget loading state
- [DAV-3256] Add product tour snackbar
- Add SDK readme and `getAccounts` method

### v1.8.0

- [DAV-2808] Add topup button to widget

### v1.7.0

- [DAV-3365] Fix microcopy Collectibles
- [DAV-3350] Fix button jumping to bottom on desktop
- [DAV-3155] Add overlay modals support + enable by default in SDK
- [DAV-3653] Fix custom JSON RPC endpoint SDK option

### v1.6.0

- [DAV-3126] Add wallet loading state + standalone login/logout

### v1.5.0

- [DAV-2698] Add SDK package and built-in authentication
- [DAV-2359] Add wallet context support
- [DAV-3597] Fix authentication issue in Safari
- [DAV-3136] Show default app banner in case custom banner is not provided
- [DAV-3366] Update Top Up onboarding wordings

### v1.4.0

- [DAV-3116] Onboarding modal on Account Overview
- [DAV-3077] Add url to Help link in mobile menu and profile dropdown

### v1.3.0

- [DAV-3036] Wallet asset overview widget
- [DAV-3119] Assets balance real-time update
- [DAV-3079] Add address QR code dialog
- [DAV-3153] Update asset section label and menu item
- [DAV-3037] Add coming soon indicator to menu
- [DAV-3039] Show embedded wallet widget
- [DAV-3074] Allow users to copy wallet address
- [DAV-3188] Show Account Overview instead of Top Up (Temp solution)
- [DAV-3062] Track ERC20 activity only when the wallet is active (Temp solution, no indexer support yet)
- [DAV-3253] Top Up screen implementation

### v1.2.0

- [DAV-3012] Wallet application screens layout and navigation
- [DAV-3029] Primary color adjusted according to design
- [DAV-2983] Add transaction popups loading state

### v1.1.0

- [DAV-2787] Transaction confirmation popups
- [DAV-2826] Add blocked popup authorization request

### v1.0.0

- Initial version
