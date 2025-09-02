/**
 * Servicio base para todas las entidades del sistema
 * Proporciona operaciones CRUD comunes y gestión de almacenamiento
 */
class BaseService {
  constructor(entityName, storageKey) {
    this.entityName = entityName;
    this.storageKey = storageKey || `${entityName.toLowerCase()}_data`;
    this.items = [];
    this.isInitialized = false;
  }

  /**
   * Inicializa el servicio
   */
  async initialize() {
    try {
      await this.loadFromStorage();
      this.isInitialized = true;
      console.log(`✅ ${this.constructor.name} inicializado correctamente`);
    } catch (error) {
      console.error(`❌ Error al inicializar ${this.constructor.name}:`, error);
      throw error;
    }
  }

  /**
   * Carga los datos desde el almacenamiento
   */
  async loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      console.log(
        `🔍 Intentando cargar datos para ${this.storageKey}:`,
        data ? 'datos encontrados' : 'sin datos'
      );

      if (data) {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
          console.log(`📊 Datos parseados exitosamente:`, parsedData);
        } catch (parseError) {
          console.error(
            `❌ Error al parsear JSON para ${this.storageKey}:`,
            parseError
          );
          console.error(`🔍 Datos corruptos:`, data);
          this.items = [];
          return;
        }

        if (!Array.isArray(parsedData)) {
          console.error(
            `❌ Los datos para ${this.storageKey} no son un array:`,
            typeof parsedData,
            parsedData
          );
          this.items = [];
          return;
        }

        console.log(`📊 Procesando ${parsedData.length} items...`);

        this.items = [];
        for (let i = 0; i < parsedData.length; i++) {
          const item = parsedData[i];
          try {
            console.log(
              `🔧 Procesando item ${i + 1}/${parsedData.length}:`,
              item
            );
            const entity = this.createEntityFromData(item);
            if (entity) {
              this.items.push(entity);
              console.log(`✅ Item ${i + 1} procesado exitosamente`);
            } else {
              console.warn(`⚠️ Item ${i + 1} retornó null, omitiendo`);
            }
          } catch (itemError) {
            console.error(
              `❌ Error al crear entidad para item ${i + 1}:`,
              item,
              itemError
            );
            // Continuar con el siguiente item en lugar de fallar completamente
          }
        }

