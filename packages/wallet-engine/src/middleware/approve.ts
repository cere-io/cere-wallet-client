import {
  createScaffoldMiddleware,
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  AsyncJsonRpcEngineNextCallback,
} from 'json-rpc-engine';

type WithPreopenedInstanceId = {
  preopenInstanceId: string;
};

type ProviderRequest<T = unknown> = WithPreopenedInstanceId & {
  params: T;
};

export type PersonalSignRequest = ProviderRequest<[string]>;

export type IncomingTransaction = {
  from: string;
  to: string;
  value: string;
  data: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
};

export type SendTransactionRequest = ProviderRequest<[IncomingTransaction]>;

export type ApproveMiddlewareOptions = {
  onSendTransaction?: (request: SendTransactionRequest) => Promise<void>;
  onPersonalSign?: (request: PersonalSignRequest) => Promise<void>;
};

const hasPreopenedPopup = (req: any): req is JsonRpcRequest<unknown> & { preopenInstanceId: string } => {
  return Object.hasOwn(req, 'preopenInstanceId');
};

type RequestMiddleware<T, U> = (
  req: JsonRpcRequest<T> & WithPreopenedInstanceId,
  res: PendingJsonRpcResponse<U>,
  next: AsyncJsonRpcEngineNextCallback,
) => Promise<void>;

const createRequestMiddleware = <T = any, U = any>(handler: RequestMiddleware<T, U>): JsonRpcMiddleware<any, any> =>
  createAsyncMiddleware<T, U>(async (req, res, next) => {
    if (!hasPreopenedPopup(req)) {
      return next();
    }

    await handler(req, res, next);

    next();
  });

const noop = async () => {};
export const createApproveMiddleware = ({
  onPersonalSign = noop,
  onSendTransaction = noop,
}: ApproveMiddlewareOptions) => {
  return createScaffoldMiddleware({
    personal_sign: createRequestMiddleware<[string]>(async (req, res, next) => {
      await onPersonalSign({
        preopenInstanceId: req.preopenInstanceId,
        params: req.params!,
      });
    }),

    eth_sendTransaction: createRequestMiddleware<[IncomingTransaction]>(async (req, res, next) => {
      await onSendTransaction({
        preopenInstanceId: req.preopenInstanceId,
        params: req.params!,
      });
    }),
  });
};
