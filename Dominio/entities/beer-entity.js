import { BaseEntity } from '../../Shared/base/BaseEntity.js';

class BeerEntity extends BaseEntity {
  constructor(id, nombre, imagen, precio) {
    super({ id, nombre, imagen, precio });
    this.type = 'beer';
    this.category = 'bebida';
  }

  validateSpecific() {
    super.validateSpecific();
    
    // Validaciones específicas de cerveza si son necesarias
    if (this.imagen && typeof this.imagen !== 'string') {
      throw new ValidationError('La imagen debe ser una URL válida');
    }
  }
}

export { BeerEntity };