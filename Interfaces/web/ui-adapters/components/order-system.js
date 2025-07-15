import OrderSystemCore from '../../../../Aplicacion/services/OrderCore.js';
import { getProductRepository } from '../../../../Shared/utils/diUtils.js';
import { setSafeInnerHTML, showModal, hideModal } from '../../../../Shared/utils/domUtils.js';
import { ErrorHandler, logError, logWarning, handleMissingElementError } from '../../../../Shared/utils/errorHandler.js';
import { calculateTotalDrinkCount, calculateTotalJuiceCount, calculateTotalJagerDrinkCount, isJuiceOption } from '../../../../Shared/utils/calculationUtils.js';

// Constants
const CONSTANTS = {
  MAX_DRINK_COUNT: 5,
  MAX_JUICE_COUNT: 2,
  SPECIAL_PRODUCTS: {
    NO_MODAL: ['HIPNOTIQ', 'BAILEYS'],
    JAGER: 'JAGERMEISTER',
    SPECIAL_RON: ['BACARDI MANGO', 'BACARDI RASPBERRY', 'MALIBU']
  },
  CATEGORIES: {
    FOOD: ['pizzas', 'alitas', 'sopas', 'ensaladas'],
    MEAT: 'carnes',
    DIGESTIVOS: 'digestivos',
    ESPUMOSOS: 'espumosos'
  },
  PRICE_TYPES: {
    BOTTLE: 'precioBotella',
    LITER: 'precioLitro',
    CUP: 'precioCopa'
  },
  SELECTORS: {
    ORDER_BTN: 'complete-order-btn',
    CANCEL_BTN: 'cancel-order-btn',
    SIDEBAR: 'order-sidebar',
    TABLES: '.product-table, .liquor-table, .product-grid'
  },
  MESSAGES: {
    SPECIAL: "Puedes elegir: 2 Jarras de jugo ó 5 Refrescos ó 1 Jarra de jugo y 2 Refrescos",
    ONLY_SODAS: "Puedes elegir hasta 5 refrescos",
    DEFAULT: "Puedes elegir hasta 5 acompañamientos",
    NO_REFRESCOS: "Este producto no incluye refrescos"
  },
  PRODUCT_OPTIONS: {
    RON: ['Mineral', 'Coca', 'Manzana'],
    TEQUILA: ['Mineral', 'Toronja', 'Botella de Agua', 'Coca'],
    BRANDY: ['Mineral', 'Coca', 'Manzana'],
    WHISKY: ['Mineral', 'Manzana', 'Ginger ale', 'Botella de Agua'],
    VODKA: ['Jugo de Piña', 'Jugo de Uva', 'Jugo de Naranja', 'Jugo de Arándano', 'Jugo de Mango', 'Jugo de Durazno', 'Mineral', 'Quina'],
    GINEBRA: ['Jugo de Piña', 'Jugo de Uva', 'Jugo de Naranja', 'Jugo de Arándano', 'Jugo de Mango', 'Jugo de Durazno', 'Mineral', 'Quina'],
    MEZCAL: ['Mineral', 'Toronja'],
    COGNAC: ['Mineral', 'Coca', 'Manzana', 'Botella de Agua'],
    DEFAULT: ['Mineral', 'Agua', 'Coca', 'Manzana']
  }
};
class OrderSystem {
  constructor(productRepository = null) {
    this.productRepository = productRepository;
    this.isInitialized = false;
    this.core = null;
    this.currentProduct = null;
    this.currentCategory = null;
    this.isOrderMode = false;
    this.selectedDrinks = [];
    this.drinkCounts = {};
    this.maxDrinkCount = CONSTANTS.MAX_DRINK_COUNT;
    this.bottleCategory = null;
    this.selectedCookingTerm = null;
    this.previousCategory = null;
    this.previousTitle = null;
    this.isShowingHistory = false;
  }

  _showModal(modalId) { showModal(modalId); }
  _hideModal(modalId) { hideModal(modalId); }

  _ensureProductRepository() {
    if (!this.productRepository) {
      try {
        this.productRepository = getProductRepository();
        this.isInitialized = true;
      } catch (error) {
        logError('Failed to initialize product repository', error);
        throw error;
      }
    }
  }

  initialize() {
    window.OrderSystem = this;
    this.core = new OrderSystemCore();
    
    try {
      this._ensureProductRepository();
    } catch (error) {
      logWarning('Product repository not available yet, will initialize on first use', error);
    }
    
    document.getElementById(CONSTANTS.SELECTORS.ORDER_BTN).addEventListener('click', () => this.completeOrder());
    document.getElementById(CONSTANTS.SELECTORS.CANCEL_BTN).addEventListener('click', () => this.toggleOrderMode());
    
    document.addEventListener('click', (e) => {
      if (!this.isOrderMode) return;
      
      if (e.target.classList.contains('price-button')) {
        if (e.target.disabled || e.target.classList.contains('non-selectable')) {
          return;
        }

        const row = e.target.closest('tr');
        const nameCell = row.querySelector('.product-name');
        const priceText = e.target.textContent;
        const productName = nameCell.textContent;

        this.handleProductSelection(productName, priceText, row, e);
      }
    });
  }

  extractPrice(priceText) {
    if (!priceText || typeof priceText !== 'string') {
      logWarning('Invalid priceText provided to extractPrice', { priceText });
      return 0;
    }
    const numericString = priceText.replace(/[^\d.]/g, '');
    const price = parseFloat(numericString);
    return isNaN(price) ? 0 : price;
  }

  getProductMetadata(row) {
    if (row?.dataset?.productType) {
      return {
        type: (row.dataset.productType || 'unknown').toLowerCase(),
        category: (row.dataset.category || 'unknown').toLowerCase()
      };
    }
    
    const tableElement = row.closest('table, .category-grid, .product-grid');
    if (!tableElement) {
      logError("Could not find parent table/grid for row", null, { row });
      return { type: 'unknown', category: 'unknown' };
    }

    return {
      type: (tableElement.dataset.productType || 'unknown').toLowerCase(),
      category: (tableElement.dataset.category || 'unknown').toLowerCase()
    };
  }

  toggleOrderMode(skipClear = false) {
    const elements = {
      sidebar: document.getElementById(CONSTANTS.SELECTORS.SIDEBAR),
      tables: document.querySelectorAll(CONSTANTS.SELECTORS.TABLES),
      wrapper: document.querySelector('.content-wrapper'),
      orderBtn: document.querySelector('[data-action="createOrder"]')
    };
    
    this.isOrderMode = !this.isOrderMode;
    const isActive = this.isOrderMode;
    
    if (elements.orderBtn) elements.orderBtn.textContent = isActive ? 'CANCELAR ORDEN' : 'CREAR ORDEN';
    elements.sidebar.style.display = isActive ? 'block' : 'none';
    elements.tables.forEach(table => table.classList.toggle('price-selection-mode', isActive));
    elements.wrapper.classList.toggle('order-active', isActive);
    
    if (!isActive && !skipClear) {
      this.core.clearItems();
      this.updateOrderDisplay();
    }
  }

  handleProductSelection(productName, priceText, row, event) {
    if (!this.isOrderMode || event.target.disabled || event.target.classList.contains('non-selectable')) return;
    
    this._resetSelectionState();
    
    const price = this.extractPrice(priceText);
    const metadata = this.getProductMetadata(row);
    const clickedPriceType = this.getPriceType(row, event.target);

    this.currentProduct = { name: productName, price, priceType: clickedPriceType };
    this.currentCategory = metadata.category;

    const handlers = {
      beverage: () => this.addProductToOrder({ name: productName, price, customizations: [] }),
      food: () => metadata.category === CONSTANTS.CATEGORIES.MEAT ? this.showMeatCustomizationModal() : this.showFoodCustomizationModal(),
      liquor: () => this._handleLiquorProduct(productName, price)
    };

    const handler = handlers[metadata.type];
    if (handler) {
      handler();
    } else {
      logWarning(`Product "${productName}" with type "${metadata.type}" did not match specific handling.`);
      this.addProductToOrder({ name: productName, price, customizations: [] });
    }
  }

  _resetSelectionState() {
    this.selectedDrinks = [];
    this.drinkCounts = {};
    this.selectedCookingTerm = null;
  }

