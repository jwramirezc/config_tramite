/**
 * Controlador para manejo de trámites
 * Clase que coordina la lógica de negocio entre modelo, vista y servicio
 */
class TramiteController {
  constructor() {
    this.service = new TramiteService();
    this.view = new TramiteView();
    this.isEditing = false;
    this.currentTramiteId = null;
    this.initializeEventListeners();
    this.loadTramites();
  }

  /**
   * Inicializa los event listeners
   */
  initializeEventListeners() {
    // Botón crear trámite
    const btnCrearTramite = document.getElementById('btnCrearTramite');
    if (btnCrearTramite) {
      btnCrearTramite.addEventListener('click', () => this.showCreateModal());
    }

    // Botón guardar trámite
    const btnGuardarTramite = document.getElementById('btnGuardarTramite');
    if (btnGuardarTramite) {
      btnGuardarTramite.addEventListener('click', () => this.saveTramite());
    }

    // Botones del modal de opciones

    const btnAnadirDocumentos = document.getElementById('btnAnadirDocumentos');
    if (btnAnadirDocumentos) {
      btnAnadirDocumentos.addEventListener('click', () =>
        this.anadirDocumentos()
      );
    }

    const btnVerDocumentos = document.getElementById('btnVerDocumentos');
    if (btnVerDocumentos) {
      btnVerDocumentos.addEventListener('click', () => this.verDocumentos());
    }

    const btnActivarInactivarTramite = document.getElementById(
      'btnActivarInactivarTramite'
    );
    if (btnActivarInactivarTramite) {
      btnActivarInactivarTramite.addEventListener('click', () =>
        this.activarInactivarTramite()
      );
    }

    const btnEliminarTramite = document.getElementById('btnEliminarTramite');
    if (btnEliminarTramite) {
      btnEliminarTramite.addEventListener('click', () => this.deleteTramite());
    }

    // Event listeners para el formulario
    const form = document.getElementById('formCrearTramite');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        this.saveTramite();
      });
    }

    // Validación de fechas en tiempo real
    this.initializeDateValidation();
  }

  /**
   * Inicializa la validación de fechas
   */
  initializeDateValidation() {
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFinalizacion = document.getElementById('fechaFinalizacion');
    const fechaInicioSubsanacion = document.getElementById(
      'fechaInicioSubsanacion'
    );
    const fechaFinSubsanacion = document.getElementById('fechaFinSubsanacion');

    if (fechaInicio && fechaFinalizacion) {
      fechaInicio.addEventListener('change', () => this.validateDates());
      fechaFinalizacion.addEventListener('change', () => this.validateDates());
    }

    if (fechaInicioSubsanacion && fechaFinSubsanacion) {
      fechaInicioSubsanacion.addEventListener('change', () =>
        this.validateSubsanacionDates()
      );
      fechaFinSubsanacion.addEventListener('change', () =>
        this.validateSubsanacionDates()
      );
    }
  }

  /**
   * Valida las fechas principales
   */
  validateDates() {
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFinalizacion = document.getElementById('fechaFinalizacion');

    if (fechaInicio.value && fechaFinalizacion.value) {
      if (new Date(fechaInicio.value) >= new Date(fechaFinalizacion.value)) {
        fechaFinalizacion.setCustomValidity(
          'La fecha de finalización debe ser posterior a la fecha de inicio'
        );
      } else {
        fechaFinalizacion.setCustomValidity('');
      }
    }
  }

  /**
   * Valida las fechas de subsanación
   */
  validateSubsanacionDates() {
    const fechaInicioSubsanacion = document.getElementById(
      'fechaInicioSubsanacion'
    );
    const fechaFinSubsanacion = document.getElementById('fechaFinSubsanacion');

    if (fechaInicioSubsanacion.value && fechaFinSubsanacion.value) {
      if (
        new Date(fechaInicioSubsanacion.value) >=
        new Date(fechaFinSubsanacion.value)
      ) {
        fechaFinSubsanacion.setCustomValidity(
          'La fecha fin de subsanación debe ser posterior a la fecha inicio de subsanación'
        );
      } else {
        fechaFinSubsanacion.setCustomValidity('');
      }
    }
  }

  /**
   * Carga y muestra los trámites
   */
  loadTramites() {
    try {
      const tramites = this.service.getAll();
      this.view.renderTable(tramites);
    } catch (error) {
      console.error('Error al cargar trámites:', error);
      this.view.showAlert('Error al cargar los trámites', 'danger');
    }
  }

  /**
   * Muestra el modal de crear trámite
   */
  showCreateModal() {
    this.isEditing = false;
    this.currentTramiteId = null;
    this.view.showCreateModal();
  }

  /**
   * Guarda un trámite (crear o actualizar)
   */
  saveTramite() {
    try {
      const formData = this.view.getFormData();

      // Validar que el formulario esté completo
      if (!this.validateFormData(formData)) {
        return;
      }

      let result;
      if (this.isEditing && this.currentTramiteId) {
        // Actualizar trámite existente
        result = this.service.update(this.currentTramiteId, formData);
      } else {
        // Crear nuevo trámite
        const tramite = Tramite.fromFormData(formData);
        result = this.service.create(tramite);
      }

      if (result.success) {
        this.view.showAlert(result.message, 'success');
        this.view.hideCreateModal();
        this.loadTramites();
        this.resetForm();
      } else {
        this.view.showAlert(result.errors.join(', '), 'danger');
      }
    } catch (error) {
      console.error('Error al guardar trámite:', error);
      this.view.showAlert('Error interno al guardar el trámite', 'danger');
    }
  }

  /**
   * Valida los datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {boolean} True si es válido
   */
  validateFormData(formData) {
    const requiredFields = [
      'nombreTramite',
      'periodoAnio',
      'periodoSemestre',
      'sede',
      'jornada',
      'fechaInicio',
      'fechaFinalizacion',
      'fechaInicioSubsanacion',
      'fechaFinSubsanacion',
    ];

    const missingFields = requiredFields.filter(
      field => !formData[field] || formData[field].trim() === ''
    );

    if (missingFields.length > 0) {
      this.view.showAlert(
        'Por favor complete todos los campos requeridos',
        'warning'
      );
      return false;
    }

    return true;
  }

  /**
   * Resetea el formulario
   */
  resetForm() {
    this.isEditing = false;
    this.currentTramiteId = null;
    this.view.clearForm();
  }

  /**
   * Muestra el modal de opciones para un trámite
   * @param {string} tramiteId - ID del trámite
   */
  showOpciones(tramiteId) {
    this.currentTramiteId = tramiteId;
    this.view.showOpcionesModal(tramiteId);
  }

  /**
   * Elimina un trámite
   */
  deleteTramite() {
    try {
      if (!this.currentTramiteId) {
        this.view.showAlert('No se ha seleccionado ningún trámite', 'warning');
        return;
      }

      const tramite = this.service.getById(this.currentTramiteId);
      if (!tramite) {
        this.view.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.view.hideOpcionesModal();

      this.view.showConfirmModal(
        'Eliminar Trámite',
        `¿Está seguro de que desea eliminar el trámite "${tramite.nombre}"? Esta acción no se puede deshacer.`,
        () => {
          const result = this.service.delete(this.currentTramiteId);
          if (result.success) {
            this.view.showAlert(result.message, 'success');
            this.loadTramites();
          } else {
            this.view.showAlert(result.errors.join(', '), 'danger');
          }
        },
        'Eliminar',
        'Cancelar'
      );
    } catch (error) {
      console.error('Error al eliminar trámite:', error);
      this.view.showAlert('Error al eliminar el trámite', 'danger');
    }
  }

  /**
   * Añade documentos a un trámite
   */
  anadirDocumentos() {
    try {
      if (!this.currentTramiteId) {
        this.view.showAlert('No se ha seleccionado ningún trámite', 'warning');
        return;
      }

      const tramite = this.service.getById(this.currentTramiteId);
      if (!tramite) {
        this.view.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.view.hideOpcionesModal();
      this.view.showDocumentosModal(tramite);
    } catch (error) {
      console.error('Error al abrir modal de documentos:', error);
      this.view.showAlert('Error al abrir el modal de documentos', 'danger');
    }
  }

  /**
   * Ver documentos de un trámite
   */
  verDocumentos() {
    try {
      if (!this.currentTramiteId) {
        this.view.showAlert('No se ha seleccionado ningún trámite', 'warning');
        return;
      }

      const tramite = this.service.getById(this.currentTramiteId);
      if (!tramite) {
        this.view.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.view.hideOpcionesModal();
      this.view.showVerDocumentosModal(tramite);
    } catch (error) {
      console.error('Error al abrir modal de ver documentos:', error);
      this.view.showAlert(
        'Error al abrir el modal de ver documentos',
        'danger'
      );
    }
  }

  /**
   * Activa o inactiva un trámite manualmente
   */
  activarInactivarTramite() {
    try {
      if (!this.currentTramiteId) {
        this.view.showAlert('No se ha seleccionado ningún trámite', 'warning');
        return;
      }

      const tramite = this.service.getById(this.currentTramiteId);
      if (!tramite) {
        this.view.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      const estadoActual = tramite.getEstadoPorFechas();

      // Solo permitir activar/inactivar manualmente si el estado automático es 'activo' o 'inactivo'
      if (estadoActual !== 'activo' && estadoActual !== 'inactivo') {
        this.view.showAlert(
          `No se puede cambiar manualmente el estado. El trámite está actualmente en estado: ${estadoActual}`,
          'warning'
        );
        return;
      }

      const nuevoEstado = estadoActual === 'inactivo' ? 'activo' : 'inactivo';
      const accion = nuevoEstado === 'activo' ? 'activar' : 'inactivar';

      this.view.hideOpcionesModal();

      this.view.showConfirmModal(
        `${accion.charAt(0).toUpperCase() + accion.slice(1)} Trámite`,
        `¿Está seguro de que desea ${accion} manualmente el trámite "${tramite.nombre}"?`,
        () => {
          const result = this.service.update(this.currentTramiteId, {
            estado: nuevoEstado,
          });
          if (result.success) {
            this.view.showAlert(
              `Trámite ${accion}do manualmente exitosamente`,
              'success'
            );
            this.loadTramites();
          } else {
            this.view.showAlert(result.errors.join(', '), 'danger');
          }
        },
        accion.charAt(0).toUpperCase() + accion.slice(1),
        'Cancelar'
      );
    } catch (error) {
      console.error('Error al cambiar estado del trámite:', error);
      this.view.showAlert('Error al cambiar el estado del trámite', 'danger');
    }
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de trámites a generar
   */
  generateSampleData(count = 5) {
    try {
      const result = this.service.generateSampleData(count);
      if (result.success) {
        this.view.showAlert(result.message, 'success');
        this.loadTramites();
      } else {
        this.view.showAlert(result.errors.join(', '), 'danger');
      }
    } catch (error) {
      console.error('Error al generar datos de ejemplo:', error);
      this.view.showAlert('Error al generar datos de ejemplo', 'danger');
    }
  }

  /**
   * Exporta los trámites a JSON
   */
  exportTramites() {
    try {
      const jsonData = this.service.exportToJSON();
      if (jsonData) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tramites_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.view.showAlert('Trámites exportados exitosamente', 'success');
      } else {
        this.view.showAlert('Error al exportar los trámites', 'danger');
      }
    } catch (error) {
      console.error('Error al exportar trámites:', error);
      this.view.showAlert('Error al exportar los trámites', 'danger');
    }
  }

  /**
   * Importa trámites desde JSON
   * @param {File} file - Archivo JSON a importar
   */
  importTramites(file) {
    try {
      const reader = new FileReader();
      reader.onload = e => {
        const jsonData = e.target.result;
        const result = this.service.importFromJSON(jsonData);

        if (result.success) {
          this.view.showAlert(result.message, 'success');
          this.loadTramites();
        } else {
          this.view.showAlert(result.errors.join(', '), 'danger');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error al importar trámites:', error);
      this.view.showAlert('Error al importar los trámites', 'danger');
    }
  }

  /**
   * Limpia todos los datos
   */
  clearAllData() {
    this.view.showConfirmModal(
      'Limpiar Todos los Datos',
      '¿Está seguro de que desea eliminar todos los trámites? Esta acción no se puede deshacer.',
      () => {
        const result = this.service.clearAll();
        if (result.success) {
          this.view.showAlert(result.message, 'success');
          this.loadTramites();
        } else {
          this.view.showAlert(result.errors.join(', '), 'danger');
        }
      },
      'Limpiar Todo',
      'Cancelar'
    );
  }

  /**
   * Obtiene estadísticas de los trámites
   * @returns {Object} Estadísticas
   */
  getStats() {
    return this.service.getStats();
  }

  /**
   * Refresca la vista
   */
  refresh() {
    this.loadTramites();
  }
}
