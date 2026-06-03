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
      // Graceful fallback if storage is blocked
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
      // Graceful fallback if storage is blocked
    }
  }
};
