import { JsonRpcEngine, JsonRpcMiddleware } from 'json-rpc-engine';

type AsyncEngine = Engine | Promise<Engine>;

export type EngineEventTarget = Pick<JsonRpcEngine, 'emit'>;

export const createAsyncEngine = (factory: () => AsyncEngine) => {
  const engine = new Engine();
  let middlewarePromise: Promise<JsonRpcMiddleware<unknown, unknown>>;

  const getMiddleware = () => {
    middlewarePromise ||= Promise.resolve(factory()).then((asyncEngine) => {
      asyncEngine.forwardEvents(engine);

      return asyncEngine.asMiddleware();
    });

    return middlewarePromise;
  };

  engine.push(async (req, res, next, end) => {
    const middleware = await getMiddleware();

    middleware(req, res, next, end);
  });

  return engine;
};

export class Engine extends JsonRpcEngine {
  forwardEvents(target: EngineEventTarget) {
    this.on('message', (message) => {
      target.emit('message', message);
      target.emit(message.type, message.data);
    });
  }

  protected pushEngine(engine: AsyncEngine | (() => AsyncEngine)) {
    const factory = typeof engine === 'function' ? engine : () => engine;
    const resultEngine = createAsyncEngine(factory);

    this.push(resultEngine.asMiddleware());

    /**
     * Forward all messages from sub-engine
     */
    resultEngine.forwardEvents(this);
  }
}
