/**
 * Vista para manejo de la interfaz de usuario de trámites
 * Clase que maneja la presentación y renderizado de datos
 */
class TramiteView {
  constructor() {
    this.container = document.getElementById('tablaTramitesContainer');
    this.modalCrear = document.getElementById('modalCrearTramite');
    this.modalOpciones = document.getElementById('modalOpcionesTramite');
    this.form = document.getElementById('formCrearTramite');
    this.currentTramiteId = null;
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
                    ${Tramite.formatDate(tramite.fechaInicio)}
                </td>
                <td class="text-center">
                    ${Tramite.formatDate(tramite.fechaFinalizacion)}
                </td>
                <td class="text-center">
                    <span class="status-badge ${estadoClass}">
                        <i class="${estadoIcon} me-1"></i>
                        ${this.getEstadoText(estado)}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-action" 
                            onclick="tramiteController.showOpciones('${
                              tramite.id
                            }')"
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
      subsanacion: 'status-pendiente',
      inactivo: 'status-finalizado',
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
      subsanacion: 'fas fa-exclamation-triangle',
      inactivo: 'fas fa-pause-circle',
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
      subsanacion: 'Subsanación',
      inactivo: 'Inactivo',
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

    // Obtener el trámite para actualizar el texto del botón
    const tramite = tramiteController.service.getById(tramiteId);
    if (tramite) {
      this.actualizarTextoBotonActivarInactivar(tramite);
    }

    const modal = new bootstrap.Modal(this.modalOpciones);
    modal.show();
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

        // Mostrar el estado actual
        const estadoText = this.getEstadoText(estado);
        textoElement.textContent = `${estadoText} (Automático)`;

        // Icono según el estado
        const estadoIcon = this.getEstadoIcon(estado);
        iconElement.className = `${estadoIcon} me-2`;
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
                Añadir Documentos - ${this.escapeHtml(tramite.nombre)}
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

                <!-- Tipo Documental -->
                <div class="mb-3">
                  <label for="tipoDocumental" class="form-label">
                    Tipo Documental
                  </label>
                  <select class="form-select" id="tipoDocumental" required>
                    <option value="">Seleccione un tipo de documento</option>
                    <option value="Solicitud">Solicitud</option>
                    <option value="Certificado">Certificado</option>
                    <option value="Constancia">Constancia</option>
                    <option value="Carné">Carné</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Acta">Acta</option>
                    <option value="Informe">Informe</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <!-- Área Solicitante -->
                <div class="mb-3">
                  <label for="areaSolicitante" class="form-label">
                    Área Solicitante
                  </label>
                  <select class="form-select" id="areaSolicitante" required>
                    <option value="">Seleccione un área</option>
                    <option value="Académica">Académica</option>
                    <option value="Administrativa">Administrativa</option>
                    <option value="Financiera">Financiera</option>
                    <option value="Bienestar">Bienestar</option>
                    <option value="Investigación">Investigación</option>
                    <option value="Extensión">Extensión</option>
                    <option value="Registro y Control">Registro y Control</option>
                    <option value="Admisiones">Admisiones</option>
                    <option value="Graduados">Graduados</option>
                  </select>
                </div>

                <!-- Responsable de validación -->
                <div class="mb-3">
                  <label for="responsableValidacion" class="form-label">
                    Responsable de validación
                  </label>
                  <input type="text" class="form-control" id="responsableValidacion" 
                         placeholder="Ingrese el nombre del responsable" required>
                </div>



                <!-- Datos requeridos -->
                <div class="mb-4">
                  <div class="card">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="fas fa-list-alt me-2"></i>
                        Datos Requeridos
                      </h6>
                    </div>
                    <div class="card-body">
                      <div id="datosRequeridosContainer">
                        <!-- Los campos se agregarán dinámicamente aquí -->
                      </div>
                      <button type="button" class="btn btn-outline-primary btn-sm mt-3" id="btnAgregarCampo">
                        <i class="fas fa-plus me-1"></i>
                        Agregar Campo
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" id="btnGuardarDocumentos">
                <i class="fas fa-save me-1"></i>
                Guardar Documento
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
    const btnAgregarCampo = document.getElementById('btnAgregarCampo');
    const btnGuardarDocumentos = document.getElementById(
      'btnGuardarDocumentos'
    );
    const datosRequeridosContainer = document.getElementById(
      'datosRequeridosContainer'
    );

