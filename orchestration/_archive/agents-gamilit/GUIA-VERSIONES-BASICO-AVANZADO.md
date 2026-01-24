# Guía: Versiones Base vs Avanzadas de Agentes NEXUS

**Fecha:** 2026-01-10
**Versión:** 1.0
**Aplica a:** BACKEND, FRONTEND, DATABASE

---

## Resumen

El sistema NEXUS ofrece dos versiones de los perfiles principales:

| Tipo | Características | Uso Recomendado |
|------|-----------------|-----------------|
| **Base** | Ligero, enfocado en ejecución | Tareas simples y rápidas |
| **Avanzado** | Validación integrada, auto-documentación | Tareas críticas y complejas |

---

## Comparación Detallada

### NEXUS-BACKEND

| Característica | Base (14.7KB) | Avanzado (30.8KB) |
|----------------|---------------|-------------------|
| Desarrollo NestJS | ✅ | ✅ |
| APIs REST/GraphQL | ✅ | ✅ |
| Testing backend | ✅ | ✅ |
| Validación automática vs docs | ❌ | ✅ |
| Actualización de HUs | ❌ | ✅ |
| Reportes de completitud | ❌ | ✅ |
| Detección de incoherencias | ❌ | ✅ |

**Cuándo usar Base:**
- Implementación de endpoints simples
- Fixes rápidos
- Tareas con especificaciones claras

**Cuándo usar Avanzado:**
- Features complejas que cruzan múltiples módulos
- Trabajo que requiere actualizar documentación
- Antes de releases importantes

---

### NEXUS-FRONTEND

| Característica | Base (4.2KB) | Avanzado (34.5KB) |
|----------------|--------------|-------------------|
| Desarrollo React | ✅ | ✅ |
| Componentes/Hooks | ✅ | ✅ |
| Testing frontend | ✅ | ✅ |
| Sincronización con API | ❌ | ✅ |
| Reportes UI/UX | ❌ | ✅ |
| Validación de contratos | ❌ | ✅ |

**Cuándo usar Base:**
- Componentes aislados
- Estilos y ajustes visuales
- Prototipos rápidos

**Cuándo usar Avanzado:**
- Páginas completas con múltiples integraciones
- Refactoring de componentes compartidos
- Cambios que afectan contratos de API

---

### NEXUS-DATABASE

| Característica | Base (2.7KB) | Avanzado (38KB) |
|----------------|--------------|-----------------|
| Diseño DDL | ✅ | ✅ |
| Seeds | ✅ | ✅ |
| RLS básico | ✅ | ✅ |
| Auditoría de políticas RLS | ❌ | ✅ |
| Documentación de esquemas | ❌ | ✅ |
| Validación de integridad | ❌ | ✅ |

**Cuándo usar Base:**
- Agregar columnas simples
- Seeds de datos
- Índices básicos

**Cuándo usar Avanzado:**
- Cambios de esquema que afectan múltiples tablas
- Implementación o modificación de RLS
- Migraciones críticas

---

## Reglas de Selección

```
SI la tarea es:
   - Simple (< 2 horas estimadas)
   - Aislada (no afecta otros módulos)
   - Con specs claras
ENTONCES → Usar versión BASE

SI la tarea es:
   - Compleja (> 2 horas estimadas)
   - Cruzada (afecta múltiples módulos)
   - Requiere documentación
   - Antes de release
ENTONCES → Usar versión AVANZADA
```

---

## Migración entre Versiones

Es posible iniciar con versión Base y migrar a Avanzada si la complejidad aumenta:

1. Documentar progreso actual
2. Guardar estado en `orchestration/ESTADO-{PERFIL}.json`
3. Reiniciar con perfil Avanzado
4. Cargar estado guardado

---

## Perfiles sin Versión Avanzada

Los siguientes perfiles solo existen en versión única:

- **NEXUS-DEVOPS** - Ya incluye validación de infraestructura
- **NEXUS-INTEGRATION** - Por definición valida todo
- **NEXUS-TESTING** - Especializado en testing únicamente
- **NEXUS-VALIDATION** - Especializado en validación
- **NEXUS-COMPLETITUD** - Especializado en completitud

---

**Recomendación general:** En caso de duda, usar la versión Avanzada. El overhead adicional de tokens se compensa con mejor calidad de entregables.
