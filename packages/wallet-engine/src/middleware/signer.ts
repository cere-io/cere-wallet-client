import { createScaffoldMiddleware, createAsyncMiddleware, JRPCRequest } from '@toruslabs/openlogin-jrpc';

export type ApprovalRequest<T = unknown> = {
  preopenInstanceId: string;
  params: T;
};

export type SignRequest = ApprovalRequest<{
  payload: any;
}>;

export type SignerMiddlewareOptions = {
  onSign?: (request: SignRequest) => Promise<boolean>;
};

const hasPreopenedPopup = (req: any): req is JRPCRequest<unknown> & { preopenInstanceId: string } => {
  return Object.hasOwn(req, 'preopenInstanceId');
};

const signRequestMiddleware = ({ onSign = async () => true }: SignerMiddlewareOptions, getPayload: (req: any) => any) =>
  createAsyncMiddleware(async (req, res, next) => {
    if (!hasPreopenedPopup(req)) {
      return next();
    }

    const approved = await onSign({
      preopenInstanceId: req.preopenInstanceId,
      params: {
        payload: getPayload(req.params),
      },
    });

    if (approved) {
      next();
    }
  });

export const createSignerMiddleware = (options: SignerMiddlewareOptions) => {
  return createScaffoldMiddleware({
    personal_sign: signRequestMiddleware(options, ([payload]) => payload),
    eth_signTypedData: signRequestMiddleware(options, ([payload]) => payload),
    eth_signTypedData_v3: signRequestMiddleware(options, ([_, payload]) => payload),
    eth_signTypedData_v4: signRequestMiddleware(options, ([_, payload]) => payload),
  });
};
