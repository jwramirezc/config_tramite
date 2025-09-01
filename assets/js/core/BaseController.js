/**
 * Controlador base para todas las funcionalidades del sistema
 * Proporciona métodos comunes y gestión de dependencias
 */
class BaseController {
  constructor() {
    this.eventManager = new EventManager();
    this.storageManager = new StorageManager();
    this.isInitialized = false;
  }

  /**
   * Inicializa el controlador
   */
  async initialize() {
    try {
      await this.setupDependencies();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log(`✅ ${this.constructor.name} inicializado correctamente`);
    } catch (error) {
      console.error(`❌ Error al inicializar ${this.constructor.name}:`, error);
      throw error;
    }
  }

  /**
   * Configura las dependencias del controlador
   */
  async setupDependencies() {
    // Método a implementar en las clases hijas
    throw new Error('setupDependencies debe ser implementado en la clase hija');
  }

  /**
   * Configura los event listeners del controlador
   */
  setupEventListeners() {
    // Método a implementar en las clases hijas
    throw new Error(
      'setupEventListeners debe ser implementado en la clase hija'
    );
  }

  /**
   * Valida que el controlador esté inicializado
   */
  validateInitialization() {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name} no ha sido inicializado`);
    }
  }

  /**
   * Ejecuta una acción con validación de inicialización
   * @param {Function} action - Acción a ejecutar
   * @param {string} actionName - Nombre de la acción para logging
   */
  async executeAction(action, actionName = 'acción') {
    try {
      this.validateInitialization();
      return await action();
    } catch (error) {
      console.error(`❌ Error en ${actionName}:`, error);
      this.showError(`Error al ejecutar ${actionName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje de error
   */
  showError(message) {
    if (this.view && typeof this.view.showAlert === 'function') {
      this.view.showAlert(message, 'danger');
    } else {
      console.error(message);
    }
  }

  /**
   * Muestra un mensaje de éxito
   * @param {string} message - Mensaje de éxito
   */
  showSuccess(message) {
    if (this.view && typeof this.view.showAlert === 'function') {
      this.view.showAlert(message, 'success');
    } else {
      console.log(`✅ ${message}`);
    }
  }

  /**
   * Muestra un mensaje de advertencia
   * @param {string} message - Mensaje de advertencia
   */
  showWarning(message) {
    if (this.view && typeof this.view.showAlert === 'function') {
      this.view.showAlert(message, 'warning');
    } else {
      console.warn(`⚠️ ${message}`);
    }
  }

  /**
   * Muestra un mensaje informativo
   * @param {string} message - Mensaje informativo
   */
  showInfo(message) {
    if (this.view && typeof this.view.showAlert === 'function') {
      this.view.showAlert(message, 'info');
    } else {
      console.info(`ℹ️ ${message}`);
    }
  }

  /**
   * Limpia los recursos del controlador
   */
  cleanup() {
    if (this.eventManager) {
      this.eventManager.removeAllListeners();
    }
    this.isInitialized = false;
    console.log(`🧹 ${this.constructor.name} limpiado`);
  }
}
