/**
 * ScreenManager - Optimized Screen Transition Manager
 * Handles welcome sequence with improved async/await pattern
 * Eliminates callback hell and provides better error handling
 */

/* Animation durations in milliseconds */
const DURATIONS = {
  WELCOME: 3000,    // How long to show welcome screen
  LOGO: 3000,       // How long to show logo screen  
  CATEGORY: 2000,   // How long to show category screen
  FADE: 1000        // Fade transition duration
};

const ScreenManager = {
  /**
   * Utility function to create delay promises
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Transition between screens with fade effect
   * @param {HTMLElement} fromScreen - Screen to hide
   * @param {HTMLElement} toScreen - Screen to show
   * @param {string} logMessage - Message to log
   */
  async transitionScreen(fromScreen, toScreen, logMessage) {
    console.log(logMessage);
    
    // Start fade out
    fromScreen.classList.add('fade-out');
    await this.delay(DURATIONS.FADE);
    
    // Switch screens
    fromScreen.style.display = 'none';
    toScreen.style.display = 'flex';
    toScreen.classList.add('fade-in');
  },

  /**
   * Validate that all required screen elements exist
   * @returns {Object} Object containing all screen elements or null if missing
   */
  validateScreenElements() {
    const elements = {
      welcomeScreen: document.querySelector('.welcome-screen'),
      logoScreen: document.querySelector('.logo-screen'),
      categoryTitleScreen: document.querySelector('.category-title-screen'),
      mainContentScreen: document.querySelector('.main-content-screen'),
      hamburgerBtn: document.getElementById('hamburger-btn')
    };

    // Check if all required elements exist
    const missingElements = Object.entries(elements)
      .filter(([key, element]) => key !== 'hamburgerBtn' && !element)
      .map(([key]) => key);

    if (missingElements.length > 0) {
      console.error('❌ Missing required screen elements:', missingElements);
      return null;
    }

    return elements;
  },

  /**
   * Load initial content with error handling
   */
  async loadInitialContent() {
    console.log('📋 Loading initial content...');
    
    try {
      const AppInit = window.AppInit;
      if (!AppInit || typeof AppInit.loadContent !== 'function') {
        throw new Error('AppInit not available or loadContent method missing');
      }

      // Small delay to ensure DOM is ready
      await this.delay(100);
      
      console.log('🎯 Calling AppInit.loadContent("cocteleria")');
      await AppInit.loadContent('cocteleria');
      console.log('✅ Welcome sequence completed successfully');
      
    } catch (error) {
      console.error('❌ Error loading content:', error);
      // Optionally show fallback content or error message
      this.showErrorFallback(error);
    }
  },

  /**
   * Show error fallback when content loading fails
   * @param {Error} error - The error that occurred
   */
  showErrorFallback(error) {
    const mainContent = document.querySelector('.main-content-screen');
    if (mainContent) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-fallback';
      errorDiv.innerHTML = `
        <h2>Error al cargar contenido</h2>
        <p>Por favor, recarga la página o contacta al soporte técnico.</p>
        <button onclick="location.reload()">Recargar página</button>
      `;
      mainContent.appendChild(errorDiv);
    }
  },

  /**
   * Start the welcome sequence with optimized async/await pattern
   */
  async startWelcomeSequence() {
    console.log('🎬 Starting welcome sequence...');
    
    try {
      // Validate all required elements
      const elements = this.validateScreenElements();
      if (!elements) return;

      const { welcomeScreen, logoScreen, categoryTitleScreen, mainContentScreen, hamburgerBtn } = elements;

      // Step 1: Show welcome screen
      console.log('👋 Showing welcome screen for', DURATIONS.WELCOME, 'ms');
      await this.delay(DURATIONS.WELCOME);

      // Step 2: Transition to logo screen
      await this.transitionScreen(
        welcomeScreen, 
        logoScreen, 
        '🔄 Transitioning from welcome to logo screen'
      );
      
      console.log('🏷️ Showing logo screen for', DURATIONS.LOGO, 'ms');
      await this.delay(DURATIONS.LOGO);

      // Step 3: Transition to category screen
      await this.transitionScreen(
        logoScreen, 
        categoryTitleScreen, 
        '🔄 Transitioning from logo to category screen'
      );
      
      console.log('📂 Showing category screen for', DURATIONS.CATEGORY, 'ms');
      await this.delay(DURATIONS.CATEGORY);

      // Step 4: Transition to main content
      await this.transitionScreen(
        categoryTitleScreen, 
        mainContentScreen, 
        '🔄 Transitioning to main content screen'
      );

      // Step 5: Show hamburger menu and load content
      if (hamburgerBtn) {
        hamburgerBtn.style.display = 'block';
        console.log('🍔 Hamburger menu displayed');
      }

      // Step 6: Load initial content
      await this.loadInitialContent();
      
    } catch (error) {
      console.error('❌ Error in welcome sequence:', error);
      this.showErrorFallback(error);
    }
  },

  /**
   * Skip welcome sequence and go directly to main content
   */
  skipToMainContent() {
    console.log('⏭️ Skipping welcome sequence...');
    
    const elements = this.validateScreenElements();
    if (!elements) return;

    const { welcomeScreen, logoScreen, categoryTitleScreen, mainContentScreen, hamburgerBtn } = elements;

    // Hide all intro screens
    [welcomeScreen, logoScreen, categoryTitleScreen].forEach(screen => {
      if (screen) screen.style.display = 'none';
    });

    // Show main content
    mainContentScreen.style.display = 'flex';
    mainContentScreen.classList.add('fade-in');

    // Show hamburger menu
    if (hamburgerBtn) {
      hamburgerBtn.style.display = 'block';
    }

    // Load content immediately
    this.loadInitialContent();
  }
};

export default ScreenManager;