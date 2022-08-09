import { BasePostMessageStream, setupMultiplex } from '@toruslabs/openlogin-jrpc';
import { getIFrameOrigin } from './getIFrameOrigin';

export const createMux = (name: string, target: string) => {
  const stream = new BasePostMessageStream({
    name,
    target,
    targetWindow: window.parent,
    targetOrigin: getIFrameOrigin(),
  });

  return setupMultiplex(stream);
};
