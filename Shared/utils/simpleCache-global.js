/**
 * SimpleCache - Global Version
 * In-memory and localStorage caching with TTL support
 * Compatible with older browsers, no ES6 imports
 */

window.SimpleCache = window.SimpleCache || {};

// Cache storage and configuration
var cacheData = new Map();
var cachePrefix = 'mtb_';
var cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  removes: 0
};

/**
 * Set cache item with TTL
 */
window.SimpleCache.set = function(key, data, ttl) {
  ttl = ttl || 300000; // Default 5 minutes
  var expires = Date.now() + ttl;
  var cacheItem = { 
    data: data, 
    expires: expires, 
    created: Date.now(),
    accessed: Date.now(),
    accessCount: 0
  };
  
  cacheData.set(key, cacheItem);
  cacheStats.sets++;
  
  try {
    localStorage.setItem(cachePrefix + key, JSON.stringify(cacheItem));
  } catch (error) {
    if (window.Logger) {
      window.Logger.debug('SimpleCache: localStorage write failed', error);
    }
  }
};

/**
 * Get cache item
 */
window.SimpleCache.get = function(key) {
  var item = cacheData.get(key);
  
  // Try localStorage if not in memory
  if (!item) {
    try {
      var stored = localStorage.getItem(cachePrefix + key);
      if (stored) {
        item = JSON.parse(stored);
      }
    } catch (error) {
      if (window.Logger) {
        window.Logger.debug('SimpleCache: localStorage read failed', error);
      }
    }
  }
  
  // Check if item exists and is not expired
  if (!item || Date.now() > item.expires) {
    window.SimpleCache.remove(key);
    cacheStats.misses++;
    return null;
  }
  
  // Update access statistics
  item.accessed = Date.now();
  item.accessCount = (item.accessCount || 0) + 1;
  
  // Update memory cache
  cacheData.set(key, item);
  cacheStats.hits++;
  
  return item.data;
};

/**
 * Remove cache item
 */
window.SimpleCache.remove = function(key) {
  cacheData.delete(key);
  cacheStats.removes++;
  
  try {
    localStorage.removeItem(cachePrefix + key);
  } catch (error) {
    if (window.Logger) {
      window.Logger.debug('SimpleCache: localStorage remove failed', error);
    }
  }
};

/**
 * Clear all cache
 */
window.SimpleCache.clear = function() {
  cacheData.clear();
  
  try {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(cachePrefix) === 0) {
        localStorage.removeItem(keys[i]);
      }
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.debug('SimpleCache: localStorage clear failed', error);
    }
  }
  
  // Reset stats
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    removes: 0
  };
};

/**
 * Get cache statistics
 */
window.SimpleCache.getStats = function() {
  var total = cacheStats.hits + cacheStats.misses;
  var hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) + '%' : '0%';
  
  // Convert Map keys to array for compatibility
  var memoryKeys = [];
  cacheData.forEach(function(value, key) {
    memoryKeys.push(key);
  });
  
  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    sets: cacheStats.sets,
    removes: cacheStats.removes,
    hitRate: hitRate,
    cacheSize: cacheData.size,
    memoryKeys: memoryKeys
  };
};

/**
 * Get cache item information
 */
window.SimpleCache.getCacheInfo = function(key) {
  var item = cacheData.get(key);
  if (!item) return null;
  
  return {
    key: key,
    created: new Date(item.created).toISOString(),
    accessed: new Date(item.accessed).toISOString(),
    expires: new Date(item.expires).toISOString(),
    accessCount: item.accessCount,
    timeToExpire: Math.max(0, item.expires - Date.now()),
    isExpired: Date.now() > item.expires
  };
};

/**
 * Clean expired cache items
 */
window.SimpleCache.cleanExpired = function() {
  var now = Date.now();
  var cleaned = 0;
  var keysToRemove = [];
  
  // Collect keys to remove (avoid modifying Map while iterating)
  cacheData.forEach(function(item, key) {
    if (now > item.expires) {
      keysToRemove.push(key);
    }
  });
  
  // Remove expired items
  for (var i = 0; i < keysToRemove.length; i++) {
    window.SimpleCache.remove(keysToRemove[i]);
    cleaned++;
  }
  
  return cleaned;
};

/**
 * Check if cache has key
 */
window.SimpleCache.has = function(key) {
  return cacheData.has(key) && Date.now() <= cacheData.get(key).expires;
};

/**
 * Get cache size
 */
window.SimpleCache.size = function() {
  return cacheData.size;
};

/**
 * Set cache prefix
 */
window.SimpleCache.setPrefix = function(prefix) {
  cachePrefix = prefix;
};

/**
 * Get cache prefix
 */
window.SimpleCache.getPrefix = function() {
  return cachePrefix;
};

console.log('SimpleCache (Global) loaded successfully');