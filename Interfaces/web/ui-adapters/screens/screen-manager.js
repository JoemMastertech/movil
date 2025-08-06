/**
 * ScreenManager - Optimized Screen Transition Manager
 * Handles welcome sequence with improved async/await pattern
 * Eliminates callback hell and provides better error handling
 */

<<<<<<< HEAD
import Logger from '../../../../Shared/utils/logger.js';

=======
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
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
<<<<<<< HEAD
    Logger.info(logMessage);
    
    // Start fade out
    if (fromScreen && fromScreen.classList) {
      fromScreen.classList.add('fade-out');
    }
    await this.delay(DURATIONS.FADE);
    
    // Switch screens
    if (fromScreen && fromScreen.classList) {
      fromScreen.classList.remove('screen-visible');
      fromScreen.classList.add('screen-hidden');
    }
    if (toScreen && toScreen.classList) {
      toScreen.classList.remove('screen-hidden');
      toScreen.classList.add('screen-visible');
      toScreen.classList.add('fade-in');
    }
=======
    console.log(logMessage);
    
    // Start fade out
    fromScreen.classList.add('fade-out');
    await this.delay(DURATIONS.FADE);
    
    // Switch screens
    fromScreen.style.display = 'none';
    toScreen.style.display = 'flex';
    toScreen.classList.add('fade-in');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
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
<<<<<<< HEAD
      Logger.error('Missing required screen elements:', missingElements);
=======
      console.error('❌ Missing required screen elements:', missingElements);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      return null;
    }

    return elements;
  },

  /**
   * Load initial content with error handling
   */
  async loadInitialContent() {
<<<<<<< HEAD
    Logger.info('Loading initial content...');
=======
    console.log('📋 Loading initial content...');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    
    try {
      const AppInit = window.AppInit;
      if (!AppInit || typeof AppInit.loadContent !== 'function') {
        throw new Error('AppInit not available or loadContent method missing');
      }

      // Small delay to ensure DOM is ready
      await this.delay(100);
      
<<<<<<< HEAD
      Logger.info('Calling AppInit.loadContent("cocteleria")');
      await AppInit.loadContent('cocteleria');
      Logger.info('Welcome sequence completed successfully');
      
    } catch (error) {
        Logger.error('Error loading content:', error);
        // Optionally show fallback content or error message
        this.showErrorFallback(error);
      }
=======
      console.log('🎯 Calling AppInit.loadContent("cocteleria")');
      await AppInit.loadContent('cocteleria');
      console.log('✅ Welcome sequence completed successfully');
      
    } catch (error) {
      console.error('❌ Error loading content:', error);
      // Optionally show fallback content or error message
      this.showErrorFallback(error);
    }
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
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
<<<<<<< HEAD
    Logger.info('Starting welcome sequence...');
=======
    console.log('🎬 Starting welcome sequence...');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    
    try {
      // Validate all required elements
      const elements = this.validateScreenElements();
      if (!elements) return;

      const { welcomeScreen, logoScreen, categoryTitleScreen, mainContentScreen, hamburgerBtn } = elements;

      // Step 1: Show welcome screen
<<<<<<< HEAD
      Logger.info('Showing welcome screen for', DURATIONS.WELCOME, 'ms');
=======
      console.log('👋 Showing welcome screen for', DURATIONS.WELCOME, 'ms');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      await this.delay(DURATIONS.WELCOME);

      // Step 2: Transition to logo screen
      await this.transitionScreen(
        welcomeScreen, 
        logoScreen, 
        '🔄 Transitioning from welcome to logo screen'
      );
      
<<<<<<< HEAD
      Logger.info('Showing logo screen for', DURATIONS.LOGO, 'ms');
=======
      console.log('🏷️ Showing logo screen for', DURATIONS.LOGO, 'ms');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      await this.delay(DURATIONS.LOGO);

      // Step 3: Transition to category screen
      await this.transitionScreen(
        logoScreen, 
        categoryTitleScreen, 
        '🔄 Transitioning from logo to category screen'
      );
      
<<<<<<< HEAD
      Logger.info('Showing category screen for', DURATIONS.CATEGORY, 'ms');
=======
      console.log('📂 Showing category screen for', DURATIONS.CATEGORY, 'ms');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      await this.delay(DURATIONS.CATEGORY);

      // Step 4: Transition to main content
      await this.transitionScreen(
        categoryTitleScreen, 
        mainContentScreen, 
        '🔄 Transitioning to main content screen'
      );

<<<<<<< HEAD
      // Show hamburger menu and load content
      if (hamburgerBtn) {
        hamburgerBtn.className = 'hamburger-btn hamburger-visible';
        Logger.info('Hamburger menu displayed');
=======
      // Step 5: Show hamburger menu and load content
      if (hamburgerBtn) {
        hamburgerBtn.style.display = 'block';
        console.log('🍔 Hamburger menu displayed');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      }

      // Step 6: Load initial content
      await this.loadInitialContent();
      
    } catch (error) {
<<<<<<< HEAD
      Logger.error('Error in welcome sequence:', error);
=======
      console.error('❌ Error in welcome sequence:', error);
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
      this.showErrorFallback(error);
    }
  },

  /**
   * Skip welcome sequence and go directly to main content
   */
  skipToMainContent() {
<<<<<<< HEAD
    Logger.info('Skipping welcome sequence...');
=======
    console.log('⏭️ Skipping welcome sequence...');
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    
    const elements = this.validateScreenElements();
    if (!elements) return;

    const { welcomeScreen, logoScreen, categoryTitleScreen, mainContentScreen, hamburgerBtn } = elements;

    // Hide all intro screens
    [welcomeScreen, logoScreen, categoryTitleScreen].forEach(screen => {
<<<<<<< HEAD
      if (screen && screen.classList) {
        screen.classList.remove('screen-visible');
        screen.classList.add('screen-hidden');
      }
    });

    // Show main content
    if (mainContentScreen && mainContentScreen.classList) {
      mainContentScreen.classList.remove('screen-hidden');
      mainContentScreen.classList.add('screen-visible');
      mainContentScreen.classList.add('fade-in');
    }

    // Show hamburger menu
    if (hamburgerBtn) {
      hamburgerBtn.className = 'hamburger-btn hamburger-visible';
=======
      if (screen) screen.style.display = 'none';
    });

    // Show main content
    mainContentScreen.style.display = 'flex';
    mainContentScreen.classList.add('fade-in');

    // Show hamburger menu
    if (hamburgerBtn) {
      hamburgerBtn.style.display = 'block';
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    }

    // Load content immediately
    this.loadInitialContent();
  }
};

export default ScreenManager;