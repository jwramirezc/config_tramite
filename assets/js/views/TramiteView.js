/**
 * Vista para manejo de la interfaz de usuario de trámites
 * Clase que maneja la presentación y renderizado de datos
 */
class TramiteView extends BaseView {
  constructor() {
    super();
    this.container = document.getElementById('tablaTramitesContainer');
    this.modalCrear = document.getElementById('modalCrearTramite');
    this.modalOpciones = document.getElementById('modalOpcionesTramite');
    this.form = document.getElementById('formCrearTramite');
    this.currentTramiteId = null;
  }

  /**
   * Configura los elementos comunes de la vista
   */
  setupCommonElements() {
    // Verificar que los elementos del DOM existan
    if (!this.container || !this.modalCrear || !this.form) {
      console.warn(
        '⚠️ Algunos elementos del DOM no están disponibles para TramiteView'
      );
    }
  }

  /**
   * Inicializa la vista
   */
  async initialize() {
    await super.initialize();
    this.setupCommonElements();
  }

  /**
   * Renderiza la tabla de trámites
   * @param {Array} tramites - Array de trámites a mostrar
   */
  renderTable(tramites = []) {
    if (tramites.length === 0) {
      this.renderEmptyState();
      return;
    }

    const tableHTML = `
            <div class="table-responsive fade-in">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th class="text-center">Nombre</th>
                            <th class="text-center">Periodo</th>
                            <th class="text-center">Sede</th>
                            <th class="text-center">Jornada</th>
                            <th class="text-center">Fecha Inicio</th>
                            <th class="text-center">Fecha Fin</th>
                            <th class="text-center">Fecha Inicio Subs</th>
                            <th class="text-center">Fecha Fin Subs</th>
                            <th class="text-center">Estado</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tramites
                          .map(tramite => this.renderTableRow(tramite))
                          .join('')}
                    </tbody>
                </table>
            </div>
        `;

    this.container.innerHTML = tableHTML;
    this.initializeTooltips();
    this.setupOpcionesButtons();
  }

  /**
   * Renderiza una fila de la tabla
   * @param {Tramite} tramite - Trámite a renderizar
   * @returns {string} HTML de la fila
   */
  renderTableRow(tramite) {
    const estado = tramite.getEstadoPorFechas();
    const estadoClass = this.getEstadoClass(estado);
    const estadoIcon = this.getEstadoIcon(estado);

    return `
            <tr data-tramite-id="${tramite.id}">
                <td>
                    <strong>${this.escapeHtml(tramite.nombre)}</strong>
                </td>
                <td class="text-center">
                    <span class="badge bg-info">${tramite.getPeriodoCompleto()}</span>
                </td>
                <td class="text-center">
                    ${this.escapeHtml(tramite.sede)}
                </td>
                <td class="text-center">
                    ${this.escapeHtml(tramite.jornada)}
                </td>
                <td class="text-center">
                    ${this.getFechaDisplay(tramite, 'fechaInicio')}
                </td>
                <td class="text-center">
                    ${this.getFechaDisplay(tramite, 'fechaFinalizacion')}
                </td>
                <td class="text-center">
                    ${this.getFechaDisplay(tramite, 'fechaInicioSubsanacion')}
                </td>
                <td class="text-center">
                    ${this.getFechaDisplay(tramite, 'fechaFinSubsanacion')}
                </td>
                <td class="text-center">
                    <span class="status-badge ${estadoClass}">
                        <i class="${estadoIcon} me-1"></i>
                        ${this.getEstadoText(estado)}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-action btn-opciones" 
                            data-tramite-id="${tramite.id}"
                            data-bs-toggle="tooltip" 
                            title="Más opciones">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </td>
            </tr>
        `;
  }

  /**
   * Renderiza el estado vacío cuando no hay trámites
   */
  renderEmptyState() {
    const emptyHTML = `
            <div class="text-center py-5 fade-in">
                <i class="fas fa-file-alt fa-4x text-muted mb-3"></i>
                <h5 class="text-muted">No hay trámites registrados</h5>
            </div>
        `;
    this.container.innerHTML = emptyHTML;
  }

  /**
   * Obtiene la clase CSS para el estado
   * @param {string} estado - Estado del trámite
   * @returns {string} Clase CSS
   */
  getEstadoClass(estado) {
    const classes = {
      activo: 'status-activo',
      pendiente: 'status-pendiente',
      finalizado: 'status-finalizado',
      subsanación: 'status-pendiente',
      inactivo: 'status-finalizado',
      sin_fechas: 'status-pendiente',
    };
    return classes[estado] || 'status-pendiente';
  }

  /**
   * Obtiene el icono para el estado
   * @param {string} estado - Estado del trámite
   * @returns {string} Clase del icono
   */
  getEstadoIcon(estado) {
    const icons = {
      activo: 'fas fa-play-circle',
      pendiente: 'fas fa-clock',
      finalizado: 'fas fa-check-circle',
      subsanación: 'fas fa-exclamation-triangle',
      inactivo: 'fas fa-pause-circle',
      sin_fechas: 'fas fa-calendar-times',
    };
    return icons[estado] || 'fas fa-question-circle';
  }

