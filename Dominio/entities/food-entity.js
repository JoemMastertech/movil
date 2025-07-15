import { BaseEntity } from '../../Shared/base/BaseEntity.js';

/**
 * Entidad Food - Representa un alimento en el dominio
 * Extiende BaseEntity para reutilizar validación común
 * 
 * @extends BaseEntity
 */
class FoodEntity extends BaseEntity {
  /**
   * Constructor para FoodEntity
   * @param {string} id - ID único del alimento
   * @param {string} nombre - Nombre del alimento
   * @param {string} ingredientes - Ingredientes del alimento
   * @param {string} video - URL del video del alimento
   * @param {number} precio - Precio del alimento
   */
  constructor(id, nombre, ingredientes, video, precio) {
    super({ id, nombre, ingredientes, video, precio });
    this.type = 'food';
    this.category = 'comida';
  }

  /**
   * Validaciones específicas para alimento
   * Complementa las validaciones base
   */
  validateSpecific() {
    super.validateSpecific();
    
    // Validaciones específicas de alimento si son necesarias
    if (this.video && typeof this.video !== 'string') {
      throw new ValidationError('El video debe ser una URL válida');
    }
  }
}

export { FoodEntity };