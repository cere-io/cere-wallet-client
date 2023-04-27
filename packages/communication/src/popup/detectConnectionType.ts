import { parse, ENGINE_MAP } from 'bowser';
import { MethodType } from 'broadcast-channel';

export const detectConnectionType = (): MethodType | undefined => {
  const { engine } = parse(navigator.userAgent);

  /**
   * WebKit and Gecko browsers do not support Broadcast channels in in IFRAMEs so falling back to localStorage
   */
  return [ENGINE_MAP.WebKit, ENGINE_MAP.Gecko].includes(engine.name || '') ? 'localstorage' : undefined;
};
