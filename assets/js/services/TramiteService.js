/**
 * Servicio para manejo de trámites
 * Clase que maneja la persistencia y operaciones CRUD de trámites
 */
class TramiteService {
  constructor() {
    this.storageKey = 'tramites_data';
    this.tramites = this.loadFromStorage();
  }

  /**
   * Carga los trámites desde localStorage
   * @returns {Array} Array de trámites
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const tramitesData = JSON.parse(data);
        return tramitesData.map(tramiteData => new Tramite(tramiteData));
      }
    } catch (error) {
      console.error('Error al cargar trámites desde localStorage:', error);
    }
    return [];
  }

  /**
   * Guarda los trámites en localStorage
   */
  saveToStorage() {
    try {
      const tramitesData = this.tramites.map(tramite => tramite.toJSON());

      // Log para verificar que el historial de fechas esté presente
      tramitesData.forEach(tramite => {
        if (tramite.historialFechas && tramite.historialFechas.length > 0) {
          console.log(
            `📊 Trámite "${tramite.nombre}" tiene ${tramite.historialFechas.length} registros en historial:`,
            tramite.historialFechas
          );
        }
      });

      console.log('Guardando en localStorage:', tramitesData);
      localStorage.setItem(this.storageKey, JSON.stringify(tramitesData));
      console.log('✅ Datos guardados exitosamente en localStorage');
    } catch (error) {
      console.error('Error al guardar trámites en localStorage:', error);
    }
  }

  /**
   * Obtiene todos los trámites
   * @returns {Array} Array de trámites
   */
  getAll() {
    return [...this.tramites];
  }

  /**
   * Obtiene un trámite por ID
   * @param {string} id - ID del trámite
   * @returns {Tramite|null} Trámite encontrado o null
   */
  getById(id) {
    return this.tramites.find(tramite => tramite.id === id) || null;
  }

  /**
   * Crea un nuevo trámite
   * @param {Tramite} tramite - Trámite a crear
   * @returns {Object} Resultado de la operación
   */
  create(tramite) {
    try {
      // Validar el trámite
      const validation = tramite.validate();
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Verificar si ya existe un trámite con el mismo nombre
      const existingTramite = this.tramites.find(
        t => t.nombre.toLowerCase() === tramite.nombre.toLowerCase()
      );

      if (existingTramite) {
        return {
          success: false,
          errors: ['Ya existe un trámite con ese nombre'],
        };
      }

      // Agregar el trámite
      this.tramites.push(tramite);
      this.saveToStorage();

      return {
        success: true,
        tramite: tramite,
        message: 'Trámite creado exitosamente',
      };
    } catch (error) {
      console.error('Error al crear trámite:', error);
      return {
        success: false,
        errors: ['Error interno al crear el trámite'],
      };
    }
  }

  /**
   * Actualiza un trámite existente
   * @param {string} id - ID del trámite
   * @param {Object} newData - Nuevos datos
   * @returns {Object} Resultado de la operación
   */
  update(id, newData) {
    try {
      const tramite = this.getById(id);
      if (!tramite) {
        return {
          success: false,
          errors: ['Trámite no encontrado'],
        };
      }

      // Verificar si es solo una actualización de estado
      const isOnlyStateUpdate =
        Object.keys(newData).length === 1 && newData.hasOwnProperty('estado');

      if (!isOnlyStateUpdate) {
        // Crear un trámite temporal para validar (solo si no es solo actualización de estado)
        const tempTramite = new Tramite({ ...tramite.toJSON(), ...newData });
        const validation = tempTramite.validate();

        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors,
          };
        }

        // Verificar si el nombre ya existe en otro trámite (solo si no es solo actualización de estado)
        const existingTramite = this.tramites.find(
          t =>
            t.id !== id &&
            t.nombre.toLowerCase() === tempTramite.nombre.toLowerCase()
        );

        if (existingTramite) {
          return {
            success: false,
            errors: ['Ya existe un trámite con ese nombre'],
          };
        }
      }

      // Actualizar el trámite
      tramite.update(newData);
      this.saveToStorage();

