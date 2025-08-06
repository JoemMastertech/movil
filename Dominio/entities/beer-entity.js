import { BaseEntity } from '../../Shared/base/BaseEntity.js';
<<<<<<< HEAD
import Validator from '../../Shared/utils/validator.js';
import { formatProductName, formatPrice } from '../../Shared/utils/formatters.js';

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
=======

class BeerEntity extends BaseEntity {
  constructor(id, nombre, imagen, precio) {
    super({ id, nombre, imagen, precio });
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
    this.type = 'beer';
    this.category = 'bebida';
  }

<<<<<<< HEAD
  // Eliminamos validateSpecific ya que usamos el validator unificado
=======
  validateSpecific() {
    super.validateSpecific();
    
    // Validaciones específicas de cerveza si son necesarias
    if (this.imagen && typeof this.imagen !== 'string') {
      throw new ValidationError('La imagen debe ser una URL válida');
    }
  }
>>>>>>> 34752f30846b6a9c833ec3d7880f20e981ac47c4
}

export { BeerEntity };