    // Evento para agregar campos dinámicamente
    if (btnAgregarCampo) {
      btnAgregarCampo.addEventListener('click', () => {
        this.agregarCampoDatosRequeridos(datosRequeridosContainer);
      });
    }

    // Evento para guardar documento
    if (btnGuardarDocumentos) {
      btnGuardarDocumentos.addEventListener('click', () => {
        this.guardarDocumento(tramite);
      });
    }

    // Agregar el primer campo por defecto
    if (datosRequeridosContainer) {
      this.agregarCampoDatosRequeridos(datosRequeridosContainer);
    }
  }

  /**
   * Agrega un campo dinámico a la sección de datos requeridos
   * @param {HTMLElement} container - Contenedor donde se agregará el campo
   */
  agregarCampoDatosRequeridos(container) {
    const campoId = Date.now() + Math.random().toString(36).substr(2, 9);
    const campoHTML = `
      <div class="row mb-3 campo-dato" data-campo-id="${campoId}">
        <div class="col-md-3">
          <label class="form-label">Nombre del Campo</label>
          <input type="text" class="form-control" 
                 placeholder="Ej: Nombre completo" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Tipo de Campo</label>
          <select class="form-select" required>
            <option value="">Seleccione tipo</option>
            <option value="fecha">Campo tipo fecha</option>
            <option value="texto">Campo tipo línea de texto</option>
            <option value="numerico">Campo numérico</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Mensaje de Ayuda</label>
          <textarea class="form-control" rows="2" 
                    placeholder="Ej: Ingrese su nombre completo tal como aparece en su documento de identidad"></textarea>
        </div>
        <div class="col-md-2">
          <label class="form-label">&nbsp;</label>
          <div class="d-grid">
            <button type="button" class="btn btn-outline-danger btn-sm" 
                    onclick="this.closest('.campo-dato').remove()">
              <i class="fas fa-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', campoHTML);
  }

  /**
   * Guarda el documento del trámite
   * @param {Tramite} tramite - Trámite al que se guardará el documento
   */
  guardarDocumento(tramite) {
    const form = document.getElementById('formDocumentos');
    if (!form) {
      this.showAlert('Error: Formulario no encontrado', 'danger');
      return;
    }

    // Validar campos requeridos
    const requiredFields = [
      'tipoDocumental',
      'areaSolicitante',
      'responsableValidacion',
    ];

    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        this.showAlert(`Por favor complete el campo: ${fieldId}`, 'warning');
        return;
      }
    }

    // Obtener datos del formulario
    const formData = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      tramiteId: tramite.id,
      tramiteNombre: tramite.nombre,
      tipoDocumental: document.getElementById('tipoDocumental').value,
      areaSolicitante: document.getElementById('areaSolicitante').value,
      responsableValidacion: document.getElementById('responsableValidacion')
        .value,
      datosRequeridos: this.obtenerDatosRequeridos(),
      fechaCreacion: new Date().toISOString(),
    };

    // Validar que haya al menos un campo de datos requeridos
    if (formData.datosRequeridos.length === 0) {
      this.showAlert(
        'Debe agregar al menos un campo de datos requeridos',
        'warning'
      );
      return;
    }

    // Guardar en localStorage
    this.guardarDocumentoEnLocalStorage(formData);

    this.showAlert(
      `Documento "${formData.tipoDocumental}" agregado exitosamente al trámite "${tramite.nombre}"`,
      'success'
    );

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById('documentosModal')
    );
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Guarda un documento en localStorage
   * @param {Object} documento - Documento a guardar
   */
  guardarDocumentoEnLocalStorage(documento) {
    try {
      // Obtener documentos existentes
      const documentosExistentes = this.obtenerDocumentosDeLocalStorage();

      // Agregar el nuevo documento
      documentosExistentes.push(documento);

      // Guardar en localStorage
      localStorage.setItem(
        'documentos_tramites',
        JSON.stringify(documentosExistentes)
      );

      console.log('Documento guardado en localStorage:', documento);
    } catch (error) {
      console.error('Error al guardar documento en localStorage:', error);
      this.showAlert('Error al guardar el documento', 'danger');
    }
  }

  /**
   * Obtiene los datos requeridos del formulario
   * @returns {Array} Array de objetos con los datos requeridos
   */
  obtenerDatosRequeridos() {
    const campos = document.querySelectorAll('.campo-dato');
    const datosRequeridos = [];

    campos.forEach(campo => {
      const inputs = campo.querySelectorAll('input, select, textarea');
      if (inputs.length >= 3) {
        const nombreCampo = inputs[0].value.trim();
        const tipoCampo = inputs[1].value;
        const mensajeAyuda = inputs[2].value.trim();

        if (nombreCampo && tipoCampo) {
          datosRequeridos.push({
            nombre: nombreCampo,
            tipo: tipoCampo,
            mensajeAyuda: mensajeAyuda || '',
          });
        }
      }
    });

    return datosRequeridos;
  }

  /**
   * Muestra un modal para ver los documentos del trámite
   * @param {Tramite} tramite - Trámite del que se mostrarán los documentos
   */
  showVerDocumentosModal(tramite) {
    // Almacenar el ID del trámite actual para operaciones posteriores
    this.currentTramiteId = tramite.id;

    // Obtener documentos del trámite desde localStorage
    const documentos = this.obtenerDocumentosDelTramite(tramite.id);

    const modalHTML = `
      <div class="modal fade" id="verDocumentosModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-eye me-2"></i>
                Documentos del Trámite - ${this.escapeHtml(tramite.nombre)}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Información del trámite -->
              <div class="mb-4">
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <i class="fas fa-info-circle me-2"></i>
                      Información del Trámite
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

              <!-- Tabla de documentos -->
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0">
                    <i class="fas fa-table me-2"></i>
                    Documentos Registrados
                  </h6>
                </div>
                <div class="card-body">
                  ${this.renderTablaDocumentos(documentos)}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('verDocumentosModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar modal
    const modal = document.getElementById('verDocumentosModal');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal después de cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  /**
   * Renderiza la tabla de documentos
   * @param {Array} documentos - Array de documentos
   * @returns {string} HTML de la tabla
   */
  renderTablaDocumentos(documentos) {
    if (!documentos || documentos.length === 0) {
      return `
        <div class="text-center py-4">
          <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h6 class="text-muted">No hay documentos registrados para este trámite</h6>
          <p class="text-muted">Los documentos aparecerán aquí una vez que sean agregados.</p>
        </div>
      `;
    }

    let tableHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th class="text-center">Tipo Documental</th>
              <th class="text-center">Área Solicitante</th>
              <th class="text-center">Responsable</th>
              <th class="text-center">Datos Requeridos</th>
              <th class="text-center">Fecha Creación</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    documentos.forEach(documento => {
      tableHTML += `
        <tr>
          <td class="text-center">
            <span class="badge bg-primary">${this.escapeHtml(
              documento.tipoDocumental
            )}</span>
          </td>
          <td class="text-center">${this.escapeHtml(
            documento.areaSolicitante
          )}</td>
          <td class="text-center">${this.escapeHtml(
            documento.responsableValidacion
          )}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary" 
                    onclick="tramiteView.mostrarDatosRequeridos('${
                      documento.id
                    }')"
                    data-bs-toggle="tooltip" 
                    title="Ver datos requeridos">
              <i class="fas fa-list"></i>
              ${documento.datosRequeridos.length} campos
            </button>
          </td>
                              <td class="text-center">${Tramite.formatDate(
                                documento.fechaCreacion
                              )}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary me-1" 
                    onclick="tramiteView.editarDocumento('${documento.id}')"
                    data-bs-toggle="tooltip" 
                    title="Editar documento">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" 
                    onclick="tramiteView.eliminarDocumento('${documento.id}')"
                    data-bs-toggle="tooltip" 
                    title="Eliminar documento">
              <i class="fas fa-trash"></i>
            </button>
          </td>
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
   * Obtiene todos los documentos de localStorage
   * @returns {Array} Array de documentos
   */
  obtenerDocumentosDeLocalStorage() {
    try {
      const documentos = localStorage.getItem('documentos_tramites');
      return documentos ? JSON.parse(documentos) : [];
    } catch (error) {
      console.error('Error al obtener documentos de localStorage:', error);
      return [];
    }
  }

  /**
   * Obtiene los documentos de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de documentos del trámite
   */
  obtenerDocumentosDelTramite(tramiteId) {
    try {
      // Obtener todos los documentos de localStorage
      const todosLosDocumentos = this.obtenerDocumentosDeLocalStorage();

      // Filtrar por el trámite específico
      const documentosDelTramite = todosLosDocumentos.filter(
        doc => doc.tramiteId === tramiteId
      );

      // Si no hay documentos, mostrar algunos de ejemplo
      if (documentosDelTramite.length === 0) {
        return this.obtenerDocumentosDeEjemplo(tramiteId);
      }

      return documentosDelTramite;
    } catch (error) {
      console.error('Error al obtener documentos del trámite:', error);
      return this.obtenerDocumentosDeEjemplo(tramiteId);
    }
  }

  /**
   * Obtiene documentos de ejemplo para mostrar cuando no hay documentos reales
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de documentos de ejemplo
   */
  obtenerDocumentosDeEjemplo(tramiteId) {
    return [
      {
        id: 'doc_ejemplo_1',
        tramiteId: tramiteId,
        tipoDocumental: 'Solicitud',
        areaSolicitante: 'Académica',
        responsableValidacion: 'Dr. Juan Pérez',
        datosRequeridos: [
          {
            nombre: 'Nombre completo',
            tipo: 'texto',
            mensajeAyuda:
              'Ingrese su nombre completo tal como aparece en su documento de identidad',
          },
          {
            nombre: 'Fecha de nacimiento',
            tipo: 'fecha',
            mensajeAyuda: 'Seleccione su fecha de nacimiento',
          },
          {
            nombre: 'Número de identificación',
            tipo: 'numerico',
            mensajeAyuda:
              'Ingrese su número de identificación sin puntos ni guiones',
          },
        ],
        fechaCreacion: new Date().toISOString(),
      },
      {
        id: 'doc_ejemplo_2',
        tramiteId: tramiteId,
        tipoDocumental: 'Certificado',
        areaSolicitante: 'Administrativa',
        responsableValidacion: 'Lic. María García',
        datosRequeridos: [
          {
            nombre: 'Código de estudiante',
            tipo: 'numerico',
            mensajeAyuda: 'Ingrese su código de estudiante de 8 dígitos',
          },
          {
            nombre: 'Programa académico',
            tipo: 'texto',
            mensajeAyuda:
              'Seleccione el programa académico en el que está matriculado',
          },
          {
            nombre: 'Fecha de expedición',
            tipo: 'fecha',
            mensajeAyuda: 'Fecha en la que se expide el certificado',
          },
        ],
        fechaCreacion: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      },
    ];
  }

  /**
   * Muestra los datos requeridos de un documento en un modal
   * @param {string} documentoId - ID del documento
   */
  mostrarDatosRequeridos(documentoId) {
    try {
      // Obtener todos los documentos
      const todosLosDocumentos = this.obtenerDocumentosDeLocalStorage();

      // Buscar el documento específico
      const documento = todosLosDocumentos.find(doc => doc.id === documentoId);

      if (!documento) {
        this.showAlert('Documento no encontrado', 'warning');
        return;
      }

      const modalHTML = `
        <div class="modal fade" id="datosRequeridosModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="fas fa-list-alt me-2"></i>
                  Datos Requeridos - ${this.escapeHtml(
                    documento.tipoDocumental
                  )}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <h6>Información del Documento</h6>
                  <table class="table table-sm">
                    <tr><td><strong>Tipo:</strong></td><td>${this.escapeHtml(
                      documento.tipoDocumental
                    )}</td></tr>
                    <tr><td><strong>Área:</strong></td><td>${this.escapeHtml(
                      documento.areaSolicitante
                    )}</td></tr>
                    <tr><td><strong>Responsable:</strong></td><td>${this.escapeHtml(
                      documento.responsableValidacion
                    )}</td></tr>
                  </table>
                </div>
                
                <div class="card">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <i class="fas fa-list me-2"></i>
                      Campos Requeridos (${documento.datosRequeridos.length})
                    </h6>
                  </div>
                  <div class="card-body">
                    ${this.renderDatosRequeridosLista(
                      documento.datosRequeridos
                    )}
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Remover modal anterior si existe
      const existingModal = document.getElementById('datosRequeridosModal');
      if (existingModal) {
        existingModal.remove();
      }

      // Agregar nuevo modal
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Mostrar modal
      const modal = document.getElementById('datosRequeridosModal');
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      // Limpiar modal después de cerrar
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    } catch (error) {
      console.error('Error al mostrar datos requeridos:', error);
      this.showAlert('Error al mostrar los datos requeridos', 'danger');
    }
  }

  /**
   * Renderiza la lista de datos requeridos
   * @param {Array} datosRequeridos - Array de datos requeridos
   * @returns {string} HTML de la lista
   */
  renderDatosRequeridosLista(datosRequeridos) {
    if (!datosRequeridos || datosRequeridos.length === 0) {
      return '<p class="text-muted">No hay datos requeridos definidos.</p>';
    }

    let html =
      '<div class="table-responsive"><table class="table table-hover">';
    html +=
      '<thead><tr><th>#</th><th>Nombre del Campo</th><th>Tipo</th><th>Mensaje de Ayuda</th><th>Icono</th></tr></thead><tbody>';

    datosRequeridos.forEach((dato, index) => {
      const tipoIcon = this.getTipoIcon(dato.tipo);
      const tipoText = this.getTipoText(dato.tipo);
      const mensajeAyuda = dato.mensajeAyuda || 'Sin mensaje de ayuda';

      html += `
        <tr>
          <td><span class="badge bg-secondary">${index + 1}</span></td>
          <td><strong>${this.escapeHtml(dato.nombre)}</strong></td>
          <td><span class="badge bg-info">${tipoText}</span></td>
          <td><small class="text-muted">${this.escapeHtml(
            mensajeAyuda
          )}</small></td>
          <td><i class="${tipoIcon} text-primary"></i></td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    return html;
  }

  /**
   * Obtiene el icono para el tipo de campo
   * @param {string} tipo - Tipo de campo
   * @returns {string} Clase del icono
   */
  getTipoIcon(tipo) {
    const icons = {
      fecha: 'fas fa-calendar',
      texto: 'fas fa-font',
      numerico: 'fas fa-hashtag',
    };
    return icons[tipo] || 'fas fa-question';
  }

  /**
   * Obtiene el texto para el tipo de campo
   * @param {string} tipo - Tipo de campo
   * @returns {string} Texto del tipo
   */
  getTipoText(tipo) {
    const texts = {
      fecha: 'Fecha',
      texto: 'Texto',
      numerico: 'Numérico',
    };
    return texts[tipo] || 'Desconocido';
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
   * Elimina un documento
   * @param {string} documentoId - ID del documento
   */
  eliminarDocumento(documentoId) {
    this.showConfirmModal(
      'Eliminar Documento',
      '¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.',
      () => {
        try {
          // Obtener todos los documentos
          const todosLosDocumentos = this.obtenerDocumentosDeLocalStorage();

          // Filtrar el documento a eliminar
          const documentosFiltrados = todosLosDocumentos.filter(
            doc => doc.id !== documentoId
          );

          // Guardar en localStorage
          localStorage.setItem(
            'documentos_tramites',
            JSON.stringify(documentosFiltrados)
          );

          this.showAlert('Documento eliminado exitosamente', 'success');

          // Recargar la tabla de documentos
          this.recargarTablaDocumentos();
        } catch (error) {
          console.error('Error al eliminar documento:', error);
          this.showAlert('Error al eliminar el documento', 'danger');
        }
      },
      'Eliminar',
      'Cancelar'
    );
  }

  /**
   * Recarga la tabla de documentos después de una operación
   */
  recargarTablaDocumentos() {
    // Obtener el modal actual
    const modal = document.getElementById('verDocumentosModal');
    if (modal && modal.classList.contains('show')) {
      // Obtener el trámite actual (podríamos almacenarlo en una variable)
      const tramiteId = this.currentTramiteId;
      if (tramiteId) {
        const tramite = tramiteController.service.getById(tramiteId);
        if (tramite) {
          // Recargar la tabla
          const documentos = this.obtenerDocumentosDelTramite(tramiteId);
          const tablaContainer = modal.querySelector('.card-body');
          if (tablaContainer) {
            tablaContainer.innerHTML = this.renderTablaDocumentos(documentos);
          }
        }
      }
    }
  }
}
