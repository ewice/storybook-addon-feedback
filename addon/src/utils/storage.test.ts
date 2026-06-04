import { describe, it, expect, vi, beforeEach, afterEach } from 'vite-plus/test';
import { safeStorage, createMemoryStorage } from './storage';

describe('storage utils', () => {
  describe('createMemoryStorage', () => {
    it('should set, get and remove items in local and session memory stores independently', () => {
      const store = createMemoryStorage();
      store.setItem('key1', 'localVal');
      store.setItem('key1', 'sessionVal', true);

      expect(store.getItem('key1')).toBe('localVal');
      expect(store.getItem('key1', true)).toBe('sessionVal');

      store.removeItem('key1');
      expect(store.getItem('key1')).toBeNull();
      expect(store.getItem('key1', true)).toBe('sessionVal');

      store.removeItem('key1', true);
      expect(store.getItem('key1', true)).toBeNull();
    });
  });

  describe('safeStorage', () => {
    const mockLocalStorage: Record<string, string> = {};
    const mockSessionStorage: Record<string, string> = {};

    beforeEach(() => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) => mockLocalStorage[key] ?? null),
        setItem: vi.fn((key, val) => {
          mockLocalStorage[key] = val;
        }),
        removeItem: vi.fn((key) => {
          delete mockLocalStorage[key];
        })
      });

      vi.stubGlobal('sessionStorage', {
        getItem: vi.fn((key) => mockSessionStorage[key] ?? null),
        setItem: vi.fn((key, val) => {
          mockSessionStorage[key] = val;
        }),
        removeItem: vi.fn((key) => {
          delete mockSessionStorage[key];
        })
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      for (const k in mockLocalStorage) delete mockLocalStorage[k];
      for (const k in mockSessionStorage) delete mockSessionStorage[k];
    });

    it('should delegate to native storage systems', () => {
      safeStorage.setItem('test-key', 'value');
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'value');
      expect(safeStorage.getItem('test-key')).toBe('value');

      safeStorage.setItem('test-session', 'val', true);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('test-session', 'val');
      expect(safeStorage.getItem('test-session', true)).toBe('val');

      safeStorage.removeItem('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should fallback gracefully when storage actions throw errors', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage is disabled');
      });
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage is disabled');
      });

      expect(() => safeStorage.setItem('blocked-key', 'val')).not.toThrow();
      expect(safeStorage.getItem('blocked-key')).toBeNull();
    });
  });
});
