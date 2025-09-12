/**
 * Modelo de datos para Habilitar Trámites
 * Clase que representa una configuración de trámite habilitado
 */
class HabilitarTramite {
  /**
   * Constructor de la clase HabilitarTramite
   * @param {Object} data - Datos del trámite habilitado
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.periodoAcademico = data.periodoAcademico || '';
    this.semestre = data.semestre || '';
    this.sede = data.sede || '';
    this.tramiteId = data.tramiteId || '';
    this.tramiteNombre = data.tramiteNombre || '';
    this.fechaInicio = data.fechaInicio || '';
    this.fechaFinalizacion = data.fechaFinalizacion || '';
    this.fechaInicioCorreccion = data.fechaInicioCorreccion || '';
    this.fechaFinCorreccion = data.fechaFinCorreccion || '';
    this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    this.estado = data.estado || 'Activo';
  }

  /**
   * Genera un ID único para el trámite habilitado
   * @returns {string} ID único
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `habilitar_tramite_${timestamp}_${random}`;
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = [
      'periodoAcademico',
      'sede',
      'tramiteId',
      'fechaInicio',
      'fechaFinalizacion',
      'fechaInicioCorreccion',
      'fechaFinCorreccion',
    ];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    // Validación de relación con trámite
    if (this.tramiteId && !this.tramiteNombre) {
      errors.push(
        'El nombre del trámite es requerido cuando se especifica el ID'
      );
    }

    // Validaciones específicas de fechas
    if (this.fechaInicio && this.fechaFinalizacion) {
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFinalizacion = new Date(this.fechaFinalizacion);

      if (fechaInicio >= fechaFinalizacion) {
        errors.push(
          'La fecha de inicio debe ser anterior a la fecha de finalización'
        );
      }
    }

    if (this.fechaInicioCorreccion && this.fechaFinCorreccion) {
      const fechaInicioCorreccion = new Date(this.fechaInicioCorreccion);
      const fechaFinCorreccion = new Date(this.fechaFinCorreccion);

      if (fechaInicioCorreccion >= fechaFinCorreccion) {
        errors.push(
          'La fecha de inicio de corrección debe ser anterior a la fecha de fin de corrección'
        );
      }
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
      periodoAcademico: 'Periodo Académico',
      sede: 'Sede',
      tramiteId: 'Trámite',
      fechaInicio: 'Fecha de Inicio',
      fechaFinalizacion: 'Fecha de Finalización',
      fechaInicioCorreccion: 'Fecha de Inicio de Corrección',
      fechaFinCorreccion: 'Fecha de Fin de Corrección',
    };
    return labels[field] || field;
  }

  /**
   * Convierte el objeto a un formato JSON
   * @returns {Object} Objeto JSON del trámite habilitado
   */
  toJSON() {
    return {
      id: this.id,
      periodoAcademico: this.periodoAcademico,
      semestre: this.semestre,
      sede: this.sede,
      tramiteId: this.tramiteId,
      tramiteNombre: this.tramiteNombre,
      fechaInicio: this.fechaInicio,
      fechaFinalizacion: this.fechaFinalizacion,
      fechaInicioCorreccion: this.fechaInicioCorreccion,
      fechaFinCorreccion: this.fechaFinCorreccion,
      fechaModificacion: this.fechaModificacion,
      estado: this.estado,
    };
  }

  /**
   * Actualiza los datos del trámite habilitado
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
   * Verifica si el trámite habilitado está activo
   * @returns {boolean} True si está activo
   */
  isActivo() {
    return this.estado === 'Activo';
  }

  /**
   * Crea un trámite habilitado desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {HabilitarTramite} Nueva instancia del trámite habilitado
   */
  static fromFormData(formData) {
    return new HabilitarTramite({
      periodoAcademico: formData.periodoAcademico,
      semestre: formData.semestre,
      sede: formData.sede,
      tramiteId: formData.tramiteId,
      tramiteNombre: formData.tramiteNombre,
      fechaInicio: formData.fechaInicio,
      fechaFinalizacion: formData.fechaFinalizacion,
      fechaInicioCorreccion: formData.fechaInicioCorreccion,
      fechaFinCorreccion: formData.fechaFinCorreccion,
      estado: 'Activo', // Estado por defecto al crear desde formulario
    });
  }

  /**
   * Calcula el semestre basado en el periodo académico
   * @param {string} periodoAcademico - Periodo académico (ej: 2025-1, 2025-2)
   * @returns {string} Semestre calculado
   */
  static calcularSemestre(periodoAcademico) {
    if (!periodoAcademico) return '';

    const ultimoCaracter = periodoAcademico.slice(-1);
    return ultimoCaracter === '1' ? 'Semestre 1' : 'Semestre 2';
  }

  /**
   * Verifica si el trámite existe en el localStorage
   * @param {string} tramiteId - ID del trámite a verificar
   * @returns {Object|null} Datos del trámite si existe, null si no
   */
  static verificarTramiteExiste(tramiteId) {
    try {
      const tramitesData = localStorage.getItem('tramites_data');
      if (!tramitesData) return null;

      const tramites = JSON.parse(tramitesData);
      return tramites.find(tramite => tramite.id === tramiteId) || null;
    } catch (error) {
      console.error('❌ Error al verificar trámite:', error);
      return null;
    }
  }

  /**
   * Obtiene información completa del trámite relacionado
   * @returns {Object|null} Información del trámite o null si no existe
   */
  getTramiteRelacionado() {
    return HabilitarTramite.verificarTramiteExiste(this.tramiteId);
  }
}
