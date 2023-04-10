import { InMemoryStorage } from './InMemoryStorage';
import { getLocalStorageAvailability } from './isLocalStorageAvailable';

export const createStorage = () => {
  let availability = getLocalStorageAvailability();

  console.log('Local storage availbalility:', availability);

  if (availability === 'quotaExceeded') {
    window.localStorage.clear();

    availability = getLocalStorageAvailability();
  }

  return availability === 'writable' ? window.localStorage : new InMemoryStorage();
};
