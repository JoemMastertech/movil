import { BaseEntity } from '../../Shared/base/BaseEntity.js';
<<<<<<< HEAD
import Validator from '../../Shared/utils/validator.js';
import { formatProductName, formatIngredients, formatPrice } from '../../Shared/utils/formatters.js';

/**
 * Entidad Cocktail - Representa un cóctel en el dominio
 * Usa validators y formatters unificados para simplicidad
=======

/**
 * Entidad Cocktail - Representa un cóctel en el dominio
 * Extiende BaseEntity para reutilizar validación común
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
 * 
 * @extends BaseEntity
 */
class CocktailEntity extends BaseEntity {
<<<<<<< HEAD
  constructor(id, nombre, ingredientes, video, precio) {
    // Formatear datos antes de crear la entidad
    const formattedData = {
      id,
      nombre: formatProductName(nombre),
      ingredientes: formatIngredients(ingredientes),
      video,
      precio: formatPrice(precio)
    };
    
    // Validar usando el validator unificado
    const validation = Validator.validateCocktail(formattedData);
    Validator.throwIfInvalid(validation, 'Cóctel');
    
    super(formattedData);
=======
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
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    this.type = 'cocktail';
    this.category = 'bebida';
  }

<<<<<<< HEAD
  // Eliminamos validateSpecific ya que usamos el validator unificado
=======
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
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

export { CocktailEntity };