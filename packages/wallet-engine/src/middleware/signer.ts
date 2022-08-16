import { createScaffoldMiddleware, createAsyncMiddleware, JRPCRequest } from '@toruslabs/openlogin-jrpc';

export type ApprovalRequest<T = unknown> = {
  preopenInstanceId: string;
  params: T;
};

export type PersonalSignRequest = ApprovalRequest<{
  payload: string;
}>;

export type SignerMiddlewareOptions = {
  onPersonalSign?: (request: PersonalSignRequest) => Promise<void>;
};

const hasPreopenedPopup = (req: any): req is JRPCRequest<unknown> & { preopenInstanceId: string } => {
  return Object.hasOwn(req, 'preopenInstanceId');
};

const noop = async () => {};
export const createSignerMiddleware = ({ onPersonalSign = noop }: SignerMiddlewareOptions) => {
  return createScaffoldMiddleware({
    personal_sign: createAsyncMiddleware(async (req, res, next) => {
      const [payload] = req.params as string[];

      if (!hasPreopenedPopup(req)) {
        return next();
      }

      await onPersonalSign({
        preopenInstanceId: req.preopenInstanceId,
        params: { payload },
      });

      next();
    }),
  });
};
