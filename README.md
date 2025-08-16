# Sistema de Gestión Documental - Módulo de Trámites

Una aplicación web moderna y escalable para la gestión de trámites y procedimientos académicos, desarrollada con programación orientada a objetos y arquitectura MVC.

## 🚀 Características

- **Programación Orientada a Objetos**: Código estructurado y reutilizable
- **Arquitectura MVC**: Separación clara de responsabilidades
- **Interfaz Responsiva**: Diseño adaptativo con Bootstrap 5
- **Iconos FontAwesome**: Interfaz moderna y atractiva
- **Persistencia Local**: Almacenamiento en localStorage
- **Validación de Formularios**: Validación en tiempo real
- **Operaciones CRUD**: Crear, Leer, Actualizar, Eliminar trámites
- **Funcionalidades Avanzadas**: Duplicar, exportar, importar datos

## 📋 Funcionalidades

### Gestión de Trámites

- ✅ Crear nuevos trámites con información completa
- ✅ Editar trámites existentes
- ✅ Eliminar trámites con confirmación
- ✅ Duplicar trámites para reutilización
- ✅ Ver detalles completos de cada trámite

### Campos del Trámite

- **Nombre del trámite/procedimiento**: Campo de texto
- **Área del trámite**: Select con opciones predefinidas
- **Periodo Aplicable**: Año + Semestre (I, II, III, IV)
- **Programa académico**: Programa + Sede + Jornada
- **Fechas importantes**: Inicio, Finalización, Subsanación

### Características Técnicas

- **Validación de fechas**: Lógica de negocio para fechas
- **Estados automáticos**: Basados en fechas actuales
- **Búsqueda y filtrado**: Por múltiples criterios
- **Exportación/Importación**: Datos en formato JSON
- **Datos de ejemplo**: Generación automática para pruebas

## 🏗️ Arquitectura del Proyecto

```
Proyecto 22 - Creación de trámite/
├── index.html                 # Página principal
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos personalizados
│   └── js/
│       ├── models/
│       │   └── Tramite.js    # Modelo de datos
│       ├── services/
│       │   └── TramiteService.js # Lógica de negocio
│       ├── controllers/
│       │   └── TramiteController.js # Controlador principal
│       ├── views/
│       │   └── TramiteView.js # Vista y UI
│       └── app.js            # Aplicación principal
└── README.md                 # Documentación
```

## 🎯 Patrón MVC Implementado

### Model (Tramite.js)

- Representa la estructura de datos de un trámite
- Maneja validaciones y lógica de negocio del modelo
- Métodos para formateo y manipulación de datos

### View (TramiteView.js)

- Maneja la presentación y renderizado de datos
- Gestiona modales, formularios y alertas
- Responsable de la interfaz de usuario

### Controller (TramiteController.js)

- Coordina entre Model y View
- Maneja eventos y acciones del usuario
- Controla el flujo de la aplicación

### Service (TramiteService.js)

- Maneja la persistencia de datos (localStorage)
- Operaciones CRUD y búsquedas
- Lógica de negocio compleja

## 🚀 Instalación y Uso

### Requisitos

- Navegador web moderno
- Servidor web local (opcional, para desarrollo)

### Instalación

1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. ¡Listo para usar!

### Uso Local con Servidor

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

## ⌨️ Atajos de Teclado

- **Ctrl/Cmd + N**: Crear nuevo trámite
- **Ctrl/Cmd + S**: Guardar (cuando el modal esté abierto)
- **Escape**: Cerrar modales
- **Doble clic en tabla**: Generar datos de ejemplo
- **Doble clic en header**: Mostrar información de la app

## 🔧 Funciones de Desarrollo

Accesibles desde la consola del navegador:

