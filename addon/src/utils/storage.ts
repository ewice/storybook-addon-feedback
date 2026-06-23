export interface StorageAdapter {
  getItem(key: string, isSession?: boolean): string | null;
  setItem(key: string, value: string, isSession?: boolean): void;
  removeItem(key: string, isSession?: boolean): void;
}

export const safeStorage: StorageAdapter = {
  getItem(key, isSession = false) {
    try {
      return isSession ? sessionStorage.getItem(key) : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value, isSession = false) {
    try {
      if (isSession) {
        sessionStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Storage may be blocked by browser settings
    }
  },
  removeItem(key, isSession = false) {
    try {
      if (isSession) {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Storage may be blocked by browser settings
    }
  }
};

export const createMemoryStorage = (): StorageAdapter => {
  const localStore = new Map<string, string>();
  const sessionStore = new Map<string, string>();

  return {
    getItem(key, isSession = false) {
      return (isSession ? sessionStore.get(key) : localStore.get(key)) ?? null;
    },
    setItem(key, value, isSession = false) {
      if (isSession) {
        sessionStore.set(key, value);
      } else {
        localStore.set(key, value);
      }
    },
    removeItem(key, isSession = false) {
      if (isSession) {
        sessionStore.delete(key);
      } else {
        localStore.delete(key);
      }
    }
  };
};
