/**
 * Vista base para todas las funcionalidades del sistema
 * Proporciona métodos comunes para la interfaz de usuario
 */
class BaseView {
  constructor() {
    this.modals = new Map();
    this.tooltips = new Map();
    this.isInitialized = false;
  }

  /**
   * Inicializa la vista
   */
  async initialize() {
    try {
      this.setupCommonElements();
      this.isInitialized = true;
    } catch (error) {
      console.error(`❌ Error al inicializar ${this.constructor.name}:`, error);
      throw error;
    }
  }

  /**
   * Configura elementos comunes de la vista
   */
  setupCommonElements() {
    // Método a implementar en las clases hijas
    throw new Error(
      'setupCommonElements debe ser implementado en la clase hija'
    );
  }

  /**
   * Valida que la vista esté inicializada
   */
  validateInitialization() {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name} no ha sido inicializada`);
    }
  }

  /**
   * Muestra un mensaje de alerta usando Bootstrap alerts
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, warning, info)
   * @param {number} duration - Duración en milisegundos (0 para no auto-cerrar)
   */
  showAlert(message, type = 'info', duration = 5000) {
    this.validateInitialization();

    // Obtener o crear el contenedor de alertas fijo
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alertContainer';
      alertContainer.className = 'position-fixed top-0 end-0 p-3';
      alertContainer.style.zIndex = '9999';
      document.body.appendChild(alertContainer);
    }

    // Crear el HTML de la alerta
    const alertId =
      'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const alertHTML = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center">
          <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
          <span>${this.escapeHtml(message)}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    // Agregar la alerta al contenedor
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);

    // Obtener la alerta recién creada
    const alertElement = document.getElementById(alertId);

    // Configurar auto-cierre si se especifica duración
    if (duration > 0) {
      setTimeout(() => {
        if (alertElement && alertElement.parentNode) {
          const bsAlert = new bootstrap.Alert(alertElement);
          bsAlert.close();
        }
      }, duration);
    }

    // Configurar evento para remover el elemento del DOM después de cerrar
    alertElement.addEventListener('closed.bs.alert', () => {
      if (alertElement.parentNode) {
        alertElement.parentNode.removeChild(alertElement);
      }
    });
  }

  /**
   * Obtiene el icono para el tipo de alerta
   * @param {string} type - Tipo de alerta
   * @returns {string} Clase del icono
   */
  getAlertIcon(type) {
    const icons = {
      success: 'check-circle',
      danger: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle',
    };
    return icons[type] || 'info-circle';
  }

  /**
   * Muestra un modal de confirmación
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {Function} onConfirm - Función a ejecutar al confirmar
   * @param {string} confirmText - Texto del botón confirmar
   * @param {string} cancelText - Texto del botón cancelar
   */
  showConfirmModal(
    title,
    message,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) {
    this.validateInitialization();

    const modalHTML = `
      <div class="modal fade" id="confirmModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.escapeHtml(title)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${this.escapeHtml(message)}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                ${this.escapeHtml(cancelText)}
              </button>
              <button type="button" class="btn btn-danger" id="confirmBtn">
                ${this.escapeHtml(confirmText)}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('confirmModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar eventos
    const modal = document.getElementById('confirmModal');
    const confirmBtn = document.getElementById('confirmBtn');

    confirmBtn.addEventListener('click', () => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();
      if (onConfirm) {
        onConfirm();
      }
    });

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal después de cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  /**
   * Crea y muestra un modal personalizado
   * @param {string} id - ID del modal
   * @param {string} html - HTML del modal
   * @param {Object} options - Opciones del modal
   */
  showCustomModal(id, html, options = {}) {
    this.validateInitialization();

    const {
      size = 'modal-md',
      backdrop = true,
      keyboard = true,
      focus = true,
    } = options;

    // Remover modal anterior si existe
    const existingModal = document.getElementById(id);
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', html);

    // Mostrar modal
    const modal = document.getElementById(id);
    const bsModal = new bootstrap.Modal(modal, {
      backdrop,
      keyboard,
      focus,
    });
    bsModal.show();

    // Limpiar modal después de cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });

    return { modal, bsModal };
  }

