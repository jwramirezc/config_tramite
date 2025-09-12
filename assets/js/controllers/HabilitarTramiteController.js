/**
 * Controlador para Habilitar Trámites
 * Maneja la lógica de negocio para la gestión de trámites habilitados
 */
class HabilitarTramiteController {
  constructor() {
    this.habilitarTramiteService = null;
    this.habilitarTramiteView = null;
    this.eventManager = null;
  }

  /**
   * Inicializa el controlador
   * @param {HabilitarTramiteService} habilitarTramiteService - Servicio de trámites habilitados
   * @param {EventManager} eventManager - Gestor de eventos
   */
  initialize(habilitarTramiteService, eventManager) {
    this.habilitarTramiteService = habilitarTramiteService;
    this.eventManager = eventManager;
    this.setupEventListeners();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Event listener para el botón de habilitar trámites
    const btnHabilitarTramites = document.getElementById(
      'btnHabilitarTramites'
    );
    if (btnHabilitarTramites) {
      btnHabilitarTramites.addEventListener('click', () => {
        this.mostrarModal();
      });
    }

    // Event listener para guardar trámite habilitado
    if (this.eventManager) {
      this.eventManager.on('habilitarTramite:guardar', async data => {
        await this.guardarHabilitarTramite(data);
      });
    } else {
      console.error(
        '❌ EventManager no disponible para configurar event listeners'
      );
    }
  }

  /**
   * Muestra el modal de habilitar trámites
   */
  mostrarModal() {
    if (this.habilitarTramiteView) {
      this.habilitarTramiteView.showModal();
    } else {
      console.error('❌ HabilitarTramiteView no está disponible');
    }
  }

  /**
   * Guarda un trámite habilitado
   * @param {Object} formData - Datos del formulario
   */
  async guardarHabilitarTramite(formData) {
    try {
      if (!this.habilitarTramiteService) {
        console.error('❌ HabilitarTramiteService no está disponible');
        return;
      }

      // Verificar si estamos editando un trámite habilitado existente
      const isEditing = this.habilitarTramiteView.currentHabilitadoId;

      let result;
      if (isEditing) {
        // Actualizar el trámite habilitado existente
        result = await this.actualizarHabilitado(
          this.habilitarTramiteView.currentHabilitadoId,
          formData
        );
      } else {
        // Crear el trámite habilitado
        result = await this.habilitarTramiteService.create(formData);
      }

      if (!result) {
        console.error('❌ Result es undefined o null');
        this.habilitarTramiteView.showAlert(
          'Error: No se recibió respuesta del servicio',
          'danger'
        );
        return;
      }

      if (result.success && result.item) {
        // ID único generado y relación guardada
      }

      if (result.success) {
        const message = isEditing
          ? 'Trámite habilitado actualizado exitosamente'
          : 'Trámite habilitado guardado exitosamente';

        this.habilitarTramiteView.mostrarExito(message);

        // Limpiar el ID de edición
        this.habilitarTramiteView.currentHabilitadoId = null;

        // Cerrar el modal después del éxito
        this.habilitarTramiteView.hideModal();

        // Refrescar el reporte de trámites habilitados
        if (window.tramiteApp && window.tramiteApp.tramiteView) {
          window.tramiteApp.tramiteView.renderTramitesHabilitadosReport();
        }

        // Verificar que se guardó en localStorage
        setTimeout(() => {
          this.verificarRelaciones();
        }, 500);
      } else {
        this.habilitarTramiteView.mostrarErrores(result.errors);
        console.error('❌ Error al guardar trámite habilitado:', result.errors);
      }
    } catch (error) {
      console.error('❌ Error al guardar trámite habilitado:', error);
      this.habilitarTramiteView.showAlert(
        'Error al guardar el trámite habilitado',
        'danger'
      );
    }
  }

  /**
   * Obtiene trámites habilitados por periodo académico
   * @param {string} periodoAcademico - Periodo académico
   * @returns {Array} Array de trámites habilitados
   */
  getHabilitarTramitesByPeriodo(periodoAcademico) {
    if (!this.habilitarTramiteService) {
      console.error('❌ HabilitarTramiteService no está disponible');
      return [];
    }

    return this.habilitarTramiteService.getByCriterios({
      periodoAcademico: periodoAcademico,
    });
  }

  /**
   * Elimina un trámite habilitado
   * @param {string} id - ID del trámite habilitado
   */
  deleteHabilitarTramite(id) {
    if (!this.habilitarTramiteService) {
      console.error('❌ HabilitarTramiteService no está disponible');
      return;
    }

    const result = this.habilitarTramiteService.delete(id);
    if (result.success) {
      this.habilitarTramiteView.showAlert(
        'Trámite habilitado eliminado exitosamente',
        'success'
      );
    } else {
      this.habilitarTramiteView.showAlert(
        'Error al eliminar el trámite habilitado',
        'danger'
      );
    }
  }