```javascript
// Limpiar todos los datos
appUtils.clearLocalStorage();

// Exportar datos a JSON
appUtils.exportData();

// Importar datos desde JSON
appUtils.importData();

// Generar datos de ejemplo
appUtils.generateSampleData(5);

// Mostrar información de la app
appUtils.showAppInfo();
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:

- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Escritorio

## 🎨 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y animaciones
- **JavaScript ES6+**: Programación orientada a objetos
- **Bootstrap 5**: Framework CSS responsivo
- **FontAwesome 6**: Iconografía moderna
- **localStorage**: Persistencia de datos

## 🔄 Flujo de Trabajo

1. **Crear Trámite**: Click en "Crear Trámite" → Llenar formulario → Guardar
2. **Editar Trámite**: Click en opciones (⋮) → Editar → Modificar → Guardar
3. **Ver Detalles**: Click en opciones (⋮) → Ver detalles
4. **Duplicar Trámite**: Click en opciones (⋮) → Duplicar
5. **Eliminar Trámite**: Click en opciones (⋮) → Eliminar → Confirmar

## 🛡️ Validaciones Implementadas

- **Campos requeridos**: Todos los campos son obligatorios
- **Fechas**: Validación de lógica de fechas
- **Nombres únicos**: No se permiten trámites con el mismo nombre
- **Formato de datos**: Validación de tipos y formatos

## 📊 Estados de Trámites

Los trámites tienen estados automáticos basados en fechas:

- **Pendiente**: Fecha de inicio futura
- **Activo**: Entre fecha de inicio y finalización
- **Subsanación**: En periodo de subsanación
- **Finalizado**: Después de todas las fechas

## 📋 Caso de Uso: Gestión de Trámites y Documentos

### Caso de Uso 2: Configuración de Fechas, Documentos y Reglas de Negocio para Trámites

**Nombre del Caso de Uso**: Configuración y Gestión de Reglas de Visibilidad y Requisitos de Trámites.

**Actor Principal**: Administrador del sistema.

**Actores Secundarios**:

- Usuario (Aspirante, Admitido, Estudiante)
- Sistema de Gestión Documental
- Base de datos local (localStorage)

**Propósito**: Permitir al administrador definir y gestionar de forma autónoma las reglas de negocio para la visibilidad de los trámites, especificar los documentos requeridos y los datos asociados a cada anexo, y determinar las fechas de habilitación en el sistema web.

**Precondiciones**:

- El administrador posee acceso al sistema de gestión
- Los tipos de usuario, periodos académicos y programas académicos están definidos
- La estructura de datos para trámites está implementada

**Flujo Normal (Pasos Detallados)**:

1. **Acceso al Sistema**: El Administrador accede al módulo de gestión de trámites.

2. **Creación/Edición de Trámite**: El Administrador define un nuevo trámite o selecciona uno existente.

3. **Configuración de Atributos del Trámite**:

   - **ID de Trámite**: Identificador único del trámite
   - **Nombre del Trámite**: Nombre descriptivo del procedimiento
   - **Periodo Académico**: Año y semestre aplicable (ej. 2024-I, 2024-II)
   - **Sede**: Sede de la universidad (Principal, Norte, Sur)
   - **Jornada**: Jornada académica (Diurna, Nocturna)
   - **Fechas de Habilitación**:
     - Fecha de Inicio
     - Fecha de Finalización
     - Fecha de Inicio de Subsanación
     - Fecha de Fin de Subsanación

4. **Gestión de Documentos**:

   - **Añadir Documentos**: El administrador puede agregar documentos requeridos para el trámite
   - **Tipo Documental**: Selección del tipo de documento (Solicitud, Certificado, Constancia, etc.)
   - **Área Solicitante**: Área de la universidad que solicita el documento
   - **Responsable de Validación**: Persona responsable de validar el documento
   - **Datos Requeridos**: Campos dinámicos que el usuario debe completar:
     - Nombre del Campo
     - Tipo de Campo (Fecha, Texto, Numérico)

5. **Reglas de Visibilidad**:

   - **Estado Automático**: El sistema calcula automáticamente el estado basado en las fechas:
     - **Pendiente**: Antes de la fecha de inicio
     - **Activo**: Entre fecha de inicio y finalización
     - **Subsanación**: En periodo de subsanación
     - **Finalizado**: Después de todas las fechas
   - **Estado Manual**: El administrador puede activar/inactivar manualmente cuando el estado automático lo permita

6. **Visualización de Documentos**:
   - **Ver Documentos**: El administrador puede ver todos los documentos asociados al trámite
   - **Gestión de Documentos**: Eliminar, editar documentos existentes
   - **Datos Requeridos**: Ver los campos requeridos para cada documento

**Flujos Alternativos / Excepciones**:

- **Estado No Modificable**: Si el trámite está en estado automático (pendiente, subsanación, finalizado), no se puede cambiar manualmente
- **Documentos Obligatorios**: Si un documento es marcado como obligatorio, el usuario debe completarlo
- **Fechas Inválidas**: El sistema valida que las fechas tengan lógica temporal
- **Documentos Duplicados**: No se permiten documentos duplicados en el mismo trámite

**Postcondiciones**:

- Los trámites están configurados con sus reglas de visibilidad
- Los documentos requeridos están definidos con sus campos asociados
- El sistema calcula automáticamente los estados basados en fechas
- La información se almacena persistentemente en localStorage

**Requerimientos Específicos**:

- **Persistencia**: Todos los datos se almacenan en localStorage del navegador
- **Validación**: Validación en tiempo real de formularios y fechas
- **Interfaz Responsiva**: Funciona en dispositivos móviles y de escritorio
- **Estados Dinámicos**: Los estados se calculan automáticamente según las fechas
- **Gestión de Documentos**: Sistema completo de CRUD para documentos

**Estructura de Datos Implementada**:

```javascript
// Estructura del Trámite
{
  id: "tramite_123",
  nombre: "Solicitud de Certificado",
  periodoAnio: "2024",
  periodoSemestre: "I",
  sede: "Principal",
  jornada: "Diurna",
  fechaInicio: "2024-01-15",
  fechaFinalizacion: "2024-06-30",
  fechaInicioSubsanacion: "2024-07-01",
  fechaFinSubsanacion: "2024-07-15",
  estado: "activo", // automático o manual
  fechaCreacion: "2024-01-01T00:00:00.000Z",
  fechaModificacion: "2024-01-01T00:00:00.000Z"
}

