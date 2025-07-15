class OrderSystemCore {
  constructor() {
    this.items = [];
    this.idCounter = 0;
  }

  addProduct(itemData) {
    if (!itemData || typeof itemData !== 'object') {
      throw new Error('Invalid item data provided');
    }
    
    const newItem = {
      ...itemData,
      id: this.generateUniqueId(),
      addedAt: new Date().toISOString()
    };
    this.items.push(newItem);
    return newItem;
  }

  /**
   * Generate unique ID for order items
   * @returns {string} Unique identifier
   */
  generateUniqueId() {
    this.idCounter++;
    return `order_${Date.now()}_${this.idCounter}`;
  }

  removeItem(itemId) {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== itemId);
    
    return this.items.length < initialLength; // Return true if item was removed
  }

  getTotal() {
    return this.items.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
  }

  getItems() {
    return [...this.items]; // Return a copy to prevent direct manipulation
  }

  getItemCount() {
    return this.items.length;
  }

  findItemById(itemId) {
    return this.items.find(item => item.id === itemId) || null;
  }

  clearItems() {
    const clearedCount = this.items.length;
    this.items = [];
    this.idCounter = 0; // Reset counter
    return clearedCount;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

export default OrderSystemCore;