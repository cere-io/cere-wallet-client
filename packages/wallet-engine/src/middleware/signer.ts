import { createScaffoldMiddleware, createAsyncMiddleware, JRPCRequest } from '@toruslabs/openlogin-jrpc';

export type ApprovalRequest<T = unknown> = {
  preopenInstanceId: string;
  params: T;
};

export type PersonalSignRequest = ApprovalRequest<{
  payload: string;
}>;

export type SignerMiddlewareOptions = {
  onPersonalSign?: (request: PersonalSignRequest) => Promise<boolean>;
};

const hasPreopenedPopup = (req: any): req is JRPCRequest<unknown> & { preopenInstanceId: string } => {
  return Object.hasOwn(req, 'preopenInstanceId');
};

export const createSignerMiddleware = ({ onPersonalSign = async () => true }: SignerMiddlewareOptions) => {
  return createScaffoldMiddleware({
    personal_sign: createAsyncMiddleware(async (req, res, next) => {
      if (!hasPreopenedPopup(req)) {
        return next();
      }

      const [payload] = req.params as string[];
      const approved = await onPersonalSign({
        preopenInstanceId: req.preopenInstanceId,
        params: { payload },
      });

      if (approved) {
        next();
      }
    }),
  });
};
