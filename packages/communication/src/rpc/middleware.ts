import { ConsoleLike, JRPCMiddleware } from '@toruslabs/openlogin-jrpc';

export const createLoggerMiddleware =
  (logger: ConsoleLike): JRPCMiddleware<unknown, unknown> =>
  (req, res, next, _) => {
    logger.debug('RPC (Request)', req);
    logger.debug('RPC (Response)', res);

    next();
  };