      return {
        success: true,
        tramite: tramite,
        message: 'Trámite actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error al actualizar trámite:', error);
      return {
        success: false,
        errors: ['Error interno al actualizar el trámite'],
      };
    }
  }

  /**
   * Elimina un trámite
   * @param {string} id - ID del trámite
   * @returns {Object} Resultado de la operación
   */
  delete(id) {
    try {
      const index = this.tramites.findIndex(tramite => tramite.id === id);
      if (index === -1) {
        return {
          success: false,
          errors: ['Trámite no encontrado'],
        };
      }

      const tramiteEliminado = this.tramites.splice(index, 1)[0];
      this.saveToStorage();

      return {
        success: true,
        tramite: tramiteEliminado,
        message: 'Trámite eliminado exitosamente',
      };
    } catch (error) {
      console.error('Error al eliminar trámite:', error);
      return {
        success: false,
        errors: ['Error interno al eliminar el trámite'],
      };
    }
  }

  /**
   * Busca trámites por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Array} Array de trámites que coinciden
   */
  search(criteria = {}) {
    return this.tramites.filter(tramite => {
      // Búsqueda por nombre
      if (
        criteria.nombre &&
        !tramite.nombre.toLowerCase().includes(criteria.nombre.toLowerCase())
      ) {
        return false;
      }

      // Búsqueda por sede
      if (criteria.sede && tramite.sede !== criteria.sede) {
        return false;
      }

      // Búsqueda por jornada
      if (criteria.jornada && tramite.jornada !== criteria.jornada) {
        return false;
      }

      // Búsqueda por estado
      if (criteria.estado && tramite.estado !== criteria.estado) {
        return false;
      }

      return true;
    });
  }

  /**
   * Obtiene estadísticas de los trámites
   * @returns {Object} Estadísticas
   */
  getStats() {
    const total = this.tramites.length;
    const activos = this.tramites.filter(t => t.isActivo()).length;
    const pendientes = this.tramites.filter(
      t => t.getEstadoPorFechas() === 'pendiente'
    ).length;
    const finalizados = this.tramites.filter(
      t => t.getEstadoPorFechas() === 'finalizado'
    ).length;
    const enSubsanacion = this.tramites.filter(t => t.isEnSubsanacion()).length;

    return {
      total,
      activos,
      pendientes,
      finalizados,
      enSubsanacion,
    };
  }

  /**
   * Exporta los trámites a JSON
   * @returns {string} JSON string de los trámites
   */
  exportToJSON() {
    try {
      const tramitesData = this.tramites.map(tramite => tramite.toJSON());
      return JSON.stringify(tramitesData, null, 2);
    } catch (error) {
      console.error('Error al exportar trámites:', error);
      return null;
    }
  }

  /**
   * Importa trámites desde JSON
   * @param {string} jsonData - Datos JSON
   * @returns {Object} Resultado de la operación
   */
  importFromJSON(jsonData) {
    try {
      const tramitesData = JSON.parse(jsonData);
      const tramitesImportados = [];

      for (const data of tramitesData) {
        const tramite = new Tramite(data);
        const validation = tramite.validate();

        if (validation.isValid) {
          tramitesImportados.push(tramite);
        }
      }

      this.tramites = [...this.tramites, ...tramitesImportados];
      this.saveToStorage();

      return {
        success: true,
        imported: tramitesImportados.length,
        message: `${tramitesImportados.length} trámites importados exitosamente`,
      };
    } catch (error) {
      console.error('Error al importar trámites:', error);
      return {
        success: false,
        errors: ['Error al importar los trámites'],
      };
    }
  }

  /**
   * Limpia todos los datos
   * @returns {Object} Resultado de la operación
   */
  clearAll() {
    try {
      this.tramites = [];
      this.saveToStorage();
      return {
        success: true,
        message: 'Todos los trámites han sido eliminados',
      };
    } catch (error) {
      console.error('Error al limpiar trámites:', error);
      return {
        success: false,
        errors: ['Error al limpiar los trámites'],
      };
    }
  }

  /**
   * Genera datos de ejemplo
   * @param {number} count - Número de trámites a generar
   * @returns {Object} Resultado de la operación
   */
  generateSampleData(count = 5) {
    try {
      const sampleTramites = [];

      const sedes = ['Principal', 'Norte', 'Sur'];
      const jornadas = ['Diurna', 'Nocturna'];

      for (let i = 1; i <= count; i++) {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() + i * 30);

        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 60);

        const fechaInicioSub = new Date(fechaFin);
        fechaInicioSub.setDate(fechaInicioSub.getDate() + 1);

        const fechaFinSub = new Date(fechaInicioSub);
        fechaFinSub.setDate(fechaFinSub.getDate() + 15);

        const tramite = new Tramite({
          nombre: `Trámite de Ejemplo ${i}`,
          periodoAnio: '2024',
          periodoSemestre: ['I', 'II', 'III', 'IV'][
            Math.floor(Math.random() * 4)
          ],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          jornada: jornadas[Math.floor(Math.random() * jornadas.length)],
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFinalizacion: fechaFin.toISOString().split('T')[0],
          fechaInicioSubsanacion: fechaInicioSub.toISOString().split('T')[0],
          fechaFinSubsanacion: fechaFinSub.toISOString().split('T')[0],
        });

        sampleTramites.push(tramite);
      }

      this.tramites = [...this.tramites, ...sampleTramites];
      this.saveToStorage();

      return {
        success: true,
        generated: sampleTramites.length,
        message: `${sampleTramites.length} trámites de ejemplo generados`,
      };
    } catch (error) {
      console.error('Error al generar datos de ejemplo:', error);
      return {
        success: false,
        errors: ['Error al generar datos de ejemplo'],
      };
    }
  }
}
