/**
 * Servicio para manejo de trámites habilitados
 * Extiende BaseService para operaciones CRUD específicas de trámites habilitados
 */
class HabilitarTramiteService extends BaseService {
  constructor() {
    super('HabilitarTramite', 'habilitar_tramites');
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
   * @returns {HabilitarTramite} Entidad creada
   */
  createEntityFromData(data) {
    return new HabilitarTramite(data);
  }

  /**
   * Valida un item antes de crear
   * @param {HabilitarTramite} habilitarTramite - Trámite habilitado a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(habilitarTramite) {
    try {
      // Si ya es una instancia de HabilitarTramite, usarla directamente
      const habilitarTramiteObj =
        habilitarTramite instanceof HabilitarTramite
          ? habilitarTramite
          : new HabilitarTramite(habilitarTramite);

      const validation = habilitarTramiteObj.validate();
      if (!validation.isValid) {
        return { isValid: false, errors: validation.errors };
      }

      // Validar que el trámite relacionado existe
      const tramiteRelacionado = habilitarTramiteObj.getTramiteRelacionado();
      if (!tramiteRelacionado) {
        return {
          isValid: false,
          errors: ['El trámite seleccionado no existe en el sistema'],
        };
      }

      // Actualizar el nombre del trámite si no está presente
      if (!habilitarTramiteObj.tramiteNombre && tramiteRelacionado.nombre) {
        habilitarTramiteObj.tramiteNombre = tramiteRelacionado.nombre;
      }

      return { isValid: true, data: habilitarTramiteObj };
    } catch (error) {
      console.error('❌ Error al validar item:', error);
      return { isValid: false, errors: ['Error interno de validación'] };
    }
  }

  /**
   * Verifica duplicados antes de crear
   * @param {HabilitarTramite} habilitarTramite - Trámite habilitado a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(habilitarTramite) {
    const duplicados = this.items.filter(
      item =>
        item.periodoAcademico === habilitarTramite.periodoAcademico &&
        item.sede === habilitarTramite.sede &&
        item.tramiteId === habilitarTramite.tramiteId
    );

    if (duplicados.length > 0) {
      return {
        isValid: false,
        errors: [
          'Ya existe una configuración para este trámite en el mismo periodo académico y sede',
        ],
      };
    }

    return { isValid: true };
  }

  /**
   * Crea un nuevo trámite habilitado
   * @param {Object} data - Datos del trámite habilitado
   * @returns {Object} Resultado de la operación
   */
  async create(data) {
    try {
      const result = await super.create(data);
      return result;
    } catch (error) {
      console.error('❌ Error en HabilitarTramiteService.create():', error);
      return {
        success: false,
        errors: ['Error interno en el servicio'],
      };
    }
  }

  /**
   * Busca trámites habilitados por criterios
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Array} Array de trámites habilitados que coinciden
   */
  getByCriterios(criterios) {
    return this.items.filter(item => {
      return Object.keys(criterios).every(key => {
        if (criterios[key] === '') return true;
        return (
          item[key] &&
          item[key]
            .toString()
            .toLowerCase()
            .includes(criterios[key].toLowerCase())
        );
      });
    });
  }

  /**
   * Obtiene trámites habilitados por ID de trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de trámites habilitados para ese trámite
   */
  getByTramiteId(tramiteId) {
    return this.items.filter(item => item.tramiteId === tramiteId);
  }

  /**
   * Obtiene información completa de trámites habilitados con datos del trámite relacionado
   * @returns {Array} Array de objetos con información completa
   */
  getHabilitarTramitesCompletos() {
    return this.items.map(item => {
      const tramiteRelacionado = HabilitarTramite.verificarTramiteExiste(
        item.tramiteId
      );
      return {
        ...item,
        tramiteRelacionado: tramiteRelacionado || null,
      };
    });
  }

  /**
   * Busca trámites habilitados
   * @param {string} termino - Término de búsqueda
   * @returns {Array} Array de trámites habilitados encontrados
   */
  searchHabilitarTramites(termino) {
    if (!termino || termino.trim() === '') {
      return this.items;
    }

    const terminoLower = termino.toLowerCase();
    return this.items.filter(
      item =>
        item.periodoAcademico.toLowerCase().includes(terminoLower) ||
        item.semestre.toLowerCase().includes(terminoLower) ||
        item.sede.toLowerCase().includes(terminoLower) ||
        item.tramiteNombre.toLowerCase().includes(terminoLower)
    );
  }

  /**
   * Obtiene estadísticas del servicio
   * @returns {Object} Estadísticas
   */
  getStats() {
    return {
      total: this.items.length,
      activos: this.items.filter(item => item.estado === 'activo').length,
      inactivos: this.items.filter(item => item.estado === 'inactivo').length,
      porPeriodo: this.getStatsPorPeriodo(),
      porSede: this.getStatsPorSede(),
    };
  }

  /**
   * Obtiene estadísticas por periodo académico
   * @returns {Object} Estadísticas por periodo
   */
  getStatsPorPeriodo() {
    const stats = {};
    this.items.forEach(item => {
      stats[item.periodoAcademico] = (stats[item.periodoAcademico] || 0) + 1;
    });
    return stats;
  }

  /**
   * Obtiene estadísticas por sede
   * @returns {Object} Estadísticas por sede
   */
  getStatsPorSede() {
    const stats = {};
    this.items.forEach(item => {
      stats[item.sede] = (stats[item.sede] || 0) + 1;
    });
    return stats;
  }

  /**
   * Genera datos de ejemplo para testing
   * @param {number} cantidad - Cantidad de registros a generar
   * @returns {Array} Array de trámites habilitados de ejemplo
   */
  generateSampleData(cantidad = 5) {
    const periodosAcademicos = ['2025-1', '2025-2', '2026-1', '2026-2'];
    const sedes = ['Cartagena', 'Barranquilla', 'Santa Marta', 'Montería'];
    const tramites = [
      { id: 'tramite_1', nombre: 'Matrícula Académica' },
      { id: 'tramite_2', nombre: 'Cambio de Programa' },
      { id: 'tramite_3', nombre: 'Homologación' },
      { id: 'tramite_4', nombre: 'Cancelación de Materias' },
    ];

    const sampleData = [];
    for (let i = 0; i < cantidad; i++) {
      const periodo =
        periodosAcademicos[
          Math.floor(Math.random() * periodosAcademicos.length)
        ];
      const sede = sedes[Math.floor(Math.random() * sedes.length)];
      const tramite = tramites[Math.floor(Math.random() * tramites.length)];

      const fechaInicio = this.generateRandomDate();
      const fechaFinalizacion = new Date(fechaInicio);
      fechaFinalizacion.setDate(fechaFinalizacion.getDate() + 30);

      const fechaInicioCorreccion = new Date(fechaFinalizacion);
      fechaInicioCorreccion.setDate(fechaInicioCorreccion.getDate() + 1);

      const fechaFinCorreccion = new Date(fechaInicioCorreccion);
      fechaFinCorreccion.setDate(fechaFinCorreccion.getDate() + 7);

      sampleData.push({
        periodoAcademico: periodo,
        semestre: HabilitarTramite.calcularSemestre(periodo),
        sede: sede,
        tramiteId: tramite.id,
        tramiteNombre: tramite.nombre,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFinalizacion: fechaFinalizacion.toISOString().split('T')[0],
        fechaInicioCorreccion: fechaInicioCorreccion
          .toISOString()
          .split('T')[0],
        fechaFinCorreccion: fechaFinCorreccion.toISOString().split('T')[0],
        estado: 'activo',
      });
    }

    return sampleData;
  }

  /**
   * Genera una fecha aleatoria
   * @returns {Date} Fecha aleatoria
   */
  generateRandomDate() {
    const start = new Date(2025, 0, 1);
    const end = new Date(2026, 11, 31);
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
}
