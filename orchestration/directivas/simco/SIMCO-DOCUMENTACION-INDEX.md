# SIMCO: Índice de Directivas de Documentación

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Alias:** @DOC_INDEX
**Propósito:** Punto de entrada unificado para directivas de documentación

---

## Resumen Ejecutivo

El sistema de documentación SIMCO se compone de 4 directivas complementarias.
Use este índice para identificar cuál directiva consultar según su necesidad.

---

## Matriz de Selección

| Pregunta | Directiva a Consultar |
|----------|----------------------|
| ¿QUÉ debo documentar? | @DOCUMENTAR |
| ¿DÓNDE documento en Suite/Vertical? | @DOC_SUITE |
| ¿CÓMO organizo la estructura? | @DOC_PROYECTO |
| ¿CUÁNDO y cómo mantengo docs? | @MANTENIMIENTO_DOCS |

---

## Directivas Componentes

### 1. SIMCO-DOCUMENTAR.md
**Alias:** @DOCUMENTAR
**Propósito:** Proceso general de documentación - QUÉ documentar

```yaml
Contenido Principal:
  - Checklist de documentación (al iniciar, durante, al completar)
  - Tipos de documentación:
    - Documentación inline (SQL COMMENT, JSDoc, TSDoc)
    - Inventarios (@INVENTORY)
    - Trazas (@TRAZA_*)
    - Próxima acción (@PROXIMA)
    - Reportes de entrega
  - Templates para cada tipo
  - Matriz de documentación por tipo de tarea
```

**Usar cuando:** Necesitas saber qué artefactos de documentación crear para una tarea.

---

### 2. SIMCO-DOCUMENTAR-SUITE.md
**Alias:** @DOC_SUITE
**Propósito:** Extensión para arquitectura Suite/Vertical - DÓNDE documentar

```yaml
Contenido Principal:
  - Matriz de decisión: dónde documentar según rol (Suite/Core/Vertical)
  - Niveles de inventarios (Vertical → Core → Suite)
  - Procedimientos por escenario:
    - Crear tabla específica en vertical
    - Modificar tabla core desde vertical
    - Crear funcionalidad reutilizable
    - Propagar cambio de core a verticales
  - Flujo de propagación de documentación
  - Integración con sistema de Mirrors
```

**Usar cuando:** Trabajas en proyectos ERP con arquitectura jerárquica.

---

### 3. SIMCO-DOCUMENTACION-PROYECTO.md
**Alias:** @DOC_PROYECTO
**Propósito:** Estructura obligatoria de carpetas - CÓMO organizar

```yaml
Contenido Principal:
  - Estructura obligatoria de /docs/
  - Estructura obligatoria de /orchestration/
  - Archivos mínimos por tipo de proyecto (Standalone, Suite, Core, Vertical)
  - API Versioning estándar
  - Ciclo de vida de documentos
  - Validaciones requeridas (frontmatter, referencias, estados)
```

**Usar cuando:** Creas un nuevo proyecto o verificas conformidad estructural.

---

### 4. SIMCO-MANTENIMIENTO-DOCUMENTACION.md
**Alias:** @MANTENIMIENTO_DOCS
**Propósito:** Ciclo de mantenimiento - CUÁNDO y cómo mantener

```yaml
Contenido Principal:
  - Triggers de mantenimiento (post-tarea, post-fase, post-DDL)
  - Ciclo de 6 pasos:
    1. IDENTIFICAR - alcance del mantenimiento
    2. SINCRONIZAR - alinear docs con realidad
    3. VALIDAR - verificar coherencia
    4. DEPRECAR - marcar obsoletos
    5. PURGAR - eliminar redundancia
    6. VERIFICAR - confirmar éxito
  - Validación de dependencias (verticales y horizontales)
  - Sincronización BD ↔ Docs ↔ Código
  - Protocolo de deprecación
  - Integración con CAPVED (Fase M opcional)
  - Carga de contexto para subagentes
```

**Usar cuando:** Completas una tarea/fase y necesitas mantener docs actualizados.

---

## Flujo de Uso Recomendado

```
ANTES de implementar:
    └── @DOC_PROYECTO → Verificar estructura existe
    └── @DOCUMENTAR → Identificar qué documentar

DURANTE implementación:
    └── @DOC_SUITE → Si es proyecto jerárquico, decidir dónde
    └── @DOCUMENTAR → Seguir checklist

DESPUÉS de implementar:
    └── @MANTENIMIENTO_DOCS → Ciclo de mantenimiento
    └── @DOC_PROYECTO → Verificar conformidad
```

---

## Dependencias Entre Directivas

```
@DOC_PROYECTO (estructura base)
    ↓
@DOCUMENTAR (proceso general)
    ↓
@DOC_SUITE (extensión jerárquica) ←── Solo si aplica
    ↓
@MANTENIMIENTO_DOCS (ciclo post-tarea)
```

---

## Referencias Cruzadas

| Desde | Referencia a | Propósito |
|-------|--------------|-----------|
| @DOCUMENTAR | @DOC_PROYECTO | Estructura de archivos |
| @DOCUMENTAR | @MANTENIMIENTO_DOCS | Validación final |
| @DOC_SUITE | @DOCUMENTAR | Directiva base |
| @DOC_SUITE | TRIGGER-PROPAGACION-AUTOMATICA | Automatización |
| @MANTENIMIENTO_DOCS | @DOC_PROYECTO | Validación estructura |
| @MANTENIMIENTO_DOCS | @SYNC_BD | Sincronización BD |

---

## Checklist de Conformidad

```
Para cualquier tarea de documentación:
[ ] ¿Consulté @DOCUMENTAR para saber qué documentar?
[ ] ¿La estructura sigue @DOC_PROYECTO?
[ ] ¿Si es Suite/Vertical, apliqué @DOC_SUITE?
[ ] ¿Ejecuté ciclo de @MANTENIMIENTO_DOCS al finalizar?
```

---

**Sistema:** SIMCO v3.8+ con SAAD
**Última actualización:** 2026-01-16
