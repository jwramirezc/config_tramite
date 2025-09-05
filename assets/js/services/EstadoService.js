/**
 * Servicio para manejo de estados de trámites
 * Extiende BaseService para operaciones CRUD específicas de estados
 */
class EstadoService extends BaseService {
  constructor() {
    super('Estado', 'estados_tramites');
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    await super.initialize();
  }

  /**
   * Crea una entidad desde datos
   * @param {Object} data - Datos de la entidad
   * @returns {Estado} Entidad creada
   */
  createEntityFromData(data) {
    return new Estado(data);
  }

  /**
   * Valida un item antes de crear
   * @param {Estado} estado - Estado a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(estado) {
    return estado.validate();
  }

  /**
   * Verifica duplicados antes de crear
   * @param {Estado} estado - Estado a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(estado) {
    // Solo puede haber un estado activo por trámite
    const existingEstado = this.items.find(
      e => e.tramiteId === estado.tramiteId && e.estado === estado.estado
    );

    if (existingEstado) {
      return {
        isValid: false,
        errors: [
          `Ya existe un estado "${estado.estado}" para el trámite ${estado.tramiteId}`,
        ],
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida datos de actualización
   * @param {Estado} estado - Estado existente
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la validación
   */
  validateUpdateData(estado, newData) {
    // Si se está cambiando el estado, verificar que no haya duplicados
    if (newData.estado && newData.estado !== estado.estado) {
      const existingEstado = this.items.find(
        e =>
          e.tramiteId === estado.tramiteId &&
          e.estado === newData.estado &&
          e.id !== estado.id
      );

      if (existingEstado) {
        return {
          isValid: false,
          errors: [
            `Ya existe un estado "${newData.estado}" para el trámite ${estado.tramiteId}`,
          ],
        };
      }
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Obtiene estados por trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de estados del trámite
   */
  getByTramiteId(tramiteId) {
    this.validateInitialization();
    return this.items.filter(estado => estado.tramiteId === tramiteId);
  }

  /**
   * Obtiene el estado actual de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Estado|null} Estado actual o null
   */
  getEstadoActual(tramiteId) {
    this.validateInitialization();
    const estados = this.getByTramiteId(tramiteId);

    if (estados.length === 0) {
      return null;
    }

    // Ordenar por fecha de cambio descendente y tomar el más reciente
    return estados.sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    )[0];
  }

  /**
   * Obtiene estados por tipo
   * @param {string} estado - Estado a buscar
   * @returns {Array} Array de estados del tipo especificado
   */
  getByEstado(estado) {
    this.validateInitialization();
    return this.items.filter(e => e.estado === estado);
  }

  /**
   * Obtiene estados por usuario
   * @param {string} usuario - Usuario que realizó el cambio
   * @returns {Array} Array de estados del usuario
   */
  getByUsuario(usuario) {
    this.validateInitialization();
    return this.items.filter(estado => estado.usuario === usuario);
  }

  /**
   * Obtiene estados por tipo de cambio
   * @param {string} tipoCambio - Tipo de cambio (manual, automático, sistema)
   * @returns {Array} Array de estados del tipo especificado
   */
  getByTipoCambio(tipoCambio) {
    this.validateInitialization();
    return this.items.filter(estado => estado.tipoCambio === tipoCambio);
  }

  /**
   * Obtiene estados activos
   * @returns {Array} Array de estados activos
   */
  getActivos() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isActivo());
  }

  /**
   * Obtiene estados inactivos
   * @returns {Array} Array de estados inactivos
   */
  getInactivos() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isInactivo());
  }

  /**
   * Obtiene estados pendientes
   * @returns {Array} Array de estados pendientes
   */
  getPendientes() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isPendiente());
  }

  /**
   * Obtiene estados finalizados
   * @returns {Array} Array de estados finalizados
   */
  getFinalizados() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isFinalizado());
  }

  /**
   * Obtiene estados en subsanación
   * @returns {Array} Array de estados en subsanación
   */
  getEnSubsanacion() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isEnSubsanacion());
  }

  /**
   * Obtiene estados sin fechas
   * @returns {Array} Array de estados sin fechas
   */
  getSinFechas() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isSinFechas());
  }

  /**
   * Obtiene estados que permiten cambio manual
   * @returns {Array} Array de estados que permiten cambio manual
   */
  getQuePermitenCambioManual() {
    this.validateInitialization();
    return this.items.filter(estado => estado.permiteCambioManual());
  }

  /**
   * Obtiene estados automáticos
   * @returns {Array} Array de estados automáticos
   */
  getAutomaticos() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isAutomatico());
  }

  /**
   * Obtiene estados manuales
   * @returns {Array} Array de estados manuales
   */
  getManuales() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isManual());
  }

  /**
   * Obtiene estados del sistema
   * @returns {Array} Array de estados del sistema
   */
  getSistema() {
    this.validateInitialization();
    return this.items.filter(estado => estado.isSistema());
  }

  /**
   * Obtiene estados por rango de fechas
   * @param {Date|string} fechaInicio - Fecha de inicio del rango
   * @param {Date|string} fechaFin - Fecha de fin del rango
   * @returns {Array} Array de estados en el rango especificado
   */
  getByRangoFechas(fechaInicio, fechaFin) {
    this.validateInitialization();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    return this.items.filter(estado => {
      const fechaCambio = new Date(estado.fechaCambio);
      return fechaCambio >= inicio && fechaCambio <= fin;
    });
  }

  /**
   * Obtiene estados por motivo
   * @param {string} motivo - Motivo del cambio
   * @returns {Array} Array de estados con el motivo especificado
   */
  getByMotivo(motivo) {
    this.validateInitialization();
    return this.items.filter(
      estado =>
        estado.motivo &&
        estado.motivo.toLowerCase().includes(motivo.toLowerCase())
    );
  }

  /**
   * Obtiene estados que han expirado
   * @returns {Array} Array de estados expirados
   */
  getExpirados() {
    this.validateInitialization();
    return this.items.filter(estado => estado.haExpirado());
  }

  /**
   * Obtiene estados que expiran pronto
   * @param {number} diasAdvertencia - Número de días para la advertencia (por defecto 7)
   * @returns {Array} Array de estados que expiran pronto
   */
  getEstadosQueExpiranPronto(diasAdvertencia = 7) {
    this.validateInitialization();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAdvertencia);

    return this.items.filter(estado => {
      if (estado.esPermanente || !estado.fechaExpiracion) {
        return false;
      }
      const expiracion = new Date(estado.fechaExpiracion);
      return expiracion <= fechaLimite && expiracion > new Date();
    });
  }

  /**
   * Obtiene el historial de estados de un trámite ordenado
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de estados ordenados por fecha de cambio
   */
  getHistorialOrdenado(tramiteId) {
    this.validateInitialization();
    const estados = this.getByTramiteId(tramiteId);
    return estados.sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    );
  }

  /**
   * Cambia el estado de un trámite
   * @param {string} tramiteId - ID del trámite
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} usuario - Usuario que realiza el cambio
   * @param {string} motivo - Motivo del cambio
   * @param {string} observaciones - Observaciones adicionales
   * @returns {Object} Resultado de la operación
   */
  async cambiarEstado(
    tramiteId,
    nuevoEstado,
    usuario = 'Usuario',
    motivo = '',
    observaciones = ''
  ) {
    try {
      this.validateInitialization();

      const estadoActual = this.getEstadoActual(tramiteId);
      if (!estadoActual) {
        // Crear nuevo estado si no existe
        const nuevoEstadoObj = new Estado({
          tramiteId,
          estado: nuevoEstado,
          usuario,
          motivo,
          observaciones,
          tipoCambio: 'manual',
        });

        return await this.create(nuevoEstadoObj);
      } else {
        // Actualizar estado existente
        const cambioRealizado = estadoActual.cambiarEstado(
          nuevoEstado,
          usuario,
          motivo,
          observaciones
        );

        if (cambioRealizado) {
          return await this.update(estadoActual.id, {
            estado: nuevoEstado,
            usuario,
            motivo,
            observaciones,
            fechaCambio: new Date().toISOString(),
          });
        } else {
          return {
            success: false,
            errors: ['No se realizó ningún cambio en el estado'],
          };
        }
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      return {
        success: false,
        errors: ['Error al cambiar el estado del trámite'],
      };
    }
  }

  /**
   * Activa un trámite
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que activa
   * @param {string} motivo - Motivo de la activación
   * @returns {Object} Resultado de la operación
   */
  async activarTramite(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Activación manual'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'activo',
      usuario,
      motivo,
      'Trámite activado manualmente'
    );
  }

  /**
   * Inactiva un trámite
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que inactiva
   * @param {string} motivo - Motivo de la inactivación
   * @returns {Object} Resultado de la operación
   */
  async inactivarTramite(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Inactivación manual'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'inactivo',
      usuario,
      motivo,
      'Trámite inactivado manualmente'
    );
  }

  /**
   * Marca un trámite como pendiente
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que marca como pendiente
   * @param {string} motivo - Motivo del cambio
   * @returns {Object} Resultado de la operación
   */
  async marcarPendiente(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Cambio a pendiente'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'pendiente',
      usuario,
      motivo,
      'Trámite marcado como pendiente'
    );
  }

  /**
   * Marca un trámite como finalizado
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que marca como finalizado
   * @param {string} motivo - Motivo del cambio
   * @returns {Object} Resultado de la operación
   */
  async marcarFinalizado(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Finalización del trámite'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'finalizado',
      usuario,
      motivo,
      'Trámite marcado como finalizado'
    );
  }

  /**
   * Marca un trámite como en subsanación
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que marca como en subsanación
   * @param {string} motivo - Motivo del cambio
   * @returns {Object} Resultado de la operación
   */
  async marcarEnSubsanacion(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Cambio a subsanación'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'subsanación',
      usuario,
      motivo,
      'Trámite marcado como en subsanación'
    );
  }

  /**
   * Marca un trámite como sin fechas
   * @param {string} tramiteId - ID del trámite
   * @param {string} usuario - Usuario que marca como sin fechas
   * @param {string} motivo - Motivo del cambio
   * @returns {Object} Resultado de la operación
   */
  async marcarSinFechas(
    tramiteId,
    usuario = 'Usuario',
    motivo = 'Sin fechas configuradas'
  ) {
    return await this.cambiarEstado(
      tramiteId,
      'sin_fechas',
      usuario,
      motivo,
      'Trámite marcado como sin fechas'
    );
  }

  /**
   * Obtiene estadísticas de estados
   * @returns {Object} Estadísticas de estados
   */
  getStats() {
    this.validateInitialization();

    const total = this.items.length;
    const activos = this.getActivos().length;
    const inactivos = this.getInactivos().length;
    const pendientes = this.getPendientes().length;
    const finalizados = this.getFinalizados().length;
    const enSubsanacion = this.getEnSubsanacion().length;
    const sinFechas = this.getSinFechas().length;

    const manuales = this.getManuales().length;
    const automaticas = this.getAutomaticos().length;
    const sistema = this.getSistema().length;

    // Estadísticas por estado
    const estadosStats = {
      activo: activos,
      inactivo: inactivos,
      pendiente: pendientes,
      finalizado: finalizados,
      subsanación: enSubsanacion,
      sin_fechas: sinFechas,
    };

    // Estadísticas por tipo de cambio
    const tiposCambioStats = {
      manual: manuales,
      automático: automaticas,
      sistema: sistema,
    };

    // Estados que requieren atención
    const queRequierenAtencion = this.getEstadosQueRequierenAtencion().length;

    return {
      total,
      estados: estadosStats,
      tiposCambio: tiposCambioStats,
      queRequierenAtencion,
      promedioCambiosPorTramite:
        total > 0
          ? (
              this.items.reduce(
                (total, estado) => total + (estado.haCambiado() ? 1 : 0),
                0
              ) / total
            ).toFixed(2)
          : 0,
    };
  }

  /**
   * Obtiene estados que requieren atención
   * @returns {Array} Array de estados que requieren atención
   */
  getEstadosQueRequierenAtencion() {
    this.validateInitialization();
    const estadosAtencion = [];

    // Estados expirados
    const expirados = this.getExpirados();
    expirados.forEach(estado => {
      estado.prioridad = 'alta';
      estado.razonAtencion = 'Estado expirado';
      estadosAtencion.push(estado);
    });

    // Estados que expiran pronto
    const expiranPronto = this.getEstadosQueExpiranPronto(7);
    expiranPronto.forEach(estado => {
      estado.prioridad = 'media';
      estado.razonAtencion = 'Expira pronto';
      estadosAtencion.push(estado);
    });

    // Estados sin fechas
    const sinFechas = this.getSinFechas();
    sinFechas.forEach(estado => {
      estado.prioridad = 'baja';
      estado.razonAtencion = 'Sin fechas configuradas';
      estadosAtencion.push(estado);
    });

    return estadosAtencion;
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de estados a generar
   * @param {string} tramiteId - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  generateSampleData(count = 3, tramiteId) {
    try {
      this.validateInitialization();

      if (!tramiteId) {
        return {
          success: false,
          errors: [
            'Se requiere el ID del trámite para generar estados de ejemplo',
          ],
        };
      }

      const sampleEstados = [];
      const usuarios = [
        'Usuario Ejemplo',
        'Admin Sistema',
        'Gestor Estados',
        'Coordinador Académico',
      ];
      const motivos = [
        'Configuración inicial',
        'Cambio de estado',
        'Ajuste del sistema',
        'Corrección manual',
      ];

      for (let i = 0; i < count; i++) {
        const estado = Estado.createSample(tramiteId);
        estado.usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
        estado.motivo = motivos[Math.floor(Math.random() * motivos.length)];
        estado.observaciones = `Estado de ejemplo #${i + 1} para demostración`;
        estado.tipoCambio = i === 0 ? 'manual' : 'sistema';

        sampleEstados.push(estado);
      }

      this.items = [...this.items, ...sampleEstados];
      this.saveToStorage();

      return {
        success: true,
        generated: sampleEstados.length,
        message: `${sampleEstados.length} estados de ejemplo generados para el trámite ${tramiteId}`,
        estados: sampleEstados,
      };
    } catch (error) {
      console.error('❌ Error al generar estados de ejemplo:', error);
      return {
        success: false,
        errors: ['Error al generar estados de ejemplo'],
      };
    }
  }

  /**
   * Exporta estados de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {string} JSON string de los estados
   */
  exportByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const estados = this.getByTramiteId(tramiteId);
      const dataToExport = estados.map(estado => estado.toJSON());
      return JSON.stringify(dataToExport, null, 2);
    } catch (error) {
      console.error('❌ Error al exportar estados del trámite:', error);
      return null;
    }
  }

  /**
   * Importa estados para un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @param {string} jsonData - Datos JSON
   * @returns {Object} Resultado de la operación
   */
  async importByTramiteId(tramiteId, jsonData) {
    try {
      this.validateInitialization();
      const importedData = JSON.parse(jsonData);
      const importedEstados = [];

      for (const data of importedData) {
        // Asignar el tramiteId correcto
        data.tramiteId = tramiteId;

        const estado = new Estado(data);
        const validation = estado.validate();

        if (validation.isValid) {
          importedEstados.push(estado);
        }
      }

      this.items = [...this.items, ...importedEstados];
      await this.saveToStorage();

      return {
        success: true,
        imported: importedEstados.length,
        message: `${importedEstados.length} estados importados para el trámite ${tramiteId}`,
        estados: importedEstados,
      };
    } catch (error) {
      console.error('❌ Error al importar estados del trámite:', error);
      return {
        success: false,
        errors: ['Error al importar estados del trámite'],
      };
    }
  }

  /**
   * Limpia estados de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  async clearByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const estadosOriginales = [...this.items];
      this.items = this.items.filter(estado => estado.tramiteId !== tramiteId);

      const removedCount = estadosOriginales.length - this.items.length;
      await this.saveToStorage();

      return {
        success: true,
        removed: removedCount,
        message: `${removedCount} estados removidos del trámite ${tramiteId}`,
      };
    } catch (error) {
      console.error('❌ Error al limpiar estados del trámite:', error);
      return {
        success: false,
        errors: ['Error al limpiar estados del trámite'],
      };
    }
  }
}
