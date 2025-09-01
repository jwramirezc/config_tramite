/**
 * Servicio para manejo de trámites
 * Extiende BaseService para operaciones CRUD específicas de trámites
 */
class TramiteService extends BaseService {
  constructor() {
    super('Tramite', 'tramites_data');
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    await super.initialize();
    console.log('📋 TramiteService inicializado');
  }

  /**
   * Crea una entidad desde datos
   * @param {Object} data - Datos de la entidad
   * @returns {Tramite} Entidad creada
   */
  createEntityFromData(data) {
    return new Tramite(data);
  }

  /**
   * Valida un item antes de crear
   * @param {Tramite} tramite - Trámite a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(tramite) {
    return tramite.validate();
  }

  /**
   * Verifica duplicados antes de crear
   * @param {Tramite} tramite - Trámite a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(tramite) {
    // Verificar si ya existe un trámite con el mismo nombre
    const existingTramite = this.items.find(
      t => t.nombre.toLowerCase() === tramite.nombre.toLowerCase()
    );

    if (existingTramite) {
      return {
        isValid: false,
        errors: ['Ya existe un trámite con ese nombre'],
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida datos de actualización
   * @param {Tramite} tramite - Trámite existente
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la validación
   */
  validateUpdateData(tramite, newData) {
    // Si se está cambiando el nombre, verificar duplicados
    if (newData.nombre && newData.nombre !== tramite.nombre) {
      const existingTramite = this.items.find(
        t =>
          t.id !== tramite.id &&
          t.nombre.toLowerCase() === newData.nombre.toLowerCase()
      );

      if (existingTramite) {
        return {
          isValid: false,
          errors: ['Ya existe un trámite con ese nombre'],
        };
      }
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Obtiene trámites por sede
   * @param {string} sede - Sede a filtrar
   * @returns {Array} Array de trámites de la sede
   */
  getBySede(sede) {
    this.validateInitialization();
    return this.items.filter(tramite => tramite.sede === sede);
  }

  /**
   * Obtiene trámites por jornada
   * @param {string} jornada - Jornada a filtrar
   * @returns {Array} Array de trámites de la jornada
   */
  getByJornada(jornada) {
    this.validateInitialization();
    return this.items.filter(tramite => tramite.jornada === jornada);
  }

  /**
   * Obtiene trámites por periodo
   * @param {string} periodoAnio - Año del periodo
   * @param {string} periodoSemestre - Semestre del periodo
   * @returns {Array} Array de trámites del periodo
   */
  getByPeriodo(periodoAnio, periodoSemestre) {
    this.validateInitialization();
    return this.items.filter(
      tramite =>
        tramite.periodoAnio === periodoAnio &&
        tramite.periodoSemestre === periodoSemestre
    );
  }

  /**
   * Obtiene trámites activos
   * @returns {Array} Array de trámites activos
   */
  getActivos() {
    this.validateInitialization();
    return this.items.filter(tramite => tramite.isActivo());
  }

  /**
   * Obtiene trámites por estado
   * @param {string} estado - Estado del trámite
   * @returns {Array} Array de trámites del estado especificado
   */
  getByEstado(estado) {
    this.validateInitialization();
    return this.items.filter(
      tramite => tramite.getEstadoPorFechas() === estado
    );
  }

  /**
   * Obtiene trámites que están en periodo de subsanación
   * @returns {Array} Array de trámites en subsanación
   */
  getEnSubsanacion() {
    this.validateInitialization();
    return this.items.filter(tramite => tramite.isEnSubsanacion());
  }

  /**
   * Obtiene trámites que expiran pronto
   * @param {number} diasAdvertencia - Número de días para la advertencia (por defecto 7)
   * @returns {Array} Array de trámites que expiran pronto
   */
  getQueExpiranPronto(diasAdvertencia = 7) {
    this.validateInitialization();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAdvertencia);

    return this.items.filter(tramite => {
      if (!tramite.fechaFinalizacion) return false;
      const fechaFin = new Date(tramite.fechaFinalizacion);
      return fechaFin <= fechaLimite && fechaFin > new Date();
    });
  }

  /**
   * Obtiene trámites por rango de fechas
   * @param {Date|string} fechaInicio - Fecha de inicio del rango
   * @param {Date|string} fechaFin - Fecha de fin del rango
   * @returns {Array} Array de trámites en el rango especificado
   */
  getByRangoFechas(fechaInicio, fechaFin) {
    this.validateInitialization();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    return this.items.filter(tramite => {
      if (!tramite.fechaCreacion) return false;
      const fechaCreacion = new Date(tramite.fechaCreacion);
      return fechaCreacion >= inicio && fechaCreacion <= fin;
    });
  }

  /**
   * Busca trámites por texto
   * @param {string} searchText - Texto a buscar
   * @returns {Array} Array de trámites que coinciden
   */
  searchByText(searchText) {
    this.validateInitialization();
    if (!searchText || searchText.trim() === '') {
      return this.getAll();
    }

    const searchLower = searchText.toLowerCase();
    return this.items.filter(tramite => {
      return (
        tramite.nombre.toLowerCase().includes(searchLower) ||
        tramite.sede.toLowerCase().includes(searchLower) ||
        tramite.jornada.toLowerCase().includes(searchLower) ||
        tramite.observaciones.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * Obtiene estadísticas de trámites
   * @returns {Object} Estadísticas de trámites
   */
  getStats() {
    this.validateInitialization();

    const total = this.items.length;
    const activos = this.getActivos().length;
    const pendientes = this.getByEstado('pendiente').length;
    const finalizados = this.getByEstado('finalizado').length;
    const enSubsanacion = this.getEnSubsanacion().length;

    // Estadísticas por sede
    const sedesStats = {};
    const sedes = [...new Set(this.items.map(t => t.sede))];
    sedes.forEach(sede => {
      sedesStats[sede] = this.getBySede(sede).length;
    });

    // Estadísticas por jornada
    const jornadasStats = {};
    const jornadas = [...new Set(this.items.map(t => t.jornada))];
    jornadas.forEach(jornada => {
      jornadasStats[jornada] = this.getByJornada(jornada).length;
    });

    // Estadísticas por periodo
    const periodosStats = {};
    this.items.forEach(tramite => {
      const periodo = `${tramite.periodoAnio}-${tramite.periodoSemestre}`;
      periodosStats[periodo] = (periodosStats[periodo] || 0) + 1;
    });

    return {
      total,
      activos,
      pendientes,
      finalizados,
      enSubsanacion,
      sedes: sedesStats,
      jornadas: jornadasStats,
      periodos: periodosStats,
    };
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de trámites a generar
   * @returns {Object} Resultado de la operación
   */
  generateSampleData(count = 5) {
    try {
      this.validateInitialization();

      const sampleTramites = [];
      const sedes = ['Principal', 'Norte', 'Sur'];
      const jornadas = ['Diurna', 'Nocturna'];

      for (let i = 1; i <= count; i++) {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() + i * 30);

        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 60);

        const fechaInicioSub = new Date(fechaFin);
        fechaInicioSub.setDate(fechaInicioSub.getDate() + 1);

        const fechaFinSub = new Date(fechaInicioSub);
        fechaFinSub.setDate(fechaFinSub.getDate() + 15);

        const tramite = new Tramite({
          nombre: `Trámite de Ejemplo ${i}`,
          periodoAnio: '2024',
          periodoSemestre: ['I', 'II', 'III', 'IV'][
            Math.floor(Math.random() * 4)
          ],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          jornada: jornadas[Math.floor(Math.random() * jornadas.length)],
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFinalizacion: fechaFin.toISOString().split('T')[0],
          fechaInicioSubsanacion: fechaInicioSub.toISOString().split('T')[0],
          fechaFinSubsanacion: fechaFinSub.toISOString().split('T')[0],
        });

        sampleTramites.push(tramite);
      }

      this.items = [...this.items, ...sampleTramites];
      this.saveToStorage();

      return {
        success: true,
        generated: sampleTramites.length,
        message: `${sampleTramites.length} trámites de ejemplo generados`,
        tramites: sampleTramites,
      };
    } catch (error) {
      console.error('❌ Error al generar datos de ejemplo:', error);
      return {
        success: false,
        errors: ['Error al generar datos de ejemplo'],
      };
    }
  }

  /**
   * Obtiene trámites que requieren atención
   * @returns {Array} Array de trámites que requieren atención
   */
  getTramitesQueRequierenAtencion() {
    this.validateInitialization();
    const tramitesAtencion = [];

    // Trámites que expiran pronto
    const expiranPronto = this.getQueExpiranPronto(7);
    expiranPronto.forEach(tramite => {
      tramite.prioridad = 'alta';
      tramite.razonAtencion = 'Expira pronto';
      tramitesAtencion.push(tramite);
    });

    // Trámites sin fechas configuradas
    const sinFechas = this.items.filter(
      tramite =>
        !tramite.fechaInicio ||
        !tramite.fechaFinalizacion ||
        !tramite.fechaInicioSubsanacion ||
        !tramite.fechaFinSubsanacion
    );
    sinFechas.forEach(tramite => {
      tramite.prioridad = 'media';
      tramite.razonAtencion = 'Sin fechas configuradas';
      tramitesAtencion.push(tramite);
    });

    // Trámites con fechas pasadas
    const fechasPasadas = this.items.filter(tramite => {
      if (!tramite.fechaFinalizacion) return false;
      return new Date(tramite.fechaFinalizacion) < new Date();
    });
    fechasPasadas.forEach(tramite => {
      tramite.prioridad = 'baja';
      tramite.razonAtencion = 'Fechas pasadas';
      tramitesAtencion.push(tramite);
    });

    return tramitesAtencion;
  }
}
