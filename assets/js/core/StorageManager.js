/**
 * Gestor de almacenamiento centralizado para el sistema
 * Proporciona métodos para manejar localStorage, sessionStorage y otros tipos de almacenamiento
 */
class StorageManager {
  constructor() {
    this.storageTypes = {
      LOCAL: 'localStorage',
      SESSION: 'sessionStorage',
      MEMORY: 'memory',
    };

    this.defaultType = this.storageTypes.LOCAL;
    this.memoryStorage = new Map();
    this.encryptionEnabled = false;
    this.encryptionKey = null;
  }

  /**
   * Habilita el cifrado para datos sensibles
   * @param {string} key - Clave de cifrado
   */
  enableEncryption(key) {
    if (!key || typeof key !== 'string') {
      throw new Error('Se requiere una clave de cifrado válida');
    }

    this.encryptionEnabled = true;
    this.encryptionKey = key;
  }

  /**
   * Deshabilita el cifrado
   */
  disableEncryption() {
    this.encryptionEnabled = false;
    this.encryptionKey = null;
  }

  /**
   * Cifra datos si el cifrado está habilitado
   * @param {string} data - Datos a cifrar
   * @returns {string} Datos cifrados o sin cifrar
   */
  encrypt(data) {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return data;
    }

    try {
      // Implementación simple de cifrado XOR (para producción usar algo más robusto)
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const charCode =
          data.charCodeAt(i) ^
          this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        encrypted += String.fromCharCode(charCode);
      }
      return btoa(encrypted); // Codificar en base64
    } catch (error) {
      console.error('❌ Error al cifrar datos:', error);
      return data;
    }
  }

  /**
   * Descifra datos si el cifrado está habilitado
   * @param {string} data - Datos a descifrar
   * @returns {string} Datos descifrados o sin descifrar
   */
  decrypt(data) {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return data;
    }

    try {
      // Decodificar de base64 y aplicar XOR inverso
      const decoded = atob(data);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode =
          decoded.charCodeAt(i) ^
          this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error('❌ Error al descifrar datos:', error);
      return data;
    }
  }

  /**
   * Guarda datos en el almacenamiento especificado
   * @param {string} key - Clave para los datos
   * @param {*} value - Valor a guardar
   * @param {string} storageType - Tipo de almacenamiento
   * @param {Object} options - Opciones adicionales
   */
  set(key, value, storageType = this.defaultType, options = {}) {
    try {
      const { ttl, compress } = options;

      let dataToStore = value;

      // Comprimir si se solicita
      if (compress && typeof value === 'string' && value.length > 1000) {
        dataToStore = this.compressData(value);
      }

      // Agregar metadatos si es necesario
      const metadata = {
        value: dataToStore,
        timestamp: Date.now(),
        compressed: compress || false,
      };

      if (ttl) {
        metadata.expiresAt = Date.now() + ttl;
      }

      const serializedData = JSON.stringify(metadata);
      const encryptedData = this.encrypt(serializedData);

      switch (storageType) {
        case this.storageTypes.LOCAL:
          localStorage.setItem(key, encryptedData);
          break;
        case this.storageTypes.SESSION:
          sessionStorage.setItem(key, encryptedData);
          break;
        case this.storageTypes.MEMORY:
          this.memoryStorage.set(key, encryptedData);
          break;
        default:
          throw new Error(`Tipo de almacenamiento no válido: ${storageType}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error al guardar datos en ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Obtiene datos del almacenamiento especificado
   * @param {string} key - Clave de los datos
   * @param {string} storageType - Tipo de almacenamiento
   * @param {*} defaultValue - Valor por defecto si no se encuentran los datos
   * @returns {*} Datos recuperados o valor por defecto
   */
  get(key, storageType = this.defaultType, defaultValue = null) {
    try {
      let storedData = null;

      switch (storageType) {
        case this.storageTypes.LOCAL:
          storedData = localStorage.getItem(key);
          break;
        case this.storageTypes.SESSION:
          storedData = sessionStorage.getItem(key);
          break;
        case this.storageTypes.MEMORY:
          storedData = this.memoryStorage.get(key);
          break;
        default:
          throw new Error(`Tipo de almacenamiento no válido: ${storageType}`);
      }

      if (!storedData) {
        return defaultValue;
      }

      const decryptedData = this.decrypt(storedData);
      const metadata = JSON.parse(decryptedData);

      // Verificar si los datos han expirado
      if (metadata.expiresAt && Date.now() > metadata.expiresAt) {
        this.remove(key, storageType);
        return defaultValue;
      }

      let result = metadata.value;

      // Descomprimir si es necesario
      if (metadata.compressed) {
        result = this.decompressData(result);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error al obtener datos de ${storageType}:`, error);
      return defaultValue;
    }
  }

  /**
   * Verifica si existe una clave en el almacenamiento
   * @param {string} key - Clave a verificar
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {boolean} True si existe
   */
  has(key, storageType = this.defaultType) {
    try {
      switch (storageType) {
        case this.storageTypes.LOCAL:
          return localStorage.getItem(key) !== null;
        case this.storageTypes.SESSION:
          return sessionStorage.getItem(key) !== null;
        case this.storageTypes.MEMORY:
          return this.memoryStorage.has(key);
        default:
          return false;
      }
    } catch (error) {
      console.error(
        `❌ Error al verificar existencia de clave en ${storageType}:`,
        error
      );
      return false;
    }
  }

  /**
   * Remueve datos del almacenamiento especificado
   * @param {string} key - Clave de los datos a remover
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {boolean} True si se removió exitosamente
   */
  remove(key, storageType = this.defaultType) {
    try {
      switch (storageType) {
        case this.storageTypes.LOCAL:
          localStorage.removeItem(key);
          break;
        case this.storageTypes.SESSION:
          sessionStorage.removeItem(key);
          break;
        case this.storageTypes.MEMORY:
          this.memoryStorage.delete(key);
          break;
        default:
          throw new Error(`Tipo de almacenamiento no válido: ${storageType}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error al remover datos de ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Limpia todo el almacenamiento especificado
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {boolean} True si se limpió exitosamente
   */
  clear(storageType = this.defaultType) {
    try {
      switch (storageType) {
        case this.storageTypes.LOCAL:
          localStorage.clear();
          break;
        case this.storageTypes.SESSION:
          sessionStorage.clear();
          break;
        case this.storageTypes.MEMORY:
          this.memoryStorage.clear();
          break;
        default:
          throw new Error(`Tipo de almacenamiento no válido: ${storageType}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error al limpiar ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Obtiene todas las claves del almacenamiento especificado
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {Array} Array de claves
   */
  keys(storageType = this.defaultType) {
    try {
      switch (storageType) {
        case this.storageTypes.LOCAL:
          return Object.keys(localStorage);
        case this.storageTypes.SESSION:
          return Object.keys(sessionStorage);
        case this.storageTypes.MEMORY:
          return Array.from(this.memoryStorage.keys());
        default:
          return [];
      }
    } catch (error) {
      console.error(`❌ Error al obtener claves de ${storageType}:`, error);
      return [];
    }
  }

  /**
   * Obtiene el tamaño del almacenamiento especificado
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {number} Número de elementos
   */
  size(storageType = this.defaultType) {
    try {
      switch (storageType) {
        case this.storageTypes.LOCAL:
          return localStorage.length;
        case this.storageTypes.SESSION:
          return sessionStorage.length;
        case this.storageTypes.MEMORY:
          return this.memoryStorage.size;
        default:
          return 0;
      }
    } catch (error) {
      console.error(`❌ Error al obtener tamaño de ${storageType}:`, error);
      return 0;
    }
  }

  /**
   * Comprime datos usando un algoritmo simple
   * @param {string} data - Datos a comprimir
   * @returns {string} Datos comprimidos
   */
  compressData(data) {
    try {
      // Implementación simple de compresión (para producción usar algo más robusto)
      let compressed = '';
      let count = 1;
      let currentChar = data[0];

      for (let i = 1; i < data.length; i++) {
        if (data[i] === currentChar) {
          count++;
        } else {
          compressed += count + currentChar;
          currentChar = data[i];
          count = 1;
        }
      }
      compressed += count + currentChar;

      return compressed;
    } catch (error) {
      console.error('❌ Error al comprimir datos:', error);
      return data;
    }
  }

  /**
   * Descomprime datos
   * @param {string} compressedData - Datos comprimidos
   * @returns {string} Datos descomprimidos
   */
  decompressData(compressedData) {
    try {
      // Implementación simple de descompresión
      let decompressed = '';
      let i = 0;

      while (i < compressedData.length) {
        let count = '';
        while (i < compressedData.length && /\d/.test(compressedData[i])) {
          count += compressedData[i];
          i++;
        }

        if (i < compressedData.length) {
          const char = compressedData[i];
          decompressed += char.repeat(parseInt(count));
          i++;
        }
      }

      return decompressed;
    } catch (error) {
      console.error('❌ Error al descomprimir datos:', error);
      return compressedData;
    }
  }

  /**
   * Obtiene información de uso del almacenamiento
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {Object} Información de uso
   */
  getUsageInfo(storageType = this.defaultType) {
    try {
      const keys = this.keys(storageType);
      let totalSize = 0;

      keys.forEach(key => {
        const value = this.get(key, storageType);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      });

      return {
        type: storageType,
        keyCount: keys.length,
        totalSize: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(4),
      };
    } catch (error) {
      console.error(
        `❌ Error al obtener información de uso de ${storageType}:`,
        error
      );
      return {
        type: storageType,
        keyCount: 0,
        totalSize: 0,
        totalSizeKB: '0.00',
        totalSizeMB: '0.0000',
      };
    }
  }

  /**
   * Limpia datos expirados del almacenamiento
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {number} Número de elementos limpiados
   */
  cleanupExpired(storageType = this.defaultType) {
    try {
      const keys = this.keys(storageType);
      let cleanedCount = 0;

      keys.forEach(key => {
        try {
          const storedData = this.get(key, storageType);
          if (storedData === null) {
            this.remove(key, storageType);
            cleanedCount++;
          }
        } catch (error) {
          // Si hay error al obtener, probablemente esté corrupto, removerlo
          this.remove(key, storageType);
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
      }

      return cleanedCount;
    } catch (error) {
      console.error(
        `❌ Error al limpiar datos expirados de ${storageType}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Exporta todos los datos del almacenamiento especificado
   * @param {string} storageType - Tipo de almacenamiento
   * @returns {Object} Datos exportados
   */
  exportData(storageType = this.defaultType) {
    try {
      const keys = this.keys(storageType);
      const exportedData = {};

      keys.forEach(key => {
        const value = this.get(key, storageType);
        if (value !== null) {
          exportedData[key] = value;
        }
      });

      return {
        storageType,
        timestamp: Date.now(),
        data: exportedData,
      };
    } catch (error) {
      console.error(`❌ Error al exportar datos de ${storageType}:`, error);
      return null;
    }
  }

  /**
   * Importa datos al almacenamiento especificado
   * @param {Object} importData - Datos a importar
   * @param {string} storageType - Tipo de almacenamiento
   * @param {boolean} overwrite - Si sobrescribir datos existentes
   * @returns {Object} Resultado de la importación
   */
  importData(importData, storageType = this.defaultType, overwrite = false) {
    try {
      if (!importData || !importData.data) {
        throw new Error('Datos de importación inválidos');
      }

      let importedCount = 0;
      let skippedCount = 0;

      Object.keys(importData.data).forEach(key => {
        if (overwrite || !this.has(key, storageType)) {
          this.set(key, importData.data[key], storageType);
          importedCount++;
        } else {
          skippedCount++;
        }
      });

      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        message: `${importedCount} elementos importados, ${skippedCount} omitidos`,
      };
    } catch (error) {
      console.error(`❌ Error al importar datos a ${storageType}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Limpia todos los recursos del gestor de almacenamiento
   */
  cleanup() {
    this.memoryStorage.clear();
    this.encryptionEnabled = false;
    this.encryptionKey = null;
  }
}
