import { BroadcastChannel } from '@toruslabs/broadcast-channel';

type UpdateHandler<S = unknown> = (state: S) => void;
export type PopupConnection<S = unknown> = {
  readonly id: string;
  update: (state: Partial<S>) => Promise<void>;
  onUpdate: (handler: UpdateHandler<S>) => () => void;
};

export const createPopupConnection = <S = unknown>(id: string): PopupConnection<S> => {
  const channel = new BroadcastChannel(`popup.channel.${id}`);

  return {
    id,
    update: (payload) => channel.postMessage({ name: 'update', payload }),
    onUpdate: (handler) => {
      const onMessage = ({ name, payload }: any) => {
        if (name === 'update') {
          handler(payload);
        }
      };

      channel.addEventListener('message', onMessage);

      return () => channel.removeEventListener('message', onMessage);
    },
  };
};