  _handleLiquorProduct(productName, price) {
    const isBottle = this.currentProduct.priceType === CONSTANTS.PRICE_TYPES.BOTTLE;
    const isSpecialCategory = [CONSTANTS.CATEGORIES.DIGESTIVOS, CONSTANTS.CATEGORIES.ESPUMOSOS].includes(this.currentCategory);
    
    if (isBottle && isSpecialCategory) {
      if (this.currentCategory === CONSTANTS.CATEGORIES.DIGESTIVOS) {
        const normalizedName = productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        if (CONSTANTS.SPECIAL_PRODUCTS.NO_MODAL.some(p => normalizedName.includes(p))) {
          return this.addProductToOrder({ name: `Botella ${productName}`, price, customizations: ['Sin acompañamientos'] });
        }
      } else {
        return this.addProductToOrder({ name: `Botella ${productName}`, price, customizations: ['Sin acompañamientos'] });
      }
    }

    const modalMap = {
      [CONSTANTS.PRICE_TYPES.BOTTLE]: () => this.showDrinkOptionsModal(),
      [CONSTANTS.PRICE_TYPES.LITER]: () => this.showLiterOptionsModal(),
      [CONSTANTS.PRICE_TYPES.CUP]: () => this.showCupOptionsModal()
    };

    const showModal = modalMap[this.currentProduct.priceType];
    if (showModal) {
      showModal();
    } else {
      logWarning(`Liquor product "${productName}" with price type "${this.currentProduct.priceType}" has no specific modal.`);
      this.addProductToOrder({ name: productName, price, customizations: ['Revisar presentación'] });
    }
  }

  getPriceType(row, clickedElement) {
    if (clickedElement.disabled || clickedElement.classList.contains('non-selectable') || clickedElement.textContent.trim() === '--') {
      return null;
    }
    
    if (clickedElement.dataset.field) return clickedElement.dataset.field;
    
    const currentTable = row.closest('table');
    if (!currentTable) {
      logError("Could not find parent table for getPriceType", null, { row });
      return null;
    }
    
    const tableHeaders = currentTable.querySelectorAll('thead th');
    const cellIndex = Array.from(row.cells).findIndex(cell => cell.contains(clickedElement));
    
    if (cellIndex === -1 || !tableHeaders || cellIndex >= tableHeaders.length) {
      logError("Invalid headers or cellIndex in getPriceType", null, { tableHeaders, cellIndex });
      return null;
    }
    
    const headerText = tableHeaders[cellIndex]?.textContent.trim().toUpperCase() || '';
    
    if (headerText.includes('BOTELLA')) return CONSTANTS.PRICE_TYPES.BOTTLE;
    if (headerText.includes('LITRO')) return CONSTANTS.PRICE_TYPES.LITER;
    if (headerText.includes('COPA')) return CONSTANTS.PRICE_TYPES.CUP;
    
    return 'precio';
  }
  
  isBottleProduct(row) {
    return document.querySelectorAll('th').some(header => {
      const text = header.textContent.toUpperCase();
      return ['BOTELLA', 'LITRO', 'COPA'].some(type => text.includes(type));
    }) && row.querySelector('.product-price');
  }

  isFoodProduct() { return CONSTANTS.CATEGORIES.FOOD.includes(this.currentCategory); }
  isMeatProduct() { return this.currentCategory === CONSTANTS.CATEGORIES.MEAT; }

  calculateTotalJagerDrinkCount() { return calculateTotalJagerDrinkCount(this.selectedDrinks, this.drinkCounts); }

  updateTotalJagerDrinkCount() {
    const totalCountElement = document.getElementById('total-jager-drinks-count');
    const total = this.calculateTotalJagerDrinkCount();
    if (totalCountElement) totalCountElement.textContent = total;

    const boostCheck = document.getElementById('boost-option');
    document.querySelectorAll('.exclusive-option-group .drink-option-container .counter-btn')
      .forEach(btn => {
        if (btn.textContent === '+') btn.disabled = boostCheck.checked || total >= this.maxDrinkCount;
      });
  }

  showDrinkOptionsModal() {
    this.renderModalFromTemplate('drink-options-modal', 'drink-options-template');
    setTimeout(() => this._continueShowDrinkOptionsModal(), 50);
  }
  
  _continueShowDrinkOptionsModal() {
    const optionsContainer = document.getElementById('drink-options-container');
    optionsContainer.innerHTML = '';
    this._resetSelectionState();

    this.bottleCategory = this.getLiquorType(this.currentProduct.name);
    this.maxDrinkCount = CONSTANTS.MAX_DRINK_COUNT;
    
    setTimeout(() => this._updateModalTitle(), 10); 

    if (this._isJagermeisterBottle()) {
      
      this._createJagerMessage(optionsContainer);
      const exclusiveGroup = this._createElement('div', 'exclusive-option-group');
      const boostOption = this._createBoostOption();
      this._setupBoostEventListener(boostOption);
      exclusiveGroup.appendChild(boostOption);
      ['Botella de Agua', 'Mineral'].forEach(option => {
        exclusiveGroup.appendChild(this._createJagerDrinkOption(option, boostOption));
      });
      optionsContainer.appendChild(exclusiveGroup);
      optionsContainer.appendChild(this._createTotalCountContainer('total-jager-drinks-count'));
      
      this.updateTotalJagerDrinkCount();
      this._setupModalButtons();
      this._showModal('drink-options-modal');
      return;
    }

    const drinkOptionsResult = this.getDrinkOptionsForProduct(this.currentProduct.name);
    if (!drinkOptionsResult || !drinkOptionsResult.drinkOptions) {
      console.error('No drink options found for product:', this.currentProduct.name);
      this._hideModal('drink-options-modal');
      return;
    }
    
    const { drinkOptions } = drinkOptionsResult;
    optionsContainer.appendChild(this._createTotalCountContainer('total-drinks-count'));
    this.renderDrinkOptions(optionsContainer, drinkOptions);
    this.updateTotalDrinkCount();
    this._setupModalButtons();
    this._showModal('drink-options-modal');
  }

  // Helper functions for modal optimization
  _isJagermeisterBottle() {
    return this.bottleCategory === 'DIGESTIVOS' && 
           this.currentProduct.priceType === CONSTANTS.PRICE_TYPES.BOTTLE && 
           this.currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes(CONSTANTS.SPECIAL_PRODUCTS.JAGER);
  }

  _updateModalTitle() {
    const modalTitle = document.querySelector('#drink-options-modal h3');
    if (!modalTitle) return;
    
    const { message } = this.getDrinkOptionsForProduct(this.currentProduct.name);
    const baseTitle = '¿Con qué desea acompañar su bebida?';
    const styleSpan = '<span style="font-size: 0.85em; font-weight: normal; color: var(--text-color);">';
    
    if (this.bottleCategory === 'VODKA' || this.bottleCategory === 'GINEBRA') {
      modalTitle.innerHTML = `${baseTitle}${styleSpan}Puedes elegir 2 Jarras de jugo ó 5 Refrescos ó 1 Jarra de jugo y 2 Refrescos</span>`;
    } else if (message === "Puedes elegir 5 refrescos") {
      modalTitle.innerHTML = `${baseTitle}${styleSpan}Puedes elegir 5 refrescos</span>`;
    } else {
      modalTitle.innerHTML = `${baseTitle}${styleSpan}${message}</span>`;
    }
  }