// Estructura del Documento
{
  id: "doc_123",
  tramiteId: "tramite_123",
  tipoDocumental: "Certificado",
  areaSolicitante: "Académica",
  responsableValidacion: "Dr. Juan Pérez",
  datosRequeridos: [
    {
      nombre: "Nombre completo",
      tipo: "texto"
    },
    {
      nombre: "Fecha de nacimiento",
      tipo: "fecha"
    }
  ],
  fechaCreacion: "2024-01-01T00:00:00.000Z"
}
```

### 🔄 Diferencias con el Caso de Uso Original

**Adaptaciones Realizadas para el Sistema Implementado**:

#### **1. Simplificación de Actores**

- **Original**: Múltiples sistemas (SAIA®, SIRA, SAC, Bus de Datos UNIVALLE)
- **Implementado**: Sistema único con localStorage como base de datos

#### **2. Gestión de Usuarios**

- **Original**: Tipos de usuario específicos (Aspirante, Admitido, Estudiante)
- **Implementado**: Sistema de administrador único para gestión de trámites

#### **3. Estructura de Datos**

- **Original**: Tabla CF_CONFIGURACION_TRAMITES_SAIA con múltiples campos
- **Implementado**: Estructura simplificada pero funcional con localStorage

#### **4. Reglas de Visibilidad**

- **Original**: Basadas en tipo de usuario, periodo, programa académico
- **Implementado**: Basadas en fechas y estado manual/automático

#### **5. Gestión de Documentos**

- **Original**: Lista estructurada con ID_DOCUMENTO, ES_OBLIGATORIO
- **Implementado**: Sistema dinámico con campos personalizables

#### **6. Validación y Permisos**

- **Original**: ROL_VALIDADOR específico de SAIA®
- **Implementado**: Responsable de validación como campo de texto

#### **7. Persistencia**

- **Original**: Base de datos centralizada SAIA®
- **Implementado**: localStorage del navegador

### ✅ Funcionalidades Implementadas vs Original

| Funcionalidad Original    | Estado Implementado | Observaciones                          |
| ------------------------- | ------------------- | -------------------------------------- |
| Configuración de trámites | ✅ Implementado     | Estructura simplificada pero funcional |
| Gestión de fechas         | ✅ Implementado     | Fechas de inicio, fin y subsanación    |
| Estados automáticos       | ✅ Implementado     | Basado en fechas actuales              |
| Gestión de documentos     | ✅ Implementado     | Sistema dinámico de campos             |
| Validación de datos       | ✅ Implementado     | Validación en tiempo real              |
| Interfaz de usuario       | ✅ Implementado     | Responsiva y moderna                   |
| Persistencia de datos     | ✅ Implementado     | localStorage                           |
| Reglas de negocio         | ✅ Implementado     | Estados automáticos y manuales         |

### 🎯 Funcionalidades Clave Mantenidas

1. **Estados Automáticos**: El sistema calcula automáticamente el estado basado en fechas
2. **Gestión de Documentos**: Sistema completo para agregar, ver y eliminar documentos
3. **Campos Dinámicos**: Posibilidad de agregar campos personalizados a los documentos
4. **Validación**: Validación de fechas y campos requeridos
5. **Interfaz Intuitiva**: Diseño moderno y fácil de usar

## 🔮 Funcionalidades Futuras

- [ ] Filtros avanzados
- [ ] Paginación para grandes volúmenes
- [ ] Búsqueda en tiempo real
- [ ] Notificaciones push
- [ ] Exportación a PDF/Excel
- [ ] Integración con APIs externas
- [ ] Sistema de usuarios y permisos
- [ ] Backup automático en la nube

## 🤝 Contribución

Este proyecto está diseñado para ser escalable y extensible. Para contribuir:

1. Mantén la arquitectura MVC
2. Sigue las convenciones de nomenclatura
3. Documenta nuevas funcionalidades
4. Prueba en diferentes dispositivos

## 📄 Licencia

Este proyecto es de uso educativo y puede ser modificado libremente.

## 👨‍💻 Autor

Desarrollado como parte del Proyecto 22 - Creación de trámite.

---

**¡Disfruta usando el Sistema de Gestión Documental! 🎉**
