import { options, ci, local } from './config';

export const config = options.ci ? ci : local;
