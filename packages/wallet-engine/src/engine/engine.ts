import { JsonRpcEngine } from 'json-rpc-engine';

export type EngineEventTarget = Pick<JsonRpcEngine, 'emit'>;

export class Engine extends JsonRpcEngine {
  forwardEvents(target: EngineEventTarget) {
    this.on('message', (message) => target.emit('message', message));

    /**
     * Forward particular event types
     */
    this.on('message', ({ type, data }) => target.emit(type, data));
  }
}
