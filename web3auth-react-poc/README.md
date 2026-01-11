# Web3Auth React PoC

A clean React TypeScript implementation to test Web3Auth No Modal SDK v9+ with email + OTP authentication.

## Purpose

This PoC was created to:
- Test Web3Auth SDK v9+ with proper TypeScript support
- Compare generated Ethereum addresses with legacy implementation
- Debug authentication flow and address generation
- Provide a clean environment without existing code dependencies

## Features

- ✅ **React + TypeScript** - Proper modern development environment
- ✅ **Web3Auth No Modal SDK v9+** - Latest version with all features
- ✅ **Email + OTP Authentication** - Using real Cere API endpoints
- ✅ **Multi-Factor Authentication (MFA)** - Support for default, optional, and mandatory MFA
- ✅ **Ethereum Address Generation** - With ethers.js v5
- ✅ **Debug Information** - Comprehensive logging of all steps
- ✅ **Modern UI** - Clean, responsive design
- ✅ **Error Handling** - Proper error states and user feedback

## Configuration

Uses the same configuration as the main Cere Wallet:

```typescript
const CONFIG = {
  CLIENT_ID: 'BEQEos1d_yDAJiO_oCXyD8lnLugjpByRODzKDv1dgcOCwqRQ1R47y7Y1eliyxFD7TsAYZ0xXJHf0fC4drBb__UM',
  NETWORK: 'cyan', // Legacy Web3Auth network
  VERIFIER: 'cere-wallet-stage',
  CHAIN_ID: '0x13882', // Polygon Amoy testnet
  RPC_URL: 'https://rpc-amoy.polygon.technology',
  API_BASE_URL: 'https://api.wallet.stage.cere.io'
};
```

## Dependencies

- `@web3auth/no-modal` - Main Web3Auth SDK
- `@web3auth/auth-adapter` - JWT authentication adapter
- `@web3auth/ethereum-provider` - Ethereum provider
- `@web3auth/base` - Base types and constants
- `ethers@5.6.9` - Ethereum utilities (same version as main app)
- `axios` - HTTP client for API calls

## Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Test authentication flow:**
   - Enter your email address
   - Receive OTP via email
   - Enter 6-digit OTP code
   - See authentication results and generated Ethereum address

## Authentication Flow

1. **MFA Configuration** → Select MFA level (default, optional, mandatory)
2. **Email Input** → Send OTP via Cere API
3. **OTP Verification** → Get JWT token from Cere API  
4. **Web3Auth Login** → Authenticate with JWT token (MFA prompt if mandatory)
5. **Address Generation** → Calculate Ethereum address from private key
6. **Results Display** → Show user info, address, MFA status, and debug data
7. **MFA Management** → Enable/disable MFA via Web3Auth Wallet UI

## Debug Information

The app provides comprehensive debug logging:
- Web3Auth initialization details
- API request/response data
- Authentication parameters
- Generated private key (truncated)
- Calculated Ethereum address
- User information from Web3Auth

## Comparison with Legacy

Key differences from the old `@toruslabs/openlogin` implementation:
- Uses modern `@web3auth/no-modal` SDK
- Different key derivation algorithms
- Updated cryptographic parameters
- New network configurations

This may result in **different Ethereum addresses** for the same `verifierId`, which is the main investigation point.

## MFA (Multi-Factor Authentication) Support

### Plan-Based MFA Features

#### Growth Plan (Current)
- ✅ **MFA is supported** - Users can enable and use MFA
- ✅ **MFA during login** - Can be forced via `mfaLevel: 'mandatory'`
- ✅ **Basic MFA enablement** - Via `enableMFA()` method
- ❌ **Advanced MFA management UI** - `manageMfa()` method not available

#### Scale Plan and Higher
- ✅ **All Growth plan features**
- ✅ **Advanced MFA management** - `manageMfa()` method with full UI
- ✅ **MFA settings customization** - Fine-grained control over MFA factors

### MFA Implementation Options

#### Option 1: Direct MFA Enablement (Recommended for Growth)
```typescript
// Simple MFA enablement without management UI
await web3auth.enableMFA();
```

#### Option 2: Mandatory MFA During Login
```typescript
// Set MFA as mandatory during adapter configuration
const adapterSettings = {
  // ... other settings
  mfaSettings: {
    deviceShareFactor: { enable: true, priority: 1, mandatory: true },
    backUpShareFactor: { enable: true, priority: 2, mandatory: true },
    // ...
  }
};
```

#### Option 3: MFA Management UI (Scale Plan Only)
```typescript
// Full MFA management interface
await web3auth.manageMfa();
```

### Testing MFA on Growth Plan

1. **Enable MFA**: Click "Enable MFA" button after authentication
2. **Mandatory MFA**: Set MFA Level to "Mandatory", logout, and log in again
3. **Verify Status**: Use "Refresh MFA Status" to check if MFA is enabled

### Error Messages

- **"growth plan" error**: Indicates you're trying to use Scale plan features
- **"Web3Auth not connected"**: Ensure user is authenticated first
- **"enableMFA method not available"**: Check SDK version compatibility

## Testing

To compare addresses:
1. Use the same email address in both implementations
2. Complete authentication in both systems
3. Compare the generated Ethereum addresses
4. Check the debug information for key derivation details

To test MFA:
1. Try different MFA levels (default, optional, mandatory)
2. Complete authentication and check MFA status
3. Use "Enable MFA" to set up additional factors
4. Test login with MFA enabled

## Architecture Benefits

Compared to the vanilla HTML/JS approach:
- ✅ **Proper dependency management** - No CDN loading issues
- ✅ **TypeScript support** - Better development experience and error catching
- ✅ **Modern React patterns** - Hooks, state management, component structure
- ✅ **Better error handling** - Proper async/await patterns
- ✅ **Hot reloading** - Faster development iteration
- ✅ **Build optimization** - Production-ready builds

## Issues Resolved

This React implementation fixes several issues from the vanilla JS approach:
- ❌ CDN loading failures → ✅ Proper npm package imports
- ❌ ES6 module resolution errors → ✅ Webpack bundling
- ❌ Global object availability issues → ✅ Direct imports
- ❌ Manual dependency management → ✅ Package.json dependencies