  /**
   * Obtiene el texto del estado
   * @param {string} estado - Estado del trámite
   * @returns {string} Texto del estado
   */
  getEstadoText(estado) {
    const texts = {
      activo: 'Activo',
      pendiente: 'Pendiente',
      finalizado: 'Finalizado',
      subsanación: 'Subsanación',
      inactivo: 'Inactivo',
      sin_fechas: 'Sin Fechas',
    };
    return texts[estado] || 'Desconocido';
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Muestra el modal de crear trámite
   */
  showCreateModal() {
    this.clearForm();
    const modal = new bootstrap.Modal(this.modalCrear);
    modal.show();
  }

  /**
   * Muestra el modal de opciones
   * @param {string} tramiteId - ID del trámite
   */
  showOpcionesModal(tramiteId) {
    this.currentTramiteId = tramiteId;

    // Emitir evento para obtener el trámite del controlador
    if (window.tramiteApp && window.tramiteApp.eventManager) {
      window.tramiteApp.eventManager.emit('tramite:getById', {
        tramiteId,
        callback: tramite => {
          if (tramite) {
            this.actualizarTextoBotonActivarInactivar(tramite);
          }
        },
      });
    }

    const modal = new bootstrap.Modal(this.modalOpciones);
    modal.show();
  }

  /**
   * Muestra el modal de gestionar fechas
   * @param {Tramite} tramite - Trámite para gestionar fechas
   */
  showGestionarFechasModal(tramite) {
    this.currentTramiteId = tramite.id;

    // Limpiar formulario
    this.clearFormFechas();

    // Renderizar historial de fechas
    this.renderHistorialFechas(tramite);

    // Configurar event listener para el formulario
    this.setupFormFechasEventListeners();

    const modal = new bootstrap.Modal(
      document.getElementById('modalGestionarFechas')
    );
    modal.show();
  }

  /**
   * Configura los event listeners del formulario de fechas
   */
  setupFormFechasEventListeners() {
    const form = document.getElementById('formGestionarFechas');
    if (form) {
      // Remover event listeners anteriores
      form.removeEventListener('submit', this.handleFormFechasSubmit);

      // Agregar nuevo event listener
      this.handleFormFechasSubmit = e => {
        e.preventDefault();
        this.submitFormFechas();
      };

      form.addEventListener('submit', this.handleFormFechasSubmit);
    }
  }

  /**
   * Maneja el envío del formulario de fechas
   */
  submitFormFechas() {
    const formData = {
      fechaInicio: document.getElementById('nuevaFechaInicio').value,
      fechaFinalizacion: document.getElementById('nuevaFechaFinalizacion')
        .value,
      fechaInicioSubsanacion: document.getElementById(
        'nuevaFechaInicioSubsanacion'
      ).value,
      fechaFinSubsanacion: document.getElementById('nuevaFechaFinSubsanacion')
        .value,
    };

    // Emitir evento para guardar fechas
    if (window.tramiteApp && window.tramiteApp.eventManager) {
      window.tramiteApp.eventManager.emit('tramite:guardarFechas', {
        formData,
      });
    }
  }

  /**
   * Limpia el formulario de fechas
   */
  clearFormFechas() {
    const form = document.getElementById('formGestionarFechas');
    if (form) {
      form.reset();
    }
  }

  /**
   * Renderiza el historial de fechas
   * @param {Tramite} tramite - Trámite para mostrar el historial
   */
  renderHistorialFechas(tramite) {
    const container = document.getElementById('tablaHistorialFechasContainer');
    if (!container) return;

    const historial = tramite.getHistorialFechasOrdenado();

    if (historial.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-4">
          <i class="fas fa-calendar-times fa-3x mb-3"></i>
          <p>No hay historial de fechas para este trámite</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead class="table-light">
            <tr>
              <th class="text-center">Fecha Inicio</th>
              <th class="text-center">Fecha Fin</th>
              <th class="text-center">Inicio Subsanación</th>
              <th class="text-center">Fin Subsanación</th>
              <th class="text-center">Fecha</th>
              <th class="text-center">Usuario</th>
            </tr>
          </thead>
          <tbody>
            ${historial
              .map(registro => this.renderHistorialRow(registro))
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  }

  /**
   * Renderiza una fila del historial de fechas
   * @param {Object} registro - Registro de fechas
   * @returns {string} HTML de la fila
   */
  renderHistorialRow(registro) {
    return `
      <tr>
        <td class="text-center">${Tramite.formatDate(registro.fechaInicio)}</td>
        <td class="text-center">${Tramite.formatDate(
          registro.fechaFinalizacion
        )}</td>
        <td class="text-center">${Tramite.formatDate(
          registro.fechaInicioSubsanacion
        )}</td>
        <td class="text-center">${Tramite.formatDate(
          registro.fechaFinSubsanacion
        )}</td>
        <td class="text-center">${Tramite.formatDate(registro.fechaCambio)}</td>
        <td class="text-center"><span class="badge bg-secondary">${
          registro.usuario
        }</span></td>
      </tr>
    `;
  }

  /**
   * Refresca el historial de fechas
   * @param {Tramite} tramite - Trámite actualizado
   */
  refreshHistorialFechas(tramite) {
    this.renderHistorialFechas(tramite);
  }

  /**
   * Obtiene la fecha para mostrar en la tabla principal
   * @param {Tramite} tramite - Trámite
   * @param {string} tipoFecha - Tipo de fecha a mostrar
   * @returns {string} Fecha formateada o mensaje
   */
  getFechaDisplay(tramite, tipoFecha) {
    const fechasMasRecientes = tramite.getFechasMasRecientes();

    if (fechasMasRecientes && fechasMasRecientes[tipoFecha]) {
      return Tramite.formatDate(fechasMasRecientes[tipoFecha]);
    }

    // Si no hay historial, mostrar las fechas principales
    if (tramite[tipoFecha]) {
      return Tramite.formatDate(tramite[tipoFecha]);
    }

    return '<span class="text-muted">Sin fecha</span>';
  }

  /**
   * Actualiza el texto del botón Activar/Inactivar según el estado del trámite
   * @param {Tramite} tramite - Trámite para obtener su estado
   */
  actualizarTextoBotonActivarInactivar(tramite) {
    const textoElement = document.getElementById('textoActivarInactivar');
    const iconElement = document.querySelector('#btnActivarInactivarTramite i');
    const botonElement = document.getElementById('btnActivarInactivarTramite');

    if (textoElement && iconElement && botonElement) {
      const estado = tramite.getEstadoPorFechas();

      // Solo permitir activar/inactivar manualmente si el estado es 'activo' o 'inactivo'
      if (estado === 'activo' || estado === 'inactivo') {
        botonElement.disabled = false;
        botonElement.classList.remove('text-muted');

        if (estado === 'inactivo') {
          textoElement.textContent = 'Activar Trámite';
          iconElement.className = 'fas fa-play me-2';
        } else {
          textoElement.textContent = 'Inactivar Trámite';
          iconElement.className = 'fas fa-pause me-2';
        }
      } else {
        // Deshabilitar el botón si el estado no permite cambio manual
        botonElement.disabled = true;
        botonElement.classList.add('text-muted');

        // Caso especial para trámites sin fechas
        if (estado === 'sin_fechas') {
          textoElement.textContent = 'Inactivar trámite';
          iconElement.className = 'fas fa-ban me-2';
        } else {
          // Mostrar el estado actual para otros estados
          const estadoText = this.getEstadoText(estado);
          textoElement.textContent = `${estadoText} (Automático)`;

          // Icono según el estado
          const estadoIcon = this.getEstadoIcon(estado);
          iconElement.className = `${estadoIcon} me-2`;
        }
      }
    }
  }

  /**
   * Cierra el modal de crear trámite
   */
  hideCreateModal() {
    const modal = bootstrap.Modal.getInstance(this.modalCrear);
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Cierra el modal de opciones
   */
  hideOpcionesModal() {
    const modal = bootstrap.Modal.getInstance(this.modalOpciones);
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Limpia el formulario
   */
  clearForm() {
    if (this.form) {
      this.form.reset();
    }
  }

  /**
   * Obtiene los datos del formulario
   * @returns {Object} Datos del formulario
   */
  getFormData() {
    const formData = {};
    const formElements = this.form.elements;

    for (let element of formElements) {
      if (element.name || element.id) {
        const key = element.name || element.id;
        formData[key] = element.value;
      }
    }

    return formData;
  }

  /**
   * Llena el formulario con datos de un trámite
   * @param {Tramite} tramite - Trámite con los datos
   */
  fillForm(tramite) {
    if (!this.form) return;

    const fields = {
      nombreTramite: tramite.nombre,
      periodoAnio: tramite.periodoAnio,
      periodoSemestre: tramite.periodoSemestre,
      sede: tramite.sede,
      jornada: tramite.jornada,
      fechaInicio: tramite.fechaInicio,
      fechaFinalizacion: tramite.fechaFinalizacion,
      fechaInicioSubsanacion: tramite.fechaInicioSubsanacion,
      fechaFinSubsanacion: tramite.fechaFinSubsanacion,
    };

    Object.keys(fields).forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.value = fields[fieldId];
      }
    });
  }

  /**
   * Muestra un mensaje de alerta usando Bootstrap alerts con close button
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, warning, info)
   * @param {number} duration - Duración en milisegundos (0 para no auto-cerrar)
   */
  showAlert(message, type = 'info', duration = 5000) {
    // Obtener o crear el contenedor de alertas fijo en la esquina superior derecha
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alertContainer';
      alertContainer.className = 'position-fixed top-0 end-0 p-3';
      alertContainer.style.zIndex = '9999';
      document.body.appendChild(alertContainer);
    }

    // Crear el HTML de la alerta con Bootstrap classes
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
    const modalHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.escapeHtml(
                              title
                            )}</h5>
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
   * Configura los botones de opciones
   */
  setupOpcionesButtons() {
    const opcionesButtons = this.container.querySelectorAll('.btn-opciones');
    opcionesButtons.forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const tramiteId = button.getAttribute('data-tramite-id');

        // Emitir evento para que el controlador lo maneje
        if (window.tramiteApp && window.tramiteApp.eventManager) {
          window.tramiteApp.eventManager.emit('tramite:showOpciones', {
            tramiteId,
          });
        } else {
          console.error(
            '❌ No se puede emitir evento: tramiteApp o eventManager no disponible'
          );
        }
      });
    });
  }

  /**
   * Inicializa los tooltips de Bootstrap
   */
  initializeTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  /**
   * Muestra un modal para añadir documentos al trámite
   * @param {Tramite} tramite - Trámite al que se añadirán documentos
   */
  showDocumentosModal(tramite) {
    const modalHTML = `
      <div class="modal fade" id="documentosModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-file-upload me-2"></i>
                Documentos Vinculados - ${this.escapeHtml(tramite.nombre)}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="formDocumentos">
                <!-- Información del trámite actual -->
                <div class="mb-4">
                  <div class="card">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="fas fa-info-circle me-2"></i>
                        Información del Trámite Actual
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6">
                          <p class="mb-2"><strong>Nombre:</strong> ${this.escapeHtml(
                            tramite.nombre
                          )}</p>
                          <p class="mb-0"><strong>Periodo:</strong> ${tramite.getPeriodoCompleto()}</p>
                        </div>
                        <div class="col-md-6">
                          <p class="mb-2"><strong>Sede:</strong> ${this.escapeHtml(
                            tramite.sede
                          )}</p>
                          <p class="mb-0"><strong>Jornada:</strong> ${this.escapeHtml(
                            tramite.jornada
                          )}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tabla unificada de documentos del trámite -->
                <div class="mb-4">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">
                        <i class="fas fa-file-alt me-2"></i>
                        Documentos del Trámite
                      </h6>
                    </div>
                    <div class="card-body">
                      <!-- Selector para agregar documentos -->
                      <div class="mb-3">
                        <label for="selectDocumento" class="form-label">
                          <i class="fas fa-file-plus me-1"></i>
                          Agregar Documento
                        </label>
                        <div class="input-group">
                          <select class="form-select" id="selectDocumento">
                            <option value="">Seleccione un documento para agregar</option>
                            <!-- Las opciones se cargarán dinámicamente -->
                          </select>
                          <button type="button" class="btn btn-outline-primary" id="btnAgregarDocumento">
                        <i class="fas fa-plus me-1"></i>
                            Agregar
                      </button>
                    </div>
                        <div class="form-text">Seleccione un documento creado previamente para vincularlo a este trámite</div>
                      </div>
                      
                      <!-- Tabla unificada -->
                      <div id="documentosUnificadosContainer">
                        <!-- La tabla se generará dinámicamente -->
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" id="btnCerrarDocumentos">
                <i class="fas fa-check me-1"></i>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('documentosModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar eventos del modal
    this.setupDocumentosModalEvents(tramite);

    // Mostrar modal
    const modal = document.getElementById('documentosModal');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal después de cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  /**
   * Configura los eventos del modal de documentos
   * @param {Tramite} tramite - Trámite asociado
   */
  setupDocumentosModalEvents(tramite) {
    const btnAgregarDocumento = document.getElementById('btnAgregarDocumento');
    const selectDocumento = document.getElementById('selectDocumento');
    const btnCerrarDocumentos = document.getElementById('btnCerrarDocumentos');

    // Cargar documentos disponibles en el select
    this.cargarDocumentosDisponibles(selectDocumento, tramite.id);

    // Evento para agregar documento seleccionado
    if (btnAgregarDocumento) {
      btnAgregarDocumento.addEventListener('click', () => {
        this.agregarDocumentoSeleccionado(tramite);
      });
    }

    // Evento para cerrar y guardar documentos pendientes
    if (btnCerrarDocumentos) {
      btnCerrarDocumentos.addEventListener('click', () => {
        this.cerrarYGuardarDocumentos(tramite);
      });
    }

    // Cargar tabla unificada de documentos
    this.cargarDocumentosUnificados(tramite.id);
  }

  /**
   * Carga los documentos vinculados al trámite en la tabla correspondiente
   * @param {string} tramiteId - ID del trámite
   */
  cargarDocumentosVinculados(tramiteId) {
    try {
      // Obtener documentos vinculados con información completa
      const documentosVinculados =
        this.obtenerDocumentosVinculadosCompletos(tramiteId);

      // Obtener el contenedor de la tabla
      const container = document.getElementById(
        'documentosVinculadosContainer'
      );
      if (!container) return;

      // Renderizar la tabla
      container.innerHTML =
        this.renderTablaDocumentosVinculados(documentosVinculados);
    } catch (error) {
      console.error('Error al cargar documentos vinculados:', error);
    }
  }

  /**
   * Cierra el modal y guarda automáticamente los documentos pendientes
   * @param {Tramite} tramite - Trámite asociado
   */
  cerrarYGuardarDocumentos(tramite) {
    try {
      // Obtener documentos temporales (pendientes)
      const temporalKey = `documentos_temporal_${tramite.id}`;
      const temporal = localStorage.getItem(temporalKey);
      const documentosTemporales = temporal ? JSON.parse(temporal) : [];

      if (documentosTemporales.length > 0) {
        // Obtener vinculaciones existentes
        const vinculacionesExistentes = this.obtenerDocumentosVinculados(
          tramite.id
        );

        // Crear nuevas vinculaciones para documentos temporales
        const nuevasVinculaciones = documentosTemporales.map(documento => ({
          id: this.generateId(),
          tramiteId: tramite.id,
          documentoId: documento.id,
          fechaVinculacion: new Date().toISOString(),
        }));

        // Combinar vinculaciones existentes con las nuevas
        const todasLasVinculaciones = this.obtenerTodasLasVinculaciones();
        const vinculacionesActualizadas = [
          ...todasLasVinculaciones,
          ...nuevasVinculaciones,
        ];

        // Guardar en localStorage
        localStorage.setItem(
          'tramite_documentos_vinculaciones',
          JSON.stringify(vinculacionesActualizadas)
        );

        // Limpiar documentos temporales
        localStorage.removeItem(temporalKey);

        this.showAlert(
          `${documentosTemporales.length} documento(s) vinculado(s) exitosamente al trámite`,
          'success'
        );
      }

      // Cerrar el modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('documentosModal')
      );
      if (modal) {
        modal.hide();
      }
    } catch (error) {
      console.error('Error al cerrar y guardar documentos:', error);
      this.showAlert('Error al guardar los documentos pendientes', 'danger');
    }
  }

  /**
   * Carga la tabla unificada de documentos del trámite
   * @param {string} tramiteId - ID del trámite
   */
  cargarDocumentosUnificados(tramiteId) {
    try {
      // Obtener el contenedor de la tabla unificada
      const container = document.getElementById(
        'documentosUnificadosContainer'
      );
      if (!container) {
        return;
      }

      // Renderizar la tabla unificada
      const html = this.renderTablaDocumentosUnificada(tramiteId);
      container.innerHTML = html;
    } catch (error) {
      console.error('Error al cargar documentos unificados:', error);
    }
  }

  /**
   * Carga los documentos disponibles en el select
   * @param {HTMLElement} selectElement - Elemento select
   * @param {string} tramiteId - ID del trámite actual
   */
  cargarDocumentosDisponibles(selectElement, tramiteId) {
    try {
      // Obtener todos los documentos creados
      const documentosCreados = this.obtenerDocumentosCreados();

      // Obtener documentos ya vinculados a este trámite
      const documentosVinculados = this.obtenerDocumentosVinculados(tramiteId);
      const idsVinculados = documentosVinculados.map(doc => doc.documentoId);

      // Filtrar documentos no vinculados
      const documentosDisponibles = documentosCreados.filter(
        doc => !idsVinculados.includes(doc.id)
      );

      // Limpiar opciones existentes
      selectElement.innerHTML =
        '<option value="">Seleccione un documento para agregar</option>';

      // Agregar opciones
      documentosDisponibles.forEach(documento => {
        const option = document.createElement('option');
        option.value = documento.id;
        option.textContent = `${documento.nombreDocumento} (${documento.tipoDocumental})`;
        selectElement.appendChild(option);
      });

      if (documentosDisponibles.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay documentos disponibles para vincular';
        option.disabled = true;
        selectElement.appendChild(option);
      }
    } catch (error) {
      console.error('Error al cargar documentos disponibles:', error);
    }
  }

  /**
   * Obtiene los documentos creados desde localStorage
   * @returns {Array} Array de documentos creados
   */
  obtenerDocumentosCreados() {
    try {
      // Los documentos se guardan con la clave 'documentos_tramites' en DocumentoService
      const documentos = localStorage.getItem('documentos_tramites');
      return documentos ? JSON.parse(documentos) : [];
    } catch (error) {
      console.error('Error al obtener documentos creados:', error);
      return [];
    }
  }

  /**
   * Obtiene los documentos vinculados a un trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de vinculaciones
   */
  obtenerDocumentosVinculados(tramiteId) {
    try {
      const vinculaciones = localStorage.getItem(
        'tramite_documentos_vinculaciones'
      );
      const todasLasVinculaciones = vinculaciones
        ? JSON.parse(vinculaciones)
        : [];
      return todasLasVinculaciones.filter(v => v.tramiteId === tramiteId);
    } catch (error) {
      console.error('Error al obtener documentos vinculados:', error);
      return [];
    }
  }

  /**
   * Agrega un documento seleccionado a la lista temporal
   * @param {Tramite} tramite - Trámite al que se agregará el documento
   */
  agregarDocumentoSeleccionado(tramite) {
    const selectDocumento = document.getElementById('selectDocumento');
    const documentoId = selectDocumento.value;

    if (!documentoId) {
      this.showAlert('Por favor seleccione un documento', 'warning');
      return;
    }

    // Obtener información del documento seleccionado
    const documentosCreados = this.obtenerDocumentosCreados();
    const documento = documentosCreados.find(doc => doc.id === documentoId);

    if (!documento) {
      this.showAlert('Documento no encontrado', 'danger');
      return;
    }

    // Agregar a la lista temporal de documentos seleccionados
    this.agregarDocumentoATemporal(documento, tramite.id);

    // Limpiar el select
    selectDocumento.value = '';

    // Recargar la tabla unificada
    this.cargarDocumentosUnificados(tramite.id);

    // Recargar opciones disponibles
    this.cargarDocumentosDisponibles(selectDocumento, tramite.id);

    this.showAlert(
      `Documento "${documento.nombreDocumento}" agregado a la lista`,
      'success'
    );
  }

  /**
   * Agrega un documento a la lista temporal
   * @param {Object} documento - Documento a agregar
   * @param {string} tramiteId - ID del trámite
   */
  agregarDocumentoATemporal(documento, tramiteId) {
    // Obtener lista temporal actual
    const temporalKey = `documentos_temporal_${tramiteId}`;
    let documentosTemporales = [];

    try {
      const temporal = localStorage.getItem(temporalKey);
      documentosTemporales = temporal ? JSON.parse(temporal) : [];
    } catch (error) {
      console.error('Error al obtener documentos temporales:', error);
    }

    // Verificar si ya existe
    const existe = documentosTemporales.some(doc => doc.id === documento.id);
    if (existe) {
      this.showAlert('Este documento ya está en la lista', 'warning');
      return;
    }

    // Agregar a la lista temporal
    documentosTemporales.push({
      ...documento,
      fechaVinculacion: new Date().toISOString(),
    });

    // Guardar en localStorage
    localStorage.setItem(temporalKey, JSON.stringify(documentosTemporales));
  }

  /**
   * Renderiza la tabla de documentos seleccionados
   * @param {string} tramiteId - ID del trámite
   */
  renderDocumentosSeleccionados(tramiteId) {
    const container = document.getElementById(
      'documentosSeleccionadosContainer'
    );
    if (!container) return;

    // Obtener documentos temporales
    const temporalKey = `documentos_temporal_${tramiteId}`;
    let documentosTemporales = [];

    try {
      const temporal = localStorage.getItem(temporalKey);
      documentosTemporales = temporal ? JSON.parse(temporal) : [];
    } catch (error) {
      console.error('Error al obtener documentos temporales:', error);
    }

    if (documentosTemporales.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h6 class="text-muted">No hay documentos seleccionados</h6>
          <p class="text-muted">Use el selector de arriba para agregar documentos a este trámite.</p>
        </div>
      `;
      return;
    }

    const tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="text-center">Nombre</th>
              <th class="text-center">Tipo</th>
              <th class="text-center">Descripción</th>
              <th class="text-center">Formato</th>
              <th class="text-center">Obligatorio</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${documentosTemporales
              .map(doc => this.renderDocumentoSeleccionadoRow(doc, tramiteId))
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  }

  /**
   * Renderiza una fila de documento seleccionado
   * @param {Object} documento - Documento a renderizar
   * @param {string} tramiteId - ID del trámite
   * @returns {string} HTML de la fila
   */
  renderDocumentoSeleccionadoRow(documento, tramiteId) {
    return `
      <tr data-documento-id="${documento.id}">
        <td class="text-center">
          <strong>${this.escapeHtml(documento.nombreDocumento)}</strong>
        </td>
          <td class="text-center">
            <span class="badge bg-primary">${this.escapeHtml(
              documento.tipoDocumental
            )}</span>
          </td>
          <td class="text-center">
          <small class="text-muted">${this.escapeHtml(
            documento.descripcionDocumento || 'Sin descripción'
          )}</small>
          </td>
          <td class="text-center">
          <span class="badge bg-info">${this.escapeHtml(
            documento.tipoFormatoEsperado || 'N/A'
          )}</span>
        </td>
        <td class="text-center">
          <span class="badge ${
            documento.obligatoriedad === 'Sí' ? 'bg-warning' : 'bg-secondary'
          }">
            ${this.escapeHtml(documento.obligatoriedad || 'No')}
          </span>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="tramiteView.removerDocumentoTemporal('${
                    documento.id
                  }', '${tramiteId}')"
                    data-bs-toggle="tooltip" 
                  title="Remover documento">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
  }

  /**
   * Remueve un documento de la lista temporal
   * @param {string} documentoId - ID del documento
   * @param {string} tramiteId - ID del trámite
   */
  removerDocumentoTemporal(documentoId, tramiteId) {
    const temporalKey = `documentos_temporal_${tramiteId}`;

    try {
      const temporal = localStorage.getItem(temporalKey);
      let documentosTemporales = temporal ? JSON.parse(temporal) : [];

      // Filtrar el documento a remover
      documentosTemporales = documentosTemporales.filter(
        doc => doc.id !== documentoId
      );

      // Guardar en localStorage
      localStorage.setItem(temporalKey, JSON.stringify(documentosTemporales));

      // Recargar la tabla unificada
      this.cargarDocumentosUnificados(tramiteId);

      // Recargar opciones disponibles
      const selectDocumento = document.getElementById('selectDocumento');
      if (selectDocumento) {
        this.cargarDocumentosDisponibles(selectDocumento, tramiteId);
      }

      this.showAlert(
        'Documento removido de la lista de selección exitosamente. Puede continuar agregando más documentos.',
        'success'
      );
    } catch (error) {
      console.error('Error al remover documento temporal:', error);
      this.showAlert('Error al remover el documento', 'danger');
    }
  }

  /**
   * Guarda las vinculaciones de documentos al trámite
   * @param {Tramite} tramite - Trámite al que se vincularán los documentos
   */
  guardarVinculacionesDocumentos(tramite) {
    const temporalKey = `documentos_temporal_${tramite.id}`;

    try {
      const temporal = localStorage.getItem(temporalKey);
      const documentosTemporales = temporal ? JSON.parse(temporal) : [];

      if (documentosTemporales.length === 0) {
        this.showAlert(
          'No hay documentos seleccionados para vincular',
          'warning'
        );
        return;
      }

      // Obtener vinculaciones existentes
      const vinculacionesExistentes = this.obtenerDocumentosVinculados(
        tramite.id
      );

      // Crear nuevas vinculaciones
      const nuevasVinculaciones = documentosTemporales.map(documento => ({
        id: `vin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tramiteId: tramite.id,
        tramiteNombre: tramite.nombre,
        documentoId: documento.id,
        documentoNombre: documento.nombreDocumento,
        documentoTipo: documento.tipoDocumental,
        fechaVinculacion: new Date().toISOString(),
      }));

      // Combinar con vinculaciones existentes
      const todasLasVinculaciones = [
        ...vinculacionesExistentes,
        ...nuevasVinculaciones,
      ];

      // Obtener todas las vinculaciones del sistema
      const todasLasVinculacionesSistema = this.obtenerTodasLasVinculaciones();
      const otrasVinculaciones = todasLasVinculacionesSistema.filter(
        v => v.tramiteId !== tramite.id
      );
      const vinculacionesFinales = [
        ...otrasVinculaciones,
        ...todasLasVinculaciones,
      ];

      // Guardar en localStorage
      localStorage.setItem(
        'tramite_documentos_vinculaciones',
        JSON.stringify(vinculacionesFinales)
      );

      // Limpiar lista temporal
      localStorage.removeItem(temporalKey);

      this.showAlert(
        `${nuevasVinculaciones.length} documento(s) vinculado(s) exitosamente al trámite "${tramite.nombre}"`,
        'success'
      );

      // Recargar la tabla unificada
      this.cargarDocumentosUnificados(tramite.id);

      // Cerrar el modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('documentosModal')
      );
      if (modal) {
        modal.hide();
      }
    } catch (error) {
      console.error('Error al guardar vinculaciones:', error);
      this.showAlert('Error al guardar las vinculaciones', 'danger');
    }
  }

  /**
   * Obtiene todas las vinculaciones del sistema
   * @returns {Array} Array de todas las vinculaciones
   */
  obtenerTodasLasVinculaciones() {
    try {
      const vinculaciones = localStorage.getItem(
        'tramite_documentos_vinculaciones'
      );
      return vinculaciones ? JSON.parse(vinculaciones) : [];
    } catch (error) {
      console.error('Error al obtener todas las vinculaciones:', error);
      return [];
    }
  }

  /**
   * Obtiene los documentos vinculados a un trámite específico con información completa
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de documentos vinculados al trámite
   */
  obtenerDocumentosVinculadosCompletos(tramiteId) {
    try {
      // Obtener vinculaciones del trámite
      const vinculaciones = this.obtenerDocumentosVinculados(tramiteId);

      if (vinculaciones.length === 0) {
        return [];
      }

      // Obtener información completa de los documentos
      const documentosCreados = this.obtenerDocumentosCreados();
      const documentosVinculados = [];

      vinculaciones.forEach(vinculacion => {
        const documento = documentosCreados.find(
          doc => doc.id === vinculacion.documentoId
        );
        if (documento) {
          documentosVinculados.push({
            ...documento,
            fechaVinculacion: vinculacion.fechaVinculacion,
            vinculacionId: vinculacion.id,
          });
        }
      });

      return documentosVinculados;
    } catch (error) {
      console.error(
        'Error al obtener documentos vinculados del trámite:',
        error
      );
      return [];
    }
  }

  /**
   * Renderiza la tabla unificada de documentos del trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {string} HTML de la tabla unificada
   */
  renderTablaDocumentosUnificada(tramiteId) {
    try {
      // Obtener documentos vinculados
      const documentosVinculados =
        this.obtenerDocumentosVinculadosCompletos(tramiteId);

      // Obtener documentos temporales
      const temporalKey = `documentos_temporal_${tramiteId}`;
      const temporal = localStorage.getItem(temporalKey);
      const documentosTemporales = temporal ? JSON.parse(temporal) : [];

      // Combinar todos los documentos
      const todosLosDocumentos = [
        ...documentosVinculados.map(doc => ({ ...doc, esVinculado: true })),
        ...documentosTemporales.map(doc => ({ ...doc, esVinculado: false })),
      ];

      if (todosLosDocumentos.length === 0) {
        return `
          <div class="text-center py-4">
            <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
            <h6 class="text-muted">No hay documentos en este trámite</h6>
            <p class="text-muted">Use el selector de arriba para agregar documentos al trámite.</p>
              </div>
        `;
      }

      let tableHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th class="text-center">Nombre</th>
                <th class="text-center">Tipo Documental</th>
                <th class="text-center">Descripción</th>
                <th class="text-center">Formato</th>
                <th class="text-center">Obligatorio</th>
                <th class="text-center">MATFIN</th>
                <th class="text-center">Campos</th>
                <th class="text-center">Estado</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
      `;

      todosLosDocumentos.forEach(documento => {
        const esVinculado = documento.esVinculado;
        const estadoBadge = esVinculado
          ? '<span class="badge bg-success">Vinculado</span>'
          : '<span class="badge bg-warning">Pendiente</span>';

        const fecha = esVinculado
          ? this.formatDate(documento.fechaVinculacion)
          : '<span class="text-muted">-</span>';

        const acciones = esVinculado
          ? `<button class="btn btn-sm btn-outline-danger" 
                     onclick="tramiteView.desvincularDocumentoDirecto('${documento.vinculacionId}', '${documento.id}', '${tramiteId}')"
                     data-bs-toggle="tooltip" 
                     title="Desvincular documento">
                <i class="fas fa-unlink"></i>
              </button>`
          : `<button class="btn btn-sm btn-outline-danger" 
                     onclick="tramiteView.removerDocumentoTemporal('${documento.id}', '${tramiteId}')"
                     data-bs-toggle="tooltip" 
                     title="Remover de la lista">
                <i class="fas fa-trash"></i>
              </button>`;

        tableHTML += `
          <tr>
            <td class="text-center">
              <strong>${this.escapeHtml(documento.nombreDocumento)}</strong>
            </td>
            <td class="text-center">
              <span class="badge bg-primary">${this.escapeHtml(
                documento.tipoDocumental
              )}</span>
            </td>
            <td class="text-center">
              <small class="text-muted">${this.escapeHtml(
                documento.descripcionDocumento || 'Sin descripción'
              )}</small>
            </td>
            <td class="text-center">
              <span class="badge bg-info">${this.escapeHtml(
                documento.tipoFormatoEsperado || 'N/A'
              )}</span>
            </td>
            <td class="text-center">
              <span class="badge ${
                documento.obligatoriedad === 'Sí'
                  ? 'bg-warning'
                  : 'bg-secondary'
              }">
                ${this.escapeHtml(documento.obligatoriedad || 'No')}
              </span>
            </td>
            <td class="text-center">
              <span class="badge ${
                documento.datosRemitenMatfin === 'Sí'
                  ? 'bg-success'
                  : 'bg-secondary'
              }">
                ${this.escapeHtml(documento.datosRemitenMatfin || 'No')}
              </span>
            </td>
            <td class="text-center">
              ${this.renderCamposDocumento(documento.id)}
            </td>
            <td class="text-center">${estadoBadge}</td>
            <td class="text-center">${fecha}</td>
            <td class="text-center">${acciones}</td>
          </tr>
        `;
      });

      tableHTML += `
            </tbody>
          </table>
        </div>
      `;

      return tableHTML;
    } catch (error) {
      console.error('Error al renderizar tabla unificada:', error);
      return '<div class="alert alert-danger">Error al cargar los documentos</div>';
    }
  }

  /**
   * Renderiza la tabla de documentos vinculados al trámite
   * @param {Array} documentos - Array de documentos vinculados
   * @returns {string} HTML de la tabla
   */
  renderTablaDocumentosVinculados(documentos) {
    if (!documentos || documentos.length === 0) {
      return `
        <div class="text-center py-4">
          <i class="fas fa-link fa-3x text-muted mb-3"></i>
          <h6 class="text-muted">No hay documentos vinculados a este trámite</h6>
          <p class="text-muted">Los documentos aparecerán aquí una vez que sean vinculados usando el selector de abajo.</p>
        </div>
      `;
    }

    let tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="text-center">Nombre</th>
              <th class="text-center">Tipo Documental</th>
              <th class="text-center">Descripción</th>
              <th class="text-center">Formato</th>
              <th class="text-center">Obligatorio</th>
              <th class="text-center">Fecha Vinculación</th>
            </tr>
          </thead>
          <tbody>
    `;

    documentos.forEach(documento => {
      tableHTML += `
        <tr>
          <td class="text-center">
            <strong>${this.escapeHtml(documento.nombreDocumento)}</strong>
          </td>
          <td class="text-center">
            <span class="badge bg-primary">${this.escapeHtml(
              documento.tipoDocumental
            )}</span>
          </td>
          <td class="text-center">
            <small class="text-muted">${this.escapeHtml(
              documento.descripcionDocumento || 'Sin descripción'
            )}</small>
          </td>
          <td class="text-center">
            <span class="badge bg-info">${this.escapeHtml(
              documento.tipoFormatoEsperado || 'N/A'
            )}</span>
          </td>
          <td class="text-center">
            <span class="badge ${
              documento.obligatoriedad === 'Sí' ? 'bg-warning' : 'bg-secondary'
            }">
              ${this.escapeHtml(documento.obligatoriedad || 'No')}
            </span>
          </td>
          <td class="text-center">${this.formatDate(
            documento.fechaVinculacion
          )}</td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    return tableHTML;
  }

  /**
   * Formatea una fecha para mostrar
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate(fecha) {
    if (!fecha) return '<span class="text-muted">Sin fecha</span>';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Edita un documento
   * @param {string} documentoId - ID del documento
   */
  editarDocumento(documentoId) {
    // Implementar lógica para editar documento
    this.showAlert('Función de editar documento en desarrollo', 'info');
  }

  /**
   * Desvincula un documento directamente desde la tabla unificada
   * @param {string} vinculacionId - ID de la vinculación
   * @param {string} documentoId - ID del documento
   * @param {string} tramiteId - ID del trámite
   */
  desvincularDocumentoDirecto(vinculacionId, documentoId, tramiteId) {
    try {
      // Obtener todas las vinculaciones
      const todasLasVinculaciones = this.obtenerTodasLasVinculaciones();

      // Filtrar la vinculación a eliminar
      const vinculacionesFiltradas = todasLasVinculaciones.filter(
        v => v.id !== vinculacionId
      );

      // Guardar en localStorage
      localStorage.setItem(
        'tramite_documentos_vinculaciones',
        JSON.stringify(vinculacionesFiltradas)
      );

      this.showAlert('Documento desvinculado exitosamente', 'success');

      // Recargar la tabla unificada
      this.cargarDocumentosUnificados(tramiteId);

      // Recargar opciones del select
      const selectDocumento = document.getElementById('selectDocumento');
      if (selectDocumento) {
        this.cargarDocumentosDisponibles(selectDocumento, tramiteId);
      }
    } catch (error) {
      console.error('Error al desvincular documento:', error);
      this.showAlert('Error al desvincular el documento', 'danger');
    }
  }

  /**
   * Obtiene los campos personalizados de un documento
   * @param {string} documentoId - ID del documento
   * @returns {Array} Array de campos del documento
   */
  obtenerCamposDocumento(documentoId) {
    try {
      if (!window.campoDocumentoService) {
        return [];
      }
      return window.campoDocumentoService.getCamposByDocumentoId(documentoId);
    } catch (error) {
      console.error('Error al obtener campos del documento:', error);
      return [];
    }
  }

  /**
   * Renderiza los campos personalizados de un documento para la tabla
   * @param {string} documentoId - ID del documento
   * @returns {string} HTML de los campos
   */
  renderCamposDocumento(documentoId) {
    try {
      const campos = this.obtenerCamposDocumento(documentoId);

      if (!campos || campos.length === 0) {
        return '<span class="text-muted">Sin campos</span>';
      }

      if (campos.length === 1) {
        const campo = campos[0];
        const icono = this.getTipoCampoIcono(campo.tipoCampo);
        const badgeColor = this.getTipoCampoBadgeColor(campo.tipoCampo);
        return `
          <span class="badge ${badgeColor}" data-bs-toggle="tooltip" title="${this.escapeHtml(
          campo.nombreCampo
        )}">
            <i class="${icono} me-1"></i>
            ${this.escapeHtml(campo.nombreCampo)}
          </span>
        `;
      }

      // Si hay múltiples campos, mostrar un badge con el número
      return `
        <span class="badge bg-info" data-bs-toggle="tooltip" title="${campos
          .map(c => c.nombreCampo)
          .join(', ')}">
          <i class="fas fa-list me-1"></i>
          ${campos.length} campo(s)
        </span>
      `;
    } catch (error) {
      console.error('Error al renderizar campos del documento:', error);
      return '<span class="text-muted">Error</span>';
    }
  }

  /**
   * Obtiene el icono del tipo de campo
   * @param {string} tipoCampo - Tipo del campo
   * @returns {string} Clase del icono
   */
  getTipoCampoIcono(tipoCampo) {
    const iconos = {
      linea_texto: 'fas fa-font',
      fecha: 'fas fa-calendar-alt',
      numerico: 'fas fa-hashtag',
    };
    return iconos[tipoCampo] || 'fas fa-question';
  }

  /**
   * Obtiene el color del badge para el tipo de campo
   * @param {string} tipoCampo - Tipo del campo
   * @returns {string} Clase del badge
   */
  getTipoCampoBadgeColor(tipoCampo) {
    const colores = {
      linea_texto: 'bg-primary',
      fecha: 'bg-info',
      numerico: 'bg-success',
    };
    return colores[tipoCampo] || 'bg-secondary';
  }

  /**
   * Genera un ID único
   * @returns {string} ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Actualiza el modal de opciones después de cambiar el estado del trámite
   * @param {string} tramiteId - ID del trámite
   */
  refreshOpcionesModal(tramiteId) {
    try {
      // Obtener el trámite actualizado
      if (window.tramiteApp && window.tramiteApp.eventManager) {
        window.tramiteApp.eventManager.emit('tramite:getById', {
          tramiteId,
          callback: tramite => {
            if (tramite) {
              // Actualizar el título del modal
              const modalTitle = document.querySelector(
                '#modalOpcionesTramite .modal-title'
              );
              if (modalTitle) {
                modalTitle.textContent = `Opciones del Trámite: ${tramite.nombre}`;
              }

              // Actualizar el estado mostrado
              const estadoElement = document.querySelector(
                '#modalOpcionesTramite .estado-tramite'
              );
              if (estadoElement) {
                const estado = tramite.getEstadoPorFechas();
                estadoElement.textContent = `Estado: ${this.getEstadoText(
                  estado
                )}`;
                estadoElement.className = `estado-tramite badge ${this.getEstadoBadgeClass(
                  estado
                )}`;
              }

              // Actualizar el botón de activar/inactivar
              this.actualizarTextoBotonActivarInactivar(tramite);

              // Actualizar las fechas mostradas
              this.actualizarFechasEnModal(tramite);
            } else {
              console.error('❌ No se pudo obtener el trámite actualizado');
            }
          },
        });
      }
    } catch (error) {
      console.error('❌ Error al actualizar modal de opciones:', error);
    }
  }

  /**
   * Actualiza las fechas mostradas en el modal de opciones
   * @param {Tramite} tramite - Trámite con las fechas actualizadas
   */
  actualizarFechasEnModal(tramite) {
    try {
      // Actualizar fecha de inicio
      const fechaInicioElement = document.querySelector(
        '#modalOpcionesTramite .fecha-inicio'
      );
      if (fechaInicioElement) {
        fechaInicioElement.textContent = this.getFechaDisplay(
          tramite,
          'fechaInicio'
        );
      }

      // Actualizar fecha de finalización
      const fechaFinalizacionElement = document.querySelector(
        '#modalOpcionesTramite .fecha-finalizacion'
      );
      if (fechaFinalizacionElement) {
        fechaFinalizacionElement.textContent = this.getFechaDisplay(
          tramite,
          'fechaFinalizacion'
        );
      }

      // Actualizar fecha de inicio de subsanación
      const fechaInicioSubsanacionElement = document.querySelector(
        '#modalOpcionesTramite .fecha-inicio-subsanacion'
      );
      if (fechaInicioSubsanacionElement) {
        fechaInicioSubsanacionElement.textContent = this.getFechaDisplay(
          tramite,
          'fechaInicioSubsanacion'
        );
      }

      // Actualizar fecha fin de subsanación
      const fechaFinSubsanacionElement = document.querySelector(
        '#modalOpcionesTramite .fecha-fin-subsanacion'
      );
      if (fechaFinSubsanacionElement) {
        fechaFinSubsanacionElement.textContent = this.getFechaDisplay(
          tramite,
          'fechaFinSubsanacion'
        );
      }
    } catch (error) {
      console.error('❌ Error al actualizar fechas en modal:', error);
    }
  }
}
