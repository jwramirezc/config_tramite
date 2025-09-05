/**
 * Modelo de datos para Documentos de Trámites
 * Clase que representa un documento asociado a un trámite
 */
class Documento {
  /**
   * Constructor de la clase Documento
   * @param {Object} data - Datos del documento
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.tramiteId = data.tramiteId || '';
    this.tramiteNombre = data.tramiteNombre || '';
    this.tipoDocumental = data.tipoDocumental || '';
    this.areaSolicitante = data.areaSolicitante || '';
    this.responsableValidacion = data.responsableValidacion || '';
    this.datosRequeridos = data.datosRequeridos || [];
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    this.estado = data.estado || 'activo';
    this.observaciones = data.observaciones || '';
    this.version = data.version || '1.0';
    this.tags = data.tags || [];

    // Nuevos campos para el formulario "Crear Documento"
    this.nombreDocumento = data.nombreDocumento || '';
    this.descripcionDocumento = data.descripcionDocumento || '';
    this.tipoFormatoEsperado = data.tipoFormatoEsperado || '';
    this.obligatoriedad = data.obligatoriedad || 'No';
    this.requiereAprobacion = data.requiereAprobacion || 'No';
    this.vigenciaEnDias = data.vigenciaEnDias || 0;
    this.permitePlazosAmpliados = data.permitePlazosAmpliados || 'No';
  }

  /**
   * Genera un ID único para el documento
   * @returns {string} ID único
   */
  generateId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = [
      'tramiteId',
      'tipoDocumental',
      'areaSolicitante',
      'responsableValidacion',
    ];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    // Validar que haya al menos un dato requerido
    if (!this.datosRequeridos || this.datosRequeridos.length === 0) {
      errors.push('Debe especificar al menos un dato requerido');
    }

