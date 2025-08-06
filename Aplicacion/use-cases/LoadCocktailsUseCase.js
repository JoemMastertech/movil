<<<<<<< HEAD
=======
/* caching time in milliseconds */
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
import Logger from '../../Shared/utils/logger.js';
import ErrorHandler from '../../Shared/utils/errorHandler.js';
import SimpleCache from '../../Shared/utils/simpleCache.js';
import { CACHE_KEYS, CACHE_CONFIG } from '../../Shared/config/constants.js';

<<<<<<< HEAD
class LoadCocktailsUseCase {
  constructor(cocktailRepository, options = {}) {
    this.repository = cocktailRepository;
    this.cacheTime = options.cacheTime || CACHE_CONFIG.DEFAULT_TTL;
    this.enableCache = options.enableCache !== false;
    this.cache = { data: null, timestamp: 0 };
    this.loading = false;
  }
  
  async execute(forceRefresh = false) {
    const now = Date.now();
    
    // Return cache if valid and not forcing refresh
    if (!forceRefresh && this.enableCache && this._isCacheValid(now)) {
      Logger.debug('Using cache');
      return this.cache.data;
    }
    
    // Prevent concurrent requests
    if (this.loading) {
      while (this.loading) await new Promise(r => setTimeout(r, 50));
      return this.cache.data || [];
    }
    
    this.loading = true;
    
    try {
      const [error, cocktails] = await ErrorHandler.handleAsync(
        this.repository.getAllCocktails(),
        'LoadCocktailsUseCase'
      );
      
      if (error) {
        Logger.warn('Repository error, using cache fallback');
        return this.cache.data || [];
      }
      
      // Update cache
      if (this.enableCache) {
        this.cache = { data: cocktails, timestamp: now };
        SimpleCache.set(CACHE_KEYS.COCKTAILS, cocktails, this.cacheTime);
      }
      
      Logger.info(`Loaded ${cocktails?.length || 0} cocktails`);
      return cocktails;
    } finally {
      this.loading = false;
    }
  }
  
  clearCache() {
    this.cache = { data: null, timestamp: 0 };
    SimpleCache.remove(CACHE_KEYS.COCKTAILS);
  }
  