  /**
   * Cierra un modal específico
   * @param {string} modalId - ID del modal a cerrar
   */
  hideModal(modalId) {
    this.validateInitialization();

    const modal = document.getElementById(modalId);
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return text;
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inicializa los tooltips de Bootstrap
   * @param {string} selector - Selector para los tooltips
   */
  initializeTooltips(selector = '[data-bs-toggle="tooltip"]') {
    this.validateInitialization();

    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll(selector)
    );
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      const tooltip = new bootstrap.Tooltip(tooltipTriggerEl);
      this.tooltips.set(tooltipTriggerEl, tooltip);
    });
  }

  /**
   * Destruye todos los tooltips
   */
  destroyTooltips() {
    this.tooltips.forEach(tooltip => {
      tooltip.dispose();
    });
    this.tooltips.clear();
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string|Date} fecha - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(fecha) {
    if (!fecha) return '';

    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  /**
   * Formatea una fecha y hora para mostrar
   * @param {string|Date} fecha - Fecha a formatear
   * @returns {string} Fecha y hora formateada
   */
  formatDateTime(fecha) {
    if (!fecha) return '';

    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error al formatear fecha y hora:', error);
      return '';
    }
  }

  /**
   * Crea un badge de estado
   * @param {string} text - Texto del badge
   * @param {string} type - Tipo de badge (primary, secondary, success, danger, warning, info)
   * @returns {string} HTML del badge
   */
  createBadge(text, type = 'secondary') {
    return `<span class="badge bg-${type}">${this.escapeHtml(text)}</span>`;
  }

  /**
   * Crea un icono con texto
   * @param {string} iconClass - Clase del icono
   * @param {string} text - Texto del icono
   * @param {string} marginClass - Clase de margen (me-1, me-2, etc.)
   * @returns {string} HTML del icono con texto
   */
  createIconWithText(iconClass, text, marginClass = 'me-2') {
    return `<i class="${iconClass} ${marginClass}"></i>${this.escapeHtml(
      text
    )}`;
  }

  /**
   * Valida un formulario
   * @param {HTMLFormElement} form - Formulario a validar
   * @returns {Object} Resultado de la validación
   */
  validateForm(form) {
    this.validateInitialization();

    if (!form || !(form instanceof HTMLFormElement)) {
      return { isValid: false, errors: ['Formulario no válido'] };
    }

    const errors = [];
    const formElements = form.elements;

    for (let element of formElements) {
      if (element.hasAttribute('required') && !element.value.trim()) {
        const label =
          element.labels?.[0]?.textContent || element.name || element.id;
        errors.push(`El campo "${label}" es requerido`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Obtiene los datos de un formulario
   * @param {HTMLFormElement} form - Formulario
   * @returns {Object} Datos del formulario
   */
  getFormData(form) {
    this.validateInitialization();

    if (!form || !(form instanceof HTMLFormElement)) {
      return {};
    }

    const formData = {};
    const formElements = form.elements;

    for (let element of formElements) {
      if (element.name || element.id) {
        const key = element.name || element.id;

        if (element.type === 'checkbox') {
          formData[key] = element.checked;
        } else if (element.type === 'radio') {
          if (element.checked) {
            formData[key] = element.value;
          }
        } else if (element.type === 'select-multiple') {
          formData[key] = Array.from(element.selectedOptions).map(
            option => option.value
          );
        } else {
          formData[key] = element.value;
        }
      }
    }

    return formData;
  }

  /**
   * Llena un formulario con datos
   * @param {HTMLFormElement} form - Formulario a llenar
   * @param {Object} data - Datos para llenar el formulario
   */
  fillForm(form, data) {
    this.validateInitialization();

    if (!form || !(form instanceof HTMLFormElement) || !data) {
      return;
    }

    Object.keys(data).forEach(key => {
      const element = form.elements[key] || document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(data[key]);
        } else if (element.type === 'radio') {
          const radioElement = form.querySelector(
            `input[name="${key}"][value="${data[key]}"]`
          );
          if (radioElement) {
            radioElement.checked = true;
          }
        } else if (element.type === 'select-multiple') {
          if (Array.isArray(data[key])) {
            data[key].forEach(value => {
              const option = element.querySelector(`option[value="${value}"]`);
              if (option) {
                option.selected = true;
              }
            });
          }
        } else {
          element.value = data[key] || '';
        }
      }
    });
  }

  /**
   * Limpia un formulario
   * @param {HTMLFormElement} form - Formulario a limpiar
   */
  clearForm(form) {
    this.validateInitialization();

    if (form && form instanceof HTMLFormElement) {
      form.reset();
    }
  }

  /**
   * Muestra un indicador de carga
   * @param {string} message - Mensaje a mostrar
   * @param {string} containerId - ID del contenedor donde mostrar el indicador
   */
  showLoading(message = 'Cargando...', containerId = null) {
    this.validateInitialization();

    const loadingHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2 text-muted">${this.escapeHtml(message)}</p>
      </div>
    `;

    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = loadingHTML;
      }
    } else {
      // Crear un indicador flotante
      const loadingId = 'loading_' + Date.now();
      const floatingLoading = `
        <div id="${loadingId}" class="position-fixed top-50 start-50 translate-middle bg-white border rounded p-4 shadow" style="z-index: 9999;">
          ${loadingHTML}
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', floatingLoading);

      // Retornar el ID para poder ocultarlo después
      return loadingId;
    }
  }

  /**
   * Oculta un indicador de carga
   * @param {string} loadingId - ID del indicador de carga
   */
  hideLoading(loadingId) {
    this.validateInitialization();

    if (loadingId) {
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  /**
   * Limpia los recursos de la vista
   */
  cleanup() {
    this.destroyTooltips();
    this.modals.clear();
    this.isInitialized = false;
  }
}