  _createElement(tag, className, textContent = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  _createJagerMessage(container) {
    const messageElement = this._createElement('p', 'drink-options-message', 'Puedes elegir 5 Refrescos ó 2 Boost');
    container.appendChild(messageElement);
  }

  _createBoostOption() {
    const boostOption = this._createElement('div', 'jager-option-container');
    const boostCheck = this._createElement('input');
    Object.assign(boostCheck, {
      type: 'checkbox',
      name: 'jager-options',
      id: 'boost-option',
      className: 'jager-radio'
    });
    
    const boostLabel = this._createElement('label', 'jager-label', '2 Boost');
    boostLabel.htmlFor = 'boost-option';
    
    boostOption.appendChild(boostCheck);
    boostOption.appendChild(boostLabel);
    return boostOption;
  }

  _setupBoostEventListener(boostOption) {
    const boostCheck = boostOption.querySelector('#boost-option');
    boostCheck.addEventListener('change', () => {
      const totalRefrescos = this.calculateTotalJagerDrinkCount();
      
      if (boostCheck.checked) {
        if (totalRefrescos > 0) {
          alert("Para seleccionar los Boost debe dejar los refrescos en 0");
          boostCheck.checked = false;
          return;
        }
        
        this.selectedDrinks = ['2 Boost'];
        this.drinkCounts = {};
        boostOption.classList.add('selected');
        
        document.querySelectorAll('.exclusive-option-group .drink-option-container .counter-btn, .exclusive-option-group .drink-option-container .count-display')
          .forEach(el => {
            if (el.classList.contains('counter-btn')) el.disabled = true;
            if (el.classList.contains('count-display')) el.textContent = '0';
          });
      } else {
        this.selectedDrinks = this.selectedDrinks.filter(drink => drink !== '2 Boost');
        boostOption.classList.remove('selected');
        document.querySelectorAll('.exclusive-option-group .drink-option-container .counter-btn')
          .forEach(btn => btn.disabled = false);
      }
      this.updateTotalJagerDrinkCount();
    });
  }

  _createJagerDrinkOption(option, boostOption) {
    const optionContainer = this._createElement('div', 'drink-option-container');
    const optionName = this._createElement('span', 'drink-option-name');
    optionName.textContent = option;
    const counterContainer = this._createElement('div', 'counter-container');
    
    const countDisplay = this._createElement('span', 'count-display', '0');
    const decrementBtn = this._createCounterButton('-', () => this._handleJagerDecrement(option, countDisplay, optionContainer, boostOption));
    const incrementBtn = this._createCounterButton('+', () => this._handleJagerIncrement(option, countDisplay, optionContainer, boostOption));
    
    counterContainer.append(decrementBtn, countDisplay, incrementBtn);
    optionContainer.append(optionName, counterContainer);
    return optionContainer;
  }

  _createCounterButton(text, clickHandler) {
    const btn = this._createElement('button', 'counter-btn');
    btn.textContent = text;
    btn.addEventListener('click', clickHandler);
    return btn;
  }

  _handleJagerDecrement(option, countDisplay, optionContainer, boostOption) {
    const boostCheck = boostOption.querySelector('#boost-option');
    if (boostCheck.checked) {
      this._resetBoostSelection(boostCheck, boostOption);
    }
    
    const currentCount = this.drinkCounts[option] || 0;
    if (currentCount > 0) {
      this.drinkCounts[option] = currentCount - 1;
      countDisplay.textContent = this.drinkCounts[option];
      if (this.drinkCounts[option] === 0) optionContainer.classList.remove('selected');
      this.updateTotalJagerDrinkCount();
    }
  }

  _handleJagerIncrement(option, countDisplay, optionContainer, boostOption) {
    const boostCheck = boostOption.querySelector('#boost-option');
    if (boostCheck.checked) {
      this._resetBoostSelection(boostCheck, boostOption);
    }
    
    const totalCount = this.calculateTotalJagerDrinkCount();
    const currentCount = this.drinkCounts[option] || 0;
    
    if (totalCount < this.maxDrinkCount) {
      this.drinkCounts[option] = currentCount + 1;
      countDisplay.textContent = this.drinkCounts[option];
      optionContainer.classList.add('selected');
      this.updateTotalJagerDrinkCount();
    }
  }

  _resetBoostSelection(boostCheck, boostOption) {
    boostCheck.checked = false;
    boostOption.classList.remove('selected');
    this.selectedDrinks = this.selectedDrinks.filter(drink => drink !== '2 Boost');
    document.querySelectorAll('.exclusive-option-group .drink-option-container .counter-btn')
      .forEach(btn => btn.disabled = false);
  }

  _createTotalCountContainer(countId) {
    const container = this._createElement('div', 'total-count-container');
    setSafeInnerHTML(container, `<span>Total seleccionado: <span id="${countId}">0</span> / ${this.maxDrinkCount}</span>`);
    return container;
  }

  _setupModalButtons() {
    document.getElementById('confirm-drinks-btn').addEventListener('click', () => this.confirmDrinkOptions());
    document.getElementById('cancel-drinks-btn').addEventListener('click', () => this.cancelProductSelection());
  }

  renderDrinkOptions(container, options) {
    // Validate that options is an array
    if (!Array.isArray(options)) {
      console.error('renderDrinkOptions: options is not an array:', options);
      return;
    }
    
    options.forEach(option => {
      container.appendChild(option === 'Ninguno' ? this._createNoneOption(option) : this._createDrinkOption(option));
    });
  }

  _createNoneOption(option) {
    const noneOption = this._createElement('button', 'drink-option');
    noneOption.textContent = option;
    noneOption.addEventListener('click', () => {
      this.selectedDrinks = ['Ninguno'];
      this.drinkCounts = {};
      document.querySelectorAll('.drink-option').forEach(btn => btn.classList.remove('selected'));
      noneOption.classList.add('selected');
      document.getElementById('total-drinks-count').textContent = '0';
    });
    return noneOption;
  }

  _createDrinkOption(option) {
    const optionContainer = this._createElement('div', 'drink-option-container');
    const optionName = this._createElement('span', 'drink-option-name');
    optionName.textContent = option;
    const counterContainer = this._createElement('div', 'counter-container');
    
    const countDisplay = this._createElement('span', 'count-display', '0');
    const decrementBtn = this._createCounterButton('-', () => this._handleDrinkDecrement(option, countDisplay, optionContainer));
    const incrementBtn = this._createCounterButton('+', () => this._handleDrinkIncrement(option, countDisplay, optionContainer));
    
    counterContainer.append(decrementBtn, countDisplay, incrementBtn);
    optionContainer.append(optionName, counterContainer);
    return optionContainer;
  }

  _handleDrinkDecrement(option, countDisplay, optionContainer) {
    const currentCount = this.drinkCounts[option] || 0;
    if (currentCount > 0) {
      this.drinkCounts[option] = currentCount - 1;
      countDisplay.textContent = this.drinkCounts[option];
      if (this.drinkCounts[option] === 0) {
        optionContainer.classList.remove('selected');
        this.selectedDrinks = this.selectedDrinks.filter(drink => drink !== option);
      }
      this.updateTotalDrinkCount();
    }
  }

  _handleDrinkIncrement(option, countDisplay, optionContainer) {
    if (this._canIncrementDrink(option)) {
      const currentCount = this.drinkCounts[option] || 0;
      this.drinkCounts[option] = currentCount + 1;
      countDisplay.textContent = this.drinkCounts[option];
      optionContainer.classList.add('selected');
      if (!this.selectedDrinks.includes(option)) this.selectedDrinks.push(option);
      this.updateTotalDrinkCount();
    }
  }

  _canIncrementDrink(option) {
    const isJuice = isJuiceOption(option);
    const totalCount = this.calculateTotalDrinkCount();
    
    if (this._isSpecialBottleCategory()) {
      const [totalJuices, totalRefrescos] = this._getDrinkCounts();
      return this._validateSpecialBottleRules(isJuice, totalJuices, totalRefrescos);
    }
    return totalCount < this.maxDrinkCount;
  }

  _isSpecialBottleCategory() {
    if (this.bottleCategory === 'VODKA' || this.bottleCategory === 'GINEBRA') return true;
    if (this.bottleCategory === 'RON') {
      const normalizedName = this.currentProduct?.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() || '';
      return ['BACARDI MANGO', 'BACARDI RASPBERRY', 'MALIBU'].some(name => normalizedName.includes(name));
    }
    return false;
  }

  _validateSpecialBottleRules(isJuice, totalJuices, totalRefrescos) {
    // Reglas estrictas para combinaciones válidas:
    // - Para subcategorías solo con refrescos: máximo 5 refrescos
    // - Para Vodka, Ginebra, Bacardi Mango, Bacardi Raspberry, Malibu:
    //   * EXACTAMENTE 2 jugos (sin refrescos)
    //   * EXACTAMENTE 5 refrescos (sin jugos) 
    //   * EXACTAMENTE 1 jugo + 2 refrescos
    
    if (this._isOnlySodaCategory()) {
      // Solo refrescos permitidos, máximo 5
      return !isJuice && totalRefrescos < 5;
    }
    
    if (this._isSpecialBottleCategory()) {
      // Verificar si estamos intentando agregar y si la combinación resultante sería válida
      const newJuices = isJuice ? totalJuices + 1 : totalJuices;
      const newRefrescos = !isJuice ? totalRefrescos + 1 : totalRefrescos;
      
      // Solo permitir si la nueva combinación es una de las tres válidas:
      // 1. Hasta 2 jugos sin refrescos
      // 2. Hasta 5 refrescos sin jugos  
      // 3. Exactamente 1 jugo + hasta 2 refrescos
      return (newJuices <= 2 && newRefrescos === 0) ||  // Combinación 1
             (newJuices === 0 && newRefrescos <= 5) ||  // Combinación 2
             (newJuices === 1 && newRefrescos <= 2);    // Combinación 3
    }
    
    // Reglas por defecto para otras categorías
    return totalJuices + totalRefrescos < 5;
  }



  calculateTotalDrinkCount() {
    return calculateTotalDrinkCount(this.drinkCounts, this.bottleCategory, this.currentProduct);
  }

  calculateTotalJuiceCount() {
    return calculateTotalJuiceCount(this.drinkCounts);
  }

  updateTotalDrinkCount() {
    const totalCountElement = document.getElementById('total-drinks-count');
    const total = this.calculateTotalDrinkCount();
    if (totalCountElement) totalCountElement.textContent = total;

    const isSpecialProduct = this._isSpecialDrinkProduct();
    document.querySelectorAll('.drink-option-container .counter-btn[textContent="+"]').forEach(btn => {
      const optionContainer = btn.closest('.drink-option-container');
      const optionNameElement = optionContainer?.querySelector('.drink-option-name');
      if (!optionNameElement) return;

      const optionName = optionNameElement.textContent;
      const isJuice = isJuiceOption(optionName);
      const [totalJuices, totalRefrescos] = this._getDrinkCounts();

      btn.disabled = isSpecialProduct ? 
        this._validateSpecialDrinkLimits(isJuice, totalJuices, totalRefrescos) : 
        total >= this.maxDrinkCount;
    });
  }

  _isSpecialDrinkProduct() {
    return this._isSpecialBottleCategory() || this._isOnlySodaCategory();
  }
  
  _isOnlySodaCategory() {
    // Detectar subcategorías que solo tienen refrescos
    // Esto se puede expandir según las categorías específicas del negocio
    const currentOptions = this.getDrinkOptionsForProduct(this.currentProduct?.name || '');
    if (!currentOptions || !currentOptions.drinkOptions) return false;
    
    // Verificar si todas las opciones son refrescos (no jugos)
    return currentOptions.drinkOptions.every(option => !isJuiceOption(option)) && 
           currentOptions.drinkOptions.length > 0 && 
           !currentOptions.drinkOptions.includes('Ninguno');
  }

  _getDrinkCounts() {
    const totalJuices = this.calculateTotalJuiceCount();
    const totalRefrescos = Object.entries(this.drinkCounts)
      .filter(([opt]) => !isJuiceOption(opt))
      .reduce((sum, [, cnt]) => sum + cnt, 0);
    return [totalJuices, totalRefrescos];
  }

  _validateSpecialDrinkLimits(isJuice, totalJuices, totalRefrescos) {
    if (this._isOnlySodaCategory()) {
      // Solo refrescos: deshabilitar si ya hay 5 refrescos o si es jugo
      return isJuice || totalRefrescos >= 5;
    }
    
    if (this._isSpecialBottleCategory()) {
      // Deshabilitar basándose en las combinaciones válidas estrictas
      if (isJuice) {
        // Deshabilitar jugos si:
        // - Ya hay 2 jugos (límite alcanzado para combinación 1)
        // - Hay refrescos y ya hay 1 jugo (combinación 3 completa en jugos)
        // - Hay más de 2 refrescos (incompatible con cualquier combinación de jugos)
        return totalJuices >= 2 || 
               (totalRefrescos > 0 && totalJuices >= 1) || 
               totalRefrescos > 2;
      } else {
        // Deshabilitar refrescos si:
        // - Ya hay 2 jugos (combinación 1, no permite refrescos)
        // - No hay jugos y ya hay 5 refrescos (combinación 2 completa)
        // - Hay 1 jugo y ya hay 2 refrescos (combinación 3 completa)
        return totalJuices >= 2 || 
               (totalJuices === 0 && totalRefrescos >= 5) || 
               (totalJuices === 1 && totalRefrescos >= 2);
      }
    }
    
    // Reglas por defecto
    return totalJuices + totalRefrescos >= 5;
  }

  getDrinkOptionsForProduct(productName) {
    // Validate input
    if (!productName || typeof productName !== 'string') {
      console.error('getDrinkOptionsForProduct: Invalid productName:', productName);
      return { drinkOptions: ['Ninguno'], message: 'Error: Producto no válido' };
    }
    
    const productType = this.getLiquorType(productName);
    const normalizedName = productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
    // Check special products first
    const specialProduct = this._getSpecialProductOptions(normalizedName);
    if (specialProduct && specialProduct.drinkOptions) {
      return specialProduct;
    }
    
    // Handle digestivos
    if (productType === 'DIGESTIVOS') {
      const digestivoResult = this._getDigestivoOptions(normalizedName, productName);
      if (digestivoResult && digestivoResult.drinkOptions) {
        return digestivoResult;
      }
    }
    
    // Handle espumosos
    if (productType === 'ESPUMOSOS') {
      return { drinkOptions: ['Ninguno'], message: CONSTANTS.MESSAGES.NO_REFRESCOS || 'Sin acompañamientos' };
    }
    
    // Get standard options with fallback
    let options = null;
    if (CONSTANTS.PRODUCT_OPTIONS && CONSTANTS.PRODUCT_OPTIONS[productType]) {
      options = CONSTANTS.PRODUCT_OPTIONS[productType];
    } else if (CONSTANTS.PRODUCT_OPTIONS && CONSTANTS.PRODUCT_OPTIONS.DEFAULT) {
      options = CONSTANTS.PRODUCT_OPTIONS.DEFAULT;
    } else {
      // Ultimate fallback
      options = ['Mineral', 'Coca', 'Manzana'];
    }
    
    // Determinar el mensaje apropiado según el tipo de producto
    let message;
    if (['VODKA', 'GINEBRA'].includes(productType)) {
      message = CONSTANTS.MESSAGES.SPECIAL || 'Opciones especiales';
    } else {
      // Verificar si es una categoría solo de refrescos
      const isOnlySodas = options.every(option => !isJuiceOption(option)) && 
                         options.length > 0 && 
                         !options.includes('Ninguno');
      message = isOnlySodas ? 
        (CONSTANTS.MESSAGES.ONLY_SODAS || 'Puedes elegir hasta 5 refrescos') :
        (CONSTANTS.MESSAGES.DEFAULT || 'Seleccione acompañamiento');
    }
    
    return { drinkOptions: options, message };
  }

  _getSpecialProductOptions(normalizedName) {
    if (!normalizedName || typeof normalizedName !== 'string') {
      return null;
    }
    
    const specialProducts = {
      'BACARDI MANGO': ['Sprite', 'Mineral', 'Quina', 'Jugo de Mango', 'Jugo de Arándano'],
      'BACARDI RASPBERRY': ['Sprite', 'Mineral', 'Quina', 'Jugo de Mango', 'Jugo de Arándano'],
      'MALIBU': ['Sprite', 'Mineral', 'Jugo de Piña']
    };
    
    for (const [key, options] of Object.entries(specialProducts)) {
      if (normalizedName.includes(key)) {
        return { 
          drinkOptions: Array.isArray(options) ? options : ['Ninguno'], 
          message: CONSTANTS.MESSAGES.SPECIAL || 'Opciones especiales'
        };
      }
    }
    return null;
  }

  _getDigestivoOptions(normalizedName, productName) {
    // Validate inputs
    if (!normalizedName || !productName || !this.currentProduct) {
      return { drinkOptions: ['Ninguno'], message: 'Sin acompañamientos' };
    }
    
    if (this.currentProduct.priceType === CONSTANTS.PRICE_TYPES.BOTTLE) {
      const digestivoOptions = {
        'LICOR 43': ['Botella de Agua', 'Mineral'],
        'CADENAS DULCE': ['Botella de Agua', 'Mineral'],
        'ZAMBUCA NEGRO': ['Botella de Agua', 'Mineral']
      };
      
      for (const [key, options] of Object.entries(digestivoOptions)) {
        if (normalizedName.includes(key)) {
          return { 
            drinkOptions: Array.isArray(options) ? options : ['Ninguno'], 
            message: "Seleccione acompañamiento:" 
          };
        }
      }
      return { 
        drinkOptions: ['Ninguno'], 
        message: CONSTANTS.MESSAGES.NO_REFRESCOS || 'Sin acompañamientos' 
      };
    }
    
    if (this.currentProduct.priceType === CONSTANTS.PRICE_TYPES.CUP && productName.includes("BAILEYS")) {
      return { drinkOptions: ['Rocas'], message: "Acompañamientos para copa" };
    }
    
    return { 
      drinkOptions: ['Ninguno'], 
      message: CONSTANTS.MESSAGES.NO_REFRESCOS || 'Sin acompañamientos' 
    };
  }

  confirmDrinkOptions() {
    if (!this._hasValidDrinkSelection()) {
      this._showValidationModal('Por favor seleccione al menos un acompañamiento');
      return;
    }

    const { prefix, name, customization } = this._buildProductInfo();
    this.addProductToOrder({
      name: `${prefix} ${name}`,
      price: this.currentProduct.price,
      customizations: [customization]
    });

    this.selectedDrinks = [];
    this.drinkCounts = {};
    this._hideModal('drink-options-modal');
  }

  _hasValidDrinkSelection() {
    const isJagerBottle = this.currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('JAGERMEISTER') && 
                          this.currentProduct.priceType === 'precioBotella';
    
    if (isJagerBottle) {
      return this.selectedDrinks.includes('2 Boost') || Object.values(this.drinkCounts).some(count => count > 0);
    }
    
    return this.selectedDrinks.length > 0 || Object.values(this.drinkCounts).some(count => count > 0);
  }

  _buildProductInfo() {
    const priceType = this.currentProduct.priceType;
    const productName = this.currentProduct.name.replace(/\s*\d+\s*ML/i, '');
    const isJagerBottle = this.currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('JAGERMEISTER') && 
                          priceType === 'precioBotella';

    const prefixMap = { 'precioBotella': 'Botella', 'precioLitro': 'Litro', 'precioCopa': 'Copa' };
    const prefix = prefixMap[priceType] || '';

    let customization = '';
    if (priceType === 'precioBotella') {
      if (isJagerBottle && this.selectedDrinks.includes('2 Boost')) {
        customization = 'Con: 2 Boost';
      } else if (Object.values(this.drinkCounts).some(count => count > 0)) {
        const customizations = Object.entries(this.drinkCounts)
          .filter(([, count]) => count > 0)
          .map(([drink, count]) => `${count}x ${drink}`);
        customization = `Con: ${customizations.join(', ')}`;
      } else {
        customization = this.selectedDrinks.includes('Ninguno') ? 'Sin acompañamientos' : `Con: ${this.selectedDrinks.join(', ')}`;
      }
    } else if (priceType === 'precioLitro') {
      customization = `Mezclador: ${this.selectedDrinks[0] || 'Ninguno'}`;
    } else if (priceType === 'precioCopa') {
      customization = `Estilo: ${this.selectedDrinks[0] || 'Ninguno'}`;
    }

    return { prefix, name: productName, customization };
  }

  showLiterOptionsModal() {
    this.renderModalFromTemplate('drink-options-modal', 'drink-options-template');
    
    setTimeout(() => {
      const modalTitle = document.querySelector('#drink-options-modal h3');
      if (modalTitle) {
        modalTitle.innerHTML = '¿Con qué desea acompañar su bebida?<span style="font-size: 0.85em; font-weight: normal; color: var(--text-color);">Cada litro se sirve con 6 oz del destilado que elija.</span>';
      }
    }, 10);
    
    this._setupOptionsModal('liter');
  }

  getLiterOptionsForProduct(category) {
    return this._getOptionsForProduct(category, 'liter');
  }

  showCupOptionsModal() {
    this.renderModalFromTemplate('drink-options-modal', 'drink-options-template');
    setTimeout(() => {
      const modalTitle = document.querySelector('#drink-options-modal h3');
      if (modalTitle) {
        modalTitle.innerHTML = '¿Con qué desea acompañar su bebida?<span style="font-size: 0.85em; font-weight: normal; color: var(--text-color);">Cada copa se sirve con 1 ½ oz del destilado que elija.</span>';
      }
    }, 10);
    this._setupOptionsModal('cup');
  }

  getCupOptionsForProduct(category) {
    return this._getOptionsForProduct(category, 'cup');
  }

  _getOptionsForProduct(category, type) {
    const productName = this.currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
    const specialProducts = {
      'BACARDI MANGO': ['Sprite', 'Mineral', type === 'liter' ? 'Tonic' : 'Tonic', 'Jugo de Mango', 'Jugo de Arándano'],
      'BACARDI RASPBERRY': ['Sprite', 'Mineral', 'Tonic', 'Jugo de Mango', 'Jugo de Arándano'],
      'MALIBU': ['Sprite', 'Mineral', 'Jugo de Piña', type === 'liter' ? 'Mineral-Piña' : 'Mineral-Piña']
    };
    
    for (const [key, options] of Object.entries(specialProducts)) {
      if (productName.includes(key)) {
        return type === 'liter' ? { options, message: 'Elija una opción para acompañar su litro:' } : options;
      }
    }

    const optionsMap = {
      'RON': ['Mineral', 'Manzana', 'Coca', 'Mineral-Coca', 'Mineral-Manzana', 'Pintado-Coca', 'Pintado-Manzana'],
      'TEQUILA': type === 'liter' ? 
        ['Toronja', 'Mineral', 'Coca', 'Toronja-Mineral', 'Paloma'] :
        ['Toronja', 'Mineral', 'Coca', 'Toronja-Mineral', 'Bandera', 'Paloma', 'Derecho'],
      'BRANDY': type === 'liter' ?
        ['Coca', 'Manzana', 'Mineral', 'Mineral-Coca', 'Mineral-Manzana'] :
        ['Coca', 'Manzana', 'Mineral', 'Mineral-Coca', 'Mineral-Manzana', 'Paris'],
      'WHISKY': type === 'liter' ?
        ['Mineral', 'Manzana', 'Ginger ale', 'Botella de Agua', 'Mineral-Ginger', 'Mineral-Manzana'] :
        ['Mineral', 'Manzana', 'Ginger ale', 'Botella de Agua', 'Rocas', 'Mineral-Manzana', 'Mineral-Ginger'],
      'VODKA': ['Jugo de Piña', 'Jugo de Naranja', 'Jugo de Arándano', 'Jugo de Mango', 'Jugo de Uva', 'Jugo de Durazno', 'Mineral', 'Tonic'],
      'GINEBRA': ['Jugo de Piña', 'Jugo de Naranja', 'Jugo de Arándano', 'Jugo de Mango', 'Jugo de Uva', 'Jugo de Durazno', 'Mineral', 'Tonic'],
      'MEZCAL': type === 'liter' ? ['Mineral', 'Toronja'] : ['Derecho Naranja y Sal de gusano', 'Toronja'],
      'COGNAC': type === 'liter' ? 
        ['Puesto-Mineral', 'Puesto-Coca', 'Puesto-Manzana'] :
        ['Puesto-Mineral', 'Puesto-Coca', 'Puesto-Manzana', 'Rocas', 'Paris'],
      'ESPUMOSOS': ['Ninguno'],
      'DIGESTIVOS': type === 'liter' ? ['Mineral', 'Botella de Agua'] : this._getDigestivoOptionsForCup(productName)
    };

    const options = optionsMap[category] || ['Mineral', 'Agua', 'Coca', 'Manzana'];
    return type === 'liter' ? { options, message: 'Elija una opción para acompañar su litro:' } : options;
  }

  _getDigestivoOptionsForCup(productName) {
    const digestivoMap = {
      'LICOR 43': ['Coñaquera Chaser Mineral', 'Rocas'],
      'JÄGERMEISTER': ['Derecho'],
      'BAILEYS': ['Rocas'],
      'CADENAS DULCE': ['Coñaquera Chaser Mineral', 'Rocas'],
      'ZAMBUCA NEGRO': [
        'Coñaquera Chaser Mineral-Moscas',
        'Coñaquera Chaser Mineral',
        'Rocas'  
      ]
    };
    
    for (const [key, options] of Object.entries(digestivoMap)) {
      const normalizedProductName = productName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (normalizedProductName.includes(normalizedKey)) {
        return options;
      }
    }
    
    return ['Mineral', 'Botella de Agua'];
  }

  _setupOptionsModal(type) {
    const optionsContainer = document.getElementById('drink-options-container');
    if (!optionsContainer) {
      console.error(`Element 'drink-options-container' not found in ${type} options modal.`);
      this._hideModal('drink-options-modal');
      return;
    }
    
    optionsContainer.innerHTML = '';
    this.selectedDrinks = [];
    this.bottleCategory = this.getLiquorType(this.currentProduct.name);

    const options = this._getOptionsForModalType(type);
    this._renderOptionsGrid(options, optionsContainer);
    this._attachModalEventListeners();
    this._showModal('drink-options-modal');
  }

  _getOptionsForModalType(type) {
    const productName = this.currentProduct.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    
    if (productName.includes('BACARDI MANGO') || productName.includes('BACARDI RASPBERRY')) {
      return ['Sprite', 'Mineral', 'Tonic', 'Jugo de Mango', 'Jugo de Arándano'];
    }
    if (productName.includes('MALIBU')) {
      return ['Sprite', 'Mineral', 'Jugo de Piña', 'Mineral-Piña'];
    }
    
    return type === 'liter' 
      ? this.getLiterOptionsForProduct(this.bottleCategory).options
      : this.getCupOptionsForProduct(this.bottleCategory);
  }

  _renderOptionsGrid(options, container) {
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'options-grid';
    
    options.forEach(option => {
      const optionButton = document.createElement('button');
      optionButton.className = 'drink-option';
      optionButton.textContent = option;
      optionButton.addEventListener('click', () => {
        document.querySelectorAll('.drink-option').forEach(btn => {
          btn.classList.remove('selected');
        });
        optionButton.classList.add('selected');
        this.selectedDrinks = [option];
      });
      optionsGrid.appendChild(optionButton);
    });

    container.appendChild(optionsGrid);
  }

  _attachModalEventListeners() {
    const confirmBtn = document.getElementById('confirm-drinks-btn');
    const cancelBtn = document.getElementById('cancel-drinks-btn');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmDrinkOptions());
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelProductSelection());
    }
  }

  showFoodCustomizationModal() {
    this.renderModalFromTemplate('food-customization-modal', 'food-customization-template');
    setTimeout(() => this._setupFoodModal(), 50);
  }
  
  _setupFoodModal() {
    document.getElementById('ingredients-input-container').style.display = 'none';
    const ingredientsInput = document.getElementById('ingredients-to-remove');
    if (ingredientsInput) ingredientsInput.value = '';
    
    const handlers = {
      'keep-ingredients-btn': () => this._addFoodToOrder('Con todos los ingredientes'),
      'customize-ingredients-btn': () => this._showIngredientsInput(),
      'confirm-ingredients-btn': () => this._confirmIngredientCustomization(),
      'cancel-ingredients-btn': () => this.cancelProductSelection()
    };
    
    Object.entries(handlers).forEach(([id, handler]) => {
      document.getElementById(id).addEventListener('click', handler);
    });
    
    this._showModal('food-customization-modal');
  }

  _showIngredientsInput() {
    document.getElementById('ingredients-input-container').style.display = 'block';
    document.querySelector('.ingredients-choice').style.display = 'none';
  }

  _addFoodToOrder(customization) {
    this.addProductToOrder({
      name: this.currentProduct.name,
      price: this.currentProduct.price,
      customizations: [customization]
    });
    this._hideModal('food-customization-modal');
  }

  _confirmIngredientCustomization() {
    const ingredientsToRemove = document.getElementById('ingredients-to-remove').value.trim();
    const customization = ingredientsToRemove ? `Sin: ${ingredientsToRemove}` : 'Con todos los ingredientes';
    this._addFoodToOrder(customization);
  }

  showMeatCustomizationModal() {
    this.renderModalFromTemplate('meat-customization-modal', 'meat-customization-template');
    setTimeout(() => this._setupMeatModal(), 50);
  }
  
  _setupMeatModal() {
    document.getElementById('garnish-input-container').style.display = 'none';
    const garnishModifications = document.getElementById('garnish-modifications');
    if (garnishModifications) garnishModifications.value = '';
    
    this.selectedCookingTerm = null;
    this._setupCookingOptions();
    
    const handlers = {
      'change-garnish-btn': () => this._showGarnishInput(),
      'keep-garnish-btn': () => this._addMeatToOrder('Guarnición estándar'),
      'confirm-garnish-btn': () => this._confirmGarnishCustomization(),
      'cancel-garnish-btn': () => this.cancelProductSelection()
    };
    
    Object.entries(handlers).forEach(([id, handler]) => {
      document.getElementById(id).addEventListener('click', handler);
    });
    
    this._showModal('meat-customization-modal');
  }

  _setupCookingOptions() {
    const cookingOptions = document.querySelectorAll('.cooking-option');
    cookingOptions.forEach(option => {
      option.classList.remove('selected');
      option.addEventListener('click', (e) => {
        cookingOptions.forEach(opt => opt.classList.remove('selected'));
        e.target.classList.add('selected');
        this.selectedCookingTerm = e.target.getAttribute('data-term');
      });
    });
  }

  _showGarnishInput() {
    if (!this._validateCookingTerm()) return;
    document.getElementById('garnish-input-container').style.display = 'block';
    document.querySelector('.garnish-choice').style.display = 'none';
  }

  _addMeatToOrder(garnishType) {
    if (!this._validateCookingTerm()) return;
    
    this.addProductToOrder({
      name: this.currentProduct.name,
      price: this.currentProduct.price,
      customizations: [`Término: ${this._getTermText(this.selectedCookingTerm)}`, garnishType]
    });
    this._hideModal('meat-customization-modal');
  }

  _getTermText(term) {
    const termMap = { 'medio': 'Término ½', 'tres-cuartos': 'Término ¾', 'bien-cocido': 'Bien Cocido' };
    return termMap[term] || term;
  }

  _confirmGarnishCustomization() {
    if (!this._validateCookingTerm()) return;
    const garnishModifications = document.getElementById('garnish-modifications').value.trim();
    const garnishType = garnishModifications ? `Guarnición: ${garnishModifications}` : 'Guarnición estándar';
    this._addMeatToOrder(garnishType);
  }

  _validateCookingTerm() {
    if (!this.selectedCookingTerm) {
      this._showValidationModal('Por favor seleccione un término de cocción primero');
      return false;
    }
    return true;
  }

  _showValidationModal(message) {
    this._createSimpleModal(message, 'Aceptar', () => {});
  }

  cancelProductSelection() {
    ['drink-options-modal', 'food-customization-modal', 'meat-customization-modal']
      .forEach(modal => this._hideModal(modal));
    this._resetSelectionState();
    this.currentProduct = null;
  }

  addProductToOrder(orderItem) {
    this.core.addProduct(orderItem); 
    this.updateOrderDisplay();
    this.currentProduct = null;
  }

  updateOrderDisplay() {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';

    const orderTotalAmount = document.getElementById('order-total-amount');

    const itemsToDisplay = this.core.getItems(); 

    itemsToDisplay.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'order-item';

      const itemHeader = document.createElement('div');
      itemHeader.className = 'order-item-header';

      const itemName = document.createElement('div');
      itemName.className = 'order-item-name';
      itemName.textContent = item.name;

      const removeButton = document.createElement('button');
      removeButton.className = 'remove-order-item';
      setSafeInnerHTML(removeButton, '&times;');
      removeButton.addEventListener('click', () => {
        this.removeOrderItem(item.id);
      });

      itemHeader.appendChild(itemName);
      itemHeader.appendChild(removeButton);

      const itemPrice = document.createElement('div');
      itemPrice.className = 'order-item-price';
      itemPrice.textContent = `$${item.price.toFixed(2)}`;

      itemElement.appendChild(itemHeader);
      itemElement.appendChild(itemPrice);

      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach(customization => {
          const customElem = document.createElement('div');
          customElem.className = 'order-item-customization';
          customElem.textContent = customization;
          itemElement.appendChild(customElem);
        });
      }

      orderItemsContainer.appendChild(itemElement);
    });

    const total = this.core.getTotal(); 
    orderTotalAmount.textContent = `$${total.toFixed(2)}`;
  }

  removeOrderItem(itemId) {
    this.core.removeItem(itemId); 
    this.updateOrderDisplay();
  }

  completeOrder() {
    const currentOrderItems = this.core.getItems();
    
    if (currentOrderItems.length === 0) {
      this._showValidationModal('La orden está vacía. Por favor agregue productos.');
      return;
    }

    this._showSuccessModal('¡Orden completada con éxito!', () => {
      const order = {
        id: Date.now(), 
        items: this.core.getItems(), 
        total: this.core.getTotal(), 
        date: new Date().toLocaleString()
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      this.core.clearItems();
      this.updateOrderDisplay();
      this.toggleOrderMode(true);
    });
  }

  _showSuccessModal(message, onConfirm) {
    this._createSimpleModal(message, 'Aceptar', onConfirm);
  }

  _createSimpleModal(message, buttonText, onConfirm) {
    const modalBackdrop = this._createElement('div', 'modal-backdrop');
    const modalContent = this._createElement('div', 'modal-content');
    
    const modalTitle = this._createElement('h3');
    modalTitle.textContent = message;
    
    const modalActions = this._createElement('div', 'modal-actions');
    const confirmBtn = this._createElement('button', 'nav-button');
    confirmBtn.textContent = buttonText;
    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(modalBackdrop);
      if (onConfirm) onConfirm();
    });
    
    modalActions.appendChild(confirmBtn);
    [modalTitle, modalActions].forEach(el => modalContent.appendChild(el));
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  }

  /**
   * Determines liquor category from product name for customization rules
   * Uses brand mapping and fallback logic for accurate liquor classification
   * Critical for applying correct accompaniment options and drink limits
   * @param {string} productName - Name of the liquor product
   * @returns {string} Liquor category (RON, TEQUILA, WHISKY, etc.)
   */
  getLiquorType(productName) {
    // Comprehensive brand to category mapping for accurate liquor classification
    const BRAND_MAPPING = {
      'BACARDÍ': 'RON', 'HAVANA': 'RON', 'MATUSALEM': 'RON', 
      'APPLETON ESTATE': 'RON', 'CAPITÁN MORGAN': 'RON', 'ZACAPA 23': 'RON',
      'MALIBU': 'RON', // Special handling in drink options
      
      'CUERVO': 'TEQUILA', 'DON JULIO': 'TEQUILA', 'HERRADURA': 'TEQUILA', 
      'MAESTRO DOBEL DIAMANTE': 'TEQUILA', 'TRADICIONAL': 'TEQUILA',
      
      'BUCHANAN': 'WHISKY', 'CHIVAS': 'WHISKY', 'JACK DANIELS': 'WHISKY', 
      'BLACK & WHITE': 'WHISKY', 'J.W.': 'WHISKY',
      
      'ABSOLUT': 'VODKA', 'GREY GOOSE': 'VODKA', 'SMIRNOFF': 'VODKA', 
      'STOLICHNAYA': 'VODKA',
      
      'TORRES': 'BRANDY', 'FUNDADOR': 'BRANDY', 'CARLOS I': 'BRANDY', 
      'TERRY CENTENARIO': 'BRANDY',
      
      'BOMBAY': 'GINEBRA', 'TANQUERAY': 'GINEBRA', 'BEEFEATER': 'GINEBRA', 
      'HENDRICK': 'GINEBRA', 'MONKEY 47': 'GINEBRA', 'THE BOTANIST': 'GINEBRA',
      
      '400 CONEJOS': 'MEZCAL', 'AMARÁS': 'MEZCAL', 'MONTELOBOS': 'MEZCAL', 
      'UNION': 'MEZCAL', 'TRIPAS DE MAGUEY': 'MEZCAL',
      
      'RÉMY MARTIN': 'COGNAC', 'HENNESSY': 'COGNAC', 'MARTELL': 'COGNAC', 
      'COURVOISIER': 'COGNAC',
      
      'HIPNOTIQ': 'DIGESTIVOS', 
      'LICOR 43': 'DIGESTIVOS', 
      'JÄGERMEISTER': 'DIGESTIVOS', 
      'BAILEYS': 'DIGESTIVOS', 
      'CADENAS DULCE': 'DIGESTIVOS', 
      'ZAMBUCA': 'DIGESTIVOS',
      
      'MOËT': 'ESPUMOSOS', 
      'CHANDON': 'ESPUMOSOS', 
      'TAITTINGER': 'ESPUMOSOS', 
      'VEUVE CLICQUOT': 'ESPUMOSOS'
    };

    const normalizedName = productName
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .toUpperCase();

    if (normalizedName.includes('MALIBU')) return 'RON';
    if (normalizedName.includes('TRIPAS DE MAGUEY')) return 'MEZCAL';

    for (const [brand, category] of Object.entries(BRAND_MAPPING)) {
      const normalizedBrand = brand.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      if (normalizedName.includes(normalizedBrand)) return category;
    }

    if (normalizedName.includes("RON")) return 'RON';
    if (normalizedName.includes("TEQUILA")) return 'TEQUILA';
    if (normalizedName.includes("WHISKY")) return 'WHISKY';
    if (normalizedName.includes("VODKA")) return 'VODKA';
    if (normalizedName.includes("BRANDY")) return 'BRANDY';
    if (normalizedName.includes("GINEBRA") || normalizedName.includes("GIN")) return 'GINEBRA';
    if (normalizedName.includes("MEZCAL")) return 'MEZCAL';
    if (normalizedName.includes("COGNAC")) return 'COGNAC';
    if (normalizedName.includes("DIGESTIVO")) return 'DIGESTIVOS';
    if (normalizedName.includes("ESPUMOSO")) return 'ESPUMOSOS';

    return 'OTRO'; // Fallback for unrecognized products
  }

  renderModalFromTemplate(modalId, templateId) {
    const modal = document.getElementById(modalId); 
    if (!modal) {
      logError(`Modal element with ID '${modalId}' not found.`);
      throw new Error(`Modal element ${modalId} not found`);
    }
    
    modal.innerHTML = '';
    
    const template = document.getElementById(templateId);
    if (!template) {
      logError(`Plantilla faltante para: ${modalId}. Template ID: ${templateId}`);
      throw new Error(`Template ${templateId} no encontrado para modal ${modalId}`);
    }
    const clone = document.importNode(template.content, true);
    modal.appendChild(clone);
    
    // Re-enhance modal with show/hide methods after template loading
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      this.enhanceModalElement(modal);
    }, 0);
  }
  
  /**
   * Enhances a single modal element with show/hide methods
   * Uses the global enhancement system for consistency
   * @param {HTMLElement} modal - The modal element to enhance
   */
  enhanceModalElement(modal) {
    if (!modal) {
      console.error('enhanceModalElement: No modal provided');
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
    
    // Also use global enhancement if available as backup
    if (typeof window.enhanceModalGlobally === 'function') {
      window.enhanceModalGlobally(modal);
    }
    
    // Verify methods were added correctly (only log errors)
    if (typeof modal.show !== 'function' || typeof modal.hide !== 'function') {
      console.error(`Modal ${modal.id} enhancement FAILED - show: ${typeof modal.show}, hide: ${typeof modal.hide}`);
    }
  }

  deleteOrder(orderId) {
    this._showConfirmationModal(
      '¿Está seguro de que desea eliminar esta orden?',
      'Esta acción moverá la orden al historial.',
      () => {
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderToDelete = savedOrders.find(order => order.id === orderId);
        const updatedOrders = savedOrders.filter(order => order.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        
        if (orderToDelete) {
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          orderHistory.push({...orderToDelete, deletedAt: new Date().toLocaleString()});
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        }
        
        // Actualizar solo la vista activa correspondiente
        const ordersScreen = document.querySelector('.orders-screen');
        if (ordersScreen && ordersScreen.style.display !== 'none') {
          if (this.isShowingHistory) {
            const historyContainer = document.querySelector('.order-history-container');
            if (historyContainer) {
              this.populateOrderHistoryScreen(historyContainer); 
            }
          } else {
            // Limpiar y repoblar solo la lista de órdenes activas
            const ordersList = document.getElementById('orders-list');
            if (ordersList) {
              ordersList.innerHTML = '';
              this._populateOrdersList('orders-list', 'orders', 'No hay órdenes guardadas.', true);
            }
          }
        }
      }
    );
  }

  showOrdersScreen() {
    const elements = {
      mainContentScreen: document.querySelector('.main-content-screen'),
      contentContainer: document.getElementById('content-container'),
      pageTitleElement: document.querySelector('.page-title'),
      hamburgerBtn: document.getElementById('hamburger-btn'),
      ordersScreen: document.querySelector('.orders-screen')
    };
    
    elements.hamburgerBtn.style.display = 'none';
    elements.contentContainer.style.display = 'none';
    
    this.previousCategory = elements.mainContentScreen.getAttribute('data-category');
    this.previousTitle = elements.pageTitleElement ? elements.pageTitleElement.textContent : 'Coctelería';
    this.isShowingHistory = false;
    
    if (elements.ordersScreen) {
      elements.ordersScreen.style.display = 'block';
      const historyButton = elements.ordersScreen.querySelector('.history-btn');
      if (historyButton) historyButton.textContent = 'Historial Órdenes';
      this.populateOrdersScreen();
    } else {
      elements.mainContentScreen.appendChild(this._createOrdersScreen());
      this.populateOrdersScreen();
    }
  }

  _createOrdersScreen() {
    const ordersScreen = document.createElement('div');
    ordersScreen.className = 'orders-screen';
    
    const header = this._createOrdersHeader();
    const ordersListContainer = this._createElement('div', 'orders-list-container');
    const ordersList = this._createElement('div', 'orders-list', 'orders-list');
    
    ordersListContainer.appendChild(ordersList);
    ordersScreen.appendChild(header);
    ordersScreen.appendChild(ordersListContainer);
    
    return ordersScreen;
  }

  _createOrdersHeader() {
    const header = this._createElement('div', 'orders-screen-header');
    
    const buttons = [
      { class: 'nav-button orders-back-btn', text: 'Volver', handler: () => this.hideOrdersScreen() },
      { class: 'nav-button history-btn', text: 'Historial Órdenes', handler: (btn) => this.toggleOrderHistoryView(btn) }
    ];
    
    const backButton = this._createButton(buttons[0]);
    const title = this._createElement('h2', 'orders-screen-title');
    title.textContent = 'Órdenes Guardadas';
    const historyButton = this._createButton(buttons[1]);
    
    [backButton, title, historyButton].forEach(el => header.appendChild(el));
    return header;
  }

  _createElement(tag, className, id = null) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (id) element.id = id;
    return element;
  }

  _createButton({ class: className, text, handler }) {
    const button = this._createElement('button', className);
    button.textContent = text;
    button.addEventListener('click', () => handler(button));
    return button;
  }
  
  populateOrdersScreen() {
    this._populateOrdersList('orders-list', 'orders', 'No hay órdenes guardadas.', true);
  }

  toggleOrderHistoryView(button) {
    this.isShowingHistory = !this.isShowingHistory;
    const elements = {
      ordersList: document.getElementById('orders-list'),
      orderHistoryContainer: document.querySelector('.order-history-container'),
      ordersScreenTitle: document.querySelector('.orders-screen-title')
    };

    if (this.isShowingHistory) {
      this._showHistoryView(button, elements);
    } else {
      this._showActiveOrdersView(button, elements);
    }
  }

  _showHistoryView(button, { ordersList, orderHistoryContainer, ordersScreenTitle }) {
    button.textContent = 'Ver Órdenes Activas';
    if (ordersScreenTitle) ordersScreenTitle.textContent = 'Historial de Órdenes';
    if (ordersList) ordersList.style.display = 'none';
    
    if (!orderHistoryContainer) {
      orderHistoryContainer = this._createHistoryContainer();
    }
    orderHistoryContainer.style.display = 'grid';
    this.populateOrderHistoryScreen(orderHistoryContainer);
  }

  _showActiveOrdersView(button, { ordersList, orderHistoryContainer, ordersScreenTitle }) {
    button.textContent = 'Historial Órdenes';
    if (ordersScreenTitle) ordersScreenTitle.textContent = 'Órdenes Guardadas';
    if (orderHistoryContainer) orderHistoryContainer.style.display = 'none';
    if (ordersList) ordersList.style.display = 'grid';
    this.populateOrdersScreen();
  }

  _createHistoryContainer() {
    const container = this._createElement('div', 'order-history-container orders-list');
    const parent = document.querySelector('.orders-list-container');
    if (parent) {
      parent.appendChild(container);
      return container;
    } else {
      logError('Cannot find .orders-list-container to append history');
      return null;
    }
  }
  
  populateOrderHistoryScreen(container) {
    container.innerHTML = '';
    container.appendChild(this._createClearHistoryButton(container));
    this._populateOrdersList(container, 'orderHistory', 'No hay órdenes en el historial.', false);
  }

  _createClearHistoryButton(container) {
    const button = this._createElement('button', 'nav-button clear-history-btn');
    button.textContent = 'Limpiar Historial';
    Object.assign(button.style, {
      marginBottom: '20px',
      gridColumn: '1 / -1',
      margin: '10px auto 20px auto',
      display: 'block'
    });
    button.addEventListener('click', () => this.promptClearHistory(container));
    return button;
  }

  _populateOrdersList(containerOrId, storageKey, emptyMessage, includeDeleteButton) {
    const container = typeof containerOrId === 'string' ? document.getElementById(containerOrId) : containerOrId;
    const orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (orders.length === 0) {
      container.appendChild(this._createEmptyMessage(emptyMessage));
      return;
    }
    
    orders.forEach((order, index) => {
      container.appendChild(this._createOrderElement(order, index, includeDeleteButton));
    });
  }

  _createEmptyMessage(message) {
    const element = this._createElement('div');
    Object.assign(element.style, {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '50px',
      color: 'var(--primary-color)'
    });
    element.textContent = message;
    return element;
  }

  _createOrderElement(order, index, includeDeleteButton) {
    const orderElement = document.createElement('div');
    orderElement.className = 'saved-order';

    const orderHeader = document.createElement('h3');
    orderHeader.textContent = `ORDEN ${index + 1} - ${order.date}`;
    orderElement.appendChild(orderHeader);

    const orderItemsList = document.createElement('div');
    orderItemsList.className = 'saved-order-items';

    order.items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'saved-order-item';

      const itemName = document.createElement('div');
      itemName.className = 'saved-order-item-name';
      itemName.textContent = item.name;

      const itemPrice = document.createElement('div');
      itemPrice.className = 'saved-order-item-price';
      itemPrice.textContent = `$${item.price.toFixed(2)}`;

      itemElement.appendChild(itemName);
      itemElement.appendChild(itemPrice);

      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach(customization => {
          const customElem = document.createElement('div');
          customElem.className = 'saved-order-item-customization';
          customElem.textContent = customization;
          itemElement.appendChild(customElem);
        });
      }
      orderItemsList.appendChild(itemElement);
    });
    orderElement.appendChild(orderItemsList);

    const orderTotal = document.createElement('div');
    orderTotal.className = 'saved-order-total';
    orderTotal.textContent = `Total: $${order.total.toFixed(2)}`;
    orderElement.appendChild(orderTotal);

    if (includeDeleteButton) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'nav-button delete-order-btn';
      deleteButton.textContent = 'Eliminar Orden';
      // Determinar si estamos en historial o en órdenes activas
      if (this.isShowingHistory) {
        deleteButton.addEventListener('click', () => this.deleteFromHistory(order.id));
      } else {
        deleteButton.addEventListener('click', () => this.deleteOrder(order.id));
      }
      orderElement.appendChild(deleteButton);
    }

    return orderElement;
  }
  
  deleteFromHistory(orderId) {
    this._showConfirmationModal(
      '¿Está seguro de que desea eliminar esta orden del historial?',
      'Esta acción eliminará permanentemente la orden del historial.',
      () => {
        // Solo eliminar del historial, NO afectar órdenes activas
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const updatedHistory = orderHistory.filter(order => order.id !== orderId);
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
        
        // Actualizar solo la vista del historial
        const historyContainer = document.querySelector('.order-history-container');
        if (historyContainer) {
          this.populateOrderHistoryScreen(historyContainer);
        }
      }
    );
  }

  promptClearHistory(historyContainer) {
    this._showConfirmationModal(
      '¿Está seguro de que desea limpiar el historial?',
      'Esta acción no se puede deshacer.',
      () => {
        // Solo limpiar el historial, NO las órdenes activas
        localStorage.setItem('orderHistory', JSON.stringify([]));
        
        // Limpiar solo el contenedor del historial
        if (historyContainer) {
          historyContainer.innerHTML = '';
          historyContainer.appendChild(this._createEmptyMessage('El historial ha sido limpiado.'));
        }
        
        // NO afectar las órdenes activas - mantener localStorage 'orders' intacto
        // Las órdenes activas deben permanecer en su interfaz
      }
    );
  }

  _showConfirmationModal(title, message, onConfirm) {
    const modalBackdrop = this._createElement('div', 'modal-backdrop');
    const modalContent = this._createElement('div', 'modal-content');
    
    const modalTitle = this._createElement('h3');
    modalTitle.textContent = title;
    
    const modalMessage = this._createElement('p');
    modalMessage.textContent = message;
    Object.assign(modalMessage.style, {
      textAlign: 'center',
      marginBottom: '20px',
      color: 'var(--text-color)'
    });
    
    const modalActions = this._createElement('div', 'modal-actions');
    const buttons = [
      { text: 'Aceptar', handler: () => { onConfirm(); this._removeModal(modalBackdrop); } },
      { text: 'Cancelar', handler: () => this._removeModal(modalBackdrop) }
    ];
    
    buttons.forEach(({ text, handler }) => {
      const btn = this._createElement('button', 'nav-button');
      btn.textContent = text;
      btn.addEventListener('click', handler);
      modalActions.appendChild(btn);
    });
    
    [modalTitle, modalMessage, modalActions].forEach(el => modalContent.appendChild(el));
    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);
  }

  _removeModal(modalBackdrop) {
    document.body.removeChild(modalBackdrop);
  }

  hideOrdersScreen() {
    const elements = {
      contentContainer: document.getElementById('content-container'),
      ordersScreen: document.querySelector('.orders-screen'),
      hamburgerBtn: document.getElementById('hamburger-btn')
    };
    
    elements.hamburgerBtn.style.display = 'block';
    elements.ordersScreen.style.display = 'none';
    elements.contentContainer.style.display = 'block';
    
    if (this.previousCategory && window.AppInit) {
      window.AppInit.loadContent(this.previousCategory);
    }
  }
}

// Wait for AppInit to be ready before initializing OrderSystem
let orderSystemInitialized = false;

function initializeOrderSystem() {
  if (orderSystemInitialized) {
    console.log('⚠️ OrderSystem already initialized, skipping...');
    return;
  }
  
  try {
    const orderSystem = new OrderSystem();
    orderSystem.initialize();
    orderSystemInitialized = true;
    console.log('✅ OrderSystem initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OrderSystem:', error);
    // Retry after a short delay
    setTimeout(initializeOrderSystem, 100);
  }
}

// Check if AppInit is already available, otherwise wait for it
if (window.AppInit && window.DIContainer) {
  initializeOrderSystem();
} else {
  // Listen for AppInit completion
  document.addEventListener('app-init-complete', initializeOrderSystem);
  
  // Fallback: try after DOMContentLoaded with a delay
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeOrderSystem, 500);
  });
}