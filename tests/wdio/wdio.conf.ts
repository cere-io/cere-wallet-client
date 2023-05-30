import path from 'path';
import dotenv from 'dotenv';
import { rootDir } from './config';

dotenv.config({
  path: path.resolve(rootDir, '.env'),
});

export * from './config';
