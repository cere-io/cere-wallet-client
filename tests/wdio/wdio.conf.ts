import path from 'path';
import dotenv from 'dotenv';
import { options, rootDir } from './config';

const envSuffix = options.env ? '.' + options.env : '';
const envFile = path.resolve(rootDir, '.env' + envSuffix);

dotenv.config({ path: envFile });

export * from './config';
