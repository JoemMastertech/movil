// ProductData is now accessed through DI Container
// Import shared utilities
import { getProductRepository } from '../../../../Shared/utils/diUtils.js';
import { setSafeInnerHTML } from '../../../../Shared/utils/domUtils.js';
import { logError, logWarning } from '../../../../Shared/utils/errorHandler.js';
import { LiquorCategories } from './LiquorCategories.js';

const ProductRenderer = {
  // Current view mode: 'table' or 'grid'
  currentViewMode: 'table',
  
  // Toggle between table and grid view
  toggleViewMode: function() {
    this.currentViewMode = this.currentViewMode === 'table' ? 'grid' : 'table';
    console.log('🔄 View mode toggled to:', this.currentViewMode);
    
    // Update toggle button text
    const toggleBtn = document.querySelector('.view-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = this.currentViewMode === 'table' ? '📋' : '🔲';
      toggleBtn.classList.toggle('active', this.currentViewMode === 'grid');
    }
    
    return this.currentViewMode;
  },
  
  // Create view toggle button
  createViewToggle: function(container) {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'view-toggle-container';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'view-toggle-btn';
    toggleBtn.textContent = this.currentViewMode === 'table' ? '🔲' : '📋';
    toggleBtn.classList.toggle('active', this.currentViewMode === 'grid');
    
    toggleBtn.addEventListener('click', () => {
      this.toggleViewMode();
      // Re-render current content with new view mode
      this.refreshCurrentView(container);
    });
    
    toggleContainer.appendChild(toggleBtn);
    return toggleContainer;
  },
  
  // Refresh current view with new mode
  refreshCurrentView: function(container) {
    // Get current category from container or last rendered category
    const existingTable = container.querySelector('table, .product-grid');
    if (!existingTable) return;
    
    const category = existingTable.dataset.category;
    if (!category) return;
    
    // Check if we have a back button (liquor subcategory)
    const backButtonContainer = container.querySelector('.back-button-container');
    let backButtonHTML = null;
    if (backButtonContainer) {
      backButtonHTML = backButtonContainer.outerHTML;
    }
    
    // Clear container and re-render
    container.innerHTML = '';
    
    // Restore back button if it existed
    if (backButtonHTML) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = backButtonHTML;
      const restoredBackButton = tempDiv.firstChild;
      
      // Re-attach event listener
      const backButton = restoredBackButton.querySelector('.back-button');
      if (backButton) {
        backButton.addEventListener('click', () => {
          this.renderLicores(container);
        });
      }
      
      container.appendChild(restoredBackButton);
    }
    
    // Re-render based on category
    switch(category) {
      case 'cocteleria':
        this.renderCocktails(container);
        break;
      case 'pizzas':
        this.renderPizzas(container);
        break;
      case 'alitas':
        this.renderAlitas(container);
        break;
      case 'sopas':
        this.renderSopas(container);
        break;
      case 'ensaladas':
        this.renderEnsaladas(container);
        break;
      case 'carnes':
        this.renderCarnes(container);
        break;
      case 'cafe':
        this.renderCafe(container);
        break;
      case 'postres':
        this.renderPostres(container);
        break;
      case 'refrescos':
        this.renderRefrescos(container);
        break;
      case 'cervezas':
        this.renderCervezas(container);
        break;
      case 'tequila':
        this.renderTequila(container);
        break;
      case 'whisky':
        this.renderWhisky(container);
        break;
      case 'ron':
        this.renderRon(container);
        break;
      case 'vodka':
        this.renderVodka(container);
        break;
      case 'ginebra':
        this.renderGinebra(container);
        break;
      case 'mezcal':
        this.renderMezcal(container);
        break;
      case 'cognac':
        this.renderCognac(container);
        break;
      case 'brandy':
        this.renderBrandy(container);
        break;
      case 'digestivos':
        this.renderDigestivos(container);
        break;
      case 'espumosos':
        this.renderEspumosos(container);
        break;
      default:
        console.warn('Unknown category for refresh:', category);
    }
  },

  createProductTable: function(container, headers, data, fields, tableClass, categoryTitle) {
    const table = document.createElement('table');
    table.className = tableClass;
    table.style.width = tableClass === 'product-table' ? 'var(--table-width)' : 'var(--table-width)';
    table.style.maxWidth = tableClass === 'product-table' ? 'var(--table-max-width)' : 'var(--table-max-width)';

    // Normalize categoryTitle for data-attribute
    const normalizedCategory = categoryTitle
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    table.dataset.category = normalizedCategory;

    // Determine productType based on category or tableClass
    let productType;
    const foodCategories = ['pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes'];
    const beverageCategories = ['cocteleria', 'refrescos', 'cervezas', 'cafe', 'postres'];

    if (foodCategories.includes(normalizedCategory)) {
      productType = 'food';
    } else if (beverageCategories.includes(normalizedCategory)) {
      productType = 'beverage';
    } else if (tableClass === 'liquor-table' || normalizedCategory === 'licores') { 
      // normalizedCategory === 'licores' handles the main licores grid
      // liquor-table handles subcategories like whisky, ron, etc.
      productType = 'liquor';
    } else {
      productType = 'unknown'; 
      logWarning(`Unknown product type for category: ${categoryTitle} (normalized: ${normalizedCategory})`);
    }
    table.dataset.productType = productType;
    
    // Add title at the top of the table
    const titleRow = document.createElement('tr');
    titleRow.className = 'title-row';
    const titleCell = document.createElement('td');
    titleCell.colSpan = headers.length;
    const titleElement = document.createElement('h2');
    titleElement.className = 'page-title';
    titleElement.textContent = categoryTitle;
    titleCell.appendChild(titleElement);
    titleRow.appendChild(titleCell);
    
    const tableHead = document.createElement('thead');
    tableHead.appendChild(titleRow);
    
    // Create table header
    const headerRow = document.createElement('tr');
    
    // Set data attribute for NOMBRE column position
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
    table.appendChild(tableHead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    data.forEach(item => {
      const row = document.createElement('tr');
      
      fields.forEach(field => {
        const td = document.createElement('td');
        
        if (field === 'nombre') {
          td.className = 'product-name';
          td.textContent = item[field];
        } else if (field === 'ingredientes') {
          td.className = 'product-ingredients';
          td.textContent = item[field] || '';
        } else if (field.includes('precio') || field === 'precioBotella' || field === 'precioLitro' || field === 'precioCopa') {
          td.className = 'product-price';
          const priceButton = document.createElement('button');
          
          // Check if price is '--' or null/undefined
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
        } else if (field === 'video') {
          td.className = 'video-icon';
          if (item[field]) {
            // Get the thumbnail URL by mapping from the video URL
            const thumbnailUrl = this.getThumbnailUrl(item[field], item.nombre, fields[0] === 'nombre' ? item.nombre : '');
            
            // Create thumbnail image for the video
            const thumbnailImg = document.createElement('img');
            thumbnailImg.className = 'video-thumb';
            thumbnailImg.src = thumbnailUrl;
            thumbnailImg.alt = `Ver video de ${item.nombre}`;
            thumbnailImg.dataset.videoUrl = item[field];
            thumbnailImg.addEventListener('click', () => {
              const category = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
              this.showVideoModal(item[field], item.nombre, category);
            });
            
            td.appendChild(thumbnailImg);
          } else {
            td.textContent = '--';
          }
        } else if (field === 'imagen' || field === 'ruta_archivo') {
          td.className = 'image-icon';
          if (item[field]) {
            const img = document.createElement('img');
            img.src = item[field];
            img.alt = item.nombre;
            
            // Check if this is a beverage category (cervezas or refrescos) or liquor subcategory for larger images
            const liquorCategories = ['whisky', 'tequila', 'ron', 'vodka', 'ginebra', 'mezcal', 'cognac', 'brandy', 'digestivos', 'espumosos'];
            const isBeverage = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos');
            const isLiquorSubcategory = categoryTitle && liquorCategories.includes(categoryTitle.toLowerCase());
            const imageSize = (isBeverage || isLiquorSubcategory) ? '70px' : '40px'; // 75% total increase for beverages and liquor subcategories (40 * 1.75 = 70)
            
            img.style.width = imageSize;
            img.style.height = imageSize;
            img.style.objectFit = 'contain';
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
              const category = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
              this.showImageModal(item[field], item.nombre, category);
            });
            td.appendChild(img);
          } else {
            td.textContent = '--';
          }
        } else {
          td.textContent = item[field] || '';
        }
        
        row.appendChild(td);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
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
        videoThumbnail.addEventListener('click', () => {
          const category = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
          this.showVideoModal(item.video, item.nombre, category);
        });
        mediaContainer.appendChild(videoThumbnail);
      } else if (item.imagen || item.ruta_archivo) {
        const image = document.createElement('img');
        image.className = 'product-image';
        image.src = item.imagen || item.ruta_archivo;
        image.alt = item.nombre;
        image.addEventListener('click', () => {
          const category = categoryTitle && (categoryTitle.toLowerCase() === 'cervezas' || categoryTitle.toLowerCase() === 'refrescos') ? categoryTitle.toLowerCase() : null;
          this.showImageModal(item.imagen || item.ruta_archivo, item.nombre, category);
        });
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
              
              // Add click event for order system
              priceButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('[GRID DEBUG] Price button clicked:', {
                  productName: e.target.dataset.productName,
                  priceText: e.target.textContent,
                  field: e.target.dataset.field,
                  orderSystemExists: !!window.OrderSystem,
                  isOrderMode: window.OrderSystem?.isOrderMode,
                  handleProductSelectionExists: !!window.OrderSystem?.handleProductSelection
                });
                
                if (window.OrderSystem && window.OrderSystem.handleProductSelection) {
                  const productName = e.target.dataset.productName;
                  const priceText = e.target.textContent;
                  const productCard = e.target.closest('.product-card');
                  console.log('[GRID DEBUG] Calling handleProductSelection with:', {
                    productName,
                    priceText,
                    productCard,
                    hasDataset: !!productCard?.dataset
                  });
                  window.OrderSystem.handleProductSelection(productName, priceText, productCard, e);
                } else {
                  console.error('[GRID DEBUG] OrderSystem not available or handleProductSelection missing');
                }
              });
              
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
              
              // Add click event for order system
              priceButton.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('[GRID DEBUG] Price button clicked (non-liquor):', {
                  productName: e.target.dataset.productName,
                  priceText: e.target.textContent,
                  field: e.target.dataset.field,
                  orderSystemExists: !!window.OrderSystem,
                  isOrderMode: window.OrderSystem?.isOrderMode
                });
                
                if (window.OrderSystem && window.OrderSystem.handleProductSelection) {
                  const productName = e.target.dataset.productName;
                  const priceText = e.target.textContent;
                  const productCard = e.target.closest('.product-card');
                  console.log('[GRID DEBUG] Calling handleProductSelection (non-liquor) with:', {
                    productName,
                    priceText,
                    productCard
                  });
                  window.OrderSystem.handleProductSelection(productName, priceText, productCard, e);
                } else {
                  console.error('[GRID DEBUG] OrderSystem not available for non-liquor product');
                }
              });
              
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
          nameElement.style.removeProperty('height');
          nameElement.style.removeProperty('min-height');
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
    element.style.removeProperty('height');
    element.style.removeProperty('min-height');
    
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
    modalBackdrop.style.position = 'fixed';
    modalBackdrop.style.top = '0';
    modalBackdrop.style.left = '0';
    modalBackdrop.style.width = '100%';
    modalBackdrop.style.height = '100%';
    modalBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalBackdrop.style.display = 'flex';
    modalBackdrop.style.justifyContent = 'center';
    modalBackdrop.style.alignItems = 'center';
    modalBackdrop.style.zIndex = '9999';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content image-modal';
    if (category) {
      modalContent.setAttribute('data-category', category);
    }
    modalContent.style.position = 'relative';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.padding = '20px';
    modalContent.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 0 20px var(--primary-light)';
    
    // Add title
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = title;
    modalTitle.style.color = 'var(--primary-color)';
    modalTitle.style.marginBottom = '15px';
    modalTitle.style.textAlign = 'center';
    modalContent.appendChild(modalTitle);
    
    // Add video
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.borderRadius = '5px';
    
    // Add error handling for video loading
    video.addEventListener('error', (e) => {
      logWarning('Video loading error', e, { videoUrl });
      video.style.display = 'none';
      
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Video no disponible en este momento';
      errorMessage.style.color = 'var(--text-color)';
      errorMessage.style.textAlign = 'center';
      errorMessage.style.padding = '20px';
      modalContent.insertBefore(errorMessage, video.nextSibling);
    });
    
    video.addEventListener('loadstart', () => {
      console.log('Loading video:', videoUrl);
    });
    
    modalContent.appendChild(video);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.className = 'nav-button';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '8px 15px';
    closeButton.style.display = 'block';
    closeButton.style.margin = '15px auto 0';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modalBackdrop);
    });
    modalContent.appendChild(closeButton);
    
    // Add modal to body
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
    
    // Close modal on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        document.body.removeChild(modalBackdrop);
      }
    });
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
    image.style.maxWidth = '100%';
    image.style.maxHeight = '60vh';
    image.style.objectFit = 'contain';
    image.style.margin = '15px 0';
    image.style.borderRadius = '10px';
    image.style.boxShadow = '0 0 20px var(--price-color)';
    modalContent.appendChild(image);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.className = 'nav-button';
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '8px 15px';
    closeButton.style.display = 'block';
    closeButton.style.margin = '15px auto 0';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modalBackdrop);
    });
    modalContent.appendChild(closeButton);
    
    // Add modal to body
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
    
    // Close modal on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        document.body.removeChild(modalBackdrop);
      }
    });
  },

  renderLicores: function(container) {
    const licoresHTML = `
      <div class="category-grid" data-product-type="liquor" data-category="licores">
        <h2 class="page-title">Licores</h2>
        ${LiquorCategories.createLicoresCategories()}
        <div class="subcategory-prompt">
          <h3>Elige una categoría</h3>
        </div>
      </div>
    `;
    
    // Contenido dinámico: HTML generado con datos internos de ProductData.licoresCategories
    // Aunque los datos son controlados, se usa sanitización como medida preventiva
    setSafeInnerHTML(container, licoresHTML);
    
    // Add click handlers for licores categories
    const categoryCards = container.querySelectorAll('.category-card');
    
    categoryCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const category = card.getAttribute('data-category');
        this.renderLicorSubcategory(container, category);
      });
    });
  },

  // createLicoresCategories moved to LiquorCategories.js

  renderLicorSubcategory: function(container, category) {
    // Asignación segura: limpieza con cadena vacía, sin riesgo XSS
    container.innerHTML = '';
    
    // Back button container for positioning below hamburger
    const backButtonContainer = document.createElement('div');
    backButtonContainer.className = 'back-button-container';

    // Back button with icon
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    // Asignación segura: cadena estática (símbolo de flecha), sin riesgo XSS
    backButton.innerHTML = '←';
    backButton.title = 'Volver a Licores';
    
    backButton.addEventListener('click', () => {
      this.renderLicores(container);
    });
    
    backButtonContainer.appendChild(backButton);
    container.appendChild(backButtonContainer);

    // Update the title for all subcategory renderings
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
    
    // Load specific subcategory
    switch(category) {
      case 'whisky':
        this.renderWhisky(container, categoryTitle);
        break;
      case 'tequila':
        this.renderTequila(container, categoryTitle);
        break;
      case 'ron':
        this.renderRon(container, categoryTitle);
        break;
      case 'vodka':
        this.renderVodka(container, categoryTitle);
        break;
      case 'brandy':
        this.renderBrandy(container, categoryTitle);
        break;
      case 'ginebra':
        this.renderGinebra(container, categoryTitle);
        break;
      case 'mezcal':
        this.renderMezcal(container, categoryTitle);
        break;
      case 'cognac':
        this.renderCognac(container, categoryTitle);
        break;
      case 'digestivos':
        this.renderDigestivos(container, categoryTitle);
        break;
      case 'espumosos':
        this.renderEspumosos(container, categoryTitle);
        break;
      default:
        // Asignación segura: cadena estática sin riesgo XSS
        container.innerHTML += '<p>Categoría no disponible</p>';
    }
  },

  // Generic liquor renderer - eliminates code duplication
  renderLiquorCategory: function(container, subcategory, title) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    const liquorFields = ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'];
    const liquorHeaders = ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA', 'PRECIO LITRO', 'PRECIO COPA'];
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository.getLiquorSubcategory(subcategory), 
        liquorFields,
        title
      );
    } else {
      this.createProductTable(container, 
        liquorHeaders, 
        productRepository.getLiquorSubcategory(subcategory), 
        liquorFields,
        'liquor-table',
        title
      );
    }
  },

  // Optimized render methods using generic function
  renderWhisky: function(container, title = 'Whisky') {
    this.renderLiquorCategory(container, 'whiskies', title);
  },

  renderTequila: function(container, title = 'Tequila') {
    this.renderLiquorCategory(container, 'tequilas', title);
  },

  renderRon: function(container, title = 'Ron') {
    this.renderLiquorCategory(container, 'rones', title);
  },

  renderVodka: function(container, title = 'Vodka') {
    this.renderLiquorCategory(container, 'vodkas', title);
  },

  renderGinebra: function(container, title = 'Ginebra') {
    this.renderLiquorCategory(container, 'ginebras', title);
  },

  renderMezcal: function(container, title = 'Mezcal') {
    this.renderLiquorCategory(container, 'mezcales', title);
  },

  renderCognac: function(container, title = 'Cognac') {
    this.renderLiquorCategory(container, 'cognacs', title);
  },

  renderBrandy: function(container, title = 'Brandy') {
    this.renderLiquorCategory(container, 'brandies', title);
  },

  renderDigestivos: function(container, title = 'Digestivos') {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository.getLiquorSubcategory('digestivos'), 
        ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
        title
      );
    } else {
      this.createProductTable(container, 
        ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA', 'PRECIO LITRO', 'PRECIO COPA'], 
        productRepository.getLiquorSubcategory('digestivos'), 
        ['nombre', 'imagen', 'precioBotella', 'precioLitro', 'precioCopa'],
        'liquor-table',
        title
      );
    }
  },

  renderEspumosos: function(container, title = 'Espumosos') {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository.getLiquorSubcategory('espumosos'), 
        ['nombre', 'imagen', 'precioBotella'],
        title
      );
    } else {
      this.createProductTable(container, 
        ['NOMBRE', 'IMAGEN', 'PRECIO BOTELLA'], 
        productRepository.getLiquorSubcategory('espumosos'), 
        ['nombre', 'imagen', 'precioBotella'],
        'liquor-table',
        title
      );
    }
  },

  renderCervezas: function(container) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository.getCervezas(), 
        ['nombre', 'ruta_archivo', 'precio'],
        'Cervezas'
      );
    } else {
      this.createProductTable(container, 
        ['NOMBRE', 'IMAGEN', 'PRECIO'], 
        productRepository.getCervezas(), 
        ['nombre', 'ruta_archivo', 'precio'],
        'product-table',
        'Cervezas'
      );
    }
  },

  renderPizzas: function(container) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository.getPizzas(), 
        ['nombre', 'ingredientes', 'video', 'precio'],
        'Pizzas'
      );
    } else {
      this.createProductTable(container, 
        ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'], 
        productRepository.getPizzas(), 
        ['nombre', 'ingredientes', 'video', 'precio'],
        'product-table',
        'Pizzas'
      );
    }
  },

  // Generic food/beverage renderer - eliminates code duplication
  renderFoodCategory: function(container, methodName, title, fields = null, headers = null) {
    const productRepository = getProductRepository();
    
    // Add view toggle button
    const toggleElement = this.createViewToggle(container);
    container.appendChild(toggleElement);
    
    // Default fields and headers for food items
    const defaultFields = ['nombre', 'ingredientes', 'video', 'precio'];
    const defaultHeaders = ['NOMBRE', 'INGREDIENTES', 'VIDEO', 'PRECIO'];
    
    const finalFields = fields || defaultFields;
    const finalHeaders = headers || defaultHeaders;
    
    if (this.currentViewMode === 'grid') {
      this.createProductGrid(container, 
        productRepository[methodName](), 
        finalFields,
        title
      );
    } else {
      this.createProductTable(container, 
        finalHeaders, 
        productRepository[methodName](), 
        finalFields,
        'product-table',
        title
      );
    }
  },

  // Optimized render methods using generic function
  renderAlitas: function(container) {
    this.renderFoodCategory(container, 'getAlitas', 'Alitas');
  },

  renderSopas: function(container) {
    this.renderFoodCategory(container, 'getSopas', 'Sopas');
  },

  renderEnsaladas: function(container) {
    this.renderFoodCategory(container, 'getEnsaladas', 'Ensaladas');
  },

  renderCarnes: function(container) {
    this.renderFoodCategory(container, 'getCarnes', 'Carnes');
  },

  renderCafe: function(container) {
    this.renderFoodCategory(container, 'getCafe', 'Café');
  },

  renderPostres: function(container) {
    this.renderFoodCategory(container, 'getPostres', 'Postres');
  },

  renderRefrescos: function(container) {
    this.renderFoodCategory(container, 'getRefrescos', 'Refrescos', 
      ['nombre', 'ruta_archivo', 'precio'], 
      ['NOMBRE', 'IMAGEN', 'PRECIO']
    );
  },

  renderCocktails: function(container) {
    this.renderFoodCategory(container, 'getCocteles', 'Coctelería');
  },
};

export default ProductRenderer;