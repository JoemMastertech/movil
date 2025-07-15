import ScreenManager from '../../Interfaces/web/ui-adapters/screens/screen-manager.js';
/**
 * Application Initialization Module - Enhanced Version
 * Integrates legacy initialization with new comprehensive system
 * 
 * @fileoverview Enhanced application initialization with Phase 3B improvements
 * @author Master Technology Bar Development Team
 * @version 2.0.0
 * @since 2024
 * 
 * @module AppInit
 * @requires ProductRenderer for UI rendering
 * @requires SafeModal for modal management
 * @requires DIContainer for dependency injection
 * @requires AppConfig for configuration management
 * @requires errorHandler for error handling
 * @requires domUtils for DOM manipulation
 * 
 * Features:
 * - Legacy application initialization
 * - Enhanced configuration management
 * - Performance optimization integration
 * - Error handling and recovery
 * - Progressive enhancement
 * - Module integration
 */

import ProductRenderer from '../../Interfaces/web/ui-adapters/components/product-table.js';
import SafeModal from '../../Interfaces/web/ui-adapters/components/SafeModal.js';
import DIContainer from '../core/DIContainer.js';
import ProductDataAdapter from '../../Infraestructura/adapters/ProductDataAdapter.js';
import AppConfig from '../core/AppConfig.js';
// Import shared utilities
import { setSafeInnerHTML } from '../utils/domUtils.js';
import { ErrorHandler, logError, logWarning } from '../utils/errorHandler.js';
import Logger from '../utils/logger.js';
import SimpleCache from '../utils/simpleCache.js';
import { DEBUG, UI, PERFORMANCE, CACHE_KEYS } from './constants.js';

/* initial view timing in milliseconds */
const INITIAL_DELAY = 100;

/* fade animation settings */
const FADE_CONFIG = {};

