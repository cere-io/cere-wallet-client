import { options, rootDir } from './options';
import { config as baseConfig } from './base';
import { createCIConfig } from './ci';
import { createLocalConfig } from './local';
import { withAllure } from './allure';

const config = withAllure(options.ci ? createCIConfig(baseConfig) : createLocalConfig(baseConfig));

export { config, options, rootDir };
