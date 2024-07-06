import {
  createScaffoldMiddleware,
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';

import { Engine } from './engine';
import type { KeyType } from '../types';

type WithPreopenedInstanceId = {
  preopenInstanceId?: string;
};

type ProviderRequest<T = unknown, U = unknown> = WithPreopenedInstanceId & {
  params: T;
  proceed: () => Promise<Pick<PendingJsonRpcResponse<U>, 'error' | 'result'>>;
};

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

export type PayloadSignData = Record<string, any>;
export type SendTransactionRequest = ProviderRequest<[IncomingTransaction], string>;
export type PersonalSignRequest = ProviderRequest<[string, string, KeyType], string>;
export type PayloadSignRequest<T = PayloadSignData> = ProviderRequest<[T, KeyType], string>;

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
  onPayloadSign?: (request: PayloadSignRequest) => Promise<void>;
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
  onPayloadSign = noop,
  onPersonalSign = noop,
  onSendTransaction = noop,
  onTransfer = noop,
}: ApproveEngineOptions) => {
  const engine = new Engine();

  engine.push(
    createScaffoldMiddleware({
      personal_sign: createRequestMiddleware<[string, string]>(async (req, proceed) => {
        await onPersonalSign({
          preopenInstanceId: req.preopenInstanceId,
          params: [...req.params!, 'ethereum' as KeyType],
          proceed,
        });
      }),

      /**
       * @deprecated Use `ed25519_signRaw` instead. This method is unsafe and should not be used.
       *
       * TODO: Remove this method after migrating `@cere/embed-wallet-inject` to use `ed25519_signRaw` and `ed25519_signPayload`.
       */
      ed25519_sign: createRequestMiddleware<[string, string]>(async (req, proceed) => {
        const [account, message] = req.params!;

        await onPersonalSign({
          preopenInstanceId: req.preopenInstanceId,
          params: [message, account, 'ed25519' as KeyType],
          proceed,
        });
      }),

      ed25519_signRaw: createRequestMiddleware<[string, string]>(async (req, proceed) => {
        const [account, message] = req.params!;

        await onPersonalSign({
          preopenInstanceId: req.preopenInstanceId,
          params: [message, account, 'ed25519' as KeyType],
          proceed,
        });
      }),

      ed25519_signPayload: createRequestMiddleware<[PayloadSignData]>(async (req, proceed) => {
        const [payload] = req.params!;

        await onPayloadSign({
          preopenInstanceId: req.preopenInstanceId,
          params: [payload, 'ed25519' as KeyType],
          proceed,
        });
      }),

      solana_signMessage: createRequestMiddleware<[string, string]>(async (req, proceed) => {
        const [account, message] = req.params!;

        await onPersonalSign({
          preopenInstanceId: req.preopenInstanceId,
          params: [message, account, 'solana' as KeyType],
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
