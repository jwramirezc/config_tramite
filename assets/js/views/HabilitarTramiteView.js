/**
 * Vista para Habilitar Trámites
 * Maneja la interfaz de usuario para la gestión de trámites habilitados
 */
class HabilitarTramiteView extends BaseView {
  constructor() {
    super();
    this.modalId = 'modalHabilitarTramites';
    this.formId = 'formHabilitarTramites';
  }

  /**
   * Inicializa la vista
   */
  async initialize() {
    await super.initialize();
    this.setupCommonElements();
    this.setupEventListeners();
    console.log('✅ HabilitarTramiteView inicializada');
  }

  /**
   * Configura elementos comunes de la vista
   */
  setupCommonElements() {
    // Implementación requerida por BaseView
    console.log('🔧 Configurando elementos comunes de HabilitarTramiteView');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Event listener para el botón de abrir modal
    const btnHabilitarTramites = document.getElementById(
      'btnHabilitarTramites'
    );
    if (btnHabilitarTramites) {
      btnHabilitarTramites.addEventListener('click', () => {
        this.showModal();
      });
    }

    // Event listener para el formulario
    const form = document.getElementById(this.formId);
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Event listener para el selector de periodo académico
    const periodoSelect = document.getElementById('periodoAcademico');
    if (periodoSelect) {
      periodoSelect.addEventListener('change', e => {
        this.updateSemestre(e.target.value);
      });
    }

    // Event listener para el botón de guardar
    document.addEventListener('click', e => {
      if (e.target && e.target.id === 'btnGuardarHabilitarTramites') {
        e.preventDefault();
        this.handleFormSubmit();
      }
    });

    // Event listener para cuando el modal se cierre completamente
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        console.log('🔧 Modal cerrado completamente, limpiando estado...');
        this.limpiarEstadoVisual();
      });
    }

    console.log('✅ Event listeners configurados en HabilitarTramiteView');
  }

  /**
   * Muestra el modal de habilitar trámites
   */
  showModal() {
    console.log('🔧 Mostrando modal de habilitar trámites');
    this.cargarTramites();
    this.cargarPeriodosAcademicos();
    this.cargarSedes();
    this.resetForm();

    const modal = new bootstrap.Modal(document.getElementById(this.modalId));
    modal.show();
  }

  /**
   * Oculta el modal
   */
  hideModal() {
    console.log('🔧 Intentando cerrar modal:', this.modalId);
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      console.log('✅ Elemento modal encontrado');
      const modal =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);

      // Limpiar el formulario antes de cerrar
      this.resetForm();

      // Cerrar el modal
      modal.hide();
      console.log('✅ Modal cerrado');

      // Limpiar el estado visual después de un breve delay
      setTimeout(() => {
        this.limpiarEstadoVisual();
      }, 300);
    } else {
      console.error('❌ No se encontró el elemento modal:', this.modalId);
    }
  }

  /**
   * Limpia el estado visual del modal
   */
  limpiarEstadoVisual() {
    console.log('🧹 Limpiando estado visual del modal');

    // Remover clases de backdrop si existen
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Remover clases de modal-open del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Limpiar cualquier alerta que pueda estar visible
    const alertContainer = document.getElementById(
      'alert-container-habilitar-tramites'
    );
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }

    console.log('✅ Estado visual limpiado');
  }

  /**
   * Carga los trámites disponibles en el selector
   */
  cargarTramites() {
    const tramiteSelect = document.getElementById('tramite');
    if (!tramiteSelect) return;

    // Limpiar opciones existentes
    tramiteSelect.innerHTML =
      '<option value="">Seleccionar trámite...</option>';

    // Obtener trámites del localStorage
    const tramitesData = localStorage.getItem('tramites_data');
    if (tramitesData) {
      try {
        const tramites = JSON.parse(tramitesData);
        tramites.forEach(tramite => {
          const option = document.createElement('option');
          option.value = tramite.id;
          option.textContent = `${tramite.codigo} - ${tramite.nombre}`;
          option.dataset.nombre = tramite.nombre;
          tramiteSelect.appendChild(option);
        });
        console.log(`✅ Trámites cargados en el selector: ${tramites.length}`);
      } catch (error) {
        console.error('❌ Error al cargar trámites:', error);
      }
    }
  }

  /**
   * Carga los periodos académicos disponibles
   */
  cargarPeriodosAcademicos() {
    const periodoSelect = document.getElementById('periodoAcademico');
    if (!periodoSelect) return;

    const periodos = ['2025-1', '2025-2', '2026-1', '2026-2'];
    periodoSelect.innerHTML =
      '<option value="">Seleccionar periodo...</option>';

    periodos.forEach(periodo => {
      const option = document.createElement('option');
      option.value = periodo;
      option.textContent = periodo;
      periodoSelect.appendChild(option);
    });
  }

  /**
   * Carga las sedes disponibles
   */
  cargarSedes() {
    const sedeSelect = document.getElementById('sede');
    if (!sedeSelect) return;

    const sedes = [
      'Cartagena',
      'Barranquilla',
      'Santa Marta',
      'Montería',
      'Valledupar',
    ];
    sedeSelect.innerHTML = '<option value="">Seleccionar sede...</option>';

    sedes.forEach(sede => {
      const option = document.createElement('option');
      option.value = sede;
      option.textContent = sede;
      sedeSelect.appendChild(option);
    });
  }

  /**
   * Actualiza el campo semestre basado en el periodo académico
   * @param {string} periodoAcademico - Periodo académico seleccionado
   */
  updateSemestre(periodoAcademico) {
    const semestreInput = document.getElementById('semestre');
    if (semestreInput) {
      semestreInput.value = HabilitarTramite.calcularSemestre(periodoAcademico);
    }
  }

  /**
   * Maneja el envío del formulario
   */
  handleFormSubmit() {
    console.log('🔧 Procesando envío del formulario');

    const formData = this.getFormData();
    console.log('📋 Datos del formulario obtenidos:', formData);

    const validation = this.validateForm(formData);
    console.log('✅ Validación del formulario:', validation);

    if (validation.isValid) {
      console.log('📡 Emitiendo evento habilitarTramite:guardar');
      this.emitEvent('habilitarTramite:guardar', formData);
    } else {
      console.log('❌ Validación fallida:', validation.errors);
      this.mostrarErrores(validation.errors);
    }
  }

  /**
   * Obtiene los datos del formulario
   * @returns {Object} Datos del formulario
   */
  getFormData() {
    const tramiteSelect = document.getElementById('tramite');
    const tramiteOption = tramiteSelect.selectedOptions[0];
    const tramiteId = document.getElementById('tramite').value;

    // Obtener el nombre del trámite desde el localStorage si no está en el dataset
    let tramiteNombre = tramiteOption ? tramiteOption.dataset.nombre : '';
    if (!tramiteNombre && tramiteId) {
      const tramiteRelacionado =
        HabilitarTramite.verificarTramiteExiste(tramiteId);
      if (tramiteRelacionado) {
        tramiteNombre = tramiteRelacionado.nombre;
      }
    }

    return {
      periodoAcademico: document.getElementById('periodoAcademico').value,
      semestre: document.getElementById('semestre').value,
      sede: document.getElementById('sede').value,
      tramiteId: tramiteId,
      tramiteNombre: tramiteNombre,
      fechaInicio: document.getElementById('fechaInicio').value,
      fechaFinalizacion: document.getElementById('fechaFinalizacion').value,
      fechaInicioCorreccion: document.getElementById('fechaInicioCorreccion')
        .value,
      fechaFinCorreccion: document.getElementById('fechaFinCorreccion').value,
    };
  }

  /**
   * Valida el formulario
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Resultado de la validación
   */
  validateForm(formData) {
    const errors = [];

    if (!formData.periodoAcademico)
      errors.push('El periodo académico es requerido');
    if (!formData.sede) errors.push('La sede es requerida');
    if (!formData.tramiteId) errors.push('El trámite es requerido');
    if (!formData.fechaInicio) errors.push('La fecha de inicio es requerida');
    if (!formData.fechaFinalizacion)
      errors.push('La fecha de finalización es requerida');
    if (!formData.fechaInicioCorreccion)
      errors.push('La fecha de inicio de corrección es requerida');
    if (!formData.fechaFinCorreccion)
      errors.push('La fecha de fin de corrección es requerida');

    // Validaciones de fechas
    if (formData.fechaInicio && formData.fechaFinalizacion) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFinalizacion = new Date(formData.fechaFinalizacion);

      if (fechaInicio >= fechaFinalizacion) {
        errors.push(
          'La fecha de inicio debe ser anterior a la fecha de finalización'
        );
      }
    }

    if (formData.fechaInicioCorreccion && formData.fechaFinCorreccion) {
      const fechaInicioCorreccion = new Date(formData.fechaInicioCorreccion);
      const fechaFinCorreccion = new Date(formData.fechaFinCorreccion);

      if (fechaInicioCorreccion >= fechaFinCorreccion) {
        errors.push(
          'La fecha de inicio de corrección debe ser anterior a la fecha de fin de corrección'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Muestra errores en la interfaz
   * @param {Array} errors - Array de errores
   */
  mostrarErrores(errors) {
    let errorMessage = '';
    if (Array.isArray(errors)) {
      errorMessage = errors.join('<br>');
    } else if (typeof errors === 'string') {
      errorMessage = errors;
    } else if (typeof errors === 'object' && errors !== null) {
      errorMessage = JSON.stringify(errors);
    } else {
      errorMessage = 'Error desconocido';
    }
    this.showAlert(errorMessage, 'danger');
  }

  /**
   * Muestra mensaje de éxito
   * @param {string} message - Mensaje de éxito
   */
  mostrarExito(message) {
    this.showAlert(message, 'success');

    // Limpiar el estado visual después de mostrar el mensaje de éxito
    setTimeout(() => {
      this.limpiarEstadoVisual();
    }, 1000);
  }

  /**
   * Resetea el formulario
   */
  resetForm() {
    const form = document.getElementById(this.formId);
    if (form) {
      form.reset();
      document.getElementById('semestre').value = '';
    }
  }

  /**
   * Emite un evento
   * @param {string} eventName - Nombre del evento
   * @param {Object} data - Datos del evento
   */
  emitEvent(eventName, data) {
    console.log(`📡 Intentando emitir evento: ${eventName}`);
    console.log(`📡 Datos del evento:`, data);

    if (window.eventManager) {
      console.log('✅ EventManager encontrado, emitiendo evento...');
      window.eventManager.emit(eventName, data);
    } else {
      console.error(
        '❌ EventManager no está disponible en window.eventManager'
      );
      console.log('🔍 window.eventManager:', window.eventManager);

      // Intentar llamar directamente al controlador como fallback
      if (window.habilitarTramiteController) {
        console.log('🔄 Intentando llamar directamente al controlador...');
        window.habilitarTramiteController.guardarHabilitarTramite(data);
      } else {
        console.error('❌ Controlador tampoco está disponible');
      }
    }
  }

  /**
   * Muestra una alerta
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, warning, info)
   */
  showAlert(message, type = 'info') {
    // Crear o actualizar el contenedor de alertas
    let alertContainer = document.getElementById(
      'alert-container-habilitar-tramites'
    );
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alert-container-habilitar-tramites';
      alertContainer.className = 'position-fixed top-0 end-0 p-3';
      alertContainer.style.zIndex = '9999';
      document.body.appendChild(alertContainer);
    }

    // Crear la alerta
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    alertContainer.insertAdjacentHTML('beforeend', alertHTML);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      const alertElement = document.getElementById(alertId);
      if (alertElement) {
        alertElement.remove();
      }
    }, 5000);
  }
}
