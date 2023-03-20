import { JsonRpcEngine } from 'json-rpc-engine';

export type EngineEventTarget = Pick<JsonRpcEngine, 'emit'>;

export class Engine extends JsonRpcEngine {
  forwardEvents(target: EngineEventTarget) {
    this.on('message', (message) => {
      target.emit('message', message);
      target.emit(message.type, message.data);
    });
  }
}
