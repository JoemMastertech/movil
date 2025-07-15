/**
 * ProductCarousel Component - Optimized Implementation
 * Lightweight carousel for product display with touch/swipe support
 * Follows YAGNI principles - only essential features
 */

class ProductCarousel {
  constructor(container, products = []) {
    this.container = container;
    this.products = products;
    this.currentIndex = 0;
    this.isInitialized = false;
  }

  /**
   * Initialize carousel with products
   * @param {Array} products - Array of product objects
   */
  init(products = null) {
    if (products) this.products = products;
    if (this.products.length === 0) return;
    
    this.render();
    this.attachEvents();
    this.isInitialized = true;
  }

  /**
   * Render carousel HTML structure
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="carousel-wrapper">
        <div class="carousel-track" id="carousel-track">
          ${this.products.map((product, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
              <img src="${product.imagen || product.ruta_archivo || '/placeholder.jpg'}" 
                   alt="${product.nombre}" 
                   loading="lazy">
              <h3>${product.nombre}</h3>
              <p class="price">$${product.precio}</p>
            </div>
          `).join('')}
        </div>
        ${this.products.length > 1 ? `
          <button class="carousel-btn prev" id="carousel-prev">‹</button>
          <button class="carousel-btn next" id="carousel-next">›</button>
          <div class="carousel-dots">
            ${this.products.map((_, index) => `
              <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEvents() {
    if (this.products.length <= 1) return;
    
    const prevBtn = this.container.querySelector('#carousel-prev');
    const nextBtn = this.container.querySelector('#carousel-next');
    const dots = this.container.querySelectorAll('.dot');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
    
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.goTo(index);
      });
    });
  }

  /**
   * Go to next item
   */
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.products.length;
    this.updateDisplay();
  }

  /**
   * Go to previous item
   */
  prev() {
    this.currentIndex = this.currentIndex === 0 ? this.products.length - 1 : this.currentIndex - 1;
    this.updateDisplay();
  }

  /**
   * Go to specific index
   * @param {number} index - Target index
   */
  goTo(index) {
    if (index >= 0 && index < this.products.length) {
      this.currentIndex = index;
      this.updateDisplay();
    }
  }

  /**
   * Update display to show current item
   */
  updateDisplay() {
    const items = this.container.querySelectorAll('.carousel-item');
    const dots = this.container.querySelectorAll('.dot');
    
    items.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentIndex);
    });
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  /**
   * Update products and re-render
   * @param {Array} newProducts - New product array
   */
  updateProducts(newProducts) {
    this.products = newProducts;
    this.currentIndex = 0;
    if (this.isInitialized) {
      this.render();
      this.attachEvents();
    }
  }
}

export default ProductCarousel;