/**
 * Modelo de datos para Trámites
 * Clase que representa un trámite en el sistema
 */
class Tramite {
  /**
   * Constructor de la clase Tramite
   * @param {Object} data - Datos del trámite
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.codigo = data.codigo || '';
    this.nombre = data.nombre || '';
    this.descripcion = data.descripcion || '';
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    this.estado = data.estado || 'activo';
    this.observaciones = data.observaciones || '';
  }

  /**
   * Genera un ID único para el trámite
   * @returns {string} ID único
   */
  generateId() {
    return (
      'tramite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = ['codigo', 'nombre', 'descripcion'];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Obtiene la etiqueta legible de un campo
   * @param {string} field - Nombre del campo
   * @returns {string} Etiqueta del campo
   */
  getFieldLabel(field) {
    const labels = {
      codigo: 'Código del trámite',
      nombre: 'Nombre del trámite',
      descripcion: 'Descripción del trámite',
    };
    return labels[field] || field;
  }

  /**
   * Convierte el objeto a un formato JSON
   * @returns {Object} Objeto JSON del trámite
   */
  toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      descripcion: this.descripcion,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion,
      estado: this.estado,
      observaciones: this.observaciones,
    };
  }

  /**
   * Actualiza los datos del trámite
   * @param {Object} newData - Nuevos datos
   */
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = newData[key];
      }
    });
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Verifica si el trámite está activo
   * @returns {boolean} True si está activo
   */
  isActivo() {
    return this.estado === 'activo';
  }

  /**
   * Crea un trámite desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Tramite} Nueva instancia del trámite
   */
  static fromFormData(formData) {
    return new Tramite({
      codigo: formData.codigoTramite,
      nombre: formData.nombreTramite,
      descripcion: formData.descripcionTramite,
    });
  }
}
