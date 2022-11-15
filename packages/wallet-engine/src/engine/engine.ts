import EventEmitter from 'events';
import { JsonRpcEngine } from 'json-rpc-engine';

export type EventTargetEngine = Pick<EventEmitter, 'emit'>;

export class Engine extends JsonRpcEngine {
  forwardEvents(toEngine: EventTargetEngine) {
    this.on('message', (message) => toEngine.emit('message', message));
  }
}
