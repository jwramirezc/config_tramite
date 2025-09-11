/**
 * Controlador para manejo de trámites
 * Clase que coordina la lógica de negocio entre modelo, vista y servicio
 */
class TramiteController extends BaseController {
  constructor(tramiteService, tramiteView, eventManager = null) {
    super(eventManager);
    this.tramiteService = tramiteService;
    this.tramiteView = tramiteView;
    this.isEditing = false;
    this.currentTramiteId = null;
  }

  /**
   * Configura las dependencias del controlador
   */
  async setupDependencies() {
    // Las dependencias ya están inyectadas en el constructor
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón crear trámite
    const btnCrearTramite = document.getElementById('btnCrearTramite');
    if (btnCrearTramite) {
      btnCrearTramite.addEventListener('click', () => {
        this.showCreateModal();
      });
    } else {
      console.error('❌ Botón crear trámite no encontrado en el DOM');
    }

    // Botón crear documento
    const btnCrearDocumento = document.getElementById('btnCrearDocumento');
    if (btnCrearDocumento) {
      btnCrearDocumento.addEventListener('click', () => {
        this.showCrearDocumentoModal();
      });
    } else {
      console.error('❌ Botón crear documento no encontrado en el DOM');
    }

    // Selector de reportes
    const reportSelector = document.getElementById('reportSelector');
    if (reportSelector) {
      reportSelector.addEventListener('change', e =>
        this.handleReportSelection(e.target.value)
      );
    } else {
      console.error('❌ Selector de reportes no encontrado en el DOM');
    }

    // Botón guardar trámite
    const btnGuardarTramite = document.getElementById('btnGuardarTramite');
    if (btnGuardarTramite) {
      btnGuardarTramite.addEventListener('click', () => this.saveTramite());
    }

    // Botones del modal de opciones
    const btnGestionarFechas = document.getElementById('btnGestionarFechas');
    if (btnGestionarFechas) {
      btnGestionarFechas.addEventListener('click', () =>
        this.gestionarFechas()
      );
    }

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

    // Event listener para mostrar opciones de trámite
    this.eventManager.on('tramite:showOpciones', data => {
      this.showOpciones(data.tramiteId);
    });

    // Event listener para obtener trámite por ID
    this.eventManager.on('tramite:getById', data => {
      const tramite = this.tramiteService.getById(data.tramiteId);
      if (data.callback && typeof data.callback === 'function') {
        data.callback(tramite);
      }
    });

    // Event listener para guardar fechas
    this.eventManager.on('tramite:guardarFechas', async data => {
      await this.guardarFechas(data.formData);
    });
  }

  /**
   * Inicializa el controlador después de configurar dependencias y eventos
   */
  async initialize() {
    await super.initialize();
    // No cargar trámites automáticamente - se cargarán cuando el usuario seleccione el reporte
  }

