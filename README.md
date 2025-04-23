# Cere wallet client application

## Important Update - Web3Auth SDK Upgrade

The Cere Wallet has been updated to use the latest Web3Auth SDKs. This upgrade resolves issues with failing requests to cyan.openlogin.com, which was causing login failures for some users.

### Changes
- Updated deprecated Web3Auth dependencies to the latest versions
- Replaced old Torus libraries with new Web3Auth libraries
- Migrated authentication logic to use modern Web3Auth APIs
- Fixed issues with email login

For more details, see the [Web3Auth SDK deprecation notice](https://web3auth.io/community/t/important-web3auth-sdk-deprecation-notice/10515)

- [Release Notes](./CHANGELOG.md)
- [Project structure](./STRUCTURE.md)

## Quick start

1. Install dependencies:

```bash
nvm exec npm i
```

2. Copy ENV file:

```bash
cp .env.dev .env
```

3. Run the app:

```bash
nvm exec npm start
```

4. Build the project in prod mode:

```bash
nvm exec npm run build
```

## Auto tests

1. Build the application bundle

```bash
nvm exec npm run build
```

2. Run tests

```bash
nvm exec npm test # headless
nvm exec npm start --workspace @cere-wallet-tests/wdio # in browser
```

3. Generate and open report

```bash
npm run test:report
```

## Simulation

1. Build the application bundle

```bash
nvm exec npm run build
```

2. Run simulation

```bash
nvm exec npm test -- --suite=simulation --maxInstances=5 --multi-run=10 # headless
nvm exec npm start --workspace @cere-wallet-tests/wdio -- --suite=simulation --maxInstances=5 --multi-run=10 # in browser
```

3. Generate and open report

```bash
npm run test:report
```
