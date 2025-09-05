/**
 * Controlador para gestión de documentos de trámites
 * Extiende BaseController para funcionalidades específicas de documentos
 */
class DocumentoController extends BaseController {
  constructor(documentoService, tramiteService, eventManager = null) {
    super(eventManager);
    this.documentoService = documentoService;
    this.tramiteService = tramiteService;
    this.documentoView = null; // Se asignará después
    this.currentTramiteId = null;
    this.currentDocumento = null;
  }

  /**
   * Configura las dependencias del controlador
   */
  async setupDependencies() {
    if (!this.documentoService) {
      throw new Error('DocumentoService es requerido');
    }
    if (!this.tramiteService) {
      throw new Error('TramiteService es requerido');
    }
  }

  /**
   * Configura los event listeners del controlador
   */
  setupEventListeners() {
    // Eventos específicos de documentos
    this.eventManager.on('documento:create', data => {
      this.createDocumento(data);
    });

    this.eventManager.on('documento:update', data => {
      this.updateDocumento(data);
    });

    this.eventManager.on('documento:delete', data => {
      this.deleteDocumento(data);
    });

    this.eventManager.on('documento:view', data => {
      this.viewDocumento(data);
    });

    this.eventManager.on('documento:list', data => {
      this.listDocumentos(data);
    });

    // Evento específico para crear documento desde el formulario
    this.eventManager.on('documento:createFromForm', data => {
      this.createDocumentoFromForm(data);
    });
  }

  /**
   * Inicializa el controlador
   */
  async initialize() {
    await this.setupDependencies();
    this.setupEventListeners();
    this.isInitialized = true; // Marcar como inicializado
  }

  /**
   * Crea un nuevo documento
   * @param {Object} data - Datos del documento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createDocumento(data) {
    return await this.executeAction(async () => {
      const documento = Documento.fromFormData(data);
      const result = await this.documentoService.create(documento);

      if (result.success) {
        this.eventManager.emit('documento:created', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'crear documento');
  }

  /**
   * Crea un nuevo documento desde el formulario "Crear Documento"
   * @param {Object} data - Datos del evento con formData y callback
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createDocumentoFromForm(data) {
    return await this.executeAction(async () => {
      const { formData, callback } = data;

      const result = await this.documentoService.createDocumentoFromForm(
        formData
      );

      if (result.success) {
        this.eventManager.emit('documento:createdFromForm', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      // Ejecutar callback si está disponible
      if (callback && typeof callback === 'function') {
        callback(result);
      }

      return result;
    }, 'crear documento desde formulario');
  }

  /**
   * Actualiza un documento existente
   * @param {string} id - ID del documento
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateDocumento(id, data) {
    return await this.executeAction(async () => {
      const result = await this.documentoService.update(id, data);

      if (result.success) {
        this.eventManager.emit('documento:updated', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'actualizar documento');
  }

  /**
   * Elimina un documento
   * @param {string} id - ID del documento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteDocumento(id) {
    return await this.executeAction(async () => {
      const result = await this.documentoService.delete(id);

      if (result.success) {
        this.eventManager.emit('documento:deleted', result.item);
        this.showSuccess(result.message);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'eliminar documento');
  }

  /**
   * Obtiene un documento por ID
   * @param {string} id - ID del documento
   * @returns {Promise<Documento|null>} Documento encontrado o null
   */
  async getDocumento(id) {
    return await this.executeAction(async () => {
      return this.documentoService.getById(id);
    }, 'obtener documento');
  }

  /**
   * Obtiene todos los documentos de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<Array>} Array de documentos
   */
  async getDocumentosByTramite(tramiteId) {
    return await this.executeAction(async () => {
      return this.documentoService.getByTramiteId(tramiteId);
    }, 'obtener documentos del trámite');
  }

  /**
   * Obtiene documentos por tipo documental
   * @param {string} tipoDocumental - Tipo de documento
   * @returns {Promise<Array>} Array de documentos
   */
  async getDocumentosByTipo(tipoDocumental) {
    return await this.executeAction(async () => {
      return this.documentoService.getByTipoDocumental(tipoDocumental);
    }, 'obtener documentos por tipo');
  }

  /**
   * Obtiene documentos por área solicitante
   * @param {string} areaSolicitante - Área solicitante
   * @returns {Promise<Array>} Array de documentos
   */
  async getDocumentosByArea(areaSolicitante) {
    return await this.executeAction(async () => {
      return this.documentoService.getByAreaSolicitante(areaSolicitante);
    }, 'obtener documentos por área');
  }

  /**
   * Busca documentos por texto
   * @param {string} searchText - Texto a buscar
   * @returns {Promise<Array>} Array de documentos que coinciden
   */
  async searchDocumentos(searchText) {
    return await this.executeAction(async () => {
      return this.documentoService.searchByText(searchText);
    }, 'buscar documentos');
  }

  /**
   * Obtiene estadísticas de documentos
   * @returns {Promise<Object>} Estadísticas
   */
  async getDocumentosStats() {
    return await this.executeAction(async () => {
      return this.documentoService.getStats();
    }, 'obtener estadísticas de documentos');
  }

