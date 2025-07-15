import ProductRepositoryPort from '../../Dominio/ports/ProductRepositoryPort.js';
import ProductData from '../data-providers/product-data.js';
import MemoizationManager from '../../Shared/performance/MemoizationManager.js';
import BaseAdapter from './BaseAdapter.js';

/**
 * Product Data Adapter - Infrastructure implementation of ProductRepositoryPort
 * Adapts the existing ProductData to the domain port interface
 * Part of Hexagonal Architecture - Infrastructure layer adapter
 */
class ProductDataAdapter extends BaseAdapter {
  constructor() {
    super();
    this.productData = ProductData;
    this.port = new ProductRepositoryPort();
    
    // Initialize memoization for expensive data operations
    this.memoizedGetLicores = MemoizationManager.memoize(
      'productAdapter.getLicores',
      this._getLicoresInternal.bind(this),
      { ttl: 600000 } // 10 minutes cache
    );
    
    this.memoizedGetCocteles = MemoizationManager.memoize(
      'productAdapter.getCocteles',
      this._getCoctelesInternal.bind(this),
      { ttl: 600000 } // 10 minutes cache
    );
  }

  /**
   * Get all cocktails (memoized)
   * @returns {Array} Array of cocktail objects
   */
  getCocteles() {
    try {
      return this.memoizedGetCocteles();
    } catch (error) {
      ErrorHandler.handle(error, 'ProductDataAdapter.getCocteles');
      return this._getCoctelesInternal();
    }
  }

  /**
   * Get all beverages (refrescos)
   * @returns {Array} Array of beverage objects
   */
  getRefrescos() {
    return this.safeExecute(
      () => this.productData.refrescos || [],
      'getRefrescos'
    );
  }

  /**
   * Get all liquors (memoized)
   * @returns {Array} Array of liquor objects
   */
  getLicores() {
    try {
      return this.memoizedGetLicores();
    } catch (error) {
      ErrorHandler.handle(error, 'ProductDataAdapter.getLicores');
      return this._getLicoresInternal();
    }
  }

  /**
   * Internal method for getting cocktails (used by memoization)
   * @returns {Array} Array of cocktail objects
   * @private
   */
  _getCoctelesInternal() {
    return this.productData.cocteles || [];
  }

  /**
   * Internal method for getting liquors (used by memoization)
   * @returns {Array} Array of liquor objects
   * @private
   */
  _getLicoresInternal() {
    return this.productData.licores || [];
  }

  /**
   * Get all beers
   * @returns {Array} Array of beer objects
   */
  getCervezas() {
    return this.safeExecute(
      () => this.productData.cervezas || [],
      'getCervezas'
    );
  }

  /**
   * Get all pizzas
   * @returns {Array} Array of pizza objects
   */
  getPizzas() {
    return this.safeExecute(() => this.productData.pizzas || [], 'getPizzas');
  }

  /**
   * Get all wings (alitas)
   * @returns {Array} Array of wing objects
   */
  getAlitas() {
    return this.safeExecute(() => this.productData.alitas || [], 'getAlitas');
  }

  /**
   * Get all soups
   * @returns {Array} Array of soup objects
   */
  getSopas() {
    return this.safeExecute(() => this.productData.sopas || [], 'getSopas');
  }

  /**
   * Get all salads
   * @returns {Array} Array of salad objects
   */
  getEnsaladas() {
    return this.safeExecute(() => this.productData.ensaladas || [], 'getEnsaladas');
  }

  /**
   * Get all meats
   * @returns {Array} Array of meat objects
   */
  getCarnes() {
    return this.safeExecute(() => this.productData.carnes || [], 'getCarnes');
  }

  /**
   * Get all coffee products
   * @returns {Array} Array of coffee objects
   */
  getCafe() {
    return this.safeExecute(() => this.productData.cafes || [], 'getCafe');
  }

  /**
   * Get all desserts
   * @returns {Array} Array of dessert objects
   */
  getPostres() {
    return this.safeExecute(() => this.productData.postres || [], 'getPostres');
  }

  /**
   * Get product by ID
   * @param {string} id - Product identifier
   * @returns {Object|null} Product object or null if not found
   */
  getProductById(id) {
    // Search across all categories
    const categories = [
      'cocteles', 'refrescos', 'licores', 'cervezas',
      'pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes',
      'cafes', 'postres'
    ];

    for (const category of categories) {
      const products = this.productData[category] || [];
      const product = products.find(p => p.id === id);
      if (product) {
        return product;
      }
    }

    return null;
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Array} Array of products in the category
   */
  getProductsByCategory(category) {
    const normalizedCategory = category.toLowerCase();
    return this.productData[normalizedCategory] || [];
  }

  /**
   * Search products by name or ingredients
   * @param {string} query - Search query
   * @returns {Array} Array of matching products
   */
  searchProducts(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results = [];

    const categories = [
      'cocteles', 'refrescos', 'licores', 'cervezas',
      'pizzas', 'alitas', 'sopas', 'ensaladas', 'carnes',
      'cafes', 'postres'
    ];

    for (const category of categories) {
      const products = this.productData[category] || [];
      const matches = products.filter(product => {
        const nameMatch = product.nombre && product.nombre.toLowerCase().includes(searchTerm);
        const ingredientsMatch = product.ingredientes && product.ingredientes.toLowerCase().includes(searchTerm);
        return nameMatch || ingredientsMatch;
      });
      results.push(...matches);
    }

    return results;
  }

  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  getAvailableCategories() {
    return this.getStandardCategories();
  }

  /**
   * Get total count of products across all categories
   * @returns {number} Total number of products
   */
  getTotalProductCount() {
    const categories = this.getAvailableCategories();
    return categories.reduce((total, category) => {
      const products = this.productData[category] || [];
      return total + products.length;
    }, 0);
  }

  /**
   * Get liquor categories for navigation
   * @returns {Array} Array of liquor category objects
   */
  getLicoresCategories() {
    return this.productData.licoresCategories;
  }

  /**
   * Get products by liquor subcategory
   * @param {string} subcategory - Liquor subcategory (whiskies, tequilas, etc.)
   * @returns {Array} Array of products in the subcategory
   */
  getLiquorSubcategory(subcategory) {
    return this.productData[subcategory] || [];
  }


}

export default ProductDataAdapter;