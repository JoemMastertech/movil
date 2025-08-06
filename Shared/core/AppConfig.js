/**
 * Application Configuration Manager
 * Centralizes environment variables, feature flags, and UI configuration
 * Replaces window.appConfig with structured, environment-aware configuration
 */
class AppConfig {
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  /**
   * Load configuration from environment and defaults
   * @returns {Object} Complete configuration object
   */
  loadConfiguration() {
    // Environment detection
    const environment = this.detectEnvironment();
    
    return {
      // Environment settings
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      
      // Database configuration
      database: {
        supabaseUrl: this.getEnvVar('VITE_SUPABASE_URL', 'https://udtlqjmrtbcpdqknwuro.supabase.co'),
        supabaseKey: this.getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkdGxxam1ydGJjcGRxa253dXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDYyNzQsImV4cCI6MjA1ODUyMjI3NH0.5UW6IHyGVFfX5bnr5kv1XFIvevVxWvBoBy2a7_0visU'),
        enableCaching: this.getBooleanEnv('VITE_ENABLE_CACHING', true),
        cacheTimeout: this.getNumberEnv('VITE_CACHE_TIMEOUT', 300000) // 5 minutes
      },

      // Feature flags
      features: {
        orderSystem: true,
        videoPlayback: true,
        imageModal: true,
        multipleCategories: true,
        drinkCustomization: true,
        meatCustomization: true,
        orderHistory: true,
        realTimeSync: false
      },

      // Business rules and validations
      validations: {
        ageCheck: {
          enabled: false // Age verification completely disabled
        },
        stockEnabled: false, // Stock validation disabled
        orderValidation: true,
        priceValidation: true
      },

      // UI configuration
      ui: {
        theme: 'dark',
        animations: {
          enabled: true,
          duration: {
            welcome: 3000,
            logo: 3000,
            category: 2000,
            fade: 1000
          }
        },
        layout: {
          tableWidth: '63.75%',
          tableMaxWidth: '900px',
          tableMargin: '30px'
        },
        modals: {
          backdrop: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '15px',
          boxShadow: '0 0 30px var(--price-color)'
        }
      },

      // Product configuration
      products: {
        maxDrinkCount: 5,
        enableVideoThumbnails: true,
        enableImageModals: true,
        defaultCategory: 'cocteleria',
        categories: [
          'cocteleria', 'refrescos', 'licores', 'cervezas',
          'pizzas', 'alitas', 'sopas', 'ensaladas',
          'carnes', 'cafe', 'postres'
        ]
      },

      // API configuration
      api: {
        timeout: this.getNumberEnv('VITE_API_TIMEOUT', 10000),
        retryAttempts: this.getNumberEnv('VITE_API_RETRY_ATTEMPTS', 3),
        retryDelay: this.getNumberEnv('VITE_API_RETRY_DELAY', 1000)
      },

      // Logging configuration
      logging: {
        enabled: this.getBooleanEnv('VITE_ENABLE_LOGGING', environment === 'development'),
        level: this.getEnvVar('VITE_LOG_LEVEL', environment === 'development' ? 'debug' : 'error'),
        console: environment === 'development',
        remote: environment === 'production'
      },

      // Security configuration
      security: {
        sanitizeHtml: true,
        validateInput: true,
        enableCSP: environment === 'production',
        allowUnsafeEval: environment === 'development'
      }
    };
  }

  /**
<<<<<<< HEAD
   * Detect current environment (simplified)
   * @returns {string} Environment name
   */
  detectEnvironment() {
    if (typeof window === 'undefined') return 'server';
    
    const envVar = this.getEnvVar('VITE_ENVIRONMENT');
    if (envVar) return envVar;
    
=======
   * Detect current environment
   * @returns {string} Environment name
   */
  detectEnvironment() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'server';
    }

    // Check for explicit environment variable
    const envVar = this.getEnvVar('VITE_ENVIRONMENT');
    if (envVar) {
      return envVar;
    }

    // Check hostname patterns
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    const hostname = window.location?.hostname || '';
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
      return 'development';
    }
    
