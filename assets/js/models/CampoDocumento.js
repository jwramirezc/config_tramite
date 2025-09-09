/**
 * Modelo de datos para Campos de Documentos
 * Clase que representa un campo personalizado de un documento
 */
class CampoDocumento {
  /**
   * Constructor de la clase CampoDocumento
   * @param {Object} data - Datos del campo
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.documentoId = data.documentoId || '';
    this.nombreCampo = data.nombreCampo || '';
    this.tipoCampo = data.tipoCampo || 'linea_texto';
    this.obligatorio = data.obligatorio || 'No';
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    this.estado = data.estado || 'activo';
    this.version = data.version || '1.0';
  }

  /**
   * Genera un ID único para el campo
   * @returns {string} ID único
   */
  generateId() {
    return (
      'campo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = [
      'documentoId',
      'nombreCampo',
      'tipoCampo',
      'obligatorio',
    ];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${field} es requerido`);
      }
    });

    // Validaciones específicas
    if (this.nombreCampo && this.nombreCampo.length < 2) {
      errors.push('El nombre del campo debe tener al menos 2 caracteres');
    }

    if (this.nombreCampo && this.nombreCampo.length > 100) {
      errors.push('El nombre del campo no puede exceder 100 caracteres');
    }

    const tiposValidos = ['linea_texto', 'fecha', 'numerico'];
    if (this.tipoCampo && !tiposValidos.includes(this.tipoCampo)) {
      errors.push(
        'El tipo de campo debe ser: línea de texto, fecha o numérico'
      );
    }

    const obligatorioValidos = ['Sí', 'No'];
    if (this.obligatorio && !obligatorioValidos.includes(this.obligatorio)) {
      errors.push('El campo obligatorio debe ser: Sí o No');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Valida los datos para crear un campo desde formulario
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validateCrearCampo() {
    const errors = [];
    const requiredFields = ['nombreCampo', 'tipoCampo', 'obligatorio'];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${field} es requerido`);
      }
    });

    // Validaciones específicas
    if (this.nombreCampo && this.nombreCampo.length < 2) {
      errors.push('El nombre del campo debe tener al menos 2 caracteres');
    }

    if (this.nombreCampo && this.nombreCampo.length > 100) {
      errors.push('El nombre del campo no puede exceder 100 caracteres');
    }

    const tiposValidos = ['linea_texto', 'fecha', 'numerico'];
    if (this.tipoCampo && !tiposValidos.includes(this.tipoCampo)) {
      errors.push(
        'El tipo de campo debe ser: línea de texto, fecha o numérico'
      );
    }

    const obligatorioValidos = ['Sí', 'No'];
    if (this.obligatorio && !obligatorioValidos.includes(this.obligatorio)) {
      errors.push('El campo obligatorio debe ser: Sí o No');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Actualiza la fecha de modificación
   */
  updateModificationDate() {
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Convierte el objeto a JSON
   * @returns {Object} Objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      documentoId: this.documentoId,
      nombreCampo: this.nombreCampo,
      tipoCampo: this.tipoCampo,
      obligatorio: this.obligatorio,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion,
      estado: this.estado,
      version: this.version,
    };
  }

  /**
   * Crea un campo desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @param {string} documentoId - ID del documento
   * @returns {CampoDocumento} Nueva instancia del campo
   */
  static fromFormData(formData, documentoId) {
    return new CampoDocumento({
      documentoId: documentoId,
      nombreCampo: formData.nombreCampo,
      tipoCampo: formData.tipoCampo,
      obligatorio: formData.obligatorio,
      estado: 'activo',
      version: '1.0',
    });
  }

  /**
   * Crea un campo de ejemplo
   * @param {string} documentoId - ID del documento
   * @returns {CampoDocumento} Campo de ejemplo
   */
  static createExample(documentoId) {
    return new CampoDocumento({
      documentoId: documentoId,
      nombreCampo: 'Campo de Ejemplo',
      tipoCampo: 'linea_texto',
      obligatorio: 'No',
      estado: 'activo',
      version: '1.0',
    });
  }

  /**
   * Obtiene el nombre legible del tipo de campo
   * @returns {string} Nombre legible del tipo
   */
  getTipoCampoLegible() {
    const tipos = {
      linea_texto: 'Línea de Texto',
      fecha: 'Fecha',
      numerico: 'Numérico',
    };
    return tipos[this.tipoCampo] || this.tipoCampo;
  }

  /**
   * Obtiene el icono del tipo de campo
   * @returns {string} Clase del icono
   */
  getTipoCampoIcono() {
    const iconos = {
      linea_texto: 'fas fa-font',
      fecha: 'fas fa-calendar-alt',
      numerico: 'fas fa-hashtag',
    };
    return iconos[this.tipoCampo] || 'fas fa-question';
  }

  /**
   * Obtiene el color del badge para el tipo de campo
   * @returns {string} Clase del badge
   */
  getTipoCampoBadgeColor() {
    const colores = {
      linea_texto: 'bg-primary',
      fecha: 'bg-info',
      numerico: 'bg-success',
    };
    return colores[this.tipoCampo] || 'bg-secondary';
  }
}
