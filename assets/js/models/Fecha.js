/**
 * Modelo de datos para Fechas de Trámites
 * Clase que representa un registro de fechas asociado a un trámite
 */
class Fecha {
  /**
   * Constructor de la clase Fecha
   * @param {Object} data - Datos de la fecha
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.tramiteId = data.tramiteId || '';
    this.fechaInicio = data.fechaInicio || '';
    this.fechaFinalizacion = data.fechaFinalizacion || '';
    this.fechaInicioSubsanacion = data.fechaInicioSubsanacion || '';
    this.fechaFinSubsanacion = data.fechaFinSubsanacion || '';
    this.fechaCambio = data.fechaCambio || new Date().toISOString();
    this.usuario = data.usuario || 'Usuario';
    this.motivo = data.motivo || '';
    this.observaciones = data.observaciones || '';
    this.tipoCambio = data.tipoCambio || 'manual'; // manual, automático, sistema
    this.estado = data.estado || 'activo'; // activo, inactivo, pendiente
  }

  /**
   * Genera un ID único para la fecha
   * @returns {string} ID único
   */
  generateId() {
    return (
      'fecha_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = [
      'tramiteId',
      'fechaInicio',
      'fechaFinalizacion',
      'fechaInicioSubsanacion',
      'fechaFinSubsanacion',
    ];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    // Validar lógica de fechas si están presentes
    if (this.fechaInicio && this.fechaFinalizacion) {
      if (new Date(this.fechaInicio) >= new Date(this.fechaFinalizacion)) {
        errors.push(
          'La fecha de finalización debe ser posterior a la fecha de inicio'
        );
      }
    }

    if (this.fechaInicioSubsanacion && this.fechaFinSubsanacion) {
      if (
        new Date(this.fechaInicioSubsanacion) >=
        new Date(this.fechaFinSubsanacion)
      ) {
        errors.push(
          'La fecha fin de subsanación debe ser posterior a la fecha inicio de subsanación'
        );
      }
    }

    if (this.fechaFinalizacion && this.fechaInicioSubsanacion) {
      if (
        new Date(this.fechaInicioSubsanacion) <=
        new Date(this.fechaFinalizacion)
      ) {
        errors.push(
          'La fecha de inicio de subsanación debe ser posterior a la fecha de finalización del trámite'
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
      tramiteId: 'ID del trámite',
      fechaInicio: 'Fecha de inicio',
      fechaFinalizacion: 'Fecha de finalización',
      fechaInicioSubsanacion: 'Fecha inicio de subsanación',
      fechaFinSubsanacion: 'Fecha fin de subsanación',
      fechaCambio: 'Fecha de cambio',
      usuario: 'Usuario',
      motivo: 'Motivo del cambio',
      observaciones: 'Observaciones',
      tipoCambio: 'Tipo de cambio',
      estado: 'Estado',
    };
    return labels[field] || field;
  }

  /**
   * Convierte el objeto a un formato JSON
   * @returns {Object} Objeto JSON de la fecha
   */
  toJSON() {
    return {
      id: this.id,
      tramiteId: this.tramiteId,
      fechaInicio: this.fechaInicio,
      fechaFinalizacion: this.fechaFinalizacion,
      fechaInicioSubsanacion: this.fechaInicioSubsanacion,
      fechaFinSubsanacion: this.fechaFinSubsanacion,
      fechaCambio: this.fechaCambio,
      usuario: this.usuario,
      motivo: this.motivo,
      observaciones: this.observaciones,
      tipoCambio: this.tipoCambio,
      estado: this.estado,
    };
  }

  /**
   * Actualiza los datos de la fecha
   * @param {Object} newData - Nuevos datos
   */
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = newData[key];
      }
    });
    this.fechaCambio = new Date().toISOString();
  }

  /**
   * Obtiene la duración del trámite en días
   * @returns {number} Duración en días
   */
  getDuracionTramite() {
    if (!this.fechaInicio || !this.fechaFinalizacion) {
      return 0;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFinalizacion);
    const diffTime = Math.abs(fin - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene la duración del periodo de subsanación en días
   * @returns {number} Duración en días
   */
  getDuracionSubsanacion() {
    if (!this.fechaInicioSubsanacion || !this.fechaFinSubsanacion) {
      return 0;
    }

    const inicio = new Date(this.fechaInicioSubsanacion);
    const fin = new Date(this.fechaFinSubsanacion);
    const diffTime = Math.abs(fin - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si el trámite está activo en una fecha específica
   * @param {Date|string} fecha - Fecha a verificar
   * @returns {boolean} True si está activo
   */
  isTramiteActivo(fecha = new Date()) {
    if (!this.fechaInicio || !this.fechaFinalizacion) {
      return false;
    }

    const fechaVerificar = new Date(fecha);
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFinalizacion);

    return fechaVerificar >= inicio && fechaVerificar <= fin;
  }

  /**
   * Verifica si el trámite está en periodo de subsanación en una fecha específica
   * @param {Date|string} fecha - Fecha a verificar
   * @returns {boolean} True si está en subsanación
   */
  isEnSubsanacion(fecha = new Date()) {
    if (!this.fechaInicioSubsanacion || !this.fechaFinSubsanacion) {
      return false;
    }

    const fechaVerificar = new Date(fecha);
    const inicioSub = new Date(this.fechaInicioSubsanacion);
    const finSub = new Date(this.fechaFinSubsanacion);

    return fechaVerificar >= inicioSub && fechaVerificar <= finSub;
  }

  /**
   * Obtiene el estado del trámite basado en las fechas
   * @param {Date|string} fecha - Fecha de referencia
   * @returns {string} Estado del trámite
   */
  getEstadoPorFechas(fecha = new Date()) {
    if (
      !this.fechaInicio ||
      !this.fechaFinalizacion ||
      !this.fechaInicioSubsanacion ||
      !this.fechaFinSubsanacion
    ) {
      return 'sin_fechas';
    }

    const fechaVerificar = new Date(fecha);
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFinalizacion);
    const inicioSub = new Date(this.fechaInicioSubsanacion);
    const finSub = new Date(this.fechaFinSubsanacion);

    if (fechaVerificar < inicio) {
      return 'pendiente';
    } else if (fechaVerificar >= inicio && fechaVerificar <= fin) {
      return 'activo';
    } else if (fechaVerificar >= inicioSub && fechaVerificar <= finSub) {
      return 'subsanación';
    } else if (fechaVerificar > finSub) {
      return 'finalizado';
    } else {
      return 'activo';
    }
  }

  /**
   * Verifica si las fechas están en el futuro
   * @returns {boolean} True si todas las fechas están en el futuro
   */
  isFechasFuturas() {
    const ahora = new Date();
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFinalizacion);
    const inicioSub = new Date(this.fechaInicioSubsanacion);
    const finSub = new Date(this.fechaFinSubsanacion);

    return inicio > ahora && fin > ahora && inicioSub > ahora && finSub > ahora;
  }

  /**
   * Verifica si las fechas están en el pasado
   * @returns {boolean} True si todas las fechas están en el pasado
   */
  isFechasPasadas() {
    const ahora = new Date();
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFinalizacion);
    const inicioSub = new Date(this.fechaInicioSubsanacion);
    const finSub = new Date(this.fechaFinSubsanacion);

    return inicio < ahora && fin < ahora && inicioSub < ahora && finSub < ahora;
  }

  /**
   * Obtiene el número de días restantes hasta el inicio del trámite
   * @param {Date|string} fecha - Fecha de referencia
   * @returns {number} Días restantes
   */
  getDiasRestantesInicio(fecha = new Date()) {
    if (!this.fechaInicio) {
      return 0;
    }

    const fechaVerificar = new Date(fecha);
    const inicio = new Date(this.fechaInicio);
    const diffTime = inicio - fechaVerificar;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el número de días restantes hasta el fin del trámite
   * @param {Date|string} fecha - Fecha de referencia
   * @returns {number} Días restantes
   */
  getDiasRestantesFin(fecha = new Date()) {
    if (!this.fechaFinalizacion) {
      return 0;
    }

    const fechaVerificar = new Date(fecha);
    const fin = new Date(this.fechaFinalizacion);
    const diffTime = fin - fechaVerificar;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el número de días restantes hasta el fin de subsanación
   * @param {Date|string} fecha - Fecha de referencia
   * @returns {number} Días restantes
   */
  getDiasRestantesSubsanacion(fecha = new Date()) {
    if (!this.fechaFinSubsanacion) {
      return 0;
    }

    const fechaVerificar = new Date(fecha);
    const finSub = new Date(this.fechaFinSubsanacion);
    const diffTime = finSub - fechaVerificar;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
   * Formatea una fecha y hora para mostrar
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha y hora formateada
   */
  formatDateTime(fecha) {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return fecha;
    }
  }

  /**
   * Obtiene la información resumida de las fechas
   * @returns {string} Información resumida
   */
  getResumen() {
    return `Inicio: ${this.formatDate(
      this.fechaInicio
    )} | Fin: ${this.formatDate(
      this.fechaFinalizacion
    )} | Subsanación: ${this.formatDate(
      this.fechaInicioSubsanacion
    )} - ${this.formatDate(this.fechaFinSubsanacion)}`;
  }

  /**
   * Obtiene la información completa de las fechas
   * @returns {string} Información completa
   */
  getInformacionCompleta() {
    return `
      Fecha de Inicio: ${this.formatDate(this.fechaInicio)}
      Fecha de Finalización: ${this.formatDate(this.fechaFinalizacion)}
      Fecha Inicio Subsanación: ${this.formatDate(this.fechaInicioSubsanacion)}
      Fecha Fin Subsanación: ${this.formatDate(this.fechaFinSubsanacion)}
      Duración del Trámite: ${this.getDuracionTramite()} días
      Duración de Subsanación: ${this.getDuracionSubsanacion()} días
      Estado: ${this.getEstadoPorFechas()}
      Usuario: ${this.usuario}
      Fecha de Cambio: ${this.formatDateTime(this.fechaCambio)}
      Tipo de Cambio: ${this.tipoCambio}
      Motivo: ${this.motivo || 'No especificado'}
      Observaciones: ${this.observaciones || 'Ninguna'}
    `.trim();
  }

  /**
   * Crea una fecha desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Fecha} Nueva instancia de la fecha
   */
  static fromFormData(formData) {
    return new Fecha({
      tramiteId: formData.tramiteId,
      fechaInicio: formData.fechaInicio,
      fechaFinalizacion: formData.fechaFinalizacion,
      fechaInicioSubsanacion: formData.fechaInicioSubsanacion,
      fechaFinSubsanacion: formData.fechaFinSubsanacion,
      usuario: formData.usuario || 'Usuario',
      motivo: formData.motivo || '',
      observaciones: formData.observaciones || '',
      tipoCambio: formData.tipoCambio || 'manual',
    });
  }

  /**
   * Crea una fecha de ejemplo
   * @param {string} tramiteId - ID del trámite
   * @returns {Fecha} Fecha de ejemplo
   */
  static createSample(tramiteId) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 30);

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 60);

    const fechaInicioSub = new Date(fechaFin);
    fechaInicioSub.setDate(fechaInicioSub.getDate() + 1);

    const fechaFinSub = new Date(fechaInicioSub);
    fechaFinSub.setDate(fechaFinSub.getDate() + 15);

    return new Fecha({
      tramiteId,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFinalizacion: fechaFin.toISOString().split('T')[0],
      fechaInicioSubsanacion: fechaInicioSub.toISOString().split('T')[0],
      fechaFinSubsanacion: fechaFinSub.toISOString().split('T')[0],
      usuario: 'Usuario Ejemplo',
      motivo: 'Configuración inicial de fechas',
      observaciones: 'Fechas de ejemplo para demostración',
      tipoCambio: 'manual',
    });
  }
}
