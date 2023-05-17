# Cere wallet client application

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
