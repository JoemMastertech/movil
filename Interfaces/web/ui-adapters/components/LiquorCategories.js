/**
 * LiquorCategories.js
 * Semana 1, Día 5: Primera extracción conservadora
 * 
 * Función extraída de product-table.js sin modificaciones
 * Líneas originales: 806-819
 */

// Importar dependencias necesarias
import { getProductRepository } from '../../../core/product-repository.js';

export const LiquorCategories = {
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
  }
};