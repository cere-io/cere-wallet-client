import { createStorage } from './createStorage';

let globalStorage: Storage;

export const getGlobalStorage = () => {
  globalStorage ||= createStorage();

  return globalStorage;
};
