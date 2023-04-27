## Release Notes:

### vNext

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
