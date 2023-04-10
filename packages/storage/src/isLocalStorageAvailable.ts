const QuotaErrorNames = ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'];

export const isQuotaExceededError = (err: unknown) => err instanceof DOMException && QuotaErrorNames.includes(err.name);

type Availability = 'quotaExceeded' | 'notWritable' | 'notSupported' | 'writable';

const testWrite = (): Availability => {
  const key = 'localStorageTest';
  const value = 'succeeds';
  const storage = window.localStorage;

  try {
    storage.setItem(key, value);
    storage.removeItem(key);

    return 'writable';
  } catch (error) {
    return isQuotaExceededError(error) ? 'quotaExceeded' : 'notWritable';
  }
};

export const getLocalStorageAvailability = (): Availability => {
  const inWindow = typeof window.localStorage === 'object' && typeof window.localStorage.setItem === 'function';

  if (!inWindow) {
    return 'notSupported';
  }

  return testWrite();
};