const AppInit = {
  // Enhanced initialization state
  isInitialized: false,
  initializationPromise: null,
  startTime: null,
  modules: new Map(),
  isRecovering: false,
  
  /**
   * Enhanced initialization method
   * Integrates with new AppConfig system while maintaining legacy functionality
   * 
   * @param {Object} [options={}] - Initialization options
   * @param {boolean} [options.enableEnhancedFeatures=true] - Enable Phase 3B features
   * @param {boolean} [options.skipLegacyInit=false] - Skip legacy initialization
   * @param {Object} [options.customConfig={}] - Custom configuration overrides
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      Logger.info('AppInit already initialized');
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performEnhancedInitialization(options);
    return this.initializationPromise;
  },

  /**
   * Performs enhanced initialization with Phase 3B features
   * 
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Success status
   */
  async performEnhancedInitialization(options) {
    try {
      this.startTime = performance.now();
      Logger.info('Starting Enhanced Master Technology Bar Application...');
      
      // Clear any stale cache on app start if needed
      if (options.clearCache) {
        SimpleCache.clear();
        Logger.debug('AppInit: Cache cleared on startup');
      }
      
      // Make AppInit globally available first
      window.AppInit = this;
      
      // Phase 1: Initialize enhanced configuration system
      if (options.enableEnhancedFeatures !== false) {
        await this.initializeEnhancedConfig(options.customConfig || {});
      }
      
      // Phase 2: Initialize core systems
      await this.initializeCoreSystem();
      
      // Phase 3: Initialize legacy systems (if not skipped)
      if (!options.skipLegacyInit) {
        await this.initializeLegacySystems();
      }
      
      // Phase 4: Initialize enhanced modules
      if (options.enableEnhancedFeatures !== false) {
        await this.initializeEnhancedModules();
      }
      
      // Phase 5: Start application
      await this.startApplication();
      
      this.isInitialized = true;
      this.logInitializationSuccess();
      
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'AppInit.enhancedInitialize');
      return this.handleInitializationError(error, options);
    }
  },

  /**
   * Initializes enhanced configuration system
   * 
   * @param {Object} customConfig - Custom configuration
   * @returns {Promise<void>}
   */
  async initializeEnhancedConfig(customConfig) {
    try {
      // AppConfig is already initialized in constructor
      // Just validate the configuration
      AppConfig.validateConfiguration();
      const configSuccess = true;
      
      console.log('⚙️ Enhanced configuration initialized');
      
      // Store reference for easy access
      this.modules.set('appConfig', AppConfig);
    } catch (error) {
      logWarning('Enhanced config initialization failed, using legacy config', error);
      // Fallback to legacy configuration
      this.initializeLegacyConfig();
    }
  },

  /**
   * Initializes core system components
   * 
   * @returns {Promise<void>}
   */
  async initializeCoreSystem() {
    // Initialize Dependency Injection Container
    this.setupDIContainer();
    
    // SafeModal auto-registers itself as 'safe-modal' when imported
    // No need to register it manually here
    
    console.log('🔧 Core systems initialized');
  },

  /**
   * Initializes legacy systems for backward compatibility
   * 
   * @returns {Promise<void>}
   */
  async initializeLegacySystems() {
    // Initialize legacy configuration if enhanced config failed
    if (!this.modules.has('appConfig')) {
      this.initializeLegacyConfig();
    }
    
    console.log('🔄 Legacy systems initialized');
  },

  /**
   * Initializes enhanced modules from Phase 3B
   * 
   * @returns {Promise<void>}
   */
  async initializeEnhancedModules() {
    try {
      // Enhanced modules initialization
      // Performance modules would be initialized here when available
      
      // Set up enhanced error handling
      this.setupEnhancedErrorHandling();
      
      // Set up performance monitoring
      if (AppConfig.get('performance.enableMonitoring')) {
        this.setupPerformanceMonitoring();
      }
      
      console.log('✨ Enhanced modules initialized');
    } catch (error) {
      logWarning('Some enhanced modules failed to initialize', error);
    }
  },

  /**
   * Starts the application with enhanced features
   * 
   * @returns {Promise<void>}
   */
  async startApplication() {
    // Enhance existing modals now that DOM is ready
    this.enhanceExistingModals();
    
    // Start the welcome sequence with enhanced timing
    const delay = AppConfig.get('ui.initialDelay') || INITIAL_DELAY;
    
    setTimeout(() => {
      this.startWelcomeSequence();
      this.initializeDrawerMenu();
      
      // Initialize enhanced UI features
      this.initializeEnhancedUI();
    }, delay);
    
    console.log('🎬 Application started');
  },

  /**
   * Initializes legacy configuration for backward compatibility
   */
  initializeLegacyConfig() {
    // Define appConfig - Global configuration for business rules and validations
    window.appConfig = {
      validations: {
        ageCheck: {
          enabled: false // Age verification completely disabled for legal compliance
        },
        stockEnabled: false // Stock validation disabled but ready for future implementation
      }
    };
    
    console.log('🔄 Legacy configuration initialized');
  },

  /**
   * Sets up enhanced error handling
   */
  setupEnhancedErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      logError('Global error in AppInit context', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      logError('Unhandled promise rejection in AppInit context', event.reason);
      event.preventDefault();
    });
  },

  /**
   * Sets up performance monitoring
   */
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task in AppInit: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        logWarning('Performance monitoring setup failed', error);
      }
    }
  },

  /**
   * Enhances existing modal elements with show/hide methods
   * Creates a global modal enhancement system that persists across DOM changes
   */
  enhanceExistingModals() {
    // Create a global modal enhancement function
    window.enhanceModalGlobally = function(modal) {
      if (!modal || !modal.id) {
        console.warn('enhanceModalGlobally: Invalid modal provided');
        return;
      }
      
      // Force add show method (always override)
      modal.show = function() {
        this.style.display = 'flex';
      };
      
      // Force add hide method (always override)
      modal.hide = function() {
        this.style.display = 'none';
      };
    };
    
    // Enhance all existing modals
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach((modal) => {
      window.enhanceModalGlobally(modal);
    });
    
    // Set up a MutationObserver to automatically enhance new modals
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is a modal
                if (node.classList && node.classList.contains('modal')) {
                  window.enhanceModalGlobally(node);
                }
                // Check for modals within the added node
                const modalsInNode = node.querySelectorAll && node.querySelectorAll('.modal');
                if (modalsInNode) {
                  modalsInNode.forEach(modal => {
                    window.enhanceModalGlobally(modal);
                  });
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  },

  /**
   * Initializes enhanced UI features
   */
  initializeEnhancedUI() {
    // Apply theme from configuration
    const theme = AppConfig.get('ui.theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Enable animations if configured
    if (AppConfig.get('ui.animations')) {
      document.documentElement.classList.add('animations-enabled');
    }
    
    // Add progressive enhancement classes
    document.documentElement.classList.add('js-enabled', 'enhanced-features');
    document.documentElement.classList.remove('no-js');
    
    console.log('🎨 Enhanced UI features initialized');
  },

  /**
   * Handles initialization errors with recovery
   * 
   * @param {Error} error - Initialization error
   * @param {Object} options - Original options
   * @returns {Promise<boolean>} Recovery success
   */
  async handleInitializationError(error, options) {
    logError('AppInit initialization failed, attempting recovery', error);
    
    // Prevent multiple recovery attempts
    if (this.isRecovering) {
      console.warn('Recovery already in progress, skipping duplicate attempt');
      return false;
    }
    
    this.isRecovering = true;
    
    try {
      // Try fallback initialization without enhanced features
      if (options.enableEnhancedFeatures !== false) {
        console.log('🔄 Attempting fallback initialization...');
        const result = await this.performEnhancedInitialization({
          ...options,
          enableEnhancedFeatures: false
        });
        this.isRecovering = false;
        return result;
      }
      
      // Last resort: basic legacy initialization
      console.log('🆘 Attempting basic legacy initialization...');
      this.basicLegacyInitialize();
      this.isRecovering = false;
      return true;
    } catch (fallbackError) {
      logError('All initialization attempts failed', fallbackError);
      this.isRecovering = false;
      return false;
    }
  },

  /**
   * Basic legacy initialization as last resort
   */
  basicLegacyInitialize() {
    // Make AppInit globally available
    window.AppInit = this;
    
    // Initialize basic DI container
    this.setupDIContainer();
    
    // Initialize legacy config
    this.initializeLegacyConfig();
    
    // SafeModal auto-registers itself as 'safe-modal' when imported
    // No manual registration needed
    
    // Start basic welcome sequence
    setTimeout(() => {
      try {
        this.startWelcomeSequence();
        this.initializeDrawerMenu();
      } catch (error) {
        logError('Basic initialization failed', error);
      }
    }, INITIAL_DELAY);
    
    this.isInitialized = true;
    Logger.info('Basic legacy initialization completed');
  },

  /**
   * Logs initialization success with statistics
   */
  logInitializationSuccess() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    Logger.info('Enhanced AppInit initialization completed successfully!', {
      totalTime: `${totalTime.toFixed(2)}ms`,
      modules: Array.from(this.modules.keys()).length
    });
    
    if (AppConfig.get && AppConfig.get('ui.debugMode')) {
       Logger.debug('Initialization modules', Array.from(this.modules.keys()));
       // Logger.debug('AppConfig stats', AppConfig.getStats()); // Method doesn't exist
      Logger.debug('SimpleCache stats', SimpleCache.getStats());
    }
    
    // Emit event to notify other components that initialization is complete
    const event = new CustomEvent('app-init-complete', {
      detail: {
        totalTime,
        modules: Array.from(this.modules.keys()),
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
    Logger.debug('app-init-complete event dispatched');
  },

  /**
   * Gets module instance
   * 
   * @param {string} moduleName - Module name
   * @returns {*} Module instance or null
   */
  getModule(moduleName) {
    return this.modules.get(moduleName) || null;
  },

  /**
   * Gets initialization statistics
   * 
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      initializationTime: this.startTime ? performance.now() - this.startTime : 0,
      modules: Array.from(this.modules.keys()),
      hasEnhancedConfig: this.modules.has('appConfig'),
      appConfigStats: this.modules.has('appConfig') ? 'Available' : null
    };
  },
  
  startWelcomeSequence: function() {
    ScreenManager.startWelcomeSequence();
  },
  
  initializeDrawerMenu: function() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawerMenu = document.getElementById('drawer-menu');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerContent = document.querySelector('.drawer-content');
    
    // Add logo at the top of the drawer
    const logoContainer = document.createElement('div');
    logoContainer.className = 'drawer-logo-container';
    const logoImage = document.createElement('img');
    logoImage.src = 'https://udtlqjmrtbcpdqknwuro.supabase.co/storage/v1/object/public/productos/recursos/logos/Logo5.webp';
    logoImage.alt = 'Master Technology Bar Logo';
    logoImage.className = 'drawer-logo';
    logoContainer.appendChild(logoImage);
    drawerContent.appendChild(logoContainer);
    
    // Define navigation items with their content types
    const navigationItems = [
      { label: 'Coctelería', target: 'cocteleria' },
      { label: 'Refrescos', target: 'refrescos' },
      { label: 'Licores', target: 'licores' },
      { label: 'Cervezas', target: 'cervezas' },
      { label: 'Pizzas', target: 'pizzas' },
      { label: 'Alitas', target: 'alitas' },
      { label: 'Sopas', target: 'sopas' },
      { label: 'Ensaladas', target: 'ensaladas' },
      { label: 'Carnes', target: 'carnes' },
      { label: 'Café', target: 'cafe' },
      { label: 'Postres', target: 'postres' },
      { label: 'Órdenes', action: 'orders' },
      { label: 'Crear orden', action: 'createOrder' }
    ];
    
    // Create menu items
    navigationItems.forEach(item => {
      const button = document.createElement('button');
      button.className = 'nav-button';
      button.textContent = item.label;
      
      if (item.target) {
        button.setAttribute('data-target', item.target);
      }
      
      if (item.action) {
        button.setAttribute('data-action', item.action);
      }
      
      drawerContent.appendChild(button);
    });
    
    // Add footer with registered trademark
    const footerContainer = document.createElement('div');
    footerContainer.className = 'drawer-footer';
    // Asignación segura: cadena estática sin riesgo XSS
    footerContainer.innerHTML = '® MasterTechnologyBar.com';
    drawerContent.appendChild(footerContainer);
    
    // Toggle drawer menu on hamburger button click
    hamburgerBtn.addEventListener('click', () => {
      drawerMenu.classList.toggle('open');
      drawerOverlay.classList.toggle('active');
    });
    
    // Close drawer when clicking overlay
    drawerOverlay.addEventListener('click', () => {
      drawerMenu.classList.remove('open');
      drawerOverlay.classList.remove('active');
    });
    
    // Menu item click handlers
    const menuButtons = drawerMenu.querySelectorAll('.nav-button');
    menuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-target');
        const action = button.getAttribute('data-action');
        
        // Clear active state from all buttons
        menuButtons.forEach(btn => btn.classList.remove('active'));
        
        // Set active state on clicked button
        button.classList.add('active');
        
        // Close the drawer
        drawerMenu.classList.remove('open');
        drawerOverlay.classList.remove('active');
        
        // Execute the appropriate action
        if (target) {
          this.loadContent(target);
        } else if (action === 'orders') {
          // Call the order system's show orders function
          const OrderSystem = window.OrderSystem;
          if (OrderSystem) {
            OrderSystem.showOrdersScreen();
          }
        } else if (action === 'createOrder') {
          // Call the order system's toggle order mode function
          const OrderSystem = window.OrderSystem;
          if (OrderSystem) {
            OrderSystem.toggleOrderMode();
          }
        }
      });
    });
    
    // Set first button as active by default
    const defaultButton = menuButtons[0];
    if (defaultButton) {
      defaultButton.classList.add('active');
    }
  },
  
  /**
   * Loads and renders content based on the specified category
   * Handles content switching with smooth transitions and proper state management
   * @param {string} contentType - The category of content to load (cocteleria, refrescos, etc.)
   */
  loadContent: function(contentType = 'cocteleria') {
    const contentContainer = document.getElementById('content-container');
    const pageTitle = document.querySelector('.page-header .page-title');
    const mainScreen = document.querySelector('.main-content-screen');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    
    if (!contentContainer || !mainScreen) {
      logError('Required DOM elements not found');
      return;
    }

    // Ensure contentType is valid - Fallback to default if invalid category provided
    contentType = this.validateContentType(contentType);
    
    // Update data-category attribute - Important for CSS styling and order system logic
    mainScreen.setAttribute('data-category', contentType);
    
    // No longer needed as title is integrated in tables
    if (pageTitle) {
      pageTitle.style.display = 'none';
    }

    contentContainer.style.opacity = 0;
    
    setTimeout(() => {
      // Asignación segura: limpieza con cadena vacía, sin riesgo XSS
      contentContainer.innerHTML = '';
      
      const success = this.initializeContent(contentType, contentContainer);
      
      if (success) {
        contentContainer.style.opacity = 1;
        
        // Position hamburger button based on NOMBRE column header
        setTimeout(() => {
          const nombreHeader = document.querySelector('[data-nombre-header="true"]');
          if (nombreHeader) {
            const rect = nombreHeader.getBoundingClientRect();
            hamburgerBtn.style.left = `${rect.left - 80}px`;
          }
        }, 100);
      }
    }, 50);
    
    // Update active state in drawer menu
    const drawerButtons = document.querySelectorAll('#drawer-menu .nav-button');
    drawerButtons.forEach(btn => {
      const btnTarget = btn.getAttribute('data-target');
      if (btnTarget === contentType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },
  
  validateContentType: function(contentType) {
    const validTypes = [
      'cocteleria', 'refrescos', 'licores', 'cervezas', 
      'pizzas', 'alitas', 'sopas', 'ensaladas', 
      'carnes', 'cafe', 'postres'
    ];
    
    return validTypes.includes(contentType) ? contentType : 'cocteleria';
  },
  
  getContentTypes: function() {
    return [
      'cocteleria', 'refrescos', 'licores', 'cervezas', 
      'pizzas', 'alitas', 'sopas', 'ensaladas', 
      'carnes', 'cafe', 'postres'
    ];
  },
  
  getCategoryTitle: function(contentType) {
    // Ensure contentType is not null/undefined
    if (!contentType) {
      return 'Coctelería';
    }
    
    // Map content type to display title
    const titles = {
      'cocteleria': 'Coctelería',
      'refrescos': 'Refrescos',
      'licores': 'Licores',
      'cervezas': 'Cervezas',
      'pizzas': 'Pizzas',
      'alitas': 'Alitas',
      'sopas': 'Sopas',
      'ensaladas': 'Ensaladas',
      'carnes': 'Carnes',
      'cafe': 'Café',
      'postres': 'Postres'
    };
    
    return titles[contentType] || contentType.charAt(0).toUpperCase() + contentType.slice(1);
  },

  initializeContent: function(contentType, container) {
    if (!container) return false;
    
    // Asignación segura: limpieza con cadena vacía, sin riesgo XSS
    container.innerHTML = '';
    
    try {
      switch(contentType) {
        case 'cocteleria':
          ProductRenderer.renderCocktails(container);
          break;
        case 'refrescos':
          ProductRenderer.renderRefrescos(container);
          break;
        case 'licores':
          ProductRenderer.renderLicores(container);
          break;
        case 'cervezas':
          ProductRenderer.renderCervezas(container);
          break;
        case 'pizzas':
          ProductRenderer.renderPizzas(container);
          break;
        case 'alitas':
          ProductRenderer.renderAlitas(container);
          break;
        case 'sopas':
          ProductRenderer.renderSopas(container);
          break;
        case 'ensaladas':
          ProductRenderer.renderEnsaladas(container);
          break;
        case 'carnes':
          ProductRenderer.renderCarnes(container);
          break;
        case 'cafe':
          ProductRenderer.renderCafe(container);
          break;
        case 'postres':
          ProductRenderer.renderPostres(container);
          break;
        default:
          logWarning(`Contenido no disponible para: ${contentType}`);
          setSafeInnerHTML(container, '<p>Contenido no disponible</p>');
          return false;
      }
      return true;
    } catch (err) {
      logError('Error loading content', err);
      setSafeInnerHTML(container, '<p>Error cargando contenido</p>');
      return false;
    }
  },

  /**
   * Setup Dependency Injection Container
   * Simplified version - using monolithic system instead of modular services
   */
  setupDIContainer: function() {
    // Create minimal DI container for ProductDataAdapter only
    window.container = new DIContainer();
    
    // Register ProductRepository as singleton (still used by some components)
    window.container.singleton('ProductRepository', () => {
      return new ProductDataAdapter();
    });

    console.log('DI Container initialized (simplified)');
  }
};

export default AppInit;