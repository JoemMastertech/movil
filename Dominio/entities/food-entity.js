import { BaseEntity } from '../../Shared/base/BaseEntity.js';
<<<<<<< HEAD
import Validator from '../../Shared/utils/validator.js';
import { formatProductName, formatIngredients, formatPrice } from '../../Shared/utils/formatters.js';

/**
 * Entidad Food - Representa un alimento en el dominio
 * Usa validators y formatters unificados para simplicidad
=======

/**
 * Entidad Food - Representa un alimento en el dominio
 * Extiende BaseEntity para reutilizar validación común
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
 * 
 * @extends BaseEntity
 */
class FoodEntity extends BaseEntity {
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
    const validation = Validator.validateFood(formattedData);
    Validator.throwIfInvalid(validation, 'Comida');
    
    super(formattedData);
=======
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
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    this.type = 'food';
    this.category = 'comida';
  }

<<<<<<< HEAD
  // Eliminamos validateSpecific ya que usamos el validator unificado
=======
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
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

export { FoodEntity };