  /**
   * Genera datos de ejemplo
   * @param {number} cantidad - Cantidad de registros a generar
   */
  generateSampleData(cantidad = 5) {
    if (!this.habilitarTramiteService) {
      console.error('❌ HabilitarTramiteService no está disponible');
      return;
    }

    const sampleData =
      this.habilitarTramiteService.generateSampleData(cantidad);
    sampleData.forEach(data => {
      this.habilitarTramiteService.create(data);
    });

    this.habilitarTramiteView.showAlert(
      `${cantidad} trámites habilitados de ejemplo generados`,
      'success'
    );
  }

  /**
   * Verifica las relaciones guardadas en localStorage
   * @returns {Object} Información de las relaciones
   */
  verificarRelaciones() {
    if (!this.habilitarTramiteService) {
      console.error('❌ HabilitarTramiteService no está disponible');
      return null;
    }

    // Verificar directamente en localStorage
    const localStorageData = localStorage.getItem('habilitar_tramites');

    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);
      } catch (error) {
        console.error('❌ Error al parsear datos de localStorage:', error);
      }
    }

    const habilitarTramites = this.habilitarTramiteService.getAll();
    const relaciones = habilitarTramites.map(item => ({
      id: item.id,
      tramiteId: item.tramiteId,
      tramiteNombre: item.tramiteNombre,
      periodoAcademico: item.periodoAcademico,
      sede: item.sede,
      tramiteExiste:
        HabilitarTramite.verificarTramiteExiste(item.tramiteId) !== null,
    }));

    return relaciones;
  }

  /**
   * Obtiene estadísticas de las relaciones
   * @returns {Object} Estadísticas de relaciones
   */
  getEstadisticasRelaciones() {
    const relaciones = this.verificarRelaciones();
    if (!relaciones) return null;

    const total = relaciones.length;
    const validas = relaciones.filter(r => r.tramiteExiste).length;
    const invalidas = total - validas;

    return {
      total,
      validas,
      invalidas,
      porcentajeValidas: total > 0 ? ((validas / total) * 100).toFixed(2) : 0,
    };
  }

  /**
   * Método de prueba para crear un trámite habilitado directamente
   * @param {Object} datos - Datos del trámite habilitado
   */
  async crearTramiteHabilitadoPrueba(datos = null) {
    const datosPrueba = datos || {
      periodoAcademico: '2025-1',
      semestre: 'Semestre 1',
      sede: 'Cartagena',
      tramiteId: 'tramite_prueba_123',
      tramiteNombre: 'Trámite de Prueba',
      fechaInicio: '2025-01-15',
      fechaFinalizacion: '2025-02-15',
      fechaInicioCorreccion: '2025-02-16',
      fechaFinCorreccion: '2025-02-23',
    };

    try {
      const result = await this.habilitarTramiteService.create(datosPrueba);

      if (result.success) {
        this.verificarRelaciones();
      } else {
        console.error(
          '❌ Error al crear trámite habilitado de prueba:',
          result.errors
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Error en crearTramiteHabilitadoPrueba:', error);
      return { success: false, errors: [error.message] };
    }
  }

  /**
   * Actualiza un trámite habilitado existente
   * @param {string} habilitadoId - ID del trámite habilitado a actualizar
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Resultado de la actualización
   */
  async actualizarHabilitado(habilitadoId, formData) {
    try {
      // Obtener trámites habilitados existentes
      const habilitadosData = localStorage.getItem('habilitar_tramites');
      if (!habilitadosData) {
        return {
          success: false,
          errors: ['No se encontraron trámites habilitados'],
        };
      }

      const habilitados = JSON.parse(habilitadosData);

      // Fix: Add missing IDs to records that don't have them
      let needsUpdate = false;
      const fixedHabilitados = habilitados.map((hab, index) => {
        if (!hab.id) {
          hab.id = `habilitado_${Date.now()}_${index}`;
          needsUpdate = true;
        }
        return hab;
      });

      // Update localStorage if we added missing IDs
      if (needsUpdate) {
        localStorage.setItem(
          'habilitar_tramites',
          JSON.stringify(fixedHabilitados)
        );
      }

      const habilitadoIndex = fixedHabilitados.findIndex(
        hab => hab.id === habilitadoId
      );

      if (habilitadoIndex === -1) {
        return {
          success: false,
          errors: ['Trámite habilitado no encontrado'],
        };
      }

      // Actualizar el trámite habilitado
      const habilitadoActualizado = {
        ...fixedHabilitados[habilitadoIndex],
        ...formData,
        fechaModificacion: new Date().toISOString(),
      };

      fixedHabilitados[habilitadoIndex] = habilitadoActualizado;

      // Guardar en localStorage
      localStorage.setItem(
        'habilitar_tramites',
        JSON.stringify(fixedHabilitados)
      );

      return {
        success: true,
        item: habilitadoActualizado,
        message: 'Trámite habilitado actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error al actualizar trámite habilitado:', error);
      return {
        success: false,
        errors: ['Error al actualizar el trámite habilitado'],
      };
    }
  }

  /**
   * Limpia los recursos del controlador
   */
  cleanup() {
    if (this.eventManager) {
      this.eventManager.off('habilitarTramite:guardar');
    }

    this.habilitarTramiteService = null;
    this.habilitarTramiteView = null;
    this.eventManager = null;
  }
}
