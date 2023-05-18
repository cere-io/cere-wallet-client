import { options } from './options';
import { config as baseConfig } from './base';
import { createCIConfig } from './ci';
import { createLocalConfig } from './local';

let config = options.ci ? createCIConfig(baseConfig) : createLocalConfig(baseConfig);

export { config };
