/**
 * Vista para gestión de documentos de trámites
 * Clase que maneja la presentación y renderizado de documentos
 */
class DocumentoView extends BaseView {
  constructor() {
    super();
    this.container = null;
    this.currentTramiteId = null;
  }

  /**
   * Configura los elementos comunes de la vista
   */
  setupCommonElements() {
    // Buscar el contenedor principal
    this.container =
      document.getElementById('documentosContainer') ||
      document.createElement('div');

    if (!document.getElementById('documentosContainer')) {
      this.container.id = 'documentosContainer';
      this.container.className = 'documentos-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Inicializa la vista
   */
  async initialize() {
    await super.initialize();
    this.setupCommonElements();
    console.log('🎨 DocumentoView inicializada');
  }

  /**
   * Muestra la lista de documentos para un trámite
   * @param {string} tramiteId - ID del trámite
   */
  showList(tramiteId) {
    this.currentTramiteId = tramiteId;
    this.renderDocumentosList([]);
  }

  /**
   * Renderiza la lista de documentos
   * @param {Array} documentos - Array de documentos
   */
  renderDocumentosList(documentos = []) {
    if (!this.container) return;

    const html = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-file-alt me-2"></i>
            Documentos del Trámite
          </h5>
        </div>
        <div class="card-body">
          ${
            documentos.length === 0
              ? '<p class="text-muted">No hay documentos para mostrar</p>'
              : this.renderDocumentosTable(documentos)
          }
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Renderiza la tabla de documentos
   * @param {Array} documentos - Array de documentos
   * @returns {string} HTML de la tabla
   */
  renderDocumentosTable(documentos) {
    return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${documentos.map(doc => this.renderDocumentoRow(doc)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Renderiza una fila de documento
   * @param {Object} documento - Documento a renderizar
   * @returns {string} HTML de la fila
   */
  renderDocumentoRow(documento) {
    return `
      <tr>
        <td>${this.escapeHtml(documento.nombre)}</td>
        <td>${this.escapeHtml(documento.tipo)}</td>
        <td>
          <span class="badge bg-${this.getEstadoBadgeClass(documento.estado)}">
            ${this.escapeHtml(documento.estado)}
          </span>
        </td>
        <td>${this.formatDate(documento.fechaCreacion)}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="this.viewDocumento('${
            documento.id
          }')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="this.editDocumento('${
            documento.id
          }')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="this.deleteDocumento('${
            documento.id
          }')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Obtiene la clase CSS para el badge del estado
   * @param {string} estado - Estado del documento
   * @returns {string} Clase CSS
   */
  getEstadoBadgeClass(estado) {
    const estados = {
      activo: 'success',
      inactivo: 'secondary',
      pendiente: 'warning',
      rechazado: 'danger',
    };
    return estados[estado] || 'secondary';
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
   * Formatea una fecha para mostrar
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
  }

  /**
   * Refresca la lista de documentos
   */
  refreshList() {
    if (this.currentTramiteId) {
      this.showList(this.currentTramiteId);
    }
  }

  /**
   * Muestra el modal para crear un nuevo documento
   */
  showCrearDocumentoModal() {
    const modalHTML = `
      <div class="modal fade" id="modalCrearDocumento" tabindex="-1" aria-labelledby="modalCrearDocumentoLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalCrearDocumentoLabel">
                <i class="fas fa-file-plus me-2"></i>
                Crear Nuevo Documento
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="formCrearDocumento">
                <!-- Nombre del Documento -->
                <div class="mb-3">
                  <label for="nombreDocumento" class="form-label">
                    <i class="fas fa-file-alt me-1"></i>
                    Nombre del Documento
                  </label>
                  <input type="text" class="form-control" id="nombreDocumento" 
                         placeholder="Ingrese el nombre del documento" required>
                </div>

                <!-- Tipo Documental -->
                <div class="mb-3">
                  <label for="tipoDocumental" class="form-label">
                    <i class="fas fa-tags me-1"></i>
                    Tipo Documental
                  </label>
                  <select class="form-select" id="tipoDocumental" required>
                    <option value="">Seleccione un tipo documental</option>
                    <option value="Solicitud">Solicitud</option>
                    <option value="Certificado">Certificado</option>
                    <option value="Constancia">Constancia</option>
                    <option value="Carné">Carné</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Acta">Acta</option>
                    <option value="Informe">Informe</option>
                    <option value="Resolución">Resolución</option>
                    <option value="Circular">Circular</option>
                    <option value="Memorando">Memorando</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <!-- Descripción del Documento -->
                <div class="mb-3">
                  <label for="descripcionDocumento" class="form-label">
                    <i class="fas fa-align-left me-1"></i>
                    Descripción del Documento
                  </label>
                  <textarea class="form-control" id="descripcionDocumento" rows="3" 
                            placeholder="Ingrese una descripción detallada del documento" required></textarea>
                </div>

                <!-- Tipo de Formato Esperado -->
                <div class="mb-3">
                  <label for="tipoFormatoEsperado" class="form-label">
                    <i class="fas fa-file-upload me-1"></i>
                    Tipo de Formato Esperado
                  </label>
                  <input type="text" class="form-control" id="tipoFormatoEsperado" 
                         placeholder="Ejemplo: pdf,jpg,docx" required>
                  <div class="form-text">Ingrese los formatos esperados separados por coma (ejemplo: pdf,jpg,docx)</div>
                </div>

                <!-- Obligatoriedad -->
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-exclamation-circle me-1"></i>
                    Obligatoriedad
                  </label>
                  <div class="row">
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="obligatoriedad" id="obligatoriedadSi" value="Sí" required>
                        <label class="form-check-label" for="obligatoriedadSi">
                          Sí
                        </label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="obligatoriedad" id="obligatoriedadNo" value="No" required>
                        <label class="form-check-label" for="obligatoriedadNo">
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ¿Requiere aprobación? -->
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-check-circle me-1"></i>
                    ¿Requiere aprobación?
                  </label>
                  <div class="row">
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="requiereAprobacion" id="requiereAprobacionSi" value="Sí" required>
                        <label class="form-check-label" for="requiereAprobacionSi">
                          Sí
                        </label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="requiereAprobacion" id="requiereAprobacionNo" value="No" required>
                        <label class="form-check-label" for="requiereAprobacionNo">
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Vigencia en días -->
                <div class="mb-3">
                  <label for="vigenciaEnDias" class="form-label">
                    <i class="fas fa-calendar-alt me-1"></i>
                    Vigencia en días
                  </label>
                  <input type="number" class="form-control" id="vigenciaEnDias" 
                         placeholder="Ingrese el número de días" min="0" required>
                </div>

                <!-- ¿Permite plazos ampliados? -->
                <div class="mb-3">
                  <label class="form-label">
                    <i class="fas fa-clock me-1"></i>
                    ¿Permite plazos ampliados?
                  </label>
                  <div class="row">
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="permitePlazosAmpliados" id="permitePlazosAmpliadosSi" value="Sí" required>
                        <label class="form-check-label" for="permitePlazosAmpliadosSi">
                          Sí
                        </label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="permitePlazosAmpliados" id="permitePlazosAmpliadosNo" value="No" required>
                        <label class="form-check-label" for="permitePlazosAmpliadosNo">
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="fas fa-times me-1"></i>
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" id="btnGuardarDocumento">
                <i class="fas fa-save me-1"></i>
                Guardar Documento
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('modalCrearDocumento');
    if (existingModal) {
      existingModal.remove();
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar modal
    const modal = document.getElementById('modalCrearDocumento');
    const bsModal = new bootstrap.Modal(modal);

    // Configurar eventos del modal DESPUÉS de que se haya insertado en el DOM
    // Usar setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.setupCrearDocumentoModalEvents();
    }, 100);

    bsModal.show();

    // Limpiar modal después de cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  /**
   * Configura los eventos del modal de crear documento
   */
  setupCrearDocumentoModalEvents() {
    console.log('🔧 Configurando eventos del modal crear documento...');
    const btnGuardarDocumento = document.getElementById('btnGuardarDocumento');
    const form = document.getElementById('formCrearDocumento');

    console.log('🔍 Botón guardar encontrado:', btnGuardarDocumento);
    console.log('🔍 Formulario encontrado:', form);

    if (btnGuardarDocumento) {
      btnGuardarDocumento.addEventListener('click', () => {
        console.log('🖱️ Clic en botón Guardar Documento');
        this.guardarDocumento();
      });
      console.log('✅ Event listener agregado al botón Guardar Documento');
    } else {
      console.error('❌ Botón Guardar Documento no encontrado');
    }

    if (form) {
      form.addEventListener('submit', e => {
        console.log('📝 Submit del formulario');
        e.preventDefault();
        this.guardarDocumento();
      });
      console.log('✅ Event listener agregado al formulario');
    } else {
      console.error('❌ Formulario no encontrado');
    }
  }

  /**
   * Guarda el documento desde el formulario
   */
  guardarDocumento() {
    console.log('🔍 Método guardarDocumento llamado');
    const form = document.getElementById('formCrearDocumento');
    if (!form) {
      console.error('❌ Formulario no encontrado');
      this.showAlert('Error: Formulario no encontrado', 'danger');
      return;
    }
    console.log('✅ Formulario encontrado');

    // Obtener datos del formulario
    const formData = {
      nombreDocumento: document.getElementById('nombreDocumento').value.trim(),
      tipoDocumental: document.getElementById('tipoDocumental').value,
      descripcionDocumento: document
        .getElementById('descripcionDocumento')
        .value.trim(),
      tipoFormatoEsperado: document
        .getElementById('tipoFormatoEsperado')
        .value.trim(),
      obligatoriedad: document.querySelector(
        'input[name="obligatoriedad"]:checked'
      )?.value,
      requiereAprobacion: document.querySelector(
        'input[name="requiereAprobacion"]:checked'
      )?.value,
      vigenciaEnDias: document.getElementById('vigenciaEnDias').value,
      permitePlazosAmpliados: document.querySelector(
        'input[name="permitePlazosAmpliados"]:checked'
      )?.value,
    };

    // Validar campos requeridos
    const requiredFields = [
      'nombreDocumento',
      'tipoDocumental',
      'descripcionDocumento',
      'tipoFormatoEsperado',
      'obligatoriedad',
      'requiereAprobacion',
      'vigenciaEnDias',
      'permitePlazosAmpliados',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        this.showAlert(
          `Por favor complete el campo: ${this.getFieldLabel(field)}`,
          'warning'
        );
        return;
      }
    }

    // Validar que vigenciaEnDias sea un número positivo
    if (
      isNaN(formData.vigenciaEnDias) ||
      parseInt(formData.vigenciaEnDias) < 0
    ) {
      this.showAlert(
        'La vigencia en días debe ser un número positivo',
        'warning'
      );
      return;
    }

    // Emitir evento para guardar el documento
    console.log('📡 Emitiendo evento documento:createFromForm');
    if (window.tramiteApp && window.tramiteApp.eventManager) {
      console.log('✅ EventManager encontrado, emitiendo evento');
      window.tramiteApp.eventManager.emit('documento:createFromForm', {
        formData,
        callback: result => {
          console.log('📨 Callback recibido:', result);
          if (result.success) {
            console.log('✅ Documento guardado exitosamente');
            this.showAlert(result.message, 'success');
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(
              document.getElementById('modalCrearDocumento')
            );
            if (modal) {
              modal.hide();
            }
          } else {
            console.log('❌ Error al guardar documento:', result.errors);
            this.showAlert(result.errors.join(', '), 'danger');
          }
        },
      });
    } else {
      console.error('❌ EventManager no encontrado');
      this.showAlert('Error: No se puede conectar con el sistema', 'danger');
    }
  }

  /**
   * Obtiene la etiqueta legible de un campo
   * @param {string} field - Nombre del campo
   * @returns {string} Etiqueta del campo
   */
  getFieldLabel(field) {
    const labels = {
      nombreDocumento: 'Nombre del Documento',
      tipoDocumental: 'Tipo Documental',
      descripcionDocumento: 'Descripción del Documento',
      tipoFormatoEsperado: 'Tipo de Formato Esperado',
      obligatoriedad: 'Obligatoriedad',
      requiereAprobacion: '¿Requiere aprobación?',
      vigenciaEnDias: 'Vigencia en días',
      permitePlazosAmpliados: '¿Permite plazos ampliados?',
    };
    return labels[field] || field;
  }

  /**
   * Muestra un mensaje de alerta
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, warning, info)
   */
  showAlert(message, type = 'info') {
    console.log(`📢 Mostrando alerta: ${message} (tipo: ${type})`);
    // Usar el método de alerta de TramiteView si está disponible
    if (
      window.tramiteApp &&
      window.tramiteApp.tramiteView &&
      window.tramiteApp.tramiteView.showAlert
    ) {
      console.log('✅ Usando TramiteView.showAlert');
      window.tramiteApp.tramiteView.showAlert(message, type);
    } else {
      console.log('⚠️ Usando alert() como fallback');
      // Fallback: mostrar alerta simple
      alert(message);
    }
  }
}
