import { BaseEntity } from '../../Shared/base/BaseEntity.js';

/**
 * Entidad Cocktail - Representa un cóctel en el dominio
 * Extiende BaseEntity para reutilizar validación común
 * 
 * @extends BaseEntity
 */
class CocktailEntity extends BaseEntity {
  /**
   * Constructor para CocktailEntity
   * @param {string} id - ID único del cóctel
   * @param {string} nombre - Nombre del cóctel
   * @param {Array} ingredientes - Lista de ingredientes del cóctel
   * @param {string} video - URL del video del cóctel
   * @param {number} precio - Precio del cóctel
   */
  constructor(id, nombre, ingredientes, video, precio) {
    super({ id, nombre, ingredientes, video, precio });
    this.type = 'cocktail';
    this.category = 'bebida';
  }

  /**
   * Validaciones específicas para cóctel
   * Complementa las validaciones base
   */
  validateSpecific() {
    super.validateSpecific();
    
    // Validaciones específicas de cóctel si son necesarias
    if (this.video && typeof this.video !== 'string') {
      throw new ValidationError('El video debe ser una URL válida');
    }
    
    if (this.ingredientes && !Array.isArray(this.ingredientes)) {
      throw new ValidationError('Los ingredientes deben ser un array');
    }
  }
}

export { CocktailEntity };