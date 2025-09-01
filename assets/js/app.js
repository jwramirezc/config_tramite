/**
 * Aplicación principal del Sistema de Gestión Documental
 * Archivo que inicializa la aplicación y maneja eventos globales
 */

// Variable global para el controlador principal
let tramiteController;

/**
 * Inicializa la aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Inicializando Sistema de Gestión Documental...');

  try {
    // Inicializar el controlador principal (sin la funcionalidad de crear trámite)
    tramiteController = new TramiteController();

    // Configurar eventos adicionales
    setupAdditionalEvents();

    console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    showErrorMessage('Error al inicializar la aplicación');
  }
});

/**
 * Configura eventos adicionales de la aplicación
 */
function setupAdditionalEvents() {
  // Evento para restaurar el título del modal después de cerrar
  const modalCrear = document.getElementById('modalCrearTramite');
  if (modalCrear) {
    modalCrear.addEventListener('hidden.bs.modal', function () {
      // Restaurar título y botón
      const modalTitle = document.getElementById('modalCrearTramiteLabel');
      const btnGuardar = document.getElementById('btnGuardarTramite');

      if (modalTitle) {
        modalTitle.innerHTML =
          '<i class="fas fa-plus-circle me-2"></i>Crear Nuevo Trámite';
      }

      if (btnGuardar) {
        btnGuardar.innerHTML =
          '<i class="fas fa-save me-1"></i>Guardar Trámite';
      }

      // Resetear estado del controlador
      if (tramiteController) {
        tramiteController.resetForm();
      }
    });
  }

  // Evento para teclas de acceso rápido
  document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + N para nuevo trámite
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      if (tramiteController) {
        tramiteController.showCreateModal();
      }
    }

    // Ctrl/Cmd + S para guardar (cuando el modal esté abierto)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      const modal = document.getElementById('modalCrearTramite');
      if (modal && modal.classList.contains('show')) {
        e.preventDefault();
        if (tramiteController) {
          tramiteController.saveTramite();
        }
      }
    }

    // Escape para cerrar modales
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal.show');
      modals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      });
    }
  });

  // Evento para mostrar información de la aplicación
  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('dblclick', function () {
      showAppInfo();
    });
  }

  // Evento para generar datos de ejemplo (doble clic en el título de la tabla)
  const tableHeader = document.querySelector('.card-header h5');
  if (tableHeader) {
    tableHeader.addEventListener('dblclick', function () {
      if (tramiteController) {
        tramiteController.generateSampleData(3);
      }
    });
  }
}

/**
 * Muestra información de la aplicación
 */
function showAppInfo() {
  const stats = tramiteController ? tramiteController.getStats() : { total: 0 };

  const infoHTML = `
        <div class="modal fade" id="appInfoModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-info-circle me-2"></i>
                            Información de la Aplicación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12">
                                <h6><i class="fas fa-cog me-2"></i>Características</h6>
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check text-success me-2"></i>Programación Orientada a Objetos</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Arquitectura MVC</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Persistencia en localStorage</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Validación de formularios</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Interfaz responsiva</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Iconos FontAwesome</li>
                                </ul>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6><i class="fas fa-chart-bar me-2"></i>Estadísticas</h6>
                                <div class="row text-center">
                                    <div class="col-6">
                                        <div class="card bg-light">
                                            <div class="card-body">
                                                <h4 class="text-primary">${stats.total}</h4>
                                                <small>Total Trámites</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="card bg-light">
                                            <div class="card-body">
                                                <h4 class="text-success">${stats.activos}</h4>
                                                <small>Activos</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6><i class="fas fa-keyboard me-2"></i>Atajos de Teclado</h6>
                                <div class="small">
                                    <div><kbd>Ctrl/Cmd + N</kbd> - Nuevo trámite</div>
                                    <div><kbd>Ctrl/Cmd + S</kbd> - Guardar (en modal)</div>
                                    <div><kbd>Escape</kbd> - Cerrar modales</div>
                                    <div><kbd>Doble clic en tabla</kbd> - Generar datos de ejemplo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Remover modal anterior si existe
  const existingModal = document.getElementById('appInfoModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Agregar nuevo modal
  document.body.insertAdjacentHTML('beforeend', infoHTML);

  // Mostrar modal
  const modal = document.getElementById('appInfoModal');
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Limpiar modal después de cerrar
  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

/**
 * Muestra mensaje de error
 * @param {string} message - Mensaje de error
 */
function showErrorMessage(message) {
  const errorHTML = `
        <div class="alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert" style="z-index: 9999;">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

  document.body.insertAdjacentHTML('beforeend', errorHTML);
}

/**
 * Función para limpiar localStorage (útil para desarrollo)
 */
function clearLocalStorage() {
  if (
    confirm(
      '¿Está seguro de que desea limpiar todos los datos? Esta acción no se puede deshacer.'
    )
  ) {
    localStorage.clear();
    location.reload();
  }
}

/**
 * Función para exportar datos (accesible desde consola)
 */
function exportData() {
  if (tramiteController) {
    tramiteController.exportTramites();
  }
}

/**
 * Función para importar datos (accesible desde consola)
 */
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (file && tramiteController) {
      tramiteController.importTramites(file);
    }
  };
  input.click();
}

/**
 * Función para generar datos de ejemplo (accesible desde consola)
 */
function generateSampleData(count = 5) {
  if (tramiteController) {
    tramiteController.generateSampleData(count);
  }
}

// Exponer funciones útiles para desarrollo
window.appUtils = {
  clearLocalStorage,
  exportData,
  importData,
  generateSampleData,
  showAppInfo,
};

// Mensaje de consola con información útil
console.log(`
🎯 Sistema de Gestión Documental - Trámites

📋 Funciones disponibles en consola:
• appUtils.clearLocalStorage() - Limpiar todos los datos
• appUtils.exportData() - Exportar datos a JSON
• appUtils.importData() - Importar datos desde JSON
• appUtils.generateSampleData(n) - Generar n trámites de ejemplo
• appUtils.showAppInfo() - Mostrar información de la app

⌨️  Atajos de teclado:
• Ctrl/Cmd + N - Nuevo trámite
• Ctrl/Cmd + S - Guardar (en modal)
• Escape - Cerrar modales
• Doble clic en tabla - Generar datos de ejemplo

🔧 Arquitectura: MVC con POO
📱 Responsive con Bootstrap 5
🎨 Iconos: FontAwesome 6
💾 Persistencia: localStorage
`);
