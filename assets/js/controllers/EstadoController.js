/**
 * Controlador para gestión de estados de trámites
 * Extiende BaseController para funcionalidades específicas de estados
 */
class EstadoController extends BaseController {
  constructor(estadoService, tramiteService, eventManager = null) {
    super(eventManager);
    this.estadoService = estadoService;
    this.tramiteService = tramiteService;
    this.estadoView = null; // Se asignará después
  }

  /**
   * Configura las dependencias del controlador
   */
  async setupDependencies() {
    if (!this.estadoService) {
      throw new Error('EstadoService es requerido');
    }
    if (!this.tramiteService) {
      throw new Error('TramiteService es requerido');
    }
  }

  /**
   * Configura los event listeners del controlador
   */
  setupEventListeners() {
    // Eventos específicos de estados
    this.eventManager.on('estado:create', data => {
      this.createEstado(data);
    });

    this.eventManager.on('estado:update', data => {
      this.updateEstado(data);
    });

    this.eventManager.on('estado:delete', data => {
      this.deleteEstado(data);
    });
  }

  /**
   * Inicializa el controlador
   */
  async initialize() {}

  /**
   * Crea un nuevo estado
   * @param {Object} data - Datos del estado
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createEstado(data) {
    return await this.executeAction(async () => {
      const estado = new Estado(data);
      const result = await this.estadoService.create(estado);

      if (result.success) {
        this.eventManager.emit('estado:created', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'crear estado');
  }

  /**
   * Actualiza un estado existente
   * @param {string} id - ID del estado
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateEstado(id, data) {
    return await this.executeAction(async () => {
      const result = await this.estadoService.update(id, data);

      if (result.success) {
        this.eventManager.emit('estado:updated', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'actualizar estado');
  }

  /**
   * Elimina un estado
   * @param {string} id - ID del estado
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteEstado(id) {
    return await this.executeAction(async () => {
      const result = await this.estadoService.delete(id);

      if (result.success) {
        this.eventManager.emit('estado:deleted', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'eliminar estado');
  }
}
