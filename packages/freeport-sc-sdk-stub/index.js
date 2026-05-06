// Stub for @cere/freeport-sc-sdk@0.26.0 (unpublished from npm).
// `createERC20MockToken` returns a real ethers.Contract with a standard ERC20
// ABI — used everywhere ERC20 balances/transfers happen (CERE, USDC, USDT).
// The other exports (Freeport, Marketplace, FToken, FreeportCollection,
// FiatGateway) are legacy NFT contracts being removed; they throw at runtime
// if called and emit a clear error so we can spot lingering call sites.

'use strict';

const { Contract } = require('ethers');

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

const stubFn = (name) => () => {
  throw new Error(`@cere/freeport-sc-sdk stub: ${name} is not implemented (legacy Freeport contracts are being removed)`);
};

const ERC20MockToken__factory = {
  abi: ERC20_ABI,
  createInterface: () => new Contract('0x0000000000000000000000000000000000000000', ERC20_ABI).interface,
  connect: (address, signerOrProvider) => new Contract(address, ERC20_ABI, signerOrProvider),
};

const stubFactory = (name) => ({
  abi: [],
  createInterface: () => ({
    functions: {},
    events: {},
    parseTransaction: stubFn(`${name}.parseTransaction`),
    encodeFunctionData: stubFn(`${name}.encodeFunctionData`),
    decodeFunctionResult: stubFn(`${name}.decodeFunctionResult`),
  }),
  connect: stubFn(`${name}.connect`),
});

const ApplicationEnum = Object.freeze({ DAVINCI: 'DAVINCI', LIVEONE: 'LIVEONE' });

function createERC20MockToken({ signer, contractAddress }) {
  return new Contract(contractAddress, ERC20_ABI, signer);
}

function getContractAddress() {
  throw new Error('@cere/freeport-sc-sdk stub: getContractAddress is not implemented (legacy Freeport contracts are being removed)');
}

module.exports = {
  ApplicationEnum,
  Deployment: {},
  ChainId: {},
  getContractAddress,
  createERC20MockToken,
  ERC20MockToken__factory,
  Freeport__factory: stubFactory('Freeport'),
  Marketplace__factory: stubFactory('Marketplace'),
  FreeportCollection__factory: stubFactory('FreeportCollection'),
  FiatGateway__factory: stubFactory('FiatGateway'),
  FToken__factory: stubFactory('FToken'),
};
