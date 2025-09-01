/**
 * Modelo de datos para Estados de Trámites
 * Clase que representa el estado de un trámite
 */
class Estado {
  /**
   * Constructor de la clase Estado
   * @param {Object} data - Datos del estado
   */
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.tramiteId = data.tramiteId || '';
    this.estado = data.estado || 'activo';
    this.estadoAnterior = data.estadoAnterior || null;
    this.fechaCambio = data.fechaCambio || new Date().toISOString();
    this.usuario = data.usuario || 'Usuario';
    this.motivo = data.motivo || '';
    this.observaciones = data.observaciones || '';
    this.tipoCambio = data.tipoCambio || 'manual'; // manual, automático, sistema
    this.esPermanente = data.esPermanente || false;
    this.fechaExpiracion = data.fechaExpiracion || null;
    this.razonCambio = data.razonCambio || '';
  }

  /**
   * Genera un ID único para el estado
   * @returns {string} ID único
   */
  generateId() {
    return (
      'estado_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns {Object} Objeto con isValid (boolean) y errors (array)
   */
  validate() {
    const errors = [];
    const requiredFields = ['tramiteId', 'estado'];

    requiredFields.forEach(field => {
      if (!this[field] || this[field].toString().trim() === '') {
        errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
      }
    });

    // Validar que el estado sea válido
    const estadosValidos = [
      'activo',
      'inactivo',
      'pendiente',
      'finalizado',
      'subsanación',
      'sin_fechas',
    ];
    if (!estadosValidos.includes(this.estado)) {
      errors.push(
        `El estado "${
          this.estado
        }" no es válido. Estados válidos: ${estadosValidos.join(', ')}`
      );
    }

    // Validar fecha de expiración si no es permanente
    if (!this.esPermanente && this.fechaExpiracion) {
      if (new Date(this.fechaExpiracion) <= new Date()) {
        errors.push('La fecha de expiración debe ser futura');
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
      estado: 'Estado',
      estadoAnterior: 'Estado anterior',
      fechaCambio: 'Fecha de cambio',
      usuario: 'Usuario',
      motivo: 'Motivo del cambio',
      observaciones: 'Observaciones',
      tipoCambio: 'Tipo de cambio',
      esPermanente: 'Es permanente',
      fechaExpiracion: 'Fecha de expiración',
      razonCambio: 'Razón del cambio',
    };
    return labels[field] || field;
  }

  /**
   * Convierte el objeto a un formato JSON
   * @returns {Object} Objeto JSON del estado
   */
  toJSON() {
    return {
      id: this.id,
      tramiteId: this.tramiteId,
      estado: this.estado,
      estadoAnterior: this.estadoAnterior,
      fechaCambio: this.fechaCambio,
      usuario: this.usuario,
      motivo: this.motivo,
      observaciones: this.observaciones,
      tipoCambio: this.tipoCambio,
      esPermanente: this.esPermanente,
      fechaExpiracion: this.fechaExpiracion,
      razonCambio: this.razonCambio,
    };
  }

  /**
   * Actualiza los datos del estado
   * @param {Object} newData - Nuevos datos
   */
  update(newData) {
    // Guardar el estado anterior antes de actualizar
    if (newData.estado && newData.estado !== this.estado) {
      this.estadoAnterior = this.estado;
    }

    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = newData[key];
      }
    });

    this.fechaCambio = new Date().toISOString();
  }

  /**
   * Cambia el estado del trámite
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} usuario - Usuario que realiza el cambio
   * @param {string} motivo - Motivo del cambio
   * @param {string} observaciones - Observaciones adicionales
   */
  cambiarEstado(
    nuevoEstado,
    usuario = 'Usuario',
    motivo = '',
    observaciones = ''
  ) {
    if (nuevoEstado === this.estado) {
      return false; // No hay cambio
    }

    this.estadoAnterior = this.estado;
    this.estado = nuevoEstado;
    this.usuario = usuario;
    this.motivo = motivo;
    this.observaciones = observaciones;
    this.fechaCambio = new Date().toISOString();

    return true;
  }

  /**
   * Activa el trámite
   * @param {string} usuario - Usuario que activa
   * @param {string} motivo - Motivo de la activación
   */
  activar(usuario = 'Usuario', motivo = 'Activación manual') {
    return this.cambiarEstado(
      'activo',
      usuario,
      motivo,
      'Trámite activado manualmente'
    );
  }

  /**
   * Inactiva el trámite
   * @param {string} usuario - Usuario que inactiva
   * @param {string} motivo - Motivo de la inactivación
   */
  inactivar(usuario = 'Usuario', motivo = 'Inactivación manual') {
    return this.cambiarEstado(
      'inactivo',
      usuario,
      motivo,
      'Trámite inactivado manualmente'
    );
  }

  /**
   * Marca el trámite como pendiente
   * @param {string} usuario - Usuario que marca como pendiente
   * @param {string} motivo - Motivo del cambio
   */
  marcarPendiente(usuario = 'Usuario', motivo = 'Cambio a pendiente') {
    return this.cambiarEstado(
      'pendiente',
      usuario,
      motivo,
      'Trámite marcado como pendiente'
    );
  }

  /**
   * Marca el trámite como finalizado
   * @param {string} usuario - Usuario que marca como finalizado
   * @param {string} motivo - Motivo del cambio
   */
  marcarFinalizado(usuario = 'Usuario', motivo = 'Finalización del trámite') {
    return this.cambiarEstado(
      'finalizado',
      usuario,
      motivo,
      'Trámite marcado como finalizado'
    );
  }

  /**
   * Marca el trámite como en subsanación
   * @param {string} usuario - Usuario que marca como en subsanación
   * @param {string} motivo - Motivo del cambio
   */
  marcarEnSubsanacion(usuario = 'Usuario', motivo = 'Cambio a subsanación') {
    return this.cambiarEstado(
      'subsanación',
      usuario,
      motivo,
      'Trámite marcado como en subsanación'
    );
  }

  /**
   * Marca el trámite como sin fechas
   * @param {string} usuario - Usuario que marca como sin fechas
   * @param {string} motivo - Motivo del cambio
   */
  marcarSinFechas(usuario = 'Usuario', motivo = 'Sin fechas configuradas') {
    return this.cambiarEstado(
      'sin_fechas',
      usuario,
      motivo,
      'Trámite marcado como sin fechas'
    );
  }

  /**
   * Verifica si el estado ha cambiado
   * @returns {boolean} True si ha cambiado
   */
  haCambiado() {
    return this.estadoAnterior !== null && this.estadoAnterior !== this.estado;
  }

  /**
   * Verifica si el trámite está activo
   * @returns {boolean} True si está activo
   */
  isActivo() {
    return this.estado === 'activo';
  }

  /**
   * Verifica si el trámite está inactivo
   * @returns {boolean} True si está inactivo
   */
  isInactivo() {
    return this.estado === 'inactivo';
  }

  /**
   * Verifica si el trámite está pendiente
   * @returns {boolean} True si está pendiente
   */
  isPendiente() {
    return this.estado === 'pendiente';
  }

  /**
   * Verifica si el trámite está finalizado
   * @returns {boolean} True si está finalizado
   */
  isFinalizado() {
    return this.estado === 'finalizado';
  }

  /**
   * Verifica si el trámite está en subsanación
   * @returns {boolean} True si está en subsanación
   */
  isEnSubsanacion() {
    return this.estado === 'subsanación';
  }

  /**
   * Verifica si el trámite no tiene fechas
   * @returns {boolean} True si no tiene fechas
   */
  isSinFechas() {
    return this.estado === 'sin_fechas';
  }

  /**
   * Verifica si el estado permite cambio manual
   * @returns {boolean} True si permite cambio manual
   */
  permiteCambioManual() {
    // Solo los estados 'activo' e 'inactivo' permiten cambio manual
    return this.estado === 'activo' || this.estado === 'inactivo';
  }

  /**
   * Verifica si el estado es automático
   * @returns {boolean} True si es automático
   */
  isAutomatico() {
    return this.tipoCambio === 'automático';
  }

  /**
   * Verifica si el estado es manual
   * @returns {boolean} True si es manual
   */
  isManual() {
    return this.tipoCambio === 'manual';
  }

  /**
   * Verifica si el estado es del sistema
   * @returns {boolean} True si es del sistema
   */
  isSistema() {
    return this.tipoCambio === 'sistema';
  }

  /**
   * Verifica si el estado ha expirado
   * @returns {boolean} True si ha expirado
   */
  haExpirado() {
    if (this.esPermanente || !this.fechaExpiracion) {
      return false;
    }

    return new Date() > new Date(this.fechaExpiracion);
  }

  /**
   * Obtiene el tiempo restante hasta la expiración
   * @returns {number} Tiempo restante en milisegundos
   */
  getTiempoRestanteExpiracion() {
    if (this.esPermanente || !this.fechaExpiracion) {
      return 0;
    }

    const ahora = new Date();
    const expiracion = new Date(this.fechaExpiracion);
    return expiracion - ahora;
  }

  /**
   * Obtiene el tiempo transcurrido desde el cambio
   * @returns {number} Tiempo transcurrido en milisegundos
   */
  getTiempoTranscurrido() {
    const ahora = new Date();
    const cambio = new Date(this.fechaCambio);
    return ahora - cambio;
  }

  /**
   * Obtiene el tiempo transcurrido en días
   * @returns {number} Tiempo transcurrido en días
   */
  getDiasTranscurridos() {
    const tiempoTranscurrido = this.getTiempoTranscurrido();
    return Math.floor(tiempoTranscurrido / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el tiempo transcurrido en horas
   * @returns {number} Tiempo transcurrido en horas
   */
  getHorasTranscurridas() {
    const tiempoTranscurrido = this.getTiempoTranscurrido();
    return Math.floor(tiempoTranscurrido / (1000 * 60 * 60));
  }

  /**
   * Obtiene el tiempo transcurrido en minutos
   * @returns {number} Tiempo transcurrido en minutos
   */
  getMinutosTranscurridos() {
    const tiempoTranscurrido = this.getTiempoTranscurrido();
    return Math.floor(tiempoTranscurrido / (1000 * 60));
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
   * Obtiene el texto del estado
   * @returns {string} Texto del estado
   */
  getEstadoText() {
    const textos = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      pendiente: 'Pendiente',
      finalizado: 'Finalizado',
      subsanación: 'Subsanación',
      sin_fechas: 'Sin Fechas',
    };
    return textos[this.estado] || this.estado;
  }

  /**
   * Obtiene la clase CSS para el estado
   * @returns {string} Clase CSS
   */
  getEstadoClass() {
    const clases = {
      activo: 'status-activo',
      pendiente: 'status-pendiente',
      finalizado: 'status-finalizado',
      subsanación: 'status-pendiente',
      inactivo: 'status-finalizado',
      sin_fechas: 'status-pendiente',
    };
    return clases[this.estado] || 'status-pendiente';
  }

  /**
   * Obtiene el icono para el estado
   * @returns {string} Clase del icono
   */
  getEstadoIcon() {
    const iconos = {
      activo: 'fas fa-play-circle',
      pendiente: 'fas fa-clock',
      finalizado: 'fas fa-check-circle',
      subsanación: 'fas fa-exclamation-triangle',
      inactivo: 'fas fa-pause-circle',
      sin_fechas: 'fas fa-calendar-times',
    };
    return iconos[this.estado] || 'fas fa-question-circle';
  }

  /**
   * Obtiene la información resumida del estado
   * @returns {string} Información resumida
   */
  getResumen() {
    return `${this.getEstadoText()} - Cambiado por ${
      this.usuario
    } el ${this.formatDate(this.fechaCambio)}`;
  }

  /**
   * Obtiene la información completa del estado
   * @returns {string} Información completa
   */
  getInformacionCompleta() {
    return `
      Estado Actual: ${this.getEstadoText()}
      Estado Anterior: ${
        this.estadoAnterior ? this.getEstadoText(this.estadoAnterior) : 'N/A'
      }
      Usuario: ${this.usuario}
      Fecha de Cambio: ${this.formatDateTime(this.fechaCambio)}
      Tipo de Cambio: ${this.tipoCambio}
      Motivo: ${this.motivo || 'No especificado'}
      Observaciones: ${this.observaciones || 'Ninguna'}
      Es Permanente: ${this.esPermanente ? 'Sí' : 'No'}
      Fecha de Expiración: ${
        this.fechaExpiracion ? this.formatDateTime(this.fechaExpiracion) : 'N/A'
      }
      Razón del Cambio: ${this.razonCambio || 'No especificada'}
      Tiempo Transcurrido: ${this.getDiasTranscurridos()} días, ${
      this.getHorasTranscurridas() % 24
    } horas
      Permite Cambio Manual: ${this.permiteCambioManual() ? 'Sí' : 'No'}
    `.trim();
  }

  /**
   * Crea un estado desde datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Estado} Nueva instancia del estado
   */
  static fromFormData(formData) {
    return new Estado({
      tramiteId: formData.tramiteId,
      estado: formData.estado,
      usuario: formData.usuario || 'Usuario',
      motivo: formData.motivo || '',
      observaciones: formData.observaciones || '',
      tipoCambio: formData.tipoCambio || 'manual',
      esPermanente: formData.esPermanente || false,
      fechaExpiracion: formData.fechaExpiracion || null,
      razonCambio: formData.razonCambio || '',
    });
  }

  /**
   * Crea un estado de ejemplo
   * @param {string} tramiteId - ID del trámite
   * @returns {Estado} Estado de ejemplo
   */
  static createSample(tramiteId) {
    return new Estado({
      tramiteId,
      estado: 'activo',
      usuario: 'Usuario Ejemplo',
      motivo: 'Configuración inicial del estado',
      observaciones: 'Estado de ejemplo para demostración',
      tipoCambio: 'manual',
      esPermanente: true,
      razonCambio: 'Inicialización del sistema',
    });
  }
}
