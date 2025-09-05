/**
 * Vista para gestión de fechas de trámites
 * Clase que maneja la presentación y renderizado de fechas
 */
class FechaView extends BaseView {
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
      document.getElementById('fechasContainer') ||
      document.createElement('div');

    if (!document.getElementById('fechasContainer')) {
      this.container.id = 'fechasContainer';
      this.container.className = 'fechas-container';
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
   * Muestra la lista de fechas para un trámite
   * @param {string} tramiteId - ID del trámite
   */
  showList(tramiteId) {
    this.currentTramiteId = tramiteId;
    this.renderFechasList([]);
  }

  /**
   * Renderiza la lista de fechas
   * @param {Array} fechas - Array de fechas
   */
  renderFechasList(fechas = []) {
    if (!this.container) return;

    const html = `
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-calendar-alt me-2"></i>
            Fechas del Trámite
          </h5>
        </div>
        <div class="card-body">
          ${
            fechas.length === 0
              ? '<p class="text-muted">No hay fechas para mostrar</p>'
              : this.renderFechasTable(fechas)
          }
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Renderiza la tabla de fechas
   * @param {Array} fechas - Array de fechas
   * @returns {string} HTML de la tabla
   */
  renderFechasTable(fechas) {
    return `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Inicio Subsanación</th>
              <th>Fin Subsanación</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${fechas.map(fecha => this.renderFechaRow(fecha)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Renderiza una fila de fecha
   * @param {Object} fecha - Fecha a renderizar
   * @returns {string} HTML de la fila
   */
  renderFechaRow(fecha) {
    return `
      <tr>
        <td>${this.formatDate(fecha.fechaInicio)}</td>
        <td>${this.formatDate(fecha.fechaFinalizacion)}</td>
        <td>${this.formatDate(fecha.fechaInicioSubsanacion)}</td>
        <td>${this.formatDate(fecha.fechaFinSubsanacion)}</td>
        <td>${this.escapeHtml(fecha.usuario)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="this.editFecha('${
            fecha.id
          }')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="this.deleteFecha('${
            fecha.id
          }')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
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
   * Refresca la lista de fechas
   */
  refreshList() {
    if (this.currentTramiteId) {
      this.showList(this.currentTramiteId);
    }
  }
}
