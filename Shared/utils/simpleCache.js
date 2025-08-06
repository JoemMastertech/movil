<<<<<<< HEAD
import { logError, logWarning } from './errorHandler.js';
import Logger from './logger.js';

class SimpleCache {
  static cache = new Map();
  static prefix = 'mtb_';
  static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    removes: 0
  };

  static set(key, data, ttl = 300000) {
    const expires = Date.now() + ttl;
    const cacheItem = { 
      data, 
      expires, 
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0
    };
    
    this.cache.set(key, cacheItem);
    this.stats.sets++;
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      Logger.debug('SimpleCache: localStorage write failed', error);
    }
  }

  static get(key) {
    let item = this.cache.get(key);
    
    // Try localStorage if not in memory
    if (!item) {
      try {
        const stored = localStorage.getItem(this.prefix + key);
        if (stored) {
          item = JSON.parse(stored);
        }
      } catch (error) {
        Logger.debug('SimpleCache: localStorage read failed', error);
      }
    }
    
    // Check if item exists and is not expired
    if (!item || Date.now() > item.expires) {
      this.remove(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access statistics
    item.accessed = Date.now();
    item.accessCount = (item.accessCount || 0) + 1;
    
    // Update memory cache
    this.cache.set(key, item);
    this.stats.hits++;
    
    return item.data;
  }

  static remove(key) {
    this.cache.delete(key);
    this.stats.removes++;
    
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      Logger.debug('SimpleCache: localStorage remove failed', error);
    }
  }

  static clear() {
    this.cache.clear();
    
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch (error) {
      Logger.debug('SimpleCache: localStorage clear failed', error);
    }
    
    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0
    };
  }

  static getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size,
      memoryKeys: Array.from(this.cache.keys())
    };
  }

  static getCacheInfo(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    return {
      key,
      created: new Date(item.created).toISOString(),
      accessed: new Date(item.accessed).toISOString(),
      expires: new Date(item.expires).toISOString(),
      accessCount: item.accessCount,
      timeToExpire: Math.max(0, item.expires - Date.now()),
      isExpired: Date.now() > item.expires
    };
  }

  static cleanExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.remove(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

export default SimpleCache;
=======
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
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