<<<<<<< HEAD
    return hostname.includes('staging') || hostname.includes('test') ? 'staging' : 'production';
  }

  /**
   * Get environment variable with fallback (simplified)
=======
    if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    }
    
    return 'production';
  }

  /**
   * Get environment variable with fallback
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
   * @param {string} key - Environment variable key
   * @param {*} defaultValue - Default value if not found
   * @returns {string|*} Environment variable value or default
   */
  getEnvVar(key, defaultValue = null) {
<<<<<<< HEAD
    // Try common environment sources
    try {
      return window?.importMeta?.env?.[key] || 
             globalThis?.importMeta?.env?.[key] || 
             process?.env?.[key] || 
             window?.env?.[key] || 
             defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get boolean environment variable (simplified)
=======
    // Try import.meta.env first (Vite)
    if (typeof window !== 'undefined' && typeof window.importMeta !== 'undefined' && window.importMeta?.env) {
      return window.importMeta.env[key] || defaultValue;
    }

    // Alternative check for import.meta in modern environments
    try {
      if (typeof globalThis !== 'undefined' && globalThis.importMeta?.env) {
        return globalThis.importMeta.env[key] || defaultValue;
      }
    } catch (e) {
      // Ignore errors when import.meta is not available
    }

    // Try process.env (Node.js)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }

    // Try window environment (fallback)
    if (typeof window !== 'undefined' && window.env) {
      return window.env[key] || defaultValue;
    }

    return defaultValue;
  }

  /**
   * Get boolean environment variable
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
   * @param {string} key - Environment variable key
   * @param {boolean} defaultValue - Default boolean value
   * @returns {boolean}
   */
  getBooleanEnv(key, defaultValue = false) {
    const value = this.getEnvVar(key);
<<<<<<< HEAD
    return value === 'true' || value === '1' || value === true || defaultValue;
  }

  /**
   * Get numeric environment variable (simplified)
=======
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value === 'true' || value === '1' || value === true;
  }

  /**
   * Get numeric environment variable
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
   * @param {string} key - Environment variable key
   * @param {number} defaultValue - Default numeric value
   * @returns {number}
   */
  getNumberEnv(key, defaultValue = 0) {
    const value = this.getEnvVar(key);
<<<<<<< HEAD
=======
    if (value === null || value === undefined) {
      return defaultValue;
    }
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate configuration integrity
   * @throws {Error} If configuration is invalid
   */
  validateConfiguration() {
    const errors = [];

    // Validate required database configuration
    if (!this.config.database.supabaseUrl) {
      errors.push('Database URL is required');
    }

    if (!this.config.database.supabaseKey) {
      errors.push('Database key is required');
    }

    // Validate feature flags are boolean
    for (const [key, value] of Object.entries(this.config.features)) {
      if (typeof value !== 'boolean') {
        errors.push(`Feature flag '${key}' must be boolean, got ${typeof value}`);
      }
    }

    // Validate categories
    if (!Array.isArray(this.config.products.categories) || this.config.products.categories.length === 0) {
      errors.push('Product categories must be a non-empty array');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get configuration value by path
   * @param {string} path - Dot-separated path (e.g., 'database.supabaseUrl')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Configuration value
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let current = this.config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureName - Feature flag name
   * @returns {boolean}
   */
  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Get validation rule
   * @param {string} ruleName - Validation rule name
   * @returns {*} Validation rule value
   */
  getValidationRule(ruleName) {
    return this.get(`validations.${ruleName}`);
  }

  /**
   * Get UI configuration
   * @param {string} uiPath - UI configuration path
   * @returns {*} UI configuration value
   */
  getUI(uiPath) {
    return this.get(`ui.${uiPath}`);
  }

  /**
   * Get all configuration (read-only)
   * @returns {Object} Complete configuration object
   */
  getAll() {
    return JSON.parse(JSON.stringify(this.config)); // Deep clone for immutability
  }

  /**
   * Reload configuration (useful for testing)
   */
  reload() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }
}

// Export singleton instance
export default new AppConfig();