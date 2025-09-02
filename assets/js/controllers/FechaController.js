/**
 * Controlador para gestión de fechas de trámites
 * Extiende BaseController para funcionalidades específicas de fechas
 */
class FechaController extends BaseController {
  constructor(fechaService, tramiteService, eventManager = null) {
    super(eventManager);
    this.fechaService = fechaService;
    this.tramiteService = tramiteService;
    this.fechaView = null; // Se asignará después
  }

  /**
   * Configura las dependencias del controlador
   */
  async setupDependencies() {
    if (!this.fechaService) {
      throw new Error('FechaService es requerido');
    }
    if (!this.tramiteService) {
      throw new Error('TramiteService es requerido');
    }
  }

  /**
   * Configura los event listeners del controlador
   */
  setupEventListeners() {
    // Eventos específicos de fechas
    this.eventManager.on('fecha:create', data => {
      this.createFecha(data);
    });

    this.eventManager.on('fecha:update', data => {
      this.updateFecha(data);
    });

    this.eventManager.on('fecha:delete', data => {
      this.deleteFecha(data);
    });
  }

  /**
   * Inicializa el controlador
   */
  async initialize() {
    console.log('🎮 FechaController inicializado');
  }

  /**
   * Crea una nueva fecha
   * @param {Object} data - Datos de la fecha
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createFecha(data) {
    return await this.executeAction(async () => {
      const fecha = new Fecha(data);
      const result = await this.fechaService.create(fecha);

      if (result.success) {
        this.eventManager.emit('fecha:created', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'crear fecha');
  }

  /**
   * Actualiza una fecha existente
   * @param {string} id - ID de la fecha
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateFecha(id, data) {
    return await this.executeAction(async () => {
      const result = await this.fechaService.update(id, data);

      if (result.success) {
        this.eventManager.emit('fecha:updated', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'actualizar fecha');
  }

  /**
   * Elimina una fecha
   * @param {string} id - ID de la fecha
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteFecha(id) {
    return await this.executeAction(async () => {
      const result = await this.fechaService.delete(id);

      if (result.success) {
        this.eventManager.emit('fecha:deleted', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'eliminar fecha');
  }
}
