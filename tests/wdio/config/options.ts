import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import path from 'path';

export const rootDir = path.resolve(__dirname, '../../..');

export const options = yargs(hideBin(process.argv)).options({
  targetUrl: { type: 'string' },
  ci: { type: 'boolean', default: false },
  headless: { type: 'boolean', default: false },
  openDevTools: { type: 'boolean', default: false },
  maxInstances: { type: 'number', default: 5 },
}).argv;
