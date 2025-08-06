// ProductData is now accessed through DI Container
// Import shared utilities
// Global utilities are now available via window object
// getProductRepository, setSafeInnerHTML, logError, logWarning, Logger are available globally

const ProductRenderer = {
  // Current view mode: 'table' or 'grid'
  currentViewMode: 'table',
  
  // Phase 3: Event delegation system
  eventDelegationInitialized: false,
  boundDelegatedHandler: null,
  
  // Toggle between table and grid view
  toggleViewMode: function() {
    this.currentViewMode = this.currentViewMode === 'table' ? 'grid' : 'table';
    Logger.info('View mode toggled to:', this.currentViewMode);
    
    // Update toggle button text
    const toggleBtn = document.querySelector('.view-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = this.currentViewMode === 'table' ? '📋' : '🔲';
      toggleBtn.classList.toggle('active', this.currentViewMode === 'grid');
    }
    
    return this.currentViewMode;
  },
  
  // Phase 3: Initialize intelligent event delegation
  initEventDelegation: function() {
    if (this.eventDelegationInitialized) return;
    
    this.boundDelegatedHandler = this.handleDelegatedEvent.bind(this);
    document.addEventListener('click', this.boundDelegatedHandler);
    this.eventDelegationInitialized = true;
    
    Logger.info('Event delegation system initialized for ProductRenderer');
  },
  
  // Phase 3: Centralized event handler
  handleDelegatedEvent: function(e) {
    const target = e.target;
    
    // Handle view toggle buttons
    if (target.classList && target.classList.contains('view-toggle-btn')) {
      e.preventDefault();
      this.toggleViewMode();
      const container = target.closest('.content-wrapper') || document.querySelector('.content-wrapper');
      if (container) this.refreshCurrentView(container);
      return;
    }
    
    // Handle back buttons
    if (target.classList && target.classList.contains('back-button')) {
      e.preventDefault();
      const container = target.closest('.content-wrapper') || document.querySelector('.content-wrapper');
      if (container) this.renderLicores(container);
      return;
    }
    
    // Handle price buttons
    if (target.classList && target.classList.contains('price-button')) {
      e.preventDefault();
      this.handlePriceButtonClick(target, e);
      return;
    }
    
    // Handle video thumbnails
    if ((target.classList && target.classList.contains('video-thumb')) || (target.classList && target.classList.contains('video-thumbnail'))) {
      e.preventDefault();
      this.handleVideoClick(target);
      return;
    }
    
    // Handle product images
    if (target.classList && target.classList.contains('product-image')) {
      e.preventDefault();
      this.handleImageClick(target);
      return;
    }
    
    // Handle product cards (grid view)
    if (target.classList && target.classList.contains('product-card')) {
      e.preventDefault();
      this.handleCardClick(target, e);
      return;
    }
    
    // Handle category cards
    if ((target.classList && target.classList.contains('category-card')) || target.closest('.category-card')) {
      e.preventDefault();
      this.handleCategoryCardClick(target);
      return;
    }
    
    // Handle modal close buttons
    if (target.classList && target.classList.contains('modal-close-btn')) {
      e.preventDefault();
      this.handleModalClose(target);
      return;
    }
    
    // Handle modal backdrop clicks
    if ((target.classList && target.classList.contains('modal-backdrop')) || 
        (target.classList && target.classList.contains('video-modal-backdrop')) || 
        (target.classList && target.classList.contains('image-modal-backdrop'))) {
      this.handleModalBackdropClick(target, e);
      return;
    }
  },
  
  // Phase 3: Cleanup event delegation
  destroyEventDelegation: function() {
    if (this.boundDelegatedHandler) {
      document.removeEventListener('click', this.boundDelegatedHandler);
      this.boundDelegatedHandler = null;
      this.eventDelegationInitialized = false;
      Logger.info('Event delegation system destroyed');
    }
  },
  
  // Create view toggle button (optimized)
  createViewToggle: function(container) {
    // Initialize event delegation if not already done
    this.initEventDelegation();
    
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'view-toggle-container';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'view-toggle-btn';
    toggleBtn.textContent = this.currentViewMode === 'table' ? '🔲' : '📋';
    toggleBtn.classList.toggle('active', this.currentViewMode === 'grid');
    
    // No individual event listener needed - handled by delegation
    toggleContainer.appendChild(toggleBtn);
    return toggleContainer;
  },
  
  // Refresh current view with new mode
  refreshCurrentView: async function(container) {
    const viewData = this._extractViewData(container);
    if (!viewData) return;
    
    const backButtonHTML = this._preserveBackButton(container);
    const targetContainer = this._clearAndRestoreContainer(container, backButtonHTML);
    await this._renderCategoryView(targetContainer, viewData.category);
  },

  _extractViewData: function(container) {
    const existingTable = container.querySelector('table, .product-grid');
    if (!existingTable) return null;
    
    const category = existingTable.dataset.category;
    if (!category) return null;
    
    return { category };
  },

  _preserveBackButton: function(container) {
    const backButtonContainer = container.querySelector('.back-button-container');
    return backButtonContainer ? backButtonContainer.outerHTML : null;
  },

  _clearAndRestoreContainer: function(container, backButtonHTML) {
    // Get or create content container without destroying sidebar structure
    let targetContainer = document.getElementById('content-container');
    if (!targetContainer) {
      // Find the content-container-flex to maintain proper structure
      const flexContainer = document.querySelector('.content-container-flex');
      if (flexContainer) {
        targetContainer = document.createElement('div');
        targetContainer.id = 'content-container';
        // Insert before the sidebar to maintain proper order
        const existingSidebar = flexContainer.querySelector('#order-sidebar');
        if (existingSidebar) {
          flexContainer.insertBefore(targetContainer, existingSidebar);
        } else {
          flexContainer.appendChild(targetContainer);
        }
      } else {
        // Fallback: create in the provided container
        targetContainer = document.createElement('div');
        targetContainer.id = 'content-container';
        container.appendChild(targetContainer);
      }
    } else {
      // Clear only the content container, leaving sidebar untouched
      targetContainer.innerHTML = '';
    }
    
    if (backButtonHTML) {
      this._restoreBackButton(targetContainer, backButtonHTML);
    }
    
    return targetContainer;
  },

  _restoreBackButton: function(container, backButtonHTML) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = backButtonHTML;
    const restoredBackButton = tempDiv.firstChild;
    
    // No need to add individual event listener - handled by delegation
    container.appendChild(restoredBackButton);
  },
  
  // Phase 3: Specific event handlers
  handleCategoryCardClick: function(target) {
    const categoryCard = target.closest('.category-card') || target;
    const category = categoryCard.dataset.category;
    
    Logger.info(`🎯 Clic en categoría de licor: ${category}`);
    
    // Log current DOM state before navigation
    const currentMainScreen = document.getElementById('main-screen');
    const currentContentContainer = document.getElementById('content-container');
    const currentOrdersBox = document.getElementById('orders-box');
    
    Logger.debug('📊 Estado DOM antes de clic en categoría:', {
      category: category,
      mainScreen: !!currentMainScreen,
      contentContainer: !!currentContentContainer,
      ordersBox: !!currentOrdersBox,
      mainScreenVisible: currentMainScreen ? !currentMainScreen.classList.contains('hidden') : false,
      mainScreenClasses: currentMainScreen ? Array.from(currentMainScreen.classList) : []
    });
    
    if (category) {
      const container = categoryCard.closest('.content-wrapper') || document.querySelector('.content-wrapper');
      if (container) {
        Logger.debug(`📦 Container encontrado para categoría ${category}`);
        this.renderLicorSubcategory(container, category);
      } else {
        Logger.error(`❌ No se encontró container para categoría ${category}`);
      }
    } else {
      Logger.warn('⚠️ No se encontró categoría en el elemento clickeado');
    }
  },
  
  handleModalClose: function(target) {
    const modal = target.closest('.modal-backdrop');
    if (modal) {
      modal.remove();
    }
  },
  
  handleModalBackdropClick: function(target, event) {
    // Only close if clicking directly on the backdrop, not on modal content
    if (event.target === target) {
      target.remove();
    }
  },
  
  handlePriceButtonClick: function(target, event) {
    if (target.disabled || (target.classList && target.classList.contains('non-selectable'))) {
      return;
    }
    
    const row = target.closest('tr');
    const card = target.closest('.product-card');
    
    if (row) {
      // Table view handling
      const nameCell = row.querySelector('.product-name');
      const priceText = target.textContent;
      const productName = nameCell.textContent;
      
      if (window.OrderSystem && window.OrderSystem.handleProductSelection) {
        window.OrderSystem.handleProductSelection(productName, priceText, row, event);
      }
    } else if (card) {
      // Grid view handling
      const productName = target.dataset.productName;
      const priceText = target.textContent;
      
      Logger.debug('[GRID DEBUG] Price button clicked:', {
        productName,
        priceText,
        field: target.dataset.field,
        orderSystemExists: !!window.OrderSystem,
        isOrderMode: window.OrderSystem?.isOrderMode
      });
      
      if (window.OrderSystem && window.OrderSystem.handleProductSelection) {
        window.OrderSystem.handleProductSelection(productName, priceText, card, event);
      }
    }
  },
  
  handleVideoClick: function(target) {
    const videoUrl = target.dataset.videoUrl || target.src;
    const productName = target.alt?.replace('Ver video de ', '') || target.alt?.replace('Video de ', '') || 'Producto';
    const categoryElement = target.closest('table, .product-grid');
    const category = categoryElement?.dataset.category;
    
    const modalCategory = (category === 'cervezas' || category === 'refrescos') ? category : null;
    this.showVideoModal(videoUrl, productName, modalCategory);
  },
  
  handleImageClick: function(target) {
    const imageUrl = target.src;
    const productName = target.alt || 'Producto';
    const categoryElement = target.closest('table, .product-grid');
    const category = categoryElement?.dataset.category;
    
    const modalCategory = (category === 'cervezas' || category === 'refrescos') ? category : null;
    this.showImageModal(imageUrl, productName, modalCategory);
  },
  
  handleCardClick: function(target, event) {
    // Handle card clicks if needed for future functionality
    Logger.debug('Product card clicked:', target);
  },
  
  handleBackButton: function(target) {
    // Handle back button navigation based on context
    const wrapper = target.closest('.content-wrapper') || document.querySelector('.content-wrapper');
    
    if (wrapper) {
      // Check if we're in a liquor subcategory and need to go back to licores
      if (target.title === 'Volver a Licores' || target.dataset.action === 'back-to-licores') {
        Logger.info('🔄 Navegando de vuelta a Licores desde subcategoría');
        
        // Log current DOM state before manipulation
        const currentMainScreen = document.getElementById('main-screen');
        const currentContentContainer = document.getElementById('content-container');
        const currentOrdersBox = document.getElementById('orders-box');
        
        Logger.debug('📊 Estado DOM antes de volver a Licores:', {
          mainScreen: !!currentMainScreen,
          contentContainer: !!currentContentContainer,
          ordersBox: !!currentOrdersBox,
          mainScreenVisible: currentMainScreen ? !currentMainScreen.classList.contains('hidden') : false
        });
        
        // Get or create content container for rendering
        let container = wrapper.querySelector('#content-container');
        if (!container) {
          Logger.warn('⚠️ Content container no encontrado, creando uno nuevo');
          container = document.createElement('div');
          container.id = 'content-container';
          const flexContainer = wrapper.querySelector('.content-container-flex');
          if (flexContainer) {
            flexContainer.insertBefore(container, flexContainer.firstChild);
            Logger.debug('✅ Container insertado en flex container');
          } else {
            wrapper.appendChild(container);
            Logger.debug('✅ Container agregado al wrapper');
          }
        } else {
          Logger.debug('✅ Content container encontrado, limpiando contenido');
          // Clear only the content container, preserving sidebar
          container.innerHTML = '';
        }
        
        Logger.info('🍷 Renderizando vista de Licores');
        this.renderLicores(container);
        
        // Log DOM state after rendering
        setTimeout(() => {
          const afterMainScreen = document.getElementById('main-screen');
          const afterContentContainer = document.getElementById('content-container');
          const afterOrdersBox = document.getElementById('orders-box');
          
          Logger.debug('📊 Estado DOM después de renderizar Licores:', {
            mainScreen: !!afterMainScreen,
            contentContainer: !!afterContentContainer,
            ordersBox: !!afterOrdersBox,
            mainScreenVisible: afterMainScreen ? !afterMainScreen.classList.contains('hidden') : false
          });
        }, 100);
      } else {
        // Generic back navigation - could be extended for other contexts
        Logger.debug('Back button clicked - implement specific navigation logic');
      }
    }
  },

  _renderCategoryView: async function(container, category) {
    const categoryRenderers = this._getCategoryRenderers();
    const renderer = categoryRenderers[category];
    
    if (renderer) {
      await renderer(container);
    } else {
      Logger.warn('Unknown category for refresh:', category);
    }
  },

  _getCategoryRenderers: function() {
    return {
      'cocteleria': (container) => this.renderCocktails(container),
      'pizzas': (container) => this.renderPizzas(container),
      'alitas': (container) => this.renderAlitas(container),
      'sopas': (container) => this.renderSopas(container),
      'ensaladas': (container) => this.renderEnsaladas(container),
      'carnes': (container) => this.renderCarnes(container),
      'cafe': (container) => this.renderCafe(container),
      'postres': (container) => this.renderPostres(container),
      'refrescos': (container) => this.renderRefrescos(container),
      'cervezas': (container) => this.renderCervezas(container),
      'tequila': (container) => this.renderTequila(container),
      'whisky': (container) => this.renderWhisky(container),
      'ron': (container) => this.renderRon(container),
      'vodka': (container) => this.renderVodka(container),
      'ginebra': (container) => this.renderGinebra(container),
      'mezcal': (container) => this.renderMezcal(container),
      'cognac': (container) => this.renderCognac(container),
      'brandy': (container) => this.renderBrandy(container),
      'digestivos': (container) => this.renderDigestivos(container),
      'espumosos': (container) => this.renderEspumosos(container)
    };
  },

  createProductTable: function(container, headers, data, fields, tableClass, categoryTitle) {
    const table = this._createTableElement(tableClass, categoryTitle);
    const titleRow = this._createTitleRow(categoryTitle, headers.length);
    const tableHead = this._createTableHeader(headers, titleRow);
    const tbody = this._createTableBody(data, fields, categoryTitle);
    
    table.appendChild(tableHead);
    table.appendChild(tbody);
    container.appendChild(table);
  },

  _createTableElement: function(tableClass, categoryTitle) {
    const table = document.createElement('table');
    table.className = tableClass;
    
    const normalizedCategory = this._normalizeCategory(categoryTitle);
    table.dataset.category = normalizedCategory;
    table.dataset.productType = this._determineProductType(normalizedCategory, tableClass, categoryTitle);
    
    return table;
  },

  _normalizeCategory: function(categoryTitle) {
    return categoryTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },

  _determineProductType: function(normalizedCategory, tableClass, categoryTitle) {
    const foodCategories = ['pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes'];
    const beverageCategories = ['cocteleria', 'refrescos', 'cervezas', 'cafe', 'postres'];

    if (foodCategories.includes(normalizedCategory)) {
      return 'food';
    } else if (beverageCategories.includes(normalizedCategory)) {
      return 'beverage';
    } else if (tableClass === 'liquor-table' || normalizedCategory === 'licores') {
      return 'liquor';
    } else {
      logWarning(`Unknown product type for category: ${categoryTitle} (normalized: ${normalizedCategory})`);
      return 'unknown';
    }
  },

  _createTitleRow: function(categoryTitle, headerLength) {
    const titleRow = document.createElement('tr');
    titleRow.className = 'title-row';
    const titleCell = document.createElement('td');
    titleCell.colSpan = headerLength;
    const titleElement = document.createElement('h2');
    titleElement.className = 'page-title';
    titleElement.textContent = categoryTitle;
    titleCell.appendChild(titleElement);
    titleRow.appendChild(titleCell);
    return titleRow;
  },

  _createTableHeader: function(headers, titleRow) {
    const tableHead = document.createElement('thead');
    tableHead.appendChild(titleRow);
    
    const headerRow = document.createElement('tr');
    headerRow.setAttribute('data-nombre-column', 'true');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      if (header === 'NOMBRE') {
        th.setAttribute('data-nombre-header', 'true');
      }
      headerRow.appendChild(th);
    });
    
    tableHead.appendChild(headerRow);
    return tableHead;
  },

  _createTableBody: function(data, fields, categoryTitle) {
    const tbody = document.createElement('tbody');
    
    data.forEach(item => {
      const row = this._createTableRow(item, fields, categoryTitle);
      tbody.appendChild(row);
    });
    
    return tbody;
  },

  _createTableRow: function(item, fields, categoryTitle) {
    const row = document.createElement('tr');
    
    fields.forEach(field => {
      const td = this._createTableCell(item, field, categoryTitle);
      row.appendChild(td);
    });
    
    return row;
  },

  _createTableCell: function(item, field, categoryTitle) {
    const td = document.createElement('td');
    
    if (field === 'nombre') {
      this._createNameCell(td, item[field]);
    } else if (field === 'ingredientes') {
      this._createIngredientsCell(td, item[field]);
    } else if (this._isPriceField(field)) {
      this._createPriceCell(td, item, field);
    } else if (field === 'video') {
      this._createVideoCell(td, item, categoryTitle);
    } else if (field === 'imagen' || field === 'ruta_archivo') {
      this._createImageCell(td, item, field, categoryTitle);
    } else {
      td.textContent = item[field] || '';
    }
    
    return td;
  },

  _createNameCell: function(td, nombre) {
    td.className = 'product-name';
    td.textContent = nombre;
  },

  _createIngredientsCell: function(td, ingredientes) {
    td.className = 'product-ingredients';
    td.textContent = ingredientes || '';
  },

  _isPriceField: function(field) {
    return field.includes('precio') || field === 'precioBotella' || field === 'precioLitro' || field === 'precioCopa';
  },

  _createPriceCell: function(td, item, field) {
    td.className = 'product-price';
    const priceButton = document.createElement('button');
    
    const priceValue = item[field];
    if (!priceValue || priceValue === '--') {
      priceButton.textContent = '--';
      priceButton.className = 'price-button non-selectable';
      priceButton.disabled = true;
    } else {
      priceButton.className = 'price-button';
      priceButton.textContent = priceValue;
      priceButton.dataset.productName = item.nombre;
      priceButton.dataset.priceType = field;
    }
    
    td.appendChild(priceButton);
  },

  _createVideoCell: function(td, item, categoryTitle) {
    td.className = 'video-icon';
    if (item.video) {
      const thumbnailUrl = this.getThumbnailUrl(item.video, item.nombre, '');
      const thumbnailImg = document.createElement('img');
      thumbnailImg.className = 'video-thumb';
      thumbnailImg.src = thumbnailUrl;
      thumbnailImg.alt = `Ver video de ${item.nombre}`;
      thumbnailImg.dataset.videoUrl = item.video;
      // No individual event listener - handled by delegation
      td.appendChild(thumbnailImg);
    } else {
      td.textContent = '--';
    }
  },

  _createImageCell: function(td, item, field, categoryTitle) {
    td.className = 'image-icon';
    if (item[field]) {
      const img = document.createElement('img');
      img.src = item[field];
      img.alt = item.nombre;
      
      const liquorCategories = ['whisky', 'tequila', 'ron', 'vodka', 'ginebra', 'mezcal', 'cognac', 'brandy', 'digestivos', 'espumosos'];
      const isBeverage = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos');
      const isLiquorSubcategory = categoryTitle && liquorCategories.includes(categoryTitle.toLowerCase());
      
      img.className = 'product-image';
      if (isBeverage || isLiquorSubcategory) {
        img.classList.add('product-image-large');
      } else {
        img.classList.add('product-image-small');
      }
      // No individual event listener - handled by delegation
      td.appendChild(img);
    } else {
      td.textContent = '--';
    }
  },

  _getCategoryForModal: function(categoryTitle) {
    return categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
  },
  
  // Create product grid view
  createProductGrid: function(container, data, fields, categoryTitle) {
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    
    // Normalize categoryTitle for data-attribute
    const normalizedCategory = categoryTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    grid.dataset.category = normalizedCategory;
    
    // Determine productType based on category
    let productType;
    const foodCategories = ['pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes'];
    const beverageCategories = ['cocteleria', 'refrescos', 'cervezas', 'cafe', 'postres'];
    
    if (foodCategories.includes(normalizedCategory)) {
      productType = 'food';
    } else if (beverageCategories.includes(normalizedCategory)) {
      productType = 'beverage';
    } else {
      productType = 'unknown';
    }
    grid.dataset.productType = productType;
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.className = 'page-title';
    titleElement.textContent = categoryTitle;
    grid.appendChild(titleElement);
    
    // Create product cards
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      // Product name
      const nameElement = document.createElement('div');
      nameElement.className = 'product-name';
      nameElement.textContent = item.nombre;
      card.appendChild(nameElement);
      
      // Product ingredients (if available)
      if (item.ingredientes) {
        const ingredientsElement = document.createElement('div');
        ingredientsElement.className = 'product-ingredients';
        ingredientsElement.textContent = item.ingredientes;
        card.appendChild(ingredientsElement);
      }
      
      // Media container (video or image)
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'product-media';
      
      if (item.video) {
        const videoThumbnail = document.createElement('img');
        videoThumbnail.className = 'video-thumbnail';
        videoThumbnail.src = this.getThumbnailUrl(item.video);
        videoThumbnail.alt = `Video de ${item.nombre}`;
        videoThumbnail.dataset.videoUrl = item.video;
        // No individual event listener - handled by delegation
        mediaContainer.appendChild(videoThumbnail);
      } else if (item.imagen || item.ruta_archivo) {
        const image = document.createElement('img');
        image.className = 'product-image';
        image.src = item.imagen || item.ruta_archivo;
        image.alt = item.nombre;
        // No individual event listener - handled by delegation
        mediaContainer.appendChild(image);
      }
      
      card.appendChild(mediaContainer);
      
      // Prices container
      const pricesContainer = document.createElement('div');
      pricesContainer.className = 'product-prices';
      
      // Check if this is a liquor subcategory
      const liquorCategories = ['whisky', 'tequila', 'ron', 'vodka', 'ginebra', 'mezcal', 'cognac', 'brandy', 'digestivos', 'espumosos'];
      const isLiquorCategory = liquorCategories.includes(normalizedCategory);
      
      if (isLiquorCategory) {
        card.classList.add('liquor-card');
        card.dataset.productType = 'liquor';
        card.dataset.category = normalizedCategory;
      }
      
      // Price labels mapping for liquors
      const priceLabels = {
        'precioBotella': 'Botella',
        'precioLitro': 'Litro', 
        'precioCopa': 'Copa'
      };
      
      // Add price buttons based on available fields
      fields.forEach(field => {
        if (field.includes('precio') || field === 'precioBotella' || field === 'precioLitro' || field === 'precioCopa') {
          const priceValue = item[field];
          if (priceValue && priceValue !== '--') {
            if (isLiquorCategory && priceLabels[field]) {
              // Create price item container for liquors
              const priceItem = document.createElement('div');
              priceItem.className = 'price-item';
              
              // Create price label
              const priceLabel = document.createElement('span');
              priceLabel.className = 'price-label';
              priceLabel.textContent = priceLabels[field] + ':';
              priceItem.appendChild(priceLabel);
              
              // Create price button
              const priceButton = document.createElement('button');
              priceButton.className = 'price-button';
              priceButton.textContent = priceValue;
              priceButton.dataset.productName = item.nombre;
              priceButton.dataset.price = priceValue;
              priceButton.dataset.field = field;
              
              // No individual event listener - handled by delegation
              
              priceItem.appendChild(priceButton);
              pricesContainer.appendChild(priceItem);
            } else {
              // Regular price button for non-liquor categories
              const priceButton = document.createElement('button');
              priceButton.className = 'price-button';
              priceButton.textContent = priceValue;
              priceButton.dataset.productName = item.nombre;
              priceButton.dataset.price = priceValue;
              priceButton.dataset.field = field;
              
              // No individual event listener - handled by delegation
              
              pricesContainer.appendChild(priceButton);
            }
          }
        }
      });
      
      card.appendChild(pricesContainer);
      grid.appendChild(card);
    });
    
    container.appendChild(grid);
    
    // Apply intelligent text truncation after grid is rendered
    this.applyIntelligentTruncation(grid);
  },
  
  // Apply intelligent text truncation to product cards
  applyIntelligentTruncation: function(gridContainer) {
    // Wait for the DOM to be fully rendered
    setTimeout(() => {
      const productCards = gridContainer.querySelectorAll('.product-card');
      
      productCards.forEach(card => {
        // Skip product names - no truncation for titles
        const nameElement = card.querySelector('.product-name');
        if (nameElement) {
          // Remove any previous truncation attributes
          nameElement.removeAttribute('data-truncated');
          nameElement.classList.remove('height-auto', 'min-height-auto');
        }
        
        // Handle product ingredients only
        const ingredientsElement = card.querySelector('.product-ingredients');
        if (ingredientsElement) {
          this.handleTextOverflow(ingredientsElement, 3); // 3 lines for ingredients
        }
      });
    }, 50); // Small delay to ensure rendering is complete
  },
  
  // Handle text overflow for individual elements
  handleTextOverflow: function(element, maxLines) {
    if (!element || !element.textContent) return;
    
    const originalText = element.textContent.trim();
    if (!originalText) return;
    
    // Reset any previous modifications
    element.textContent = originalText;
    element.removeAttribute('data-truncated');
    element.classList.remove('height-auto', 'min-height-auto');
    
    // Force a reflow to get accurate measurements
    element.offsetHeight;
    
    // Get the computed dimensions after CSS has been applied
    const computedStyle = window.getComputedStyle(element);
    const elementHeight = parseFloat(computedStyle.height);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    
    // Check if content overflows the CSS-defined space
    // Add a small tolerance to account for rounding errors
    const tolerance = 2;
    const actualScrollHeight = element.scrollHeight;
    
    if (actualScrollHeight > (elementHeight + tolerance) && elementHeight > 0) {
      // Content overflows - apply JavaScript truncation as fallback
      let start = 0;
      let end = originalText.length;
      let bestFit = originalText;
      let iterations = 0;
      const maxIterations = 15;
      
      while (start <= end && iterations < maxIterations) {
        const mid = Math.floor((start + end) / 2);
        const testText = originalText.substring(0, mid) + '...';
        element.textContent = testText;
        
        // Force reflow for accurate measurement
        element.offsetHeight;
        
        if (element.scrollHeight <= (elementHeight + tolerance)) {
          bestFit = testText;
          start = mid + 1;
        } else {
          end = mid - 1;
        }
        iterations++;
      }
      
      element.textContent = bestFit;
      
      // Mark as truncated for CSS pseudo-element
      if (bestFit !== originalText) {
        element.setAttribute('data-truncated', 'true');
      }
    }
    
    // Let CSS handle all sizing - don't override heights
  },

  getThumbnailUrl: function(videoUrl, productName, category) {
    // Extract category from video URL
    let extractedCategory = '';
    if (videoUrl.includes('/cocteleria/')) {
      extractedCategory = 'cocteleria';
    } else if (videoUrl.includes('/pizzas/')) {
      extractedCategory = 'pizzas';
    } else if (videoUrl.includes('/alitas/')) {
      extractedCategory = 'alitas';
    } else if (videoUrl.includes('/ensaladas/')) {
      extractedCategory = 'ensaladas';
    } else if (videoUrl.includes('/sopas/')) {
      extractedCategory = 'sopas';
    } else if (videoUrl.includes('/carnes/')) {
      extractedCategory = 'carnes';
    } else if (videoUrl.includes('/cafe/')) {
      extractedCategory = 'cafes';
    } else if (videoUrl.includes('/postres/')) {
      extractedCategory = 'postres';
    }
    
    // Extract video filename without extension
    const videoFilename = videoUrl.split('/').pop().replace('.mp4', '');
    
    // Special cases mapping for incorrect thumbnail URLs
    const specialCases = {
      'bufanda-negra': 'bufanda',
      'cantarito-fresa': 'Cantarito fresa',
      'martini-bealys': 'martini-baileys',
      'mojito-frutos-rojos': 'mojito-frutos-rojo',
      'alitas- habanero': 'alitas-habanero',
      'cafe-express': 'cafe-expess',
      'ensalada-mixta-con-pollo-parrilla': 'ensalada-mixta-con-pollo'
    };
    
    // Use special case mapping if available, otherwise use the original filename
    const thumbnailFilename = specialCases[videoFilename] || videoFilename;
    
    // Construct thumbnail URL
    return `https://udtlqjmrtbcpdqknwuro.supabase.co/storage/v1/object/public/productos/imagenes/bebidas/mini-${extractedCategory}/${thumbnailFilename}.webp`;
  },

  showVideoModal: function(videoUrl, title, category = null) {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content image-modal video-modal';
    if (category) {
      modalContent.setAttribute('data-category', category);
    }
    
    // Add title
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);
    
    // Add video
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;
    
    // Add error handling for video loading
    video.addEventListener('error', (e) => {
      logWarning('Video loading error', e, { videoUrl });
      video.className = 'video-hidden';
      
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Video no disponible en este momento';
      errorMessage.className = 'error-message';
      modalContent.insertBefore(errorMessage, video.nextSibling);
    });
    
    video.addEventListener('loadstart', () => {
      Logger.info('Loading video:', videoUrl);
    });
    
    modalContent.appendChild(video);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.className = 'nav-button modal-close-btn';
    closeButton.dataset.modalId = 'video-modal';
    // No individual event listener - handled by delegation
    modalContent.appendChild(closeButton);
    
    // Add modal to body
    modalBackdrop.className += ' video-modal-backdrop';
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  },

  showImageModal: function(imageUrl, title, category = null) {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content image-modal';
    
    // Add title
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalContent.appendChild(modalTitle);
    
    // Add image with standardized size
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = title;
    modalContent.appendChild(image);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.className = 'nav-button modal-close-btn';
    closeButton.dataset.modalId = 'image-modal';
    // No individual event listener - handled by delegation
    modalContent.appendChild(closeButton);
    
    // Add modal to body
    modalBackdrop.className += ' image-modal-backdrop';
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  },

  renderLicores: async function(container) {
    // Ensure we're working with the correct content container, not destroying the sidebar
    let targetContainer = container;
    
    // If container is not the specific content-container, find or create it
    if (container.id !== 'content-container') {
      targetContainer = document.getElementById('content-container');
      if (!targetContainer) {
        // Create content-container within the flex structure
        const flexContainer = document.querySelector('.content-container-flex');
        if (flexContainer) {
          targetContainer = document.createElement('div');
          targetContainer.id = 'content-container';
          const existingSidebar = flexContainer.querySelector('#order-sidebar');
          if (existingSidebar) {
            flexContainer.insertBefore(targetContainer, existingSidebar);
          } else {
            flexContainer.appendChild(targetContainer);
          }
        } else {
          // Fallback: use the provided container but preserve sidebar
          const sidebar = document.getElementById('order-sidebar');
          const sidebarHTML = sidebar ? sidebar.outerHTML : null;
          targetContainer = container;
          if (sidebarHTML && !container.querySelector('#order-sidebar')) {
            container.insertAdjacentHTML('beforeend', sidebarHTML);
          }
        }
      }
    }
    
    const licoresHTML = `
      <div class="category-grid" data-product-type="liquor" data-category="licores">
        <h2 class="page-title">Licores</h2>
        ${this.createLicoresCategories()}
        <div class="subcategory-prompt">
          <h3>Elige una categoría</h3>
        </div>
      </div>
    `;
    
    // Contenido dinámico: HTML generado con datos internos de ProductData.licoresCategories
    // Aunque los datos son controlados, se usa sanitización como medida preventiva
    setSafeInnerHTML(targetContainer, licoresHTML);
    
    // No individual event listeners needed - handled by delegation
    // Category cards will be handled by the centralized event system
  },

  createLicoresCategories: function() {
    const productRepository = getProductRepository();
    const licoresCategories = productRepository.getLicoresCategories();
    
    const html = licoresCategories.map(category => `
      <div class="category-card" data-category="${category.nombre.toLowerCase()}">
        <img src="${category.icono}" alt="${category.nombre}" class="category-image">
        <h3 class="category-name">${category.nombre}</h3>
      </div>
    `).join('');
    
    return html;
  },

  renderLicorSubcategory: async function(container, category) {
    Logger.info(`🍾 Navegando hacia subcategoría de licores: ${category}`);
    
    // Log current DOM state before manipulation
    const currentMainScreen = document.getElementById('main-screen');
    const currentContentContainer = document.getElementById('content-container');
    const currentOrdersBox = document.getElementById('orders-box');
    
    Logger.debug('📊 Estado DOM antes de renderizar subcategoría:', {
      category: category,
      mainScreen: !!currentMainScreen,
      contentContainer: !!currentContentContainer,
      ordersBox: !!currentOrdersBox,
      mainScreenVisible: currentMainScreen ? !currentMainScreen.classList.contains('hidden') : false,
      mainScreenClasses: currentMainScreen ? Array.from(currentMainScreen.classList) : []
    });
    
    // Preserve the sidebar before clearing content
    // Look for sidebar in the correct location within the DOM structure
    const sidebar = document.getElementById('order-sidebar');
    let sidebarHTML = null;
    if (sidebar) {
      sidebarHTML = sidebar.outerHTML;
      Logger.debug('💾 Sidebar preservado para subcategoría');
    } else {
      Logger.warn('⚠️ No se encontró sidebar para preservar');
      Logger.debug('🔍 Buscando sidebar en DOM completo:', {
        sidebarInDocument: !!document.getElementById('order-sidebar'),
        contentContainerFlex: !!document.querySelector('.content-container-flex'),
        containerType: container.className || container.tagName
      });
    }
    
    // Get or create content container without destroying sidebar
    let targetContainer = document.getElementById('content-container');
    if (targetContainer) {
      // Simply clear the content container, leaving sidebar untouched
      targetContainer.innerHTML = '';
      Logger.debug('🧹 Content container limpiado, sidebar intacto');
    } else {
      Logger.warn('⚠️ No se encontró content-container, creando uno nuevo');
      // Find the content-container-flex to maintain proper structure
      const flexContainer = document.querySelector('.content-container-flex');
      if (flexContainer) {
        targetContainer = document.createElement('div');
        targetContainer.id = 'content-container';
        // Insert before the sidebar to maintain proper order
        const existingSidebar = flexContainer.querySelector('#order-sidebar');
        if (existingSidebar) {
          flexContainer.insertBefore(targetContainer, existingSidebar);
        } else {
          flexContainer.appendChild(targetContainer);
        }
        Logger.debug('🆕 Content container creado en estructura flex');
      } else {
        Logger.error('❌ No se encontró content-container-flex, estructura DOM comprometida');
        return;
      }
    }
    
    // Back button container for positioning below hamburger
    const backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'back-button-container';

    // Back button with icon
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    // Asignación segura: cadena estática (símbolo de flecha), sin riesgo XSS
    backButton.innerHTML = '←';
    backButton.title = 'Volver a Licores';
    
    // No individual event listener - handled by delegation
    
    backButtonContainer.appendChild(backButton);
    targetContainer.appendChild(backButtonContainer);

    // Update the title for all subcategory renderings
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Load specific subcategory
    switch(category) {
      case 'whisky':
        await this.renderWhisky(targetContainer, categoryTitle);
        break;
      case 'tequila':
        await this.renderTequila(targetContainer, categoryTitle);
        break;
      case 'ron':
        await this.renderRon(targetContainer, categoryTitle);
        break;
      case 'vodka':
        await this.renderVodka(targetContainer, categoryTitle);
        break;
      case 'brandy':
        await this.renderBrandy(targetContainer, categoryTitle);
        break;
      case 'ginebra':
        await this.renderGinebra(targetContainer, categoryTitle);
        break;
      case 'mezcal':
        await this.renderMezcal(targetContainer, categoryTitle);
        break;
      case 'cognac':
        await this.renderCognac(targetContainer, categoryTitle);
        break;
      case 'digestivos':
        await this.renderDigestivos(targetContainer, categoryTitle);
        break;
      case 'espumosos':
        await this.renderEspumosos(targetContainer, categoryTitle);
        break;
      default:
        // Asignación segura: cadena estática sin riesgo XSS
        targetContainer.innerHTML += '<p>Categoría no disponible</p>';
    }
    
    // Log DOM state after rendering subcategory
    setTimeout(() => {
      const afterMainScreen = document.getElementById('main-screen');
      const afterContentContainer = document.getElementById('content-container');
      const afterOrdersBox = document.getElementById('orders-box');
      
      Logger.debug('📊 Estado DOM después de renderizar subcategoría:', {
        category: category,
        mainScreen: !!afterMainScreen,
        contentContainer: !!afterContentContainer,
        ordersBox: !!afterOrdersBox,
        mainScreenVisible: afterMainScreen ? !afterMainScreen.classList.contains('hidden') : false,
        mainScreenClasses: afterMainScreen ? Array.from(afterMainScreen.classList) : []
      });
      
      Logger.info(`✅ Subcategoría ${category} renderizada completamente`);
    }, 100);
  },

  // Generic liquor renderer - eliminates code duplication
  renderLiquorCategory: async function(container, subcategory, title) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    const liquorFields = ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'];
    const liquorHeaders = ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA', 'PRECIO LITRO', 'PRECIO COPA'];
    
    try {
      const data = await productRepository.getLiquorSubcategory(subcategory);
      
      if (this.currentViewMode === 'grid') {
        this.createProductGrid(container, 
          data, 
          liquorFields,
          title
        );
      } else {
        this.createProductTable(container, 
          liquorHeaders, 
          data, 
          liquorFields,
          'liquor-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML += `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  // Optimized render methods using generic function
  renderWhisky: async function(container, title = 'Whisky') {
    await this.renderLiquorCategory(container, 'whisky', title);
  },

  renderTequila: async function(container, title = 'Tequila') {
    await this.renderLiquorCategory(container, 'tequila', title);
  },

  renderRon: async function(container, title = 'Ron') {
    await this.renderLiquorCategory(container, 'ron', title);
  },

  renderVodka: async function(container, title = 'Vodka') {
    await this.renderLiquorCategory(container, 'vodka', title);
  },

  renderGinebra: async function(container, title = 'Ginebra') {
    await this.renderLiquorCategory(container, 'ginebra', title);
  },

  renderMezcal: async function(container, title = 'Mezcal') {
    await this.renderLiquorCategory(container, 'mezcal', title);
  },

  renderCognac: async function(container, title = 'Cognac') {
    await this.renderLiquorCategory(container, 'cognac', title);
  },

  renderBrandy: async function(container, title = 'Brandy') {
    await this.renderLiquorCategory(container, 'brandy', title);
  },

  renderDigestivos: async function(container, title = 'Digestivos') {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    try {
      const data = await productRepository.getLiquorSubcategory('digestivos');
      
      if (this.currentViewMode === 'grid') {
        this.createProductGrid(container, 
          data, 
          ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
          title
        );
      } else {
        this.createProductTable(container, 
          ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA', 'PRECIO LITRO', 'PRECIO COPA'], 
          data, 
          ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
          'liquor-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML += `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  renderEspumosos: async function(container, title = 'Espumosos') {
    await this.renderLiquorCategory(container, 'espumosos', title);
  },

  renderCervezas: async function(container) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    try {
      const data = await productRepository.getCervezas();
      
      if (this.currentViewMode === 'grid') {
        this.createProductGrid(container, 
          data, 
          ['nombre', 'ruta_archivo', 'precio'],
          'Cervezas'
        );
      } else {
        this.createProductTable(container, 
          ['NOMBRE', 'IMAGEN', 'PRECIO'], 
          data, 
          ['nombre', 'ruta_archivo', 'precio'],
          'product-table',
          'Cervezas'
        );
      }
    } catch (error) {
      logError('Error rendering Cervezas:', error);
      // Preserve sidebar when showing error
      const targetContainer = container.id === 'content-container' ? container : document.getElementById('content-container') || container;
      targetContainer.innerHTML = '<p>Error cargando Cervezas. Por favor, intente de nuevo.</p>';
    }
  },

  renderPizzas: async function(container) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    try {
      const data = await productRepository.getPizzas();
      
      if (this.currentViewMode === 'grid') {
        this.createProductGrid(container, 
          data, 
          ['nombre', 'ingredientes', 'video', 'precio'],
          'Pizzas'
        );
      } else {
        this.createProductTable(container, 
          ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'], 
          data, 
          ['nombre', 'ingredientes', 'video', 'precio'],
          'product-table',
          'Pizzas'
        );
      }
    } catch (error) {
      logError('Error rendering Pizzas:', error);
      // Preserve sidebar when showing error
      const targetContainer = container.id === 'content-container' ? container : document.getElementById('content-container') || container;
      targetContainer.innerHTML = '<p>Error cargando Pizzas. Por favor, intente de nuevo.</p>';
    }
  },

  // Generic food/beverage renderer - eliminates code duplication
  renderFoodCategory: async function(container, methodName, title, fields = null, headers = null) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    // Default fields and headers for food items
    const defaultFields = ['nombre', 'ingredientes', 'video', 'precio'];
    const defaultHeaders = ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'];
    
    const finalFields = fields || defaultFields;
    const finalHeaders = headers || defaultHeaders;
    
    try {
      const data = await productRepository[methodName]();
      
      if (this.currentViewMode === 'grid') {
        this.createProductGrid(container, 
          data, 
          finalFields,
          title
        );
      } else {
        this.createProductTable(container, 
          finalHeaders, 
          data, 
          finalFields,
          'product-table',
          title
        );
      }
    } catch (error) {
      logError(`Error rendering ${title}:`, error);
      container.innerHTML = `<p>Error cargando ${title}. Por favor, intente de nuevo.</p>`;
    }
  },

  // Optimized render methods using generic function
  renderAlitas: async function(container) {
    await this.renderFoodCategory(container, 'getAlitas', 'Alitas');
  },

  renderSopas: async function(container) {
    await this.renderFoodCategory(container, 'getSopas', 'Sopas');
  },

  renderEnsaladas: async function(container) {
    await this.renderFoodCategory(container, 'getEnsaladas', 'Ensaladas');
  },

  renderCarnes: async function(container) {
    await this.renderFoodCategory(container, 'getCarnes', 'Carnes');
  },

  renderCafe: async function(container) {
    await this.renderFoodCategory(container, 'getCafe', 'Café');
  },

  renderPostres: async function(container) {
    await this.renderFoodCategory(container, 'getPostres', 'Postres');
  },

  renderRefrescos: async function(container) {
    await this.renderFoodCategory(container, 'getRefrescos', 'Refrescos', 
      ['nombre', 'ruta_archivo', 'precio'], 
      ['NOMBRE', 'IMAGEN', 'PRECIO']
    );
  },

  renderCocktails: async function(container) {
    await this.renderFoodCategory(container, 'getCocteles', 'Coctelería');
  },
};

// Make ProductRenderer globally available for legacy compatibility
window.ProductRenderer = ProductRenderer;

export default ProductRenderer;