  _isCacheValid(now = Date.now()) {
    return this.cache.data && (now - this.cache.timestamp) < this.cacheTime;
=======
/**
 * Default cache time in milliseconds (5 minutes)
 * Can be overridden via constructor options
 */
const DEFAULT_CACHE_TIME = CACHE_CONFIG.DEFAULT_TTL;

/**
 * Use case for loading cocktails with caching and error handling
 * Implements flexible cache configuration and robust error management
 * 
 * @class LoadCocktailsUseCase
 */
class LoadCocktailsUseCase {
  /**
   * Creates an instance of LoadCocktailsUseCase
   * 
   * @param {Object} cocktailRepository - Repository implementing CocktailRepositoryPort
   * @param {Object} options - Configuration options
   * @param {number} options.cacheTime - Cache duration in milliseconds (default: 5 minutes)
   * @param {boolean} options.enableCache - Whether to enable caching (default: true)
   */
  constructor(cocktailRepository, options = {}) {
    this.cocktailRepository = cocktailRepository;
    this.cacheTime = options.cacheTime || DEFAULT_CACHE_TIME;
    this.enableCache = options.enableCache !== false;
    this.cachedData = null;
    this.lastFetch = null;
    this.isLoading = false;
    this.lastFetchTime = null;
    this.minRefreshInterval = 30 * 1000; // 30 seconds minimum between fetches
  }
  
  /**
   * Executes the cocktail loading use case with caching and error handling
   * 
   * @param {boolean} forceRefresh - Force refresh ignoring cache
   * @returns {Promise<Array>} Array of cocktail objects
   * @throws {Error} When repository fails and no cached data is available
   */
  async execute(forceRefresh = false) {
    const now = Date.now();
    
    Logger.debug('LoadCocktailsUseCase: Starting execution', { 
      enableCache: this.enableCache, 
      cacheTime: this.cacheTime,
      forceRefresh
    });
    
    // Prevent concurrent requests
    if (this.isLoading && !forceRefresh) {
      Logger.debug('LoadCocktailsUseCase: Request already in progress, waiting...');
      // Wait for current request to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached result after waiting
      if (this.enableCache && this.cachedData) {
        Logger.debug('LoadCocktailsUseCase: Using cache after waiting for concurrent request');
        return this.cachedData;
      }
    }

    // Check minimum refresh interval
    if (!forceRefresh && this.lastFetchTime && (now - this.lastFetchTime) < this.minRefreshInterval) {
      if (this.enableCache && this.cachedData) {
        Logger.debug('LoadCocktailsUseCase: Using cache due to minimum refresh interval');
        return this.cachedData;
      }
    }
    
    // Check memory cache first (if not forcing refresh)
    if (!forceRefresh && this.enableCache && this.cachedData && this.lastFetch && 
        (now - this.lastFetch) < this.cacheTime) {
      Logger.debug('LoadCocktailsUseCase: Using memory cache');
      return this.cachedData;
    }
    
    // Check persistent cache (if not forcing refresh)
    if (!forceRefresh && this.enableCache) {
      const cachedCocktails = SimpleCache.get(CACHE_KEYS.COCKTAILS);
      if (cachedCocktails) {
        Logger.info('LoadCocktailsUseCase: Using persistent cache');
        this.cachedData = cachedCocktails;
        this.lastFetch = now;
        return cachedCocktails;
      }
    }
    
    this.isLoading = true;
    
    try {
      // Use ErrorHandler for async operations
      const [error, cocktails] = await ErrorHandler.handleAsync(
        this.cocktailRepository.getAllCocktails(),
        'LoadCocktailsUseCase.execute'
      );
      
      if (error) {
        // If we have cached data, return it as fallback
        if (this.cachedData) {
          Logger.warn('LoadCocktailsUseCase: Using stale cache due to error', { 
            userMessage: error.userMessage 
          });
          return this.cachedData;
        }
        
        // No cached data available, throw error
        throw new Error(error.userMessage || 'Error loading cocktails');
      }
      
      Logger.info('LoadCocktailsUseCase: Successfully loaded cocktails', { 
        count: cocktails?.length || 0 
      });
      
      // Update both memory and persistent cache
      if (this.enableCache) {
        this.cachedData = cocktails;
        this.lastFetch = now;
        this.lastFetchTime = now;
        SimpleCache.set(CACHE_KEYS.COCKTAILS, cocktails, this.cacheTime);
      }
      
      return cocktails;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Clears the cached data and forces next execution to fetch fresh data
   * Clears both memory and persistent cache
   */
  clearCache() {
    Logger.debug('LoadCocktailsUseCase: Clearing cache');
    this.cachedData = null;
    this.lastFetch = null;
    this.lastFetchTime = null;
    SimpleCache.remove(CACHE_KEYS.COCKTAILS);
    Logger.info('LoadCocktailsUseCase: Cache cleared');
  }

  /**
   * Get cache status information
   * @returns {Object} Cache status details
   */
  getCacheStatus() {
    const now = Date.now();
    return {
      hasMemoryCache: !!this.cachedData,
      hasPersistentCache: !!SimpleCache.get(CACHE_KEYS.COCKTAILS),
      lastFetch: this.lastFetch,
      lastFetchTime: this.lastFetchTime,
      cacheAge: this.lastFetch ? now - this.lastFetch : null,
      isLoading: this.isLoading,
      cacheEnabled: this.enableCache,
      cacheTimeout: this.cacheTime
    };
  }

  /**
   * Check if cache is valid
   * @returns {boolean} True if cache is valid and not expired
   */
  isCacheValid() {
    if (!this.enableCache || !this.cachedData || !this.lastFetch) {
      return false;
    }
    return (Date.now() - this.lastFetch) < this.cacheTime;
  }

  /**
   * Preload cocktails data (fire and forget)
   */
  async preload() {
    try {
      await this.execute();
      Logger.debug('LoadCocktailsUseCase: Preload completed successfully');
    } catch (error) {
      Logger.warn('LoadCocktailsUseCase: Preload failed', { error: error.message });
    }
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
  }
}

export default LoadCocktailsUseCase;