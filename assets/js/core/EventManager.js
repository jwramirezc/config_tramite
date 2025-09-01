/**
 * Gestor de eventos centralizado para el sistema
 * Permite registrar, emitir y gestionar eventos de manera eficiente
 */
class EventManager {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
    this.globalListeners = new Map();
  }

  /**
   * Registra un listener para un evento
   * @param {string} eventName - Nombre del evento
   * @param {Function} callback - Función callback a ejecutar
   * @param {Object} options - Opciones del listener
   */
  on(eventName, callback, options = {}) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listener = {
      callback,
      options,
      id: this.generateListenerId(),
    };

    this.events.get(eventName).push(listener);

    if (options.once) {
      this.onceEvents.set(listener.id, eventName);
    }

    return listener.id;
  }

  /**
   * Registra un listener que se ejecuta solo una vez
   * @param {string} eventName - Nombre del evento
   * @param {Function} callback - Función callback a ejecutar
   * @param {Object} options - Opciones del listener
   */
  once(eventName, callback, options = {}) {
    options.once = true;
    return this.on(eventName, callback, options);
  }

  /**
   * Emite un evento a todos los listeners registrados
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos a pasar a los listeners
   */
  emit(eventName, data = null) {
    const listeners = this.events.get(eventName);
    if (!listeners) {
      return;
    }

    const listenersToRemove = [];

    listeners.forEach(listener => {
      try {
        listener.callback(data, eventName);

        // Si es un evento de una sola vez, marcarlo para remover
        if (listener.options.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`❌ Error en listener del evento ${eventName}:`, error);
      }
    });

    // Remover listeners de una sola vez
    listenersToRemove.forEach(id => {
      this.removeListenerById(id);
    });

    // Emitir a listeners globales
    this.emitToGlobalListeners(eventName, data);
  }

  /**
   * Emite un evento a listeners globales
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emitToGlobalListeners(eventName, data) {
    this.globalListeners.forEach((callback, pattern) => {
      if (this.matchesPattern(eventName, pattern)) {
        try {
          callback(data, eventName);
        } catch (error) {
          console.error(
            `❌ Error en listener global del evento ${eventName}:`,
            error
          );
        }
      }
    });
  }

  /**
   * Verifica si un nombre de evento coincide con un patrón
   * @param {string} eventName - Nombre del evento
   * @param {string} pattern - Patrón a verificar
   * @returns {boolean} True si coincide
   */
  matchesPattern(eventName, pattern) {
    if (pattern === '*' || pattern === eventName) {
      return true;
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return eventName.startsWith(prefix);
    }

    if (pattern.startsWith('*')) {
      const suffix = pattern.slice(1);
      return eventName.endsWith(suffix);
    }

    return false;
  }

  /**
   * Registra un listener global que escucha múltiples eventos
   * @param {string} pattern - Patrón de eventos a escuchar
   * @param {Function} callback - Función callback a ejecutar
   */
  onGlobal(pattern, callback) {
    this.globalListeners.set(pattern, callback);
  }

  /**
   * Remueve un listener específico
   * @param {string} eventName - Nombre del evento
   * @param {Function} callback - Función callback a remover
   */
  off(eventName, callback) {
    const listeners = this.events.get(eventName);
    if (!listeners) {
      return;
    }

    const index = listeners.findIndex(
      listener => listener.callback === callback
    );
    if (index !== -1) {
      const listener = listeners[index];
      listeners.splice(index, 1);

      // Remover de eventos de una sola vez si es necesario
      if (this.onceEvents.has(listener.id)) {
        this.onceEvents.delete(listener.id);
      }
    }
  }

  /**
   * Remueve un listener por ID
   * @param {string} listenerId - ID del listener
   */
  removeListenerById(listenerId) {
    // Buscar en todos los eventos
    for (const [eventName, listeners] of this.events) {
      const index = listeners.findIndex(listener => listener.id === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);

        // Remover de eventos de una sola vez
        if (this.onceEvents.has(listenerId)) {
          this.onceEvents.delete(listenerId);
        }

        // Si no hay más listeners para este evento, remover el evento
        if (listeners.length === 0) {
          this.events.delete(eventName);
        }

        break;
      }
    }
  }

  /**
   * Remueve todos los listeners de un evento específico
   * @param {string} eventName - Nombre del evento
   */
  removeAllListeners(eventName) {
    const listeners = this.events.get(eventName);
    if (listeners) {
      // Remover de eventos de una sola vez
      listeners.forEach(listener => {
        if (this.onceEvents.has(listener.id)) {
          this.onceEvents.delete(listener.id);
        }
      });

      this.events.delete(eventName);
    }
  }

  /**
   * Remueve todos los listeners de todos los eventos
   */
  removeAllListeners() {
    this.events.clear();
    this.onceEvents.clear();
    this.globalListeners.clear();
  }

  /**
   * Obtiene el número de listeners para un evento
   * @param {string} eventName - Nombre del evento
   * @returns {number} Número de listeners
   */
  listenerCount(eventName) {
    const listeners = this.events.get(eventName);
    return listeners ? listeners.length : 0;
  }

  /**
   * Obtiene todos los nombres de eventos registrados
   * @returns {Array} Array de nombres de eventos
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Genera un ID único para un listener
   * @returns {string} ID único
   */
  generateListenerId() {
    return (
      'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Emite un evento de manera asíncrona
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   */
  emitAsync(eventName, data = null) {
    setTimeout(() => {
      this.emit(eventName, data);
    }, 0);
  }

  /**
   * Emite un evento después de un delay
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   * @param {number} delay - Delay en milisegundos
   */
  emitDelayed(eventName, data = null, delay = 1000) {
    setTimeout(() => {
      this.emit(eventName, data);
    }, delay);
  }

  /**
   * Emite un evento solo si no hay otros eventos pendientes
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   * @param {number} debounceTime - Tiempo de debounce en milisegundos
   */
  emitDebounced(eventName, data = null, debounceTime = 300) {
    if (this.debounceTimers && this.debounceTimers[eventName]) {
      clearTimeout(this.debounceTimers[eventName]);
    }

    if (!this.debounceTimers) {
      this.debounceTimers = {};
    }

    this.debounceTimers[eventName] = setTimeout(() => {
      this.emit(eventName, data);
      delete this.debounceTimers[eventName];
    }, debounceTime);
  }

  /**
   * Emite un evento solo si ha pasado un tiempo mínimo desde la última emisión
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos del evento
   * @param {number} throttleTime - Tiempo mínimo entre emisiones en milisegundos
   */
  emitThrottled(eventName, data = null, throttleTime = 1000) {
    if (!this.lastEmitTimes) {
      this.lastEmitTimes = {};
    }

    const now = Date.now();
    const lastEmitTime = this.lastEmitTimes[eventName] || 0;

    if (now - lastEmitTime >= throttleTime) {
      this.emit(eventName, data);
      this.lastEmitTimes[eventName] = now;
    }
  }

  /**
   * Obtiene información de debug sobre los eventos registrados
   * @returns {Object} Información de debug
   */
  getDebugInfo() {
    const info = {
      totalEvents: this.events.size,
      totalListeners: 0,
      onceEvents: this.onceEvents.size,
      globalListeners: this.globalListeners.size,
      events: {},
    };

    for (const [eventName, listeners] of this.events) {
      info.events[eventName] = {
        listenerCount: listeners.length,
        hasOnceListeners: listeners.some(l => l.options.once),
      };
      info.totalListeners += listeners.length;
    }

    return info;
  }

  /**
   * Limpia todos los recursos del gestor de eventos
   */
  cleanup() {
    this.removeAllListeners();

    if (this.debounceTimers) {
      Object.values(this.debounceTimers).forEach(timer => {
        clearTimeout(timer);
      });
      this.debounceTimers = {};
    }

    this.lastEmitTimes = {};

    console.log('🧹 EventManager limpiado');
  }
}
