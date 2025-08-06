import { BaseEntity } from '../../Shared/base/BaseEntity.js';
// Global utilities are now available via window object
// Validator, formatProductName, formatPrice are available globally

class BeerEntity extends BaseEntity {
  constructor(id, nombre, imagen, precio) {
    // Formatear datos antes de crear la entidad
    const formattedData = {
      id,
      nombre: formatProductName(nombre),
      imagen,
      precio: formatPrice(precio)
    };
    
    // Validar usando el validator unificado
    const validation = Validator.validateBeer(formattedData);
    Validator.throwIfInvalid(validation, 'Cerveza');
    
    super(formattedData);
    this.type = 'beer';
    this.category = 'bebida';
  }

  // Eliminamos validateSpecific ya que usamos el validator unificado
}

export { BeerEntity };