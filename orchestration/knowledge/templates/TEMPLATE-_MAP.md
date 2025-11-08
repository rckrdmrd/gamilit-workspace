# 🗺️ Mapa de Navegación: [Nombre del Módulo/Directorio]

> **Propósito**: Este archivo _MAP.md sirve como índice navegable para el directorio actual, facilitando la exploración y comprensión de la estructura de documentación del proyecto Gamilit.

---

## 📋 Contenido del Directorio

### Archivos Principales

| Archivo | Descripción | Estado | Última Actualización |
|---------|-------------|--------|----------------------|
| **[ARCHIVO-1.md](./ARCHIVO-1.md)** | Descripción breve del archivo | ✅ Completo | YYYY-MM-DD |
| **[ARCHIVO-2.md](./ARCHIVO-2.md)** | Descripción breve del archivo | 🟡 En progreso | YYYY-MM-DD |
| **[ARCHIVO-3.md](./ARCHIVO-3.md)** | Descripción breve del archivo | 🔴 Pendiente | YYYY-MM-DD |

### Subdirectorios

| Directorio | Descripción | Archivos | Estado |
|------------|-------------|----------|--------|
| **[subdir-1/](./subdir-1/_MAP.md)** | Descripción del subdirectorio | X archivos | ✅ |
| **[subdir-2/](./subdir-2/_MAP.md)** | Descripción del subdirectorio | Y archivos | 🟡 |

---

## 🎯 Documentos Clave

### Por Prioridad

#### Alta Prioridad
- **[RF-XXX-001](./RF-XXX-001-titulo.md)** - [Título] (⭐⭐⭐)
- **[RF-XXX-002](./RF-XXX-002-titulo.md)** - [Título] (⭐⭐⭐)

#### Media Prioridad
- **[RF-XXX-003](./RF-XXX-003-titulo.md)** - [Título] (⭐⭐)

#### Baja Prioridad
- **[RF-XXX-004](./RF-XXX-004-titulo.md)** - [Título] (⭐)

### Por Categoría

#### Requerimientos Funcionales (RF)
- [RF-XXX-001](./RF-XXX-001-titulo.md) - Título del requerimiento
- [RF-XXX-002](./RF-XXX-002-titulo.md) - Título del requerimiento

#### Especificaciones Técnicas (ET)
- [ET-XXX-001](../02-especificaciones-tecnicas/modulo/ET-XXX-001-titulo.md) - Título de la especificación

#### Documentación General
- [README.md](./README.md) - Introducción al módulo
- [GUIA.md](./GUIA.md) - Guía de uso

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Total de archivos** | XX |
| **Documentos completados** | XX (XX%) |
| **En progreso** | XX (XX%) |
| **Pendientes** | XX (XX%) |
| **Última actualización** | YYYY-MM-DD |

---

## 🔗 Enlaces Relacionados

### Documentación Padre
- [⬆️ Regresar al nivel superior](../_MAP.md)
- [🏠 Ir a documentación raíz](../../_MAP.md)

### Módulos Relacionados
- [Módulo Relacionado 1](../modulo-1/_MAP.md)
- [Módulo Relacionado 2](../modulo-2/_MAP.md)

### Implementación
- [📂 Código Backend](../../../apps/backend/src/modules/module/)
- [📂 Código Frontend](../../../apps/frontend/src/features/module/)
- [🗄️ Esquema DDL](../../../apps/database/ddl/schemas/schema/)

---

## 📝 Guía de Uso

### Para Nuevos Miembros del Equipo

1. **Empezar por aquí**: Lee el [README.md](./README.md) para entender el contexto
2. **Revisar requerimientos**: Revisa los documentos RF-XXX para entender funcionalidades
3. **Estudiar arquitectura**: Lee las especificaciones ET-XXX para detalles técnicos
4. **Ver ejemplos**: Consulta [EJEMPLOS.md](./EJEMPLOS.md) para casos de uso

### Para Desarrollo

1. **Antes de codificar**: Verifica que exista el RF correspondiente
2. **Durante desarrollo**: Consulta el ET para detalles de implementación
3. **Después de implementar**: Actualiza el estado en este _MAP.md

### Para QA/Testing

1. **Criterios de aceptación**: Busca en documentos RF-XXX
2. **Casos de prueba**: Consulta sección "Testing" en documentos ET-XXX
3. **Flujos completos**: Revisa casos de uso en RF-XXX

---

## ⚠️ Notas Importantes

### Convenciones de Nomenclatura

- **RF-XXX-NNN**: Requerimientos Funcionales
  - XXX = Código del módulo (ej: AUTH, GAM, EDU)
  - NNN = Número secuencial (001, 002, 003...)

- **ET-XXX-NNN**: Especificaciones Técnicas
  - Sigue la misma convención que RF

### Estados de Documentos

| Emoji | Estado | Descripción |
|-------|--------|-------------|
| ✅ | Completado | Documento finalizado y revisado |
| 🟡 | En progreso | Documento en proceso de escritura |
| 🔴 | Pendiente | Documento no iniciado |
| ⏸️  | En pausa | Documento pausado temporalmente |
| 🔄 | Requiere actualización | Documento desactualizado |

### Proceso de Actualización

1. Al crear un nuevo documento, agregarlo a la tabla "Archivos Principales"
2. Actualizar estadísticas
3. Si es alta prioridad, agregarlo a "Documentos Clave"
4. Actualizar fecha de "Última Actualización"

---

## 📚 Recursos Adicionales

### Plantillas

- [Template RF](../../templates/TEMPLATE-RF.md) - Para crear nuevos requerimientos
- [Template ET](../../templates/TEMPLATE-ET.md) - Para crear nuevas especificaciones
- [Template _MAP](../../templates/TEMPLATE-_MAP.md) - Para crear nuevos mapas

### Guías

- [GUIA-REFERENCIAS-SIMCO.md](../../apps/database/ddl/GUIA-REFERENCIAS-SIMCO.md)
- [Convenciones de Documentación](../../standards/documentation-conventions.md)

---

## 🔄 Historial de Cambios

| Fecha | Cambios | Autor |
|-------|---------|-------|
| YYYY-MM-DD | Creación del _MAP.md | [Autor] |
| YYYY-MM-DD | Agregados documentos RF-XXX-001 a RF-XXX-003 | [Autor] |

---

**Última actualización**: YYYY-MM-DD
**Mantenido por**: [Nombre del Equipo/Persona]
**Contacto**: [email/slack]

---

*Este mapa de navegación es parte del sistema SIMCO (Sistema Indexado Modular por COntexto) implementado en el proyecto Gamilit.*
