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
}