  /**
   * Genera datos de ejemplo para documentos
   * @param {number} count - Número de documentos a generar
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<Object>} Resultado de la operación
   */
  async generateSampleDocumentos(count, tramiteId) {
    return await this.executeAction(async () => {
      const result = await this.documentoService.generateSampleData(
        count,
        tramiteId
      );

      if (result.success) {
        this.showSuccess(result.message);
        this.eventManager.emit('documento:sampleGenerated', result.documentos);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'generar documentos de ejemplo');
  }

  /**
   * Exporta documentos de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<string|null>} JSON string o null
   */
  async exportDocumentos(tramiteId) {
    return await this.executeAction(async () => {
      return this.documentoService.exportByTramiteId(tramiteId);
    }, 'exportar documentos');
  }

  /**
   * Importa documentos para un trámite
   * @param {string} tramiteId - ID del trámite
   * @param {string} jsonData - Datos JSON
   * @returns {Promise<Object>} Resultado de la operación
   */
  async importDocumentos(tramiteId, jsonData) {
    return await this.executeAction(async () => {
      const result = await this.documentoService.importByTramiteId(
        tramiteId,
        jsonData
      );

      if (result.success) {
        this.showSuccess(result.message);
        this.eventManager.emit('documento:imported', result.documentos);
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'importar documentos');
  }

  /**
   * Limpia documentos de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<Object>} Resultado de la operación
   */
  async clearDocumentos(tramiteId) {
    return await this.executeAction(async () => {
      const result = await this.documentoService.clearByTramiteId(tramiteId);

      if (result.success) {
        this.showSuccess(result.message);
        this.eventManager.emit('documento:cleared', { tramiteId });
      } else {
        this.showError(result.errors.join(', '));
      }

      return result;
    }, 'limpiar documentos del trámite');
  }

  /**
   * Obtiene todos los tipos documentales únicos
   * @returns {Promise<Array>} Array de tipos documentales
   */
  async getTiposDocumentales() {
    return await this.executeAction(async () => {
      return this.documentoService.getAllTiposDocumentales();
    }, 'obtener tipos documentales');
  }

  /**
   * Obtiene todas las áreas solicitantes únicas
   * @returns {Promise<Array>} Array de áreas solicitantes
   */
  async getAreasSolicitantes() {
    return await this.executeAction(async () => {
      return this.documentoService.getAllAreasSolicitantes();
    }, 'obtener áreas solicitantes');
  }

  /**
   * Obtiene todos los responsables de validación únicos
   * @returns {Promise<Array>} Array de responsables
   */
  async getResponsablesValidacion() {
    return await this.executeAction(async () => {
      return this.documentoService.getAllResponsablesValidacion();
    }, 'obtener responsables de validación');
  }

  /**
   * Obtiene todas las etiquetas únicas
   * @returns {Promise<Array>} Array de etiquetas
   */
  async getTags() {
    return await this.executeAction(async () => {
      return this.documentoService.getAllTags();
    }, 'obtener etiquetas');
  }

  /**
   * Obtiene documentos por etiqueta
   * @param {string} tag - Etiqueta a buscar
   * @returns {Promise<Array>} Array de documentos
   */
  async getDocumentosByTag(tag) {
    return await this.executeAction(async () => {
      return this.documentoService.getByTag(tag);
    }, 'obtener documentos por etiqueta');
  }

  /**
   * Obtiene documentos activos
   * @returns {Promise<Array>} Array de documentos activos
   */
  async getDocumentosActivos() {
    return await this.executeAction(async () => {
      return this.documentoService.getActivos();
    }, 'obtener documentos activos');
  }

  /**
   * Obtiene documentos inactivos
   * @returns {Promise<Array>} Array de documentos inactivos
   */
  async getDocumentosInactivos() {
    return await this.executeAction(async () => {
      return this.documentoService.getInactivos();
    }, 'obtener documentos inactivos');
  }

  /**
   * Valida un documento
   * @param {Object} data - Datos del documento a validar
   * @returns {Object} Resultado de la validación
   */
  validateDocumento(data) {
    const documento = new Documento(data);
    return documento.validate();
  }

  /**
   * Establece el trámite actual para operaciones
   * @param {string} tramiteId - ID del trámite
   */
  setCurrentTramite(tramiteId) {
    this.currentTramiteId = tramiteId;
  }

  /**
   * Obtiene el trámite actual
   * @returns {string|null} ID del trámite actual
   */
  getCurrentTramite() {
    return this.currentTramiteId;
  }

  /**
   * Establece el documento actual para operaciones
   * @param {Documento} documento - Documento actual
   */
  setCurrentDocumento(documento) {
    this.currentDocumento = documento;
  }

  /**
   * Obtiene el documento actual
   * @returns {Documento|null} Documento actual
   */
  getCurrentDocumento() {
    return this.currentDocumento;
  }

  /**
   * Limpia el documento actual
   */
  clearCurrentDocumento() {
    this.currentDocumento = null;
  }

  /**
   * Obtiene información del trámite asociado
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<Tramite|null>} Trámite encontrado o null
   */
  async getTramiteInfo(tramiteId) {
    return await this.executeAction(async () => {
      return this.tramiteService.getById(tramiteId);
    }, 'obtener información del trámite');
  }

  /**
   * Verifica si un trámite existe
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<boolean>} True si existe
   */
  async tramiteExists(tramiteId) {
    return await this.executeAction(async () => {
      const tramite = await this.tramiteService.getById(tramiteId);
      return tramite !== null;
    }, 'verificar existencia del trámite');
  }

  /**
   * Obtiene el resumen de documentos de un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise<Object>} Resumen de documentos
   */
  async getDocumentosResumen(tramiteId) {
    return await this.executeAction(async () => {
      const documentos = await this.documentoService.getByTramiteId(tramiteId);
      const stats = await this.documentoService.getStats();

      return {
        total: documentos.length,
        activos: documentos.filter(d => d.isActivo()).length,
        inactivos: documentos.filter(d => !d.isActivo()).length,
        porTipo: stats.tiposDocumentales,
        porArea: stats.areasSolicitantes,
        porResponsable: stats.responsablesValidacion,
      };
    }, 'obtener resumen de documentos');
  }
}
