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
    this.nombre = data.nombre || '';
    this.periodoAnio = data.periodoAnio || '';
    this.periodoSemestre = data.periodoSemestre || '';
    this.sede = data.sede || '';
    this.jornada = data.jornada || '';
    this.fechaInicio = data.fechaInicio || '';
    this.fechaFinalizacion = data.fechaFinalizacion || '';
    this.fechaInicioSubsanacion = data.fechaInicioSubsanacion || '';
    this.fechaFinSubsanacion = data.fechaFinSubsanacion || '';
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    this.estado = data.estado || 'activo';
    this.observaciones = data.observaciones || '';
    this.historialFechas = data.historialFechas || [];
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
    const requiredFields = [
      'nombre',
      'periodoAnio',
      'periodoSemestre',
      'sede',
      'jornada',
    ];

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
      nombre: 'Nombre del trámite',
      periodoAnio: 'Año del periodo',
      periodoSemestre: 'Semestre del periodo',
      sede: 'Sede',
      jornada: 'Jornada',
      fechaInicio: 'Fecha de inicio',
      fechaFinalizacion: 'Fecha de finalización',
      fechaInicioSubsanacion: 'Fecha inicio de subsanación',
      fechaFinSubsanacion: 'Fecha fin de subsanación',
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
      nombre: this.nombre,
      periodoAnio: this.periodoAnio,
      periodoSemestre: this.periodoSemestre,
      sede: this.sede,
      jornada: this.jornada,
      fechaInicio: this.fechaInicio,
      fechaFinalizacion: this.fechaFinalizacion,
      fechaInicioSubsanacion: this.fechaInicioSubsanacion,
      fechaFinSubsanacion: this.fechaFinSubsanacion,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion: this.fechaModificacion,
      estado: this.estado,
      observaciones: this.observaciones,
      historialFechas: this.historialFechas,
    };
  }

  /**
   * Actualiza los datos del trámite
   * @param {Object} newData - Nuevos datos
   */
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        // Preservar el historial de fechas si se está actualizando
        if (key === 'historialFechas' && Array.isArray(newData[key])) {
          this[key] = [...newData[key]];
        } else {
          this[key] = newData[key];
        }
      }
    });
    this.fechaModificacion = new Date().toISOString();
  }

  /**
   * Obtiene el periodo completo formateado
   * @returns {string} Periodo formateado
   */
  getPeriodoCompleto() {
    return `${this.periodoAnio} - ${this.periodoSemestre}`;
  }

  /**
   * Obtiene la información institucional completa
   * @returns {string} Información institucional completa
   */
  getInformacionInstitucional() {
    return `${this.sede} - ${this.jornada}`;
  }

  /**
   * Verifica si el trámite está activo
   * @returns {boolean} True si está activo
   */
  isActivo() {
    return this.estado === 'activo';
  }

  /**
   * Verifica si el trámite está en periodo de subsanación
   * @returns {boolean} True si está en subsanación
   */
  isEnSubsanacion() {
    const hoy = new Date();
    const inicioSubsanacion = new Date(this.fechaInicioSubsanacion);
    const finSubsanacion = new Date(this.fechaFinSubsanacion);

    return hoy >= inicioSubsanacion && hoy <= finSubsanacion;
  }

  /**
   * Obtiene el estado del trámite basado en las fechas
   * @returns {string} Estado del trámite
   */
  getEstadoPorFechas() {
    // Si no hay fechas configuradas, retornar estado por defecto
    if (
      !this.fechaInicio ||
      !this.fechaFinalizacion ||
      !this.fechaInicioSubsanacion ||
      !this.fechaFinSubsanacion
    ) {
      return 'sin_fechas';
    }

    const hoy = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFinalizacion = new Date(this.fechaFinalizacion);
    const fechaInicioSubsanacion = new Date(this.fechaInicioSubsanacion);
    const fechaFinSubsanacion = new Date(this.fechaFinSubsanacion);

    // Si el trámite tiene un estado manual (activo/inactivo), respetarlo
    if (this.estado === 'inactivo') {
      return 'inactivo';
    }
    if (this.estado === 'activo') {
      return 'activo';
    }

    // Si no hay estado manual, calcular basado en fechas
    if (hoy < fechaInicio) {
      return 'pendiente';
    } else if (hoy >= fechaInicio && hoy <= fechaFinalizacion) {
      return 'activo';
    } else if (hoy >= fechaInicioSubsanacion && hoy <= fechaFinSubsanacion) {
      return 'subsanación';
    } else if (hoy > fechaFinSubsanacion) {
      return 'finalizado';
    } else {
      return 'activo'; // Estado por defecto
    }
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  static formatDate(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Crea un trámite desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Tramite} Nueva instancia del trámite
   */
  static fromFormData(formData) {
    return new Tramite({
      nombre: formData.nombreTramite,
      periodoAnio: formData.periodoAnio,
      periodoSemestre: formData.periodoSemestre,
      sede: formData.sede,
      jornada: formData.jornada,
    });
  }

  /**
   * Agrega un nuevo registro de fechas al historial
   * @param {Object} fechas - Objeto con las fechas
   * @param {string} usuario - Usuario que realiza el cambio
   */
  agregarFechas(fechas, usuario = 'Usuario') {
    const registroFechas = {
      id: `fecha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fechaInicio: fechas.fechaInicio,
      fechaFinalizacion: fechas.fechaFinalizacion,
      fechaInicioSubsanacion: fechas.fechaInicioSubsanacion,
      fechaFinSubsanacion: fechas.fechaFinSubsanacion,
      fechaCambio: new Date().toISOString(),
      usuario: usuario,
    };

    console.log('📅 Agregando fechas al historial:', registroFechas);
    console.log('👤 Usuario que realiza el cambio:', usuario);
    console.log('📊 Historial antes:', this.historialFechas);

    this.historialFechas.push(registroFechas);

    console.log('📊 Historial después:', this.historialFechas);
    console.log(
      '🔍 Verificando que el usuario esté en el historial:',
      this.historialFechas[this.historialFechas.length - 1].usuario
    );

    // Actualizar las fechas principales con las más recientes
    this.fechaInicio = fechas.fechaInicio;
    this.fechaFinalizacion = fechas.fechaFinalizacion;
    this.fechaInicioSubsanacion = fechas.fechaInicioSubsanacion;
    this.fechaFinSubsanacion = fechas.fechaFinSubsanacion;

    this.fechaModificacion = new Date().toISOString();

    console.log('✅ Fechas agregadas al historial exitosamente');
    return registroFechas;
  }

  /**
   * Obtiene las fechas más recientes del historial
   * @returns {Object|null} Objeto con las fechas más recientes o null si no hay historial
   */
  getFechasMasRecientes() {
    if (this.historialFechas.length === 0) {
      return null;
    }

    // Ordenar por fecha de cambio descendente y tomar el más reciente
    const fechasOrdenadas = [...this.historialFechas].sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    );

    return fechasOrdenadas[0];
  }

  /**
   * Obtiene el historial de fechas ordenado por fecha de cambio
   * @returns {Array} Array de registros de fechas ordenados
   */
  getHistorialFechasOrdenado() {
    return [...this.historialFechas].sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    );
  }
}