  /**
   * Maneja la selección del tipo de reporte
   * @param {string} reportType - Tipo de reporte seleccionado
   */
  async handleReportSelection(reportType) {
    try {
      switch (reportType) {
        case 'tramites':
          await this.loadTramites();
          break;
        case 'documentos':
          this.tramiteView.renderDocumentosReport();
          break;
        case 'tramites_habilitados':
          this.tramiteView.renderTramitesHabilitadosReport();
          break;
        case '':
        default:
          this.tramiteView.showInitialState();
          break;
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      this.showError('Error al cargar el reporte seleccionado');
    }
  }

  /**
   * Carga y muestra los trámites
   */
  async loadTramites() {
    try {
      const tramites = await this.tramiteService.getAll();
      this.tramiteView.renderTable(tramites);
    } catch (error) {
      console.error('Error al cargar trámites:', error);
      this.showError('Error al cargar los trámites');
    }
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
   * Muestra el modal de crear trámite
   */
  showCreateModal() {
    this.isEditing = false;
    this.currentTramiteId = null;
    this.tramiteView.showCreateModal();
  }

  /**
   * Muestra el modal de crear documento
   */
  showCrearDocumentoModal() {
    if (window.tramiteApp && window.tramiteApp.documentoView) {
      window.tramiteApp.documentoView.showCrearDocumentoModal();
    } else {
      console.error('❌ DocumentoView no está disponible');
    }
  }

  /**
   * Guarda un trámite (crear o actualizar)
   */
  async saveTramite() {
    try {
      const formData = this.tramiteView.getFormData();

      // Validar que el formulario esté completo
      if (!this.validateFormData(formData)) {
        return;
      }

      let result;
      if (this.isEditing && this.currentTramiteId) {
        // Actualizar trámite existente
        result = await this.tramiteService.update(
          this.currentTramiteId,
          formData
        );
      } else {
        // Crear nuevo trámite
        const tramite = Tramite.fromFormData(formData);
        result = await this.tramiteService.create(tramite);
      }

      if (result.success) {
        this.tramiteView.showAlert(result.message, 'success');
        this.tramiteView.hideCreateModal();
        await this.loadTramites();
        this.resetForm();
      } else {
        this.tramiteView.showAlert(result.errors.join(', '), 'danger');
      }
    } catch (error) {
      console.error('❌ Error al guardar trámite:', error);
      this.tramiteView.showAlert(
        'Error interno al guardar el trámite',
        'danger'
      );
    }
  }

  /**
   * Valida los datos del formulario
   * @param {Object} formData - Datos del formulario
   * @returns {boolean} True si es válido
   */
  validateFormData(formData) {
    const requiredFields = [
      'codigoTramite',
      'nombreTramite',
      'descripcionTramite',
    ];

    const missingFields = requiredFields.filter(
      field => !formData[field] || formData[field].trim() === ''
    );

    if (missingFields.length > 0) {
      this.tramiteView.showAlert(
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
    this.tramiteView.clearForm();
  }

  /**
   * Muestra el modal de opciones para un trámite
   * @param {string} tramiteId - ID del trámite
   */
  showOpciones(tramiteId) {
    this.currentTramiteId = tramiteId;
    this.tramiteView.showOpcionesModal(tramiteId);
  }

  /**
   * Gestiona las fechas de un trámite
   */
  gestionarFechas() {
    try {
      if (!this.currentTramiteId) {
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.tramiteView.hideOpcionesModal();
      this.tramiteView.showGestionarFechasModal(tramite);
    } catch (error) {
      console.error('Error al abrir modal de fechas:', error);
      this.tramiteView.showAlert('Error al abrir el modal de fechas', 'danger');
    }
  }

  /**
   * Guarda las fechas de un trámite
   * @param {Object} fechas - Objeto con las fechas
   */
  async guardarFechas(fechas) {
    try {
      if (!this.currentTramiteId) {
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      // Validar fechas
      if (!this.validarFechas(fechas)) {
        return;
      }

      // Agregar fechas al historial
      const usuario = 'Usuario'; // En un sistema real, esto vendría del contexto de autenticación
      tramite.agregarFechas(fechas, usuario);


      // Actualizar en el servicio - pasar solo los campos necesarios
      const updateData = {
        fechaInicio: tramite.fechaInicio,
        fechaFinalizacion: tramite.fechaFinalizacion,
        fechaInicioSubsanacion: tramite.fechaInicioSubsanacion,
        fechaFinSubsanacion: tramite.fechaFinSubsanacion,
        fechaModificacion: tramite.fechaModificacion,
        historialFechas: tramite.historialFechas,
      };

      const result = await this.tramiteService.update(
        this.currentTramiteId,
        updateData
      );

      if (result.success) {
        this.tramiteView.showAlert('Fechas guardadas exitosamente', 'success');
        this.tramiteView.refreshHistorialFechas(tramite);
        await this.loadTramites(); // Actualizar la tabla principal
      } else {
        this.tramiteView.showAlert(result.errors.join(', '), 'danger');
      }
    } catch (error) {
      console.error('Error al guardar fechas:', error);
      this.tramiteView.showAlert('Error al guardar las fechas', 'danger');
    }
  }

  /**
   * Valida las fechas ingresadas
   * @param {Object} fechas - Objeto con las fechas
   * @returns {boolean} True si las fechas son válidas
   */
  validarFechas(fechas) {
    const {
      fechaInicio,
      fechaFinalizacion,
      fechaInicioSubsanacion,
      fechaFinSubsanacion,
    } = fechas;

    // Validar que todas las fechas estén presentes
    if (
      !fechaInicio ||
      !fechaFinalizacion ||
      !fechaInicioSubsanacion ||
      !fechaFinSubsanacion
    ) {
      this.tramiteView.showAlert('Todas las fechas son requeridas', 'warning');
      return false;
    }

    // Validar que la fecha de finalización sea posterior a la de inicio
    if (new Date(fechaInicio) >= new Date(fechaFinalizacion)) {
      this.tramiteView.showAlert(
        'La fecha de finalización debe ser posterior a la fecha de inicio',
        'warning'
      );
      return false;
    }

    // Validar que la fecha fin de subsanación sea posterior a la fecha inicio de subsanación
    if (new Date(fechaInicioSubsanacion) >= new Date(fechaFinSubsanacion)) {
      this.tramiteView.showAlert(
        'La fecha fin de subsanación debe ser posterior a la fecha inicio de subsanación',
        'warning'
      );
      return false;
    }

    // Validar que la fecha de inicio de subsanación sea posterior a la fecha de finalización del trámite
    if (new Date(fechaInicioSubsanacion) <= new Date(fechaFinalizacion)) {
      this.tramiteView.showAlert(
        'La fecha de inicio de subsanación debe ser posterior a la fecha de finalización del trámite',
        'warning'
      );
      return false;
    }

    return true;
  }

  /**
   * Elimina un trámite
   */
  deleteTramite() {
    try {
      if (!this.currentTramiteId) {
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.tramiteView.hideOpcionesModal();

      this.tramiteView.showConfirmModal(
        'Eliminar Trámite',
        `¿Está seguro de que desea eliminar el trámite "${tramite.nombre}"? Esta acción no se puede deshacer.`,
        () => {
          const result = this.tramiteService.delete(this.currentTramiteId);
          if (result.success) {
            this.tramiteView.showAlert(result.message, 'success');
            this.loadTramites();
          } else {
            this.tramiteView.showAlert(result.errors.join(', '), 'danger');
          }
        },
        'Eliminar',
        'Cancelar'
      );
    } catch (error) {
      console.error('Error al eliminar trámite:', error);
      this.tramiteView.showAlert('Error al eliminar el trámite', 'danger');
    }
  }

  /**
   * Añade documentos a un trámite
   */
  anadirDocumentos() {
    try {
      if (!this.currentTramiteId) {
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.tramiteView.hideOpcionesModal();
      this.tramiteView.showDocumentosModal(tramite);
    } catch (error) {
      console.error('Error al abrir modal de documentos:', error);
      this.tramiteView.showAlert(
        'Error al abrir el modal de documentos',
        'danger'
      );
    }
  }

  /**
   * Ver documentos vinculados a un trámite
   */
  verDocumentos() {
    try {
      if (!this.currentTramiteId) {
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      this.tramiteView.hideOpcionesModal();
      this.tramiteView.showVerDocumentosModal(tramite);
    } catch (error) {
      console.error('Error al abrir modal de ver documentos:', error);
      this.tramiteView.showAlert(
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
        this.tramiteView.showAlert(
          'No se ha seleccionado ningún trámite',
          'warning'
        );
        return;
      }

      const tramite = this.tramiteService.getById(this.currentTramiteId);
      if (!tramite) {
        this.tramiteView.showAlert('Trámite no encontrado', 'danger');
        return;
      }

      const estadoActual = tramite.getEstadoPorFechas();

      // Solo permitir activar/inactivar manualmente si el estado automático es 'activo' o 'inactivo'
      if (estadoActual !== 'activo' && estadoActual !== 'inactivo') {
        this.tramiteView.showAlert(
          `No se puede cambiar manualmente el estado. El trámite está actualmente en estado: ${estadoActual}`,
          'warning'
        );
        return;
      }

      const nuevoEstado = estadoActual === 'inactivo' ? 'activo' : 'inactivo';
      const accion = nuevoEstado === 'activo' ? 'activar' : 'inactivar';

      this.tramiteView.hideOpcionesModal();

      this.tramiteView.showConfirmModal(
        `${accion.charAt(0).toUpperCase() + accion.slice(1)} Trámite`,
        `¿Está seguro de que desea ${accion} manualmente el trámite "${tramite.nombre}"?`,
        async () => {
          try {
            // Obtener el trámite actualizado
            const tramite = this.tramiteService.getById(this.currentTramiteId);
            if (tramite) {
              // Cambiar el estado usando el método del modelo
              tramite.setEstado(
                nuevoEstado,
                'Usuario',
                `${accion} manual del trámite`
              );
            }

            const result = await this.tramiteService.update(
              this.currentTramiteId,
              {
                estado: nuevoEstado,
              }
            );
            if (result.success) {
              // Construir el mensaje correctamente
              const mensaje =
                nuevoEstado === 'activo'
                  ? 'Trámite activado manualmente exitosamente'
                  : 'Trámite inactivado manualmente exitosamente';

              this.tramiteView.showAlert(mensaje, 'success');
              await this.loadTramites();
              // Actualizar la vista del modal de opciones
              this.tramiteView.refreshOpcionesModal(this.currentTramiteId);
            } else {
              this.tramiteView.showAlert(result.errors.join(', '), 'danger');
            }
          } catch (error) {
            console.error('Error al cambiar estado del trámite:', error);
            this.tramiteView.showAlert(
              'Error interno al cambiar el estado del trámite',
              'danger'
            );
          }
        },
        accion.charAt(0).toUpperCase() + accion.slice(1),
        'Cancelar'
      );
    } catch (error) {
      console.error('Error al cambiar estado del trámite:', error);
      this.tramiteView.showAlert(
        'Error al cambiar el estado del trámite',
        'danger'
      );
    }
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de trámites a generar
   */
  generateSampleData(count = 5) {
    try {
      const result = this.tramiteService.generateSampleData(count);
      if (result.success) {
        this.tramiteView.showAlert(result.message, 'success');
        this.loadTramites();
      } else {
        this.tramiteView.showAlert(result.errors.join(', '), 'danger');
      }
    } catch (error) {
      console.error('Error al generar datos de ejemplo:', error);
      this.tramiteView.showAlert('Error al generar datos de ejemplo', 'danger');
    }
  }

  /**
   * Exporta los trámites a JSON
   */
  exportTramites() {
    try {
      const jsonData = this.tramiteService.exportToJSON();
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

        this.tramiteView.showAlert(
          'Trámites exportados exitosamente',
          'success'
        );
      } else {
        this.tramiteView.showAlert('Error al exportar los trámites', 'danger');
      }
    } catch (error) {
      console.error('Error al exportar trámites:', error);
      this.tramiteView.showAlert('Error al exportar los trámites', 'danger');
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
        const result = this.tramiteService.importFromJSON(jsonData);

        if (result.success) {
          this.tramiteView.showAlert(result.message, 'success');
          this.loadTramites();
        } else {
          this.tramiteView.showAlert(result.errors.join(', '), 'danger');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error al importar trámites:', error);
      this.tramiteView.showAlert('Error al importar los trámites', 'danger');
    }
  }

  /**
   * Limpia todos los datos
   */
  clearAllData() {
    this.tramiteView.showConfirmModal(
      'Limpiar Todos los Datos',
      '¿Está seguro de que desea eliminar todos los trámites? Esta acción no se puede deshacer.',
      () => {
        const result = this.tramiteService.clearAll();
        if (result.success) {
          this.tramiteView.showAlert(result.message, 'success');
          this.loadTramites();
        } else {
          this.tramiteView.showAlert(result.errors.join(', '), 'danger');
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
    return this.tramiteService.getStats();
  }

  /**
   * Refresca la vista
   */
  refresh() {
    this.loadTramites();
  }
}
