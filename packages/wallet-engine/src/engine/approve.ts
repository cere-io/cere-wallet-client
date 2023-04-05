import {
  createScaffoldMiddleware,
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';

import { Engine } from './engine';

type WithPreopenedInstanceId = {
  preopenInstanceId?: string;
};

type ProviderRequest<T = unknown, U = unknown> = WithPreopenedInstanceId & {
  params: T;
  proceed: () => Promise<Pick<PendingJsonRpcResponse<U>, 'error' | 'result'>>;
};

export type PersonalSignRequest = ProviderRequest<[string], string>;

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

export type SendTransactionRequest = ProviderRequest<[IncomingTransaction], string>;

export type TransferParams = {
  from: string;
  to: string;
  token: string;
  balance: string;
};

export type TransferRequest = ProviderRequest<[TransferParams], string>;

export type ApproveEngineOptions = {
  onSendTransaction?: (request: SendTransactionRequest) => Promise<void>;
  onTransfer?: (request: TransferRequest) => Promise<void>;
  onPersonalSign?: (request: PersonalSignRequest) => Promise<void>;
};

type RequestMiddleware<T, U> = (
  req: JsonRpcRequest<T> & Partial<WithPreopenedInstanceId>,
  proceed: () => Promise<PendingJsonRpcResponse<U>>,
) => Promise<void>;

const createRequestMiddleware = <T = any, U = any>(handler: RequestMiddleware<T, U>): JsonRpcMiddleware<any, any> =>
  createAsyncMiddleware<T, U>(async (req, res, next) => {
    let done = false;

    const proceed = async () => {
      await next();
      done = true;

      return res;
    };

    await handler(req, proceed);

    if (!done) {
      await proceed();
    }
  });

const noop = async () => {};
export const createApproveEngine = ({
  onPersonalSign = noop,
  onSendTransaction = noop,
  onTransfer = noop,
}: ApproveEngineOptions) => {
  const engine = new Engine();

  engine.push(
    createScaffoldMiddleware({
      personal_sign: createRequestMiddleware<[string]>(async (req, proceed) => {
        await onPersonalSign({
          preopenInstanceId: req.preopenInstanceId,
          params: req.params!,
          proceed,
        });
      }),

      eth_sendTransaction: createRequestMiddleware<[IncomingTransaction]>(async (req, proceed) => {
        await onSendTransaction({
          preopenInstanceId: req.preopenInstanceId,
          params: req.params!,
          proceed,
        });
      }),

      ed25519_transfer: createRequestMiddleware<string[]>(async (req, proceed) => {
        const [from, to, balance] = req.params!;

        await onTransfer({
          preopenInstanceId: req.preopenInstanceId,
          proceed,
          params: [
            {
              from,
              to,
              balance,
              token: 'CERE',
            },
          ],
        });
      }),

      eth_transfer: createRequestMiddleware<string[]>(async (req, proceed) => {
        const [from, to, balance] = req.params!;

        await onTransfer({
          preopenInstanceId: req.preopenInstanceId,
          proceed,
          params: [
            {
              from,
              to,
              balance,
              token: 'CERE',
            },
          ],
        });
      }),
    }),
  );

  return engine;
};
