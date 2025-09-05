/**
 * Vista para gestión de estados de trámites
 * Clase que maneja la presentación y renderizado de estados
 */
class EstadoView extends BaseView {
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
      document.getElementById('estadosContainer') ||
      document.createElement('div');

    if (!document.getElementById('estadosContainer')) {
      this.container.id = 'estadosContainer';
      this.container.className = 'estados-container';
      document.body.appendChild(this.container);
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
   * Muestra la lista de estados para un trámite
   * @param {string} tramiteId - ID del trámite
   */
  showList(tramiteId) {
    this.currentTramiteId = tramiteId;
    this.renderEstadosList([]);
  }

  /**
   * Renderiza la lista de estados
   * @param {Array} estados - Array de estados
   */
  renderEstadosList(estados = []) {
    if (!this.container) return;

    const html = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-info-circle me-2"></i>
            Estados del Trámite
          </h5>
        </div>
        <div class="card-body">
          ${
            estados.length === 0
              ? '<p class="text-muted">No hay estados para mostrar</p>'
              : this.renderEstadosTable(estados)
          }
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Renderiza la tabla de estados
   * @param {Array} estados - Array de estados
   * @returns {string} HTML de la tabla
   */
  renderEstadosTable(estados) {
    return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Motivo</th>
              <th>Observaciones</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${estados.map(estado => this.renderEstadoRow(estado)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Renderiza una fila de estado
   * @param {Object} estado - Estado a renderizar
   * @returns {string} HTML de la fila
   */
  renderEstadoRow(estado) {
    return `
      <tr>
        <td>
          <span class="badge bg-${this.getEstadoBadgeClass(estado.estado)}">
            ${this.escapeHtml(estado.estado)}
          </span>
        </td>
        <td>${this.escapeHtml(estado.motivo)}</td>
        <td>${this.escapeHtml(estado.observaciones)}</td>
        <td>${this.escapeHtml(estado.usuario)}</td>
        <td>${this.formatDate(estado.fechaCambio)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="this.editEstado('${
            estado.id
          }')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="this.deleteEstado('${
            estado.id
          }')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Obtiene la clase CSS para el badge del estado
   * @param {string} estado - Estado del trámite
   * @returns {string} Clase CSS
   */
  getEstadoBadgeClass(estado) {
    const estados = {
      activo: 'success',
      inactivo: 'secondary',
      pendiente: 'warning',
      subsanación: 'info',
      finalizado: 'dark',
      sin_fechas: 'light',
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
   * Refresca la lista de estados
   */
  refreshList() {
    if (this.currentTramiteId) {
      this.showList(this.currentTramiteId);
    }
  }
}
