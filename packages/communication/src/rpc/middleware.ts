import { ConsoleLike, JRPCMiddleware, createAsyncMiddleware } from '@toruslabs/openlogin-jrpc';

export const createLoggerMiddleware = (logger: ConsoleLike): JRPCMiddleware<unknown, unknown> =>
  createAsyncMiddleware(async (req, res, next) => {
    logger.debug('RPC (Request)', req);
    await next();
    logger.debug('RPC (Response)', res);
  });
