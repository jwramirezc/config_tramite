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
    console.log('🔧 Inicializando HabilitarTramiteController...');
    console.log(
      '🔧 habilitarTramiteService recibido:',
      habilitarTramiteService
    );
    console.log('🔧 eventManager recibido:', eventManager);

    this.habilitarTramiteService = habilitarTramiteService;
    this.eventManager = eventManager;
    this.setupEventListeners();
    console.log('✅ HabilitarTramiteController inicializado correctamente');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    console.log(
      '🔧 Configurando event listeners en HabilitarTramiteController...'
    );

    // Event listener para el botón de habilitar trámites
    const btnHabilitarTramites = document.getElementById(
      'btnHabilitarTramites'
    );
    if (btnHabilitarTramites) {
      btnHabilitarTramites.addEventListener('click', () => {
        this.mostrarModal();
      });
      console.log(
        '✅ Event listener para botón habilitar trámites configurado'
      );
    }

    // Event listener para guardar trámite habilitado
    if (this.eventManager) {
      this.eventManager.on('habilitarTramite:guardar', async data => {
        console.log(
          '📨 Evento habilitarTramite:guardar recibido en el controlador:',
          data
        );
        await this.guardarHabilitarTramite(data);
      });
      console.log(
        '✅ Event listener habilitarTramite:guardar configurado en el controlador'
      );
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
    console.log(
      '🔧 Mostrando modal de habilitar trámites desde el controlador'
    );
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
    console.log('🔧 Iniciando proceso de guardado de trámite habilitado');
    console.log('📋 Datos recibidos:', formData);

    try {
      if (!this.habilitarTramiteService) {
        console.error('❌ HabilitarTramiteService no está disponible');
        return;
      }

      // Crear el trámite habilitado
      console.log('📝 Creando trámite habilitado...');
      console.log(
        '🔗 Datos de relación - tramiteId:',
        formData.tramiteId,
        'tramiteNombre:',
        formData.tramiteNombre
      );

      console.log('🔧 Llamando a habilitarTramiteService.create()...');
      const result = await this.habilitarTramiteService.create(formData);
      console.log('📝 Resultado del guardado:', result);
      console.log('📝 Tipo de resultado:', typeof result);
      console.log(
        '📝 result es null/undefined:',
        result === null || result === undefined
      );

      if (!result) {
        console.error('❌ Result es undefined o null');
        this.habilitarTramiteView.showAlert(
          'Error: No se recibió respuesta del servicio',
          'danger'
        );
        return;
      }

      if (result.success && result.item) {
        console.log('✅ ID único generado:', result.item.id);
        console.log(
          '🔗 Relación guardada - tramiteId:',
          result.item.tramiteId,
          'tramiteNombre:',
          result.item.tramiteNombre
        );
      }

      if (result.success) {
        this.habilitarTramiteView.mostrarExito(
          'Trámite habilitado guardado exitosamente'
        );
        console.log('✅ Trámite habilitado guardado exitosamente');

        // Cerrar el modal después del éxito
        console.log('🔧 Cerrando modal...');
        this.habilitarTramiteView.hideModal();

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
    console.log(
      '🔍 Datos en localStorage (habilitar_tramites):',
      localStorageData
    );

    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);
        console.log('🔍 Datos parseados:', parsedData);
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

    console.log('🔍 Relaciones verificadas:', relaciones);
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

    console.log('🧪 Creando trámite habilitado de prueba...');
    console.log('🧪 Datos de prueba:', datosPrueba);

    try {
      const result = await this.habilitarTramiteService.create(datosPrueba);
      console.log('🧪 Resultado:', result);

      if (result.success) {
        console.log('✅ Trámite habilitado de prueba creado exitosamente');
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
   * Limpia los recursos del controlador
   */
  cleanup() {
    console.log('🧹 Limpiando HabilitarTramiteController...');

    if (this.eventManager) {
      this.eventManager.off('habilitarTramite:guardar');
    }

    this.habilitarTramiteService = null;
    this.habilitarTramiteView = null;
    this.eventManager = null;

    console.log('✅ HabilitarTramiteController limpiado');
  }
}
