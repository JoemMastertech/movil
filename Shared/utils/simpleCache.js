import Logger from './logger.js';
import { MemoizationManager } from '../performance/MemoizationManager.js';

class SimpleCache {
  static #prefix = 'mtb_cache_';
  static #memoryCache = new MemoizationManager({ defaultCacheSize: 50, defaultTTL: 300000 });
  
  static set(key, data, ttl = 300000, memoryOnly = false) {
    try {
      this.#memoryCache.cache('localStorage', key, data, { ttl });
      if (!memoryOnly) {
        localStorage.setItem(this.#prefix + key, JSON.stringify({
          data, expires: Date.now() + ttl, created: Date.now()
        }));
      }
      Logger.debug(`Cache set: ${key}`);
    } catch (error) {
      Logger.warn('Error setting cache', { key, error: error.message });
    }
  }
  
  static get(key) {
    try {
      const memoryData = this.#memoryCache.get('localStorage', key);
      if (memoryData !== null) return memoryData;
      
      const item = localStorage.getItem(this.#prefix + key);
      if (!item) return null;
      
      const { data, expires } = JSON.parse(item);
      if (Date.now() > expires) {
        this.remove(key);
        return null;
      }
      
      this.#memoryCache.cache('localStorage', key, data, { ttl: expires - Date.now() });
      return data;
    } catch (error) {
      Logger.warn('Error getting cache', { key, error: error.message });
      this.remove(key);
      return null;
    }
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(this.#prefix + key);
    } catch (error) {
      Logger.warn('Error removing cache', { key, error: error.message });
    }
  }
  
  static clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.#prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      Logger.warn('Error clearing cache', { error: error.message });
    }
  }
  
  static getStats() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.#prefix));
      let validItems = 0, expiredItems = 0;
      
      keys.forEach(key => {
        try {
          const { expires } = JSON.parse(localStorage.getItem(key));
          Date.now() > expires ? expiredItems++ : validItems++;
        } catch { expiredItems++; }
      });
      
      return {
        localStorage: { totalItems: keys.length, validItems, expiredItems },
        memory: this.#memoryCache.getGlobalStats(),
        efficiency: validItems > 0 ? `${((validItems / (validItems + expiredItems)) * 100).toFixed(1)}%` : '0%'
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  static cleanup() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.#prefix))
        .forEach(key => {
          try {
            const { expires } = JSON.parse(localStorage.getItem(key));
            if (Date.now() > expires) localStorage.removeItem(key);
          } catch { localStorage.removeItem(key); }
        });
    } catch (error) {
      Logger.warn('Error during cache cleanup', { error: error.message });
    }
  }
}

// Initialize cleanup on load
SimpleCache.cleanup();

// Export both SimpleCache and MemoizationManager for unified access
export default SimpleCache;
export { MemoizationManager };