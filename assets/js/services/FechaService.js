/**
 * Servicio para manejo de fechas de trámites
 * Extiende BaseService para operaciones CRUD específicas de fechas
 */
class FechaService extends BaseService {
  constructor() {
    super('Fecha', 'fechas_tramites');
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    await super.initialize();
    console.log('📅 FechaService inicializado');
  }

  /**
   * Crea una entidad desde datos
   * @param {Object} data - Datos de la entidad
   * @returns {Fecha} Entidad creada
   */
  createEntityFromData(data) {
    return new Fecha(data);
  }

  /**
   * Valida un item antes de crear
   * @param {Fecha} fecha - Fecha a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(fecha) {
    return fecha.validate();
  }

  /**
   * Verifica duplicados antes de crear
   * @param {Fecha} fecha - Fecha a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(fecha) {
    // Para fechas, no hay duplicados estrictos, pero podemos verificar si hay fechas muy similares
    const fechasSimilares = this.items.filter(
      f =>
        f.tramiteId === fecha.tramiteId &&
        f.fechaInicio === fecha.fechaInicio &&
        f.fechaFinalizacion === fecha.fechaFinalizacion &&
        f.fechaInicioSubsanacion === fecha.fechaInicioSubsanacion &&
        f.fechaFinSubsanacion === fecha.fechaFinSubsanacion
    );

    if (fechasSimilares.length > 0) {
      return {
        isValid: false,
        errors: ['Ya existe un registro de fechas idéntico para este trámite'],
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida datos de actualización
   * @param {Fecha} fecha - Fecha existente
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la validación
   */
  validateUpdateData(fecha, newData) {
    // Crear una fecha temporal para validar
    const tempFecha = new Fecha({ ...fecha.toJSON(), ...newData });
    return tempFecha.validate();
  }

  /**
   * Obtiene fechas por trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de fechas del trámite
   */
  getByTramiteId(tramiteId) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.tramiteId === tramiteId);
  }

  /**
   * Obtiene la fecha más reciente de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Fecha|null} Fecha más reciente o null
   */
  getFechaMasReciente(tramiteId) {
    this.validateInitialization();
    const fechas = this.getByTramiteId(tramiteId);

    if (fechas.length === 0) {
      return null;
    }

    // Ordenar por fecha de cambio descendente y tomar el más reciente
    return fechas.sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    )[0];
  }

  /**
   * Obtiene fechas por usuario
   * @param {string} usuario - Usuario que realizó el cambio
   * @returns {Array} Array de fechas del usuario
   */
  getByUsuario(usuario) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.usuario === usuario);
  }

  /**
   * Obtiene fechas por tipo de cambio
   * @param {string} tipoCambio - Tipo de cambio (manual, automático, sistema)
   * @returns {Array} Array de fechas del tipo especificado
   */
  getByTipoCambio(tipoCambio) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.tipoCambio === tipoCambio);
  }

  /**
   * Obtiene fechas por estado
   * @param {string} estado - Estado de las fechas
   * @returns {Array} Array de fechas del estado especificado
   */
  getByEstado(estado) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.estado === estado);
  }

  /**
   * Obtiene fechas activas
   * @returns {Array} Array de fechas activas
   */
  getActivas() {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.estado === 'activo');
  }

  /**
   * Obtiene fechas inactivas
   * @returns {Array} Array de fechas inactivas
   */
  getInactivas() {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.estado === 'inactivo');
  }

  /**
   * Obtiene fechas por rango de fechas
   * @param {Date|string} fechaInicio - Fecha de inicio del rango
   * @param {Date|string} fechaFin - Fecha de fin del rango
   * @returns {Array} Array de fechas en el rango especificado
   */
  getByRangoFechas(fechaInicio, fechaFin) {
    this.validateInitialization();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    return this.items.filter(fecha => {
      const fechaCambio = new Date(fecha.fechaCambio);
      return fechaCambio >= inicio && fechaCambio <= fin;
    });
  }

  /**
   * Obtiene fechas por motivo
   * @param {string} motivo - Motivo del cambio
   * @returns {Array} Array de fechas con el motivo especificado
   */
  getByMotivo(motivo) {
    this.validateInitialization();
    return this.items.filter(
      fecha =>
        fecha.motivo &&
        fecha.motivo.toLowerCase().includes(motivo.toLowerCase())
    );
  }

  /**
   * Obtiene fechas futuras
   * @returns {Array} Array de fechas futuras
   */
  getFechasFuturas() {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.isFechasFuturas());
  }

  /**
   * Obtiene fechas pasadas
   * @returns {Array} Array de fechas pasadas
   */
  getFechasPasadas() {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.isFechasPasadas());
  }

  /**
   * Obtiene fechas que están activas actualmente
   * @param {Date|string} fechaReferencia - Fecha de referencia (por defecto hoy)
   * @returns {Array} Array de fechas activas en la fecha de referencia
   */
  getFechasActivasEnFecha(fechaReferencia = new Date()) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.isTramiteActivo(fechaReferencia));
  }

  /**
   * Obtiene fechas que están en subsanación en una fecha específica
   * @param {Date|string} fechaReferencia - Fecha de referencia (por defecto hoy)
   * @returns {Array} Array de fechas en subsanación en la fecha de referencia
   */
  getFechasEnSubsanacionEnFecha(fechaReferencia = new Date()) {
    this.validateInitialization();
    return this.items.filter(fecha => fecha.isEnSubsanacion(fechaReferencia));
  }

  /**
   * Obtiene fechas que expiran pronto
   * @param {number} diasAdvertencia - Número de días para la advertencia (por defecto 7)
   * @returns {Array} Array de fechas que expiran pronto
   */
  getFechasQueExpiranPronto(diasAdvertencia = 7) {
    this.validateInitialization();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAdvertencia);

    return this.items.filter(fecha => {
      const fechaFin = new Date(fecha.fechaFinalizacion);
      return fechaFin <= fechaLimite && fechaFin > new Date();
    });
  }

  /**
   * Obtiene fechas por periodo
   * @param {string} periodo - Periodo (año-semestre)
   * @returns {Array} Array de fechas del periodo especificado
   */
  getByPeriodo(periodo) {
    this.validateInitialization();
    // Esta funcionalidad requeriría acceso al modelo Tramite para obtener el periodo
    // Por ahora retornamos todas las fechas
    return this.getAll();
  }

  /**
   * Obtiene el historial de fechas de un trámite ordenado
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de fechas ordenadas por fecha de cambio
   */
  getHistorialOrdenado(tramiteId) {
    this.validateInitialization();
    const fechas = this.getByTramiteId(tramiteId);
    return fechas.sort(
      (a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio)
    );
  }

  /**
   * Obtiene estadísticas de fechas
   * @returns {Object} Estadísticas de fechas
   */
  getStats() {
    this.validateInitialization();

    const total = this.items.length;
    const activas = this.getActivas().length;
    const inactivas = this.getInactivas().length;
    const manuales = this.getByTipoCambio('manual').length;
    const automaticas = this.getByTipoCambio('automático').length;
    const sistema = this.getByTipoCambio('sistema').length;

    // Estadísticas por estado
    const estadosStats = {};
    ['activo', 'inactivo', 'pendiente'].forEach(estado => {
      estadosStats[estado] = this.getByEstado(estado).length;
    });

    // Estadísticas por tipo de cambio
    const tiposCambioStats = {
      manual: manuales,
      automático: automaticas,
      sistema: sistema,
    };

    // Fechas futuras vs pasadas
    const futuras = this.getFechasFuturas().length;
    const pasadas = this.getFechasPasadas().length;

    return {
      total,
      activas,
      inactivas,
      estados: estadosStats,
      tiposCambio: tiposCambioStats,
      futuras,
      pasadas,
      promedioDuracionTramite:
        total > 0
          ? (
              this.items.reduce(
                (total, fecha) => total + fecha.getDuracionTramite(),
                0
              ) / total
            ).toFixed(2)
          : 0,
      promedioDuracionSubsanacion:
        total > 0
          ? (
              this.items.reduce(
                (total, fecha) => total + fecha.getDuracionSubsanacion(),
                0
              ) / total
            ).toFixed(2)
          : 0,
    };
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de fechas a generar
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
            'Se requiere el ID del trámite para generar fechas de ejemplo',
          ],
        };
      }

      const sampleFechas = [];
      const usuarios = [
        'Usuario Ejemplo',
        'Admin Sistema',
        'Gestor Fechas',
        'Coordinador Académico',
      ];
      const motivos = [
        'Configuración inicial',
        'Ajuste de calendario',
        'Cambio de periodo',
        'Corrección de fechas',
      ];

      for (let i = 0; i < count; i++) {
        const fecha = Fecha.createSample(tramiteId);
        fecha.usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
        fecha.motivo = motivos[Math.floor(Math.random() * motivos.length)];
        fecha.observaciones = `Fecha de ejemplo #${i + 1} para demostración`;
        fecha.tipoCambio = i === 0 ? 'manual' : 'sistema';

        sampleFechas.push(fecha);
      }

      this.items = [...this.items, ...sampleFechas];
      this.saveToStorage();

      return {
        success: true,
        generated: sampleFechas.length,
        message: `${sampleFechas.length} fechas de ejemplo generadas para el trámite ${tramiteId}`,
        fechas: sampleFechas,
      };
    } catch (error) {
      console.error('❌ Error al generar fechas de ejemplo:', error);
      return {
        success: false,
        errors: ['Error al generar fechas de ejemplo'],
      };
    }
  }

  /**
   * Exporta fechas de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {string} JSON string de las fechas
   */
  exportByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const fechas = this.getByTramiteId(tramiteId);
      const dataToExport = fechas.map(fecha => fecha.toJSON());
      return JSON.stringify(dataToExport, null, 2);
    } catch (error) {
      console.error('❌ Error al exportar fechas del trámite:', error);
      return null;
    }
  }

  /**
   * Importa fechas para un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @param {string} jsonData - Datos JSON
   * @returns {Object} Resultado de la operación
   */
  async importByTramiteId(tramiteId, jsonData) {
    try {
      this.validateInitialization();
      const importedData = JSON.parse(jsonData);
      const importedFechas = [];

      for (const data of importedData) {
        // Asignar el tramiteId correcto
        data.tramiteId = tramiteId;

        const fecha = new Fecha(data);
        const validation = fecha.validate();

        if (validation.isValid) {
          importedFechas.push(fecha);
        }
      }

      this.items = [...this.items, ...importedFechas];
      await this.saveToStorage();

      return {
        success: true,
        imported: importedFechas.length,
        message: `${importedFechas.length} fechas importadas para el trámite ${tramiteId}`,
        fechas: importedFechas,
      };
    } catch (error) {
      console.error('❌ Error al importar fechas del trámite:', error);
      return {
        success: false,
        errors: ['Error al importar fechas del trámite'],
      };
    }
  }

  /**
   * Limpia fechas de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  async clearByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const fechasOriginales = [...this.items];
      this.items = this.items.filter(fecha => fecha.tramiteId !== tramiteId);

      const removedCount = fechasOriginales.length - this.items.length;
      await this.saveToStorage();

      return {
        success: true,
        removed: removedCount,
        message: `${removedCount} fechas removidas del trámite ${tramiteId}`,
      };
    } catch (error) {
      console.error('❌ Error al limpiar fechas del trámite:', error);
      return {
        success: false,
        errors: ['Error al limpiar fechas del trámite'],
      };
    }
  }

  /**
   * Obtiene fechas que requieren atención
   * @returns {Array} Array de fechas que requieren atención
   */
  getFechasQueRequierenAtencion() {
    this.validateInitialization();
    const fechasAtencion = [];

    // Fechas que expiran pronto (en los próximos 7 días)
    const fechasExpiranPronto = this.getFechasQueExpiranPronto(7);
    fechasExpiranPronto.forEach(fecha => {
      fecha.prioridad = 'alta';
      fecha.razonAtencion = 'Expira pronto';
      fechasAtencion.push(fecha);
    });

    // Fechas sin fechas configuradas
    const fechasSinFechas = this.items.filter(
      fecha =>
        !fecha.fechaInicio ||
        !fecha.fechaFinalizacion ||
        !fecha.fechaInicioSubsanacion ||
        !fecha.fechaFinSubsanacion
    );
    fechasSinFechas.forEach(fecha => {
      fecha.prioridad = 'media';
      fecha.razonAtencion = 'Fechas incompletas';
      fechasAtencion.push(fecha);
    });

    // Fechas con fechas pasadas
    const fechasPasadas = this.getFechasPasadas();
    fechasPasadas.forEach(fecha => {
      fecha.prioridad = 'baja';
      fecha.razonAtencion = 'Fechas pasadas';
      fechasAtencion.push(fecha);
    });

    return fechasAtencion;
  }
}