    // Validar cada dato requerido
    if (this.datosRequeridos && this.datosRequeridos.length > 0) {
      this.datosRequeridos.forEach((dato, index) => {
        if (!dato.nombre || !dato.tipo) {
          errors.push(
            `El dato requerido #${index + 1} debe tener nombre y tipo`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Valida los campos específicos del formulario "Crear Documento"
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validateCrearDocumento() {
    console.log('🔍 Validando documento:', this);
    const errors = [];
    const requiredFields = [
      'nombreDocumento',
      'tipoDocumental',
      'descripcionDocumento',
      'tipoFormatoEsperado',
      'obligatoriedad',
      'requiereAprobacion',
      'vigenciaEnDias',
      'permitePlazosAmpliados',
    ];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    // Validar que vigenciaEnDias sea un número positivo
    if (
      this.vigenciaEnDias &&
      (isNaN(this.vigenciaEnDias) || this.vigenciaEnDias < 0)
    ) {
      errors.push('La vigencia en días debe ser un número positivo');
    }

    // Validar que obligatoriedad sea Sí o No
    if (this.obligatoriedad && !['Sí', 'No'].includes(this.obligatoriedad)) {
      errors.push('La obligatoriedad debe ser "Sí" o "No"');
    }

    // Validar que requiereAprobacion sea Sí o No
    if (
      this.requiereAprobacion &&
      !['Sí', 'No'].includes(this.requiereAprobacion)
    ) {
      errors.push('¿Requiere aprobación? debe ser "Sí" o "No"');
    }

    // Validar que permitePlazosAmpliados sea Sí o No
    if (
      this.permitePlazosAmpliados &&
      !['Sí', 'No'].includes(this.permitePlazosAmpliados)
    ) {
      errors.push('¿Permite plazos ampliados? debe ser "Sí" o "No"');
    }

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
      tramiteId: 'ID del trámite',
      tipoDocumental: 'Tipo documental',
      areaSolicitante: 'Área solicitante',
      responsableValidacion: 'Responsable de validación',
      datosRequeridos: 'Datos requeridos',
      version: 'Versión',
      tags: 'Etiquetas',
      nombreDocumento: 'Nombre del Documento',
      descripcionDocumento: 'Descripción del Documento',
      tipoFormatoEsperado: 'Tipo de Formato Esperado',
      obligatoriedad: 'Obligatoriedad',
      requiereAprobacion: '¿Requiere aprobación?',
      vigenciaEnDias: 'Vigencia en días',
      permitePlazosAmpliados: '¿Permite plazos ampliados?',
    };
    return labels[field] || field;
  }

  /**
   * Convierte el objeto a un formato JSON
   * @returns {Object} Objeto JSON del documento
   */
  toJSON() {
    return {
      id: this.id,
      tramiteId: this.tramiteId,
      tramiteNombre: this.tramiteNombre,
      tipoDocumental: this.tipoDocumental,
      areaSolicitante: this.areaSolicitante,
      responsableValidacion: this.responsableValidacion,
      datosRequeridos: this.datosRequeridos,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion,
      estado: this.estado,
      observaciones: this.observaciones,
      version: this.version,
      tags: this.tags,
      // Nuevos campos para el formulario "Crear Documento"
      nombreDocumento: this.nombreDocumento,
      descripcionDocumento: this.descripcionDocumento,
      tipoFormatoEsperado: this.tipoFormatoEsperado,
      obligatoriedad: this.obligatoriedad,
      requiereAprobacion: this.requiereAprobacion,
      vigenciaEnDias: this.vigenciaEnDias,
      permitePlazosAmpliados: this.permitePlazosAmpliados,
    };
  }

  /**
   * Actualiza los datos del documento
   * @param {Object} newData - Nuevos datos
   */
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        if (key === 'datosRequeridos' && Array.isArray(newData[key])) {
          this[key] = [...newData[key]];
        } else if (key === 'tags' && Array.isArray(newData[key])) {
          this[key] = [...newData[key]];
        } else {
          this[key] = newData[key];
        }
      }
    });
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Agrega un dato requerido al documento
   * @param {Object} datoRequerido - Dato requerido a agregar
   */
  agregarDatoRequerido(datoRequerido) {
    if (!this.datosRequeridos) {
      this.datosRequeridos = [];
    }

    if (datoRequerido.nombre && datoRequerido.tipo) {
      this.datosRequeridos.push({
        id: `dato_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nombre: datoRequerido.nombre,
        tipo: datoRequerido.tipo,
        mensajeAyuda: datoRequerido.mensajeAyuda || '',
        requerido: datoRequerido.requerido !== false,
        ...datoRequerido,
      });

      this.fechaModificacion = new Date().toISOString();
    }
  }

  /**
   * Remueve un dato requerido del documento
   * @param {string} datoId - ID del dato requerido
   * @returns {boolean} True si se removió exitosamente
   */
  removerDatoRequerido(datoId) {
    if (!this.datosRequeridos) {
      return false;
    }

    const index = this.datosRequeridos.findIndex(dato => dato.id === datoId);
    if (index !== -1) {
      this.datosRequeridos.splice(index, 1);
      this.fechaModificacion = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Actualiza un dato requerido existente
   * @param {string} datoId - ID del dato requerido
   * @param {Object} newData - Nuevos datos
   * @returns {boolean} True si se actualizó exitosamente
   */
  actualizarDatoRequerido(datoId, newData) {
    if (!this.datosRequeridos) {
      return false;
    }

    const dato = this.datosRequeridos.find(d => d.id === datoId);
    if (dato) {
      Object.assign(dato, newData);
      this.fechaModificacion = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Agrega una etiqueta al documento
   * @param {string} tag - Etiqueta a agregar
   */
  agregarTag(tag) {
    if (!this.tags) {
      this.tags = [];
    }

    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.fechaModificacion = new Date().toISOString();
    }
  }

  /**
   * Remueve una etiqueta del documento
   * @param {string} tag - Etiqueta a remover
   * @returns {boolean} True si se removió exitosamente
   */
  removerTag(tag) {
    if (!this.tags) {
      return false;
    }

    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      this.fechaModificacion = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Verifica si el documento tiene una etiqueta específica
   * @param {string} tag - Etiqueta a verificar
   * @returns {boolean} True si tiene la etiqueta
   */
  tieneTag(tag) {
    return this.tags && this.tags.includes(tag);
  }

  /**
   * Obtiene el número de datos requeridos
   * @returns {number} Número de datos requeridos
   */
  getNumeroDatosRequeridos() {
    return this.datosRequeridos ? this.datosRequeridos.length : 0;
  }

  /**
   * Obtiene los datos requeridos por tipo
   * @param {string} tipo - Tipo de dato
   * @returns {Array} Array de datos del tipo especificado
   */
  getDatosRequeridosPorTipo(tipo) {
    if (!this.datosRequeridos) {
      return [];
    }

    return this.datosRequeridos.filter(dato => dato.tipo === tipo);
  }

  /**
   * Obtiene los datos requeridos obligatorios
   * @returns {Array} Array de datos obligatorios
   */
  getDatosRequeridosObligatorios() {
    if (!this.datosRequeridos) {
      return [];
    }

    return this.datosRequeridos.filter(dato => dato.requerido !== false);
  }

  /**
   * Verifica si el documento está activo
   * @returns {boolean} True si está activo
   */
  isActivo() {
    return this.estado === 'activo';
  }

  /**
   * Activa el documento
   */
  activar() {
    this.estado = 'activo';
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Inactiva el documento
   */
  inactivar() {
    this.estado = 'inactivo';
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Obtiene la información resumida del documento
   * @returns {string} Información resumida
   */
  getResumen() {
    return `${this.tipoDocumental} - ${
      this.areaSolicitante
    } (${this.getNumeroDatosRequeridos()} campos)`;
  }

  /**
   * Obtiene la información completa del documento
   * @returns {string} Información completa
   */
  getInformacionCompleta() {
    return `
      Tipo: ${this.tipoDocumental}
      Área: ${this.areaSolicitante}
      Responsable: ${this.responsableValidacion}
      Datos requeridos: ${this.getNumeroDatosRequeridos()}
      Estado: ${this.estado}
      Versión: ${this.version}
      Etiquetas: ${this.tags.join(', ')}
      Creado: ${this.formatDate(this.fechaCreacion)}
      Modificado: ${this.formatDate(this.fechaModificacion)}
    `.trim();
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate(fecha) {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return fecha;
    }
  }

  /**
   * Crea un documento desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Documento} Nueva instancia del documento
   */
  static fromFormData(formData) {
    return new Documento({
      tramiteId: formData.tramiteId,
      tramiteNombre: formData.tramiteNombre,
      tipoDocumental: formData.tipoDocumental,
      areaSolicitante: formData.areaSolicitante,
      responsableValidacion: formData.responsableValidacion,
      datosRequeridos: formData.datosRequeridos || [],
      observaciones: formData.observaciones || '',
      tags: formData.tags || [],
    });
  }

  /**
   * Crea un documento desde datos del formulario "Crear Documento"
   * @param {Object} formData - Datos del formulario
   * @returns {Documento} Nueva instancia del documento
   */
  static fromCrearDocumentoFormData(formData) {
    return new Documento({
      nombreDocumento: formData.nombreDocumento,
      tipoDocumental: formData.tipoDocumental,
      descripcionDocumento: formData.descripcionDocumento,
      tipoFormatoEsperado: formData.tipoFormatoEsperado,
      obligatoriedad: formData.obligatoriedad,
      requiereAprobacion: formData.requiereAprobacion,
      vigenciaEnDias: parseInt(formData.vigenciaEnDias) || 0,
      permitePlazosAmpliados: formData.permitePlazosAmpliados,
      estado: 'activo',
      version: '1.0',
      tags: [],
    });
  }

  /**
   * Crea un documento de ejemplo
   * @param {string} tramiteId - ID del trámite
   * @param {string} tramiteNombre - Nombre del trámite
   * @returns {Documento} Documento de ejemplo
   */
  static createSample(tramiteId, tramiteNombre) {
    return new Documento({
      tramiteId,
      tramiteNombre,
      tipoDocumental: 'Solicitud',
      areaSolicitante: 'Académica',
      responsableValidacion: 'Dr. Juan Pérez',
      datosRequeridos: [
        {
          id: 'dato_1',
          nombre: 'Nombre completo',
          tipo: 'texto',
          mensajeAyuda:
            'Ingrese su nombre completo tal como aparece en su documento de identidad',
          requerido: true,
        },
        {
          id: 'dato_2',
          nombre: 'Fecha de nacimiento',
          tipo: 'fecha',
          mensajeAyuda: 'Seleccione su fecha de nacimiento',
          requerido: true,
        },
        {
          id: 'dato_3',
          nombre: 'Número de identificación',
          tipo: 'numerico',
          mensajeAyuda:
            'Ingrese su número de identificación sin puntos ni guiones',
          requerido: true,
        },
      ],
      tags: ['ejemplo', 'solicitud', 'académico'],
    });
  }
}
