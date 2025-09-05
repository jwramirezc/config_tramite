/**
 * Aplicación principal del sistema de gestión de trámites
 * Coordina la inicialización y gestión de todos los módulos
 */
class TramiteApp {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.eventManager = new EventManager();
    this.storageManager = new StorageManager();

    // Servicios principales
    this.tramiteService = null;
    this.documentoService = null;
    this.fechaService = null;
    this.estadoService = null;

    // Controladores principales
    this.tramiteController = null;
    this.documentoController = null;
    this.fechaController = null;
    this.estadoController = null;

    // Vistas principales
    this.tramiteView = null;
    this.documentoView = null;
    this.fechaView = null;
    this.estadoView = null;
  }

  /**
   * Inicializa la aplicación
   */
  async initialize() {
    try {
      console.log('🚀 Inicializando aplicación de gestión de trámites...');

      // Inicializar gestores core
      await this.initializeCoreManagers();

      // Inicializar servicios
      await this.initializeServices();

      // Inicializar controladores
      await this.initializeControllers();

      // Inicializar vistas
      await this.initializeViews();

      // Configurar eventos globales
      this.setupGlobalEvents();

      // Configurar navegación
      this.setupNavigation();

      this.isInitialized = true;
      console.log('✅ Aplicación inicializada correctamente');

      // Emitir evento de inicialización completa
      this.eventManager.emit('app:initialized');
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      this.showError('Error al inicializar la aplicación: ' + error.message);
      throw error;
    }
  }

  /**
   * Inicializa los gestores core
   */
  async initializeCoreManagers() {
    console.log('🔧 Inicializando gestores core...');

    // Configurar cifrado para datos sensibles (opcional)
    // this.storageManager.enableEncryption('clave-secreta-2024');

    console.log('✅ Gestores core inicializados');
  }

  /**
   * Inicializa los servicios
   */
  async initializeServices() {
    console.log('🔌 Inicializando servicios...');

    // Crear instancias de servicios
    this.tramiteService = new TramiteService();
    this.documentoService = new DocumentoService();
    this.fechaService = new FechaService();
    this.estadoService = new EstadoService();

    // Inicializar servicios
    await Promise.all([
      this.tramiteService.initialize(),
      this.documentoService.initialize(),
      this.fechaService.initialize(),
      this.estadoService.initialize(),
    ]);

    // Registrar servicios en el mapa de módulos
    this.modules.set('tramiteService', this.tramiteService);
    this.modules.set('documentoService', this.documentoService);
    this.modules.set('fechaService', this.fechaService);
    this.modules.set('estadoService', this.estadoService);

    console.log('✅ Servicios inicializados');
  }

  /**
   * Inicializa los controladores
   */
  async initializeControllers() {
    console.log('🎮 Inicializando controladores...');

    // Crear instancias de controladores
    this.tramiteController = new TramiteController(
      this.tramiteService,
      null, // TramiteView se creará después
      this.eventManager // Pasar el EventManager compartido
    );

    this.documentoController = new DocumentoController(
      this.documentoService,
      this.tramiteService,
      this.eventManager
    );

    this.fechaController = new FechaController(
      this.fechaService,
      this.tramiteService,
      this.eventManager
    );

    this.estadoController = new EstadoController(
      this.estadoService,
      this.tramiteService,
      this.eventManager
    );

    // Los controladores se inicializarán después de que se les asignen las vistas
    console.log('✅ Controladores creados');

    // Registrar controladores en el mapa de módulos
    this.modules.set('tramiteController', this.tramiteController);
    this.modules.set('documentoController', this.documentoController);
    this.modules.set('fechaController', this.fechaController);
    this.modules.set('estadoController', this.estadoController);

    console.log('✅ Controladores inicializados');
  }

  /**
   * Inicializa las vistas
   */
  async initializeViews() {
    console.log('🎨 Inicializando vistas...');

    // Crear instancias de vistas
    this.tramiteView = new TramiteView();
    this.documentoView = new DocumentoView();
    this.fechaView = new FechaView();
    this.estadoView = new EstadoView();

    // Inicializar vistas
    await Promise.all([
      this.tramiteView.initialize(),
      this.documentoView.initialize(),
      this.fechaView.initialize(),
      this.estadoView.initialize(),
    ]);

    // Actualizar los controladores con sus vistas correspondientes
    this.tramiteController.tramiteView = this.tramiteView;
    this.documentoController.documentoView = this.documentoView;
    this.fechaController.fechaView = this.fechaView;
    this.estadoController.estadoView = this.estadoView;

    // Registrar vistas en el mapa de módulos
    this.modules.set('tramiteView', this.tramiteView);
    this.modules.set('documentoView', this.documentoView);
    this.modules.set('fechaView', this.fechaView);
    this.modules.set('estadoView', this.estadoView);

    console.log('✅ Vistas inicializadas');

    // Ahora inicializar los controladores después de que tengan sus vistas
    console.log('🎮 Inicializando controladores...');
    await Promise.all([
      this.tramiteController.initialize(),
      this.documentoController.initialize(),
      this.fechaController.initialize(),
      this.estadoController.initialize(),
    ]);
    console.log('✅ Controladores inicializados');
  }

  /**
   * Configura eventos globales
   */
  setupGlobalEvents() {
    console.log('📡 Configurando eventos globales...');

    // Eventos de navegación
    this.eventManager.on('navigation:change', data => {
      this.handleNavigationChange(data);
    });

    // Eventos de trámites
    this.eventManager.on('tramite:created', data => {
      this.handleTramiteCreated(data);
    });

    this.eventManager.on('tramite:updated', data => {
      this.handleTramiteUpdated(data);
    });

    this.eventManager.on('tramite:deleted', data => {
      this.handleTramiteDeleted(data);
    });

    // Eventos de documentos
    this.eventManager.on('documento:created', data => {
      this.handleDocumentoCreated(data);
    });

    this.eventManager.on('documento:updated', data => {
      this.handleDocumentoUpdated(data);
    });

    this.eventManager.on('documento:deleted', data => {
      this.handleDocumentoDeleted(data);
    });

    // Eventos de fechas
    this.eventManager.on('fecha:created', data => {
      this.handleFechaCreated(data);
    });

    this.eventManager.on('fecha:updated', data => {
      this.handleFechaUpdated(data);
    });

    this.eventManager.on('fecha:deleted', data => {
      this.handleFechaDeleted(data);
    });

    // Eventos de estados
    this.eventManager.on('estado:changed', data => {
      this.handleEstadoChanged(data);
    });

    console.log('✅ Eventos globales configurados');
  }

  /**
   * Configura la navegación
   */
  setupNavigation() {
    console.log('🧭 Configurando navegación...');

    // Configurar navegación por hash
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Configurar navegación inicial
    this.handleHashChange();

    console.log('✅ Navegación configurada');
  }

  /**
   * Maneja cambios en la navegación
   */
  handleNavigationChange(data) {
    const { module, action, params } = data;

    switch (module) {
      case 'tramite':
        this.navigateToTramite(action, params);
        break;
      case 'documento':
        this.navigateToDocumento(action, params);
        break;
      case 'fecha':
        this.navigateToFecha(action, params);
        break;
      case 'estado':
        this.navigateToEstado(action, params);
        break;
      default:
        console.warn('Módulo de navegación no reconocido:', module);
    }
  }

  /**
   * Maneja cambios en el hash de la URL
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'tramite:list';
    const [module, action] = hash.split(':');
    const params = this.parseHashParams();

    this.eventManager.emit('navigation:change', { module, action, params });
  }

  /**
   * Parsea parámetros del hash
   */
  parseHashParams() {
    const params = {};
    const queryString = window.location.hash.split('?')[1];

    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    return params;
  }

  /**
   * Navega a funcionalidades de trámites
   */
  navigateToTramite(action, params) {
    switch (action) {
      case 'list':
        // Mostrar la tabla de trámites (ya está renderizada por defecto)
        console.log('📋 Navegando a lista de trámites');
        break;
      case 'create':
        this.tramiteView.showCreateModal();
        break;
      case 'edit':
        this.tramiteView.showOpcionesModal(params.id);
        break;
      case 'view':
        this.tramiteView.showOpcionesModal(params.id);
        break;
      default:
        console.log('📋 Acción no reconocida, mostrando vista por defecto');
    }
  }

  /**
   * Navega a funcionalidades de documentos
   */
  navigateToDocumento(action, params) {
    switch (action) {
      case 'list':
        this.documentoView.showList(params.tramiteId);
        break;
      case 'create':
        this.documentoView.showCreateForm(params.tramiteId);
        break;
      case 'edit':
        this.documentoView.showEditForm(params.id);
        break;
      case 'view':
        this.documentoView.showDetails(params.id);
        break;
      default:
        this.documentoView.showList(params.tramiteId);
    }
  }

  /**
   * Navega a funcionalidades de fechas
   */
  navigateToFecha(action, params) {
    switch (action) {
      case 'list':
        this.fechaView.showList(params.tramiteId);
        break;
      case 'create':
        this.fechaView.showCreateForm(params.tramiteId);
        break;
      case 'edit':
        this.fechaView.showEditForm(params.id);
        break;
      case 'view':
        this.fechaView.showDetails(params.id);
        break;
      default:
        this.fechaView.showList(params.tramiteId);
    }
  }

  /**
   * Navega a funcionalidades de estados
   */
  navigateToEstado(action, params) {
    switch (action) {
      case 'list':
        this.estadoView.showList(params.tramiteId);
        break;
      case 'change':
        this.estadoView.showChangeForm(params.tramiteId);
        break;
      case 'history':
        this.estadoView.showHistory(params.tramiteId);
        break;
      default:
        this.estadoView.showList(params.tramiteId);
    }
  }

  /**
   * Maneja eventos de trámites creados
   */
  handleTramiteCreated(data) {
    console.log('📋 Trámite creado:', data);
    this.showSuccess('Trámite creado exitosamente');

    // Actualizar vista si es necesario
    if (this.tramiteView) {
      this.tramiteView.refreshList();
    }
  }

  /**
   * Maneja eventos de trámites actualizados
   */
  handleTramiteUpdated(data) {
    console.log('📋 Trámite actualizado:', data);
    this.showSuccess('Trámite actualizado exitosamente');

    // Actualizar vista si es necesario
    if (this.tramiteView) {
      this.tramiteView.refreshList();
    }
  }

  /**
   * Maneja eventos de trámites eliminados
   */
  handleTramiteDeleted(data) {
    console.log('📋 Trámite eliminado:', data);
    this.showSuccess('Trámite eliminado exitosamente');

    // Actualizar vista si es necesario
    if (this.tramiteView) {
      this.tramiteView.refreshList();
    }
  }

  /**
   * Maneja eventos de documentos creados
   */
  handleDocumentoCreated(data) {
    console.log('📚 Documento creado:', data);
    this.showSuccess('Documento creado exitosamente');
  }

  /**
   * Maneja eventos de documentos actualizados
   */
  handleDocumentoUpdated(data) {
    console.log('📚 Documento actualizado:', data);
    this.showSuccess('Documento actualizado exitosamente');
  }

  /**
   * Maneja eventos de documentos eliminados
   */
  handleDocumentoDeleted(data) {
    console.log('📚 Documento eliminado:', data);
    this.showSuccess('Documento eliminado exitosamente');
  }

  /**
   * Maneja eventos de fechas creadas
   */
  handleFechaCreated(data) {
    console.log('📅 Fecha creada:', data);
    this.showSuccess('Fechas configuradas exitosamente');
  }

  /**
   * Maneja eventos de fechas actualizadas
   */
  handleFechaUpdated(data) {
    console.log('📅 Fecha actualizada:', data);
    this.showSuccess('Fechas actualizadas exitosamente');
  }

  /**
   * Maneja eventos de fechas eliminadas
   */
  handleFechaDeleted(data) {
    console.log('📅 Fecha eliminada:', data);
    this.showSuccess('Fechas eliminadas exitosamente');
  }

  /**
   * Maneja eventos de cambios de estado
   */
  handleEstadoChanged(data) {
    console.log('🔄 Estado cambiado:', data);
    this.showSuccess(`Estado cambiado a: ${data.nuevoEstado}`);
  }

  /**
   * Obtiene un módulo por nombre
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Obtiene un servicio por nombre
   */
  getService(name) {
    const serviceName = name + 'Service';
    return this.modules.get(serviceName);
  }

  /**
   * Obtiene un controlador por nombre
   */
  getController(name) {
    const controllerName = name + 'Controller';
    return this.modules.get(controllerName);
  }

  /**
   * Obtiene una vista por nombre
   */
  getView(name) {
    const viewName = name + 'View';
    return this.modules.get(viewName);
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(message) {
    if (this.tramiteView) {
      this.tramiteView.showAlert(message, 'success');
    } else {
      console.log('✅ ' + message);
    }
  }

  /**
   * Muestra un mensaje de error
   */
  showError(message) {
    if (this.tramiteView) {
      this.tramiteView.showAlert(message, 'danger');
    } else {
      console.error('❌ ' + message);
    }
  }

  /**
   * Muestra un mensaje de advertencia
   */
  showWarning(message) {
    if (this.tramiteView) {
      this.tramiteView.showAlert(message, 'warning');
    } else {
      console.warn('⚠️ ' + message);
    }
  }

  /**
   * Muestra un mensaje informativo
   */
  showInfo(message) {
    if (this.tramiteView) {
      this.tramiteView.showAlert(message, 'info');
    } else {
      console.info('ℹ️ ' + message);
    }
  }

  /**
   * Obtiene información de debug de la aplicación
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      modules: Array.from(this.modules.keys()),
      eventManager: this.eventManager.getDebugInfo(),
      storageManager: this.storageManager.getUsageInfo(),
      services: {
        tramite: this.tramiteService ? this.tramiteService.getStats() : null,
        documento: this.documentoService
          ? this.documentoService.getStats()
          : null,
        fecha: this.fechaService ? this.fechaService.getStats() : null,
        estado: this.estadoService ? this.estadoService.getStats() : null,
      },
    };
  }

  /**
   * Limpia todos los recursos de la aplicación
   */
  cleanup() {
    console.log('🧹 Limpiando recursos de la aplicación...');

    // Limpiar controladores
    if (this.tramiteController) this.tramiteController.cleanup();
    if (this.documentoController) this.documentoController.cleanup();
    if (this.fechaController) this.fechaController.cleanup();
    if (this.estadoController) this.estadoController.cleanup();

    // Limpiar vistas
    if (this.tramiteView) this.tramiteView.cleanup();
    if (this.documentoView) this.documentoView.cleanup();
    if (this.fechaView) this.fechaView.cleanup();
    if (this.estadoView) this.estadoView.cleanup();

    // Limpiar servicios
    if (this.tramiteService) this.tramiteService.cleanup();
    if (this.documentoService) this.documentoService.cleanup();
    if (this.fechaService) this.fechaService.cleanup();
    if (this.estadoService) this.estadoService.cleanup();

    // Limpiar gestores core
    if (this.eventManager) this.eventManager.cleanup();
    if (this.storageManager) this.storageManager.cleanup();

    this.isInitialized = false;
    this.modules.clear();

    console.log('✅ Recursos de la aplicación limpiados');
  }
}

// Crear instancia global de la aplicación
window.tramiteApp = new TramiteApp();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.tramiteApp.initialize();
  } catch (error) {
    console.error('Error fatal al inicializar la aplicación:', error);
  }
});

// Manejar eventos de cierre de la página
window.addEventListener('beforeunload', () => {
  if (window.tramiteApp) {
    window.tramiteApp.cleanup();
  }
});
