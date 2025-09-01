/**
 * Servicio para manejo de documentos de trámites
 * Extiende BaseService para operaciones CRUD específicas de documentos
 */
class DocumentoService extends BaseService {
  constructor() {
    super('Documento', 'documentos_tramites');
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    await super.initialize();
    console.log('📚 DocumentoService inicializado');
  }

  /**
   * Crea una entidad desde datos
   * @param {Object} data - Datos de la entidad
   * @returns {Documento} Entidad creada
   */
  createEntityFromData(data) {
    return new Documento(data);
  }

  /**
   * Valida un item antes de crear
   * @param {Documento} documento - Documento a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(documento) {
    return documento.validate();
  }

  /**
   * Verifica duplicados antes de crear
   * @param {Documento} documento - Documento a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(documento) {
    // Verificar si ya existe un documento del mismo tipo para el mismo trámite
    const existingDocumento = this.items.find(
      doc =>
        doc.tramiteId === documento.tramiteId &&
        doc.tipoDocumental === documento.tipoDocumental &&
        doc.areaSolicitante === documento.areaSolicitante
    );

    if (existingDocumento) {
      return {
        isValid: false,
        errors: [
          `Ya existe un documento del tipo "${documento.tipoDocumental}" para el área "${documento.areaSolicitante}" en este trámite`,
        ],
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida datos de actualización
   * @param {Documento} documento - Documento existente
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la validación
   */
  validateUpdateData(documento, newData) {
    // Si se está cambiando el tipo documental o área, verificar duplicados
    if (
      (newData.tipoDocumental &&
        newData.tipoDocumental !== documento.tipoDocumental) ||
      (newData.areaSolicitante &&
        newData.areaSolicitante !== documento.areaSolicitante)
    ) {
      const tempDocumento = new Documento({
        ...documento.toJSON(),
        ...newData,
      });
      return this.checkForDuplicates(tempDocumento);
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Obtiene documentos por trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Array} Array de documentos del trámite
   */
  getByTramiteId(tramiteId) {
    this.validateInitialization();
    return this.items.filter(doc => doc.tramiteId === tramiteId);
  }

  /**
   * Obtiene documentos por tipo documental
   * @param {string} tipoDocumental - Tipo de documento
   * @returns {Array} Array de documentos del tipo especificado
   */
  getByTipoDocumental(tipoDocumental) {
    this.validateInitialization();
    return this.items.filter(doc => doc.tipoDocumental === tipoDocumental);
  }

  /**
   * Obtiene documentos por área solicitante
   * @param {string} areaSolicitante - Área solicitante
   * @returns {Array} Array de documentos del área especificada
   */
  getByAreaSolicitante(areaSolicitante) {
    this.validateInitialization();
    return this.items.filter(doc => doc.areaSolicitante === areaSolicitante);
  }

  /**
   * Obtiene documentos por responsable de validación
   * @param {string} responsableValidacion - Responsable de validación
   * @returns {Array} Array de documentos del responsable especificado
   */
  getByResponsableValidacion(responsableValidacion) {
    this.validateInitialization();
    return this.items.filter(
      doc => doc.responsableValidacion === responsableValidacion
    );
  }

  /**
   * Obtiene documentos activos
   * @returns {Array} Array de documentos activos
   */
  getActivos() {
    this.validateInitialization();
    return this.items.filter(doc => doc.isActivo());
  }

  /**
   * Obtiene documentos inactivos
   * @returns {Array} Array de documentos inactivos
   */
  getInactivos() {
    this.validateInitialization();
    return this.items.filter(doc => !doc.isActivo());
  }

  /**
   * Obtiene documentos por etiqueta
   * @param {string} tag - Etiqueta a buscar
   * @returns {Array} Array de documentos con la etiqueta especificada
   */
  getByTag(tag) {
    this.validateInitialization();
    return this.items.filter(doc => doc.tieneTag(tag));
  }

  /**
   * Obtiene todas las etiquetas únicas
   * @returns {Array} Array de etiquetas únicas
   */
  getAllTags() {
    this.validateInitialization();
    const allTags = [];
    this.items.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          if (!allTags.includes(tag)) {
            allTags.push(tag);
          }
        });
      }
    });
    return allTags.sort();
  }

  /**
   * Obtiene todos los tipos documentales únicos
   * @returns {Array} Array de tipos documentales únicos
   */
  getAllTiposDocumentales() {
    this.validateInitialization();
    const tipos = [];
    this.items.forEach(doc => {
      if (doc.tipoDocumental && !tipos.includes(doc.tipoDocumental)) {
        tipos.push(doc.tipoDocumental);
      }
    });
    return tipos.sort();
  }

  /**
   * Obtiene todas las áreas solicitantes únicas
   * @returns {Array} Array de áreas solicitantes únicas
   */
  getAllAreasSolicitantes() {
    this.validateInitialization();
    const areas = [];
    this.items.forEach(doc => {
      if (doc.areaSolicitante && !areas.includes(doc.areaSolicitante)) {
        areas.push(doc.areaSolicitante);
      }
    });
    return areas.sort();
  }

  /**
   * Obtiene todos los responsables de validación únicos
   * @returns {Array} Array de responsables únicos
   */
  getAllResponsablesValidacion() {
    this.validateInitialization();
    const responsables = [];
    this.items.forEach(doc => {
      if (
        doc.responsableValidacion &&
        !responsables.includes(doc.responsableValidacion)
      ) {
        responsables.push(doc.responsableValidacion);
      }
    });
    return responsables.sort();
  }

  /**
   * Busca documentos por texto
   * @param {string} searchText - Texto a buscar
   * @returns {Array} Array de documentos que coinciden
   */
  searchByText(searchText) {
    this.validateInitialization();
    if (!searchText || searchText.trim() === '') {
      return this.getAll();
    }

    const searchLower = searchText.toLowerCase();
    return this.items.filter(doc => {
      return (
        doc.tipoDocumental.toLowerCase().includes(searchLower) ||
        doc.areaSolicitante.toLowerCase().includes(searchLower) ||
        doc.responsableValidacion.toLowerCase().includes(searchLower) ||
        doc.observaciones.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  }

  /**
   * Obtiene estadísticas de documentos
   * @returns {Object} Estadísticas de documentos
   */
  getStats() {
    this.validateInitialization();

    const total = this.items.length;
    const activos = this.getActivos().length;
    const inactivos = this.getInactivos().length;

    // Estadísticas por tipo documental
    const tiposStats = {};
    this.getAllTiposDocumentales().forEach(tipo => {
      tiposStats[tipo] = this.getByTipoDocumental(tipo).length;
    });

    // Estadísticas por área
    const areasStats = {};
    this.getAllAreasSolicitantes().forEach(area => {
      areasStats[area] = this.getByAreaSolicitante(area).length;
    });

    // Estadísticas por responsable
    const responsablesStats = {};
    this.getAllResponsablesValidacion().forEach(responsable => {
      responsablesStats[responsable] =
        this.getByResponsableValidacion(responsable).length;
    });

    // Total de datos requeridos
    const totalDatosRequeridos = this.items.reduce((total, doc) => {
      return total + doc.getNumeroDatosRequeridos();
    }, 0);

    return {
      total,
      activos,
      inactivos,
      tiposDocumentales: tiposStats,
      areasSolicitantes: areasStats,
      responsablesValidacion: responsablesStats,
      totalDatosRequeridos,
      promedioDatosPorDocumento:
        total > 0 ? (totalDatosRequeridos / total).toFixed(2) : 0,
    };
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de documentos a generar
   * @param {string} tramiteId - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  generateSampleData(count = 3, tramiteId) {
    try {
      this.validateInitialization();

      if (!tramiteId) {
        return {
          success: false,
          errors: [
            'Se requiere el ID del trámite para generar documentos de ejemplo',
          ],
        };
      }

      const sampleDocumentos = [];
      const tiposDocumentales = [
        'Solicitud',
        'Certificado',
        'Constancia',
        'Carné',
        'Diploma',
        'Acta',
        'Informe',
      ];
      const areasSolicitantes = [
        'Académica',
        'Administrativa',
        'Financiera',
        'Bienestar',
        'Investigación',
        'Extensión',
      ];
      const responsables = [
        'Dr. Juan Pérez',
        'Lic. María García',
        'Ing. Carlos López',
        'Mg. Ana Rodríguez',
        'Esp. Luis Martínez',
      ];

      for (let i = 0; i < count; i++) {
        const tipoDocumental =
          tiposDocumentales[
            Math.floor(Math.random() * tiposDocumentales.length)
          ];
        const areaSolicitante =
          areasSolicitantes[
            Math.floor(Math.random() * areasSolicitantes.length)
          ];
        const responsable =
          responsables[Math.floor(Math.random() * responsables.length)];

        const documento = Documento.createSample(
          tramiteId,
          `Trámite ${tramiteId}`
        );
        documento.tipoDocumental = tipoDocumental;
        documento.areaSolicitante = areaSolicitante;
        documento.responsableValidacion = responsable;
        documento.tags = [
          tipoDocumental.toLowerCase(),
          areaSolicitante.toLowerCase(),
          'ejemplo',
        ];

        sampleDocumentos.push(documento);
      }

      this.items = [...this.items, ...sampleDocumentos];
      this.saveToStorage();

      return {
        success: true,
        generated: sampleDocumentos.length,
        message: `${sampleDocumentos.length} documentos de ejemplo generados para el trámite ${tramiteId}`,
        documentos: sampleDocumentos,
      };
    } catch (error) {
      console.error('❌ Error al generar documentos de ejemplo:', error);
      return {
        success: false,
        errors: ['Error al generar documentos de ejemplo'],
      };
    }
  }

  /**
   * Exporta documentos de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {string} JSON string de los documentos
   */
  exportByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const documentos = this.getByTramiteId(tramiteId);
      const dataToExport = documentos.map(doc => doc.toJSON());
      return JSON.stringify(dataToExport, null, 2);
    } catch (error) {
      console.error('❌ Error al exportar documentos del trámite:', error);
      return null;
    }
  }

  /**
   * Importa documentos para un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @param {string} jsonData - Datos JSON
   * @returns {Object} Resultado de la operación
   */
  async importByTramiteId(tramiteId, jsonData) {
    try {
      this.validateInitialization();
      const importedData = JSON.parse(jsonData);
      const importedDocumentos = [];

      for (const data of importedData) {
        // Asignar el tramiteId correcto
        data.tramiteId = tramiteId;

        const documento = new Documento(data);
        const validation = documento.validate();

        if (validation.isValid) {
          importedDocumentos.push(documento);
        }
      }

      this.items = [...this.items, ...importedDocumentos];
      await this.saveToStorage();

      return {
        success: true,
        imported: importedDocumentos.length,
        message: `${importedDocumentos.length} documentos importados para el trámite ${tramiteId}`,
        documentos: importedDocumentos,
      };
    } catch (error) {
      console.error('❌ Error al importar documentos del trámite:', error);
      return {
        success: false,
        errors: ['Error al importar documentos del trámite'],
      };
    }
  }

  /**
   * Limpia documentos de un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  async clearByTramiteId(tramiteId) {
    try {
      this.validateInitialization();
      const documentosOriginales = [...this.items];
      this.items = this.items.filter(doc => doc.tramiteId !== tramiteId);

      const removedCount = documentosOriginales.length - this.items.length;
      await this.saveToStorage();

      return {
        success: true,
        removed: removedCount,
        message: `${removedCount} documentos removidos del trámite ${tramiteId}`,
      };
    } catch (error) {
      console.error('❌ Error al limpiar documentos del trámite:', error);
      return {
        success: false,
        errors: ['Error al limpiar documentos del trámite'],
      };
    }
  }
}
