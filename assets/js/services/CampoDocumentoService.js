/**
 * Servicio para manejar los campos de documentos
 * Extiende BaseService para operaciones CRUD
 */
class CampoDocumentoService extends BaseService {
  constructor() {
    super('CampoDocumento', 'campos_documentos');
  }

  /**
   * Crea un nuevo campo de documento
   * @param {Object} campoData - Datos del campo
   * @returns {Object} Resultado de la operación
   */
  async createCampo(campoData) {
    try {
      this.validateInitialization();

      // Crear campo desde los datos
      const campo = new CampoDocumento(campoData);

      // Validar el campo
      const validation = campo.validate();
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Verificar duplicados por nombre en el mismo documento
      const existingCampo = this.items.find(
        c =>
          c.documentoId === campo.documentoId &&
          c.nombreCampo.toLowerCase() === campo.nombreCampo.toLowerCase()
      );

      if (existingCampo) {
        return {
          success: false,
          errors: [
            `Ya existe un campo con el nombre "${campo.nombreCampo}" en este documento`,
          ],
        };
      }

      // Agregar el campo
      this.items.push(campo);
      await this.saveToStorage();

      return {
        success: true,
        item: campo,
        message: `Campo "${campo.nombreCampo}" creado exitosamente`,
      };
    } catch (error) {
      console.error('❌ Error al crear campo de documento:', error);
      return {
        success: false,
        errors: ['Error al crear el campo'],
      };
    }
  }

  /**
   * Crea un campo desde el formulario
   * @param {Object} formData - Datos del formulario
   * @param {string} documentoId - ID del documento
   * @returns {Object} Resultado de la operación
   */
  async createCampoFromForm(formData, documentoId) {
    try {
      this.validateInitialization();

      // Crear campo desde los datos del formulario
      const campo = CampoDocumento.fromFormData(formData, documentoId);

      // Validar el campo
      const validation = campo.validateCrearCampo();
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Verificar duplicados por nombre en el mismo documento
      const existingCampo = this.items.find(
        c =>
          c.documentoId === campo.documentoId &&
          c.nombreCampo.toLowerCase() === campo.nombreCampo.toLowerCase()
      );

      if (existingCampo) {
        return {
          success: false,
          errors: [
            `Ya existe un campo con el nombre "${campo.nombreCampo}" en este documento`,
          ],
        };
      }

      // Agregar el campo
      this.items.push(campo);
      await this.saveToStorage();

      return {
        success: true,
        item: campo,
        message: `Campo "${campo.nombreCampo}" creado exitosamente`,
      };
    } catch (error) {
      console.error('❌ Error al crear campo desde formulario:', error);
      return {
        success: false,
        errors: ['Error al crear el campo'],
      };
    }
  }

  /**
   * Obtiene todos los campos de un documento específico
   * @param {string} documentoId - ID del documento
   * @returns {Array} Array de campos del documento
   */
  getCamposByDocumentoId(documentoId) {
    try {
      this.validateInitialization();
      return this.items.filter(
        campo => campo.documentoId === documentoId && campo.estado === 'activo'
      );
    } catch (error) {
      console.error('❌ Error al obtener campos del documento:', error);
      return [];
    }
  }

  /**
   * Elimina un campo específico
   * @param {string} campoId - ID del campo
   * @returns {Object} Resultado de la operación
   */
  async deleteCampo(campoId) {
    try {
      this.validateInitialization();

      const campoIndex = this.items.findIndex(campo => campo.id === campoId);
      if (campoIndex === -1) {
        return {
          success: false,
          errors: ['Campo no encontrado'],
        };
      }

      const campo = this.items[campoIndex];
      this.items.splice(campoIndex, 1);
      await this.saveToStorage();

      return {
        success: true,
        message: `Campo "${campo.nombreCampo}" eliminado exitosamente`,
      };
    } catch (error) {
      console.error('❌ Error al eliminar campo:', error);
      return {
        success: false,
        errors: ['Error al eliminar el campo'],
      };
    }
  }

  /**
   * Elimina todos los campos de un documento específico
   * @param {string} documentoId - ID del documento
   * @returns {Object} Resultado de la operación
   */
  async deleteCamposByDocumentoId(documentoId) {
    try {
      this.validateInitialization();

      const camposOriginales = this.items.length;
      this.items = this.items.filter(
        campo => campo.documentoId !== documentoId
      );

      if (this.items.length < camposOriginales) {
        await this.saveToStorage();
        return {
          success: true,
          message: `Campos del documento eliminados exitosamente`,
        };
      }

      return {
        success: true,
        message: `No se encontraron campos para eliminar`,
      };
    } catch (error) {
      console.error('❌ Error al eliminar campos del documento:', error);
      return {
        success: false,
        errors: ['Error al eliminar los campos del documento'],
      };
    }
  }

  /**
   * Actualiza un campo existente
   * @param {string} campoId - ID del campo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} Resultado de la operación
   */
  async updateCampo(campoId, updateData) {
    try {
      this.validateInitialization();

      const campoIndex = this.items.findIndex(campo => campo.id === campoId);
      if (campoIndex === -1) {
        return {
          success: false,
          errors: ['Campo no encontrado'],
        };
      }

      // Actualizar campos
      const campo = this.items[campoIndex];
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          campo[key] = updateData[key];
        }
      });

      campo.updateModificationDate();

      // Validar el campo actualizado
      const validation = campo.validate();
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      await this.saveToStorage();

      return {
        success: true,
        item: campo,
        message: `Campo "${campo.nombreCampo}" actualizado exitosamente`,
      };
    } catch (error) {
      console.error('❌ Error al actualizar campo:', error);
      return {
        success: false,
        errors: ['Error al actualizar el campo'],
      };
    }
  }

  /**
   * Obtiene estadísticas de campos por documento
   * @returns {Object} Estadísticas
   */
  getEstadisticas() {
    try {
      this.validateInitialization();

      const totalCampos = this.items.length;
      const camposActivos = this.items.filter(
        c => c.estado === 'activo'
      ).length;

      // Agrupar por tipo de campo
      const porTipo = this.items.reduce((acc, campo) => {
        acc[campo.tipoCampo] = (acc[campo.tipoCampo] || 0) + 1;
        return acc;
      }, {});

      // Agrupar por documento
      const porDocumento = this.items.reduce((acc, campo) => {
        acc[campo.documentoId] = (acc[campo.documentoId] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCampos,
        camposActivos,
        porTipo,
        porDocumento,
        documentosConCampos: Object.keys(porDocumento).length,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return {
        totalCampos: 0,
        camposActivos: 0,
        porTipo: {},
        porDocumento: {},
        documentosConCampos: 0,
      };
    }
  }
}