        console.log(
          `📥 ${this.entityName}s cargados desde almacenamiento:`,
          this.items.length
        );
      } else {
        this.items = [];
        console.log(`📝 No hay ${this.entityName}s en almacenamiento`);
      }
    } catch (error) {
      console.error(
        `❌ Error general al cargar ${this.entityName}s desde almacenamiento:`,
        error
      );
      console.error(
        `🔍 Datos problemáticos:`,
        localStorage.getItem(this.storageKey)
      );
      this.items = [];
    }
  }

  /**
   * Guarda los datos en el almacenamiento
   */
  async saveToStorage() {
    try {
      const dataToSave = this.items.map(item =>
        this.prepareDataForStorage(item)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      console.log(
        `💾 ${this.entityName}s guardados en almacenamiento:`,
        this.items.length
      );
    } catch (error) {
      console.error(
        `❌ Error al guardar ${this.entityName}s en almacenamiento:`,
        error
      );
      throw error;
    }
  }

  /**
   * Prepara los datos para almacenamiento
   * @param {Object} item - Item a preparar
   * @returns {Object} Datos preparados
   */
  prepareDataForStorage(item) {
    if (typeof item.toJSON === 'function') {
      return item.toJSON();
    }
    return item;
  }

  /**
   * Crea una entidad desde datos
   * @param {Object} data - Datos de la entidad
   * @returns {Object} Entidad creada
   */
  createEntityFromData(data) {
    // Método a implementar en las clases hijas
    throw new Error(
      'createEntityFromData debe ser implementado en la clase hija'
    );
  }

  /**
   * Obtiene todos los items
   * @returns {Array} Array de items
   */
  getAll() {
    this.validateInitialization();
    return [...this.items];
  }

  /**
   * Obtiene un item por ID
   * @param {string} id - ID del item
   * @returns {Object|null} Item encontrado o null
   */
  getById(id) {
    this.validateInitialization();
    return this.items.find(item => item.id === id) || null;
  }

  /**
   * Busca items por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Array} Array de items que coinciden
   */
  search(criteria = {}) {
    this.validateInitialization();
    return this.items.filter(item => this.matchesCriteria(item, criteria));
  }

  /**
   * Verifica si un item coincide con los criterios
   * @param {Object} item - Item a verificar
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {boolean} True si coincide
   */
  matchesCriteria(item, criteria) {
    return Object.keys(criteria).every(key => {
      if (!criteria[key]) return true;

      const itemValue = item[key];
      const criteriaValue = criteria[key];

      if (typeof criteriaValue === 'string') {
        return (
          itemValue &&
          itemValue.toLowerCase().includes(criteriaValue.toLowerCase())
        );
      }

      return itemValue === criteriaValue;
    });
  }

  /**
   * Crea un nuevo item
   * @param {Object} item - Item a crear
   * @returns {Object} Resultado de la operación
   */
  async create(item) {
    try {
      this.validateInitialization();

      // Validar el item
      const validation = this.validateItem(item);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Verificar duplicados
      const duplicateCheck = this.checkForDuplicates(item);
      if (!duplicateCheck.isValid) {
        return {
          success: false,
          errors: duplicateCheck.errors,
        };
      }

      // Agregar el item
      this.items.push(item);
      await this.saveToStorage();

      return {
        success: true,
        item: item,
        message: `${this.entityName} creado exitosamente`,
      };
    } catch (error) {
      console.error(`❌ Error al crear ${this.entityName}:`, error);
      return {
        success: false,
        errors: [`Error interno al crear el ${this.entityName}`],
      };
    }
  }

  /**
   * Actualiza un item existente
   * @param {string} id - ID del item
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la operación
   */
  async update(id, newData) {
    try {
      this.validateInitialization();

      const item = this.getById(id);
      if (!item) {
        return {
          success: false,
          errors: [`${this.entityName} no encontrado`],
        };
      }

      // Validar los nuevos datos
      const validation = this.validateUpdateData(item, newData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Actualizar el item
      this.updateItem(item, newData);
      await this.saveToStorage();

      return {
        success: true,
        item: item,
        message: `${this.entityName} actualizado exitosamente`,
      };
    } catch (error) {
      console.error(`❌ Error al actualizar ${this.entityName}:`, error);
      return {
        success: false,
        errors: [`Error interno al actualizar el ${this.entityName}`],
      };
    }
  }

  /**
   * Elimina un item
   * @param {string} id - ID del item
   * @returns {Object} Resultado de la operación
   */
  async delete(id) {
    try {
      this.validateInitialization();

      const index = this.items.findIndex(item => item.id === id);
      if (index === -1) {
        return {
          success: false,
          errors: [`${this.entityName} no encontrado`],
        };
      }

      const deletedItem = this.items.splice(index, 1)[0];
      await this.saveToStorage();

      return {
        success: true,
        item: deletedItem,
        message: `${this.entityName} eliminado exitosamente`,
      };
    } catch (error) {
      console.error(`❌ Error al eliminar ${this.entityName}:`, error);
      return {
        success: false,
        errors: [`Error interno al eliminar el ${this.entityName}`],
      };
    }
  }

  /**
   * Valida un item antes de crear
   * @param {Object} item - Item a validar
   * @returns {Object} Resultado de la validación
   */
  validateItem(item) {
    // Método a implementar en las clases hijas
    throw new Error('validateItem debe ser implementado en la clase hija');
  }

  /**
   * Verifica duplicados antes de crear
   * @param {Object} item - Item a verificar
   * @returns {Object} Resultado de la verificación
   */
  checkForDuplicates(item) {
    // Método a implementar en las clases hijas
    return { isValid: true, errors: [] };
  }

  /**
   * Valida datos de actualización
   * @param {Object} item - Item existente
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la validación
   */
  validateUpdateData(item, newData) {
    // Método a implementar en las clases hijas
    return { isValid: true, errors: [] };
  }

  /**
   * Actualiza un item con nuevos datos
   * @param {Object} item - Item a actualizar
   * @param {Object} newData - Nuevos datos
   */
  updateItem(item, newData) {
    if (typeof item.update === 'function') {
      item.update(newData);
    } else {
      Object.assign(item, newData);
    }
  }

  /**
   * Valida que el servicio esté inicializado
   */
  validateInitialization() {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name} no ha sido inicializado`);
    }
  }

  /**
   * Limpia todos los datos
   * @returns {Object} Resultado de la operación
   */
  async clearAll() {
    try {
      this.validateInitialization();
      this.items = [];
      await this.saveToStorage();
      return {
        success: true,
        message: `Todos los ${this.entityName}s han sido eliminados`,
      };
    } catch (error) {
      console.error(`❌ Error al limpiar ${this.entityName}s:`, error);
      return {
        success: false,
        errors: [`Error al limpiar los ${this.entityName}s`],
      };
    }
  }

  /**
   * Obtiene estadísticas básicas
   * @returns {Object} Estadísticas
   */
  getStats() {
    this.validateInitialization();
    return {
      total: this.items.length,
    };
  }

  /**
   * Exporta los datos a JSON
   * @returns {string} JSON string de los datos
   */
  exportToJSON() {
    try {
      this.validateInitialization();
      const dataToExport = this.items.map(item =>
        this.prepareDataForStorage(item)
      );
      return JSON.stringify(dataToExport, null, 2);
    } catch (error) {
      console.error(`❌ Error al exportar ${this.entityName}s:`, error);
      return null;
    }
  }

  /**
   * Importa datos desde JSON
   * @param {string} jsonData - Datos JSON
   * @returns {Object} Resultado de la operación
   */
  async importFromJSON(jsonData) {
    try {
      this.validateInitialization();
      const importedData = JSON.parse(jsonData);
      const importedItems = [];

      for (const data of importedData) {
        const item = this.createEntityFromData(data);
        const validation = this.validateItem(item);

        if (validation.isValid) {
          importedItems.push(item);
        }
      }

      this.items = [...this.items, ...importedItems];
      await this.saveToStorage();

      return {
        success: true,
        imported: importedItems.length,
        message: `${importedItems.length} ${this.entityName}s importados exitosamente`,
      };
    } catch (error) {
      console.error(`❌ Error al importar ${this.entityName}s:`, error);
      return {
        success: false,
        errors: [`Error al importar los ${this.entityName}s`],
      };
    }
  }
}
