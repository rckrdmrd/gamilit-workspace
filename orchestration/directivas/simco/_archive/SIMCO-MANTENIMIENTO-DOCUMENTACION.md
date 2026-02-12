# SIMCO: MANTENIMIENTO DE DOCUMENTACIÓN

**Versión:** 1.0.0
**Alias:** @MANTENIMIENTO_DOCS
**Fecha:** 2026-01-10
**Categoría:** operaciones_documentacion
**Obligatoria:** SÍ (post-tarea/fase)

---

## RESUMEN EJECUTIVO

> **Principio:** La documentación es un activo vivo que requiere mantenimiento sistemático. Documentación desactualizada es peor que no tener documentación.

Esta directiva establece el ciclo obligatorio de mantenimiento, purga gradual y deprecación de documentación que debe ejecutarse después de completar tareas o fases significativas.

---

## 1. Propósito y Alcance

### 1.1 Propósito

- Garantizar coherencia entre documentación, código y base de datos
- Eliminar gradualmente documentación obsoleta
- Prevenir acumulación de deuda documental
- Asegurar que subagentes tengan contexto actualizado

### 1.2 Problemas que Resuelve

| Problema | Solución |
|----------|----------|
| Docs desactualizados post-implementación | Ciclo obligatorio de sincronización |
| Conflictos entre specs y código | Validación de dependencias |
| Históricos obsoletos sin deprecar | Protocolo de deprecación |
| Pérdida de contexto en subagentes | Carga automática de directivas |
| Scripts BD desincronizados | @SYNC_BD obligatorio |

### 1.3 Alcance

**Aplica a:**
- Toda documentación en `/docs/`
- Toda documentación en `/orchestration/`
- Inventarios YAML
- Scripts de base de datos
- Especificaciones técnicas

**No aplica a:**
- Código fuente (usar @VALIDAR)
- Configuración de CI/CD
- Archivos de lock (package-lock.json, etc.)

---

## 2. Principios Fundamentales

### 2.1 Documentación como Activo Vivo

```
La documentación NO es un entregable único.
Es un activo que evoluciona con el proyecto.
```

### 2.2 Coherencia sobre Completitud

```
Es mejor tener MENOS documentación COHERENTE
que MUCHA documentación INCONSISTENTE.
```

### 2.3 Purga Gradual, No Masiva

```
Purgar pequeñas cantidades frecuentemente.
NUNCA hacer purgas masivas que pierdan contexto histórico valioso.
```

### 2.4 Deprecación Antes de Eliminación

```
SIEMPRE deprecar con período de gracia (mínimo 30 días).
NUNCA eliminar documentación sin aviso previo.
```

### 2.5 Validación de Dependencias Obligatoria

```
Antes de declarar "tarea completada":
- Validar TODOS los documentos dependientes
- Validar TODOS los documentos de los que se depende
```

---

## 3. Triggers de Mantenimiento (Cuándo Aplicar)

### 3.1 Matriz de Decisión

| Evento | Mantenimiento | Nivel |
|--------|---------------|-------|
| Tarea completada (código) | OBLIGATORIO | Básico |
| Fase/Sprint completado | OBLIGATORIO | Completo |
| Cambio en DDL | OBLIGATORIO | @SYNC_BD |
| Cambio en API | OBLIGATORIO | Básico |
| Refactorización mayor | OBLIGATORIO | Completo |
| Corrección de bug menor | OPCIONAL | Básico |
| Auditoría mensual | OBLIGATORIO | Completo |

### 3.2 Niveles de Mantenimiento

**Básico:**
- Actualizar frontmatter (fechas, versiones)
- Verificar referencias directas
- Actualizar _MAP.md

**Completo:**
- Todo lo básico +
- Validar dependencias completas
- Ejecutar checklist @CHK_MANTENIMIENTO
- Deprecar obsoletos
- Purgar redundante

---

## 4. Ciclo de Mantenimiento (6 Pasos)

### 4.1 IDENTIFICAR

**Objetivo:** Determinar alcance del mantenimiento

```yaml
Acciones:
  - Listar documentos modificados en la tarea
  - Listar documentos con dependencia directa
  - Listar documentos dependientes
  - Identificar docs con >3 meses sin actualizar
  - Revisar _MAP.md de directorios afectados

Entregable:
  - Lista de documentos a revisar
  - Mapa de dependencias
```

### 4.2 SINCRONIZAR

**Objetivo:** Alinear documentación con realidad actual

```yaml
Acciones:
  - Actualizar specs vs código implementado
  - Sincronizar entities con DDL
  - Actualizar inventarios
  - Verificar ejemplos de código
  - Actualizar diagramas si aplica

Referencia: @SYNC_BD si hay cambios de BD

Entregable:
  - Documentos actualizados
  - Lista de cambios realizados
```

### 4.3 VALIDAR

**Objetivo:** Verificar coherencia y dependencias

```yaml
Acciones:
  - Validar referencias cruzadas
  - Verificar links internos
  - Confirmar build exitoso
  - Confirmar tests exitosos
  - Verificar scripts BD ejecutables

Entregable:
  - Checklist de validación completado
  - Lista de issues encontrados
```

### 4.4 DEPRECAR

**Objetivo:** Marcar documentos obsoletos

```yaml
Acciones:
  - Identificar docs que ya no aplican
  - Agregar bloque [DEPRECATED] (ver @TPL_DEPRECACION)
  - Establecer fecha de eliminación
  - Actualizar _MAP.md con estado
  - Notificar a equipos afectados

Entregable:
  - Lista de docs deprecados
  - Fechas de eliminación planificadas
```

### 4.5 PURGAR

**Objetivo:** Eliminar redundancia gradualmente

```yaml
Acciones:
  - Eliminar secciones duplicadas
  - Consolidar información repetida
  - Reducir verbosidad manteniendo esencia
  - Eliminar ejemplos obsoletos
  - Eliminar TODOs antiguos resueltos

Principio: Purgar máximo 10-20% por ciclo

Entregable:
  - Documentos optimizados
  - Registro de purgas realizadas
```

### 4.6 VERIFICAR

**Objetivo:** Confirmar mantenimiento exitoso

```yaml
Acciones:
  - Ejecutar @CHK_MANTENIMIENTO
  - Verificar todos los frontmatter actualizados
  - Confirmar inventarios al día
  - Validar build/tests finales
  - Documentar resultado

Entregable:
  - Checklist completado
  - Reporte de mantenimiento
```

---

## 5. Validación de Dependencias

### 5.1 Dependencias Verticales (Jerarquía)

```
Visión/Roadmap
    └── Épicas
        └── Historias de Usuario
            └── Especificaciones Técnicas
                └── Código Implementado
```

**Regla:** Cambio en nivel inferior DEBE reflejarse en niveles superiores si afecta alcance.

### 5.2 Dependencias Horizontales (Entre Capas)

```
DDL (schemas) ↔ Entities (backend) ↔ Types (frontend)
API Specs ↔ Controllers ↔ Services ↔ Repositories
Inventarios ↔ Código real ↔ Documentación
```

**Regla:** Cambio en una capa DEBE sincronizarse con capas adyacentes.

### 5.3 Matriz de Impacto de Cambios

| Cambio en | Impacta a |
|-----------|-----------|
| DDL (tabla) | Entity, DTO, Repository, Service, Controller, API Spec, Frontend Types, Tests, Inventario BD |
| Entity | DTO, Service, Tests, Inventario Backend |
| API Endpoint | Frontend Service, Tests, API Spec, Inventario |
| Componente UI | Tests, Inventario Frontend |

### 5.4 Checklist de Validación por Cambio

**Al modificar DDL:**
```
- [ ] Entity actualizada
- [ ] DTO actualizado
- [ ] Repository actualizado
- [ ] Service actualizado (si métodos afectados)
- [ ] Controller actualizado (si endpoints afectados)
- [ ] Tests actualizados
- [ ] Script create-database.sh actualizado
- [ ] DATABASE_INVENTORY actualizado
- [ ] Ejecutar recreación de BD exitosa
```

**Al modificar Backend:**
```
- [ ] DTOs consistentes con entities
- [ ] Tests actualizados
- [ ] API Spec actualizado
- [ ] Frontend types actualizados (si API cambió)
- [ ] BACKEND_INVENTORY actualizado
```

**Al modificar Frontend:**
```
- [ ] Types consistentes con API
- [ ] Tests actualizados
- [ ] FRONTEND_INVENTORY actualizado
```

---

## 6. Sincronización BD ↔ Docs ↔ Código

Para cambios que involucran base de datos, usar directiva complementaria:

**Referencia:** @SYNC_BD (SIMCO-SINCRONIZACION-BD.md)

### 6.1 Resumen del Flujo

```
1. Modificar DDL
2. Actualizar script create/recreate
3. Ejecutar recreación
4. Sincronizar Entity
5. Sincronizar DTO
6. Actualizar inventario
7. Documentar cambio
```

---

## 7. Protocolo de Deprecación

### 7.1 Cuándo Deprecar

- Documento reemplazado por versión nueva
- Funcionalidad eliminada del sistema
- Spec obsoleto por refactorización
- Información ya no aplica al estado actual

### 7.2 Formato de Marcado

Agregar al INICIO del documento:

```markdown
---
[DEPRECATED]
Fecha de deprecación: {YYYY-MM-DD}
Deprecado por: {Motivo o referencia}
Reemplazo: {Documento o recurso que lo reemplaza}
Eliminar después de: {YYYY-MM-DD}
---
```

**Referencia:** @TPL_DEPRECACION

### 7.3 Período de Gracia

| Tipo de Documento | Período Mínimo |
|-------------------|----------------|
| Specs técnicos | 30 días |
| Guías de usuario | 60 días |
| ADRs | 90 días (solo archivar, nunca eliminar) |
| Históricos de proyecto | 90 días |

### 7.4 Proceso de Archivado

```
1. Marcar como [DEPRECATED]
2. Esperar período de gracia
3. Mover a 99-archivo/ (si existe)
4. Actualizar _MAP.md
5. Eliminar después de 90 días adicionales
```

### 7.5 Registro en Changelog

Documentar en el changelog del proyecto:
```
## [YYYY-MM-DD] Deprecaciones
- DEPRECATED: {archivo} - {motivo}
- ARCHIVED: {archivo} - movido a 99-archivo/
- DELETED: {archivo} - eliminado después de período de gracia
```

---

## 8. Purga Gradual

### 8.1 Principios de Purga

1. **Máximo 10-20% por ciclo** - Evitar pérdida masiva
2. **Preservar contexto histórico valioso** - ADRs, decisiones
3. **Consolidar, no eliminar** - Unir duplicados
4. **Reducir verbosidad** - Mantener esencia

### 8.2 Qué Purgar

```yaml
Purgar:
  - Secciones duplicadas entre documentos
  - Ejemplos de código obsoletos
  - Comentarios TODO resueltos
  - Referencias a versiones muy antiguas
  - Texto redundante que no agrega valor
  - Warnings/notas temporales cumplidas
```

### 8.3 Qué NO Purgar

```yaml
NO Purgar:
  - ADRs (solo archivar)
  - Decisiones de arquitectura
  - Contexto histórico de "por qué"
  - Lecciones aprendidas
  - Información de seguridad
  - Requisitos regulatorios
```

### 8.4 Técnicas de Consolidación

| Técnica | Cuándo Usar |
|---------|-------------|
| Fusionar docs similares | 2+ docs cubren mismo tema |
| Extraer a referencia común | Mismo texto en múltiples docs |
| Resumir histórico | Detalles antiguos ya no relevantes |
| Crear índice navegable | Múltiples docs pequeños relacionados |

---

## 9. Integración con CAPVED

### 9.1 Diagrama CAPVED + M

```
┌─────────────────────────────────────────────────────────────┐
│                      CICLO CAPVED + M                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   C ──► A ──► P ──► V ──► E ──► D ──► [M]                  │
│   │     │     │     │     │     │      │                   │
│   │     │     │     │     │     │      └── MANTENIMIENTO   │
│   │     │     │     │     │     └── Documentación          │
│   │     │     │     │     └── Ejecución                    │
│   │     │     │     └── Validación                         │
│   │     │     └── Planeación                               │
│   │     └── Análisis                                       │
│   └── Contexto                                             │
│                                                             │
│   [M] = Fase opcional pero RECOMENDADA post-D              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Cuándo Ejecutar Fase M

| Situación | Fase M |
|-----------|--------|
| Tarea simple, sin cambios de docs | Omitir |
| Tarea con cambios de docs | Básico |
| Tarea con cambios de BD | Completo + @SYNC_BD |
| Fin de sprint/fase | Completo |
| Refactorización | Completo |

### 9.3 Integración con Fase D

```yaml
Fase D (Documentación):
  - Documentar cambios realizados
  - Actualizar specs afectados
  - Crear ADR si decisión arquitectural

Fase M (Mantenimiento):
  - Validar coherencia de docs
  - Sincronizar dependencias
  - Deprecar obsoletos
  - Purgar redundante
  - Verificar integridad
```

---

## 10. Carga de Contexto para Subagentes

### 10.1 Problema

```
Los subagentes pierden contexto sobre:
- Estándares de documentación
- Directivas aplicables
- Estado actual del proyecto
- Dependencias a validar
```

### 10.2 Solución: Contexto Obligatorio por Operación

```yaml
CONTEXTO_OBLIGATORIO:
  cualquier_tarea:
    - @TAREA
    - @CAPVED
    - HERENCIA-SIMCO.md (del proyecto)

  operacion_ddl:
    - @OP_DDL
    - @MIGRACIONES
    - @SYNC_BD
    - @MANTENIMIENTO_DOCS

  operacion_backend:
    - @OP_BACKEND
    - @TESTING
    - @MANTENIMIENTO_DOCS

  operacion_frontend:
    - @OP_FRONTEND
    - @TESTING
    - @MANTENIMIENTO_DOCS

  operacion_documentacion:
    - @DOC_PROYECTO
    - @NOMENCLATURA
    - @ESTRUCTURA_DOCS
    - @MANTENIMIENTO_DOCS
```

### 10.3 Instrucciones para Subagentes

```markdown
## INSTRUCCIONES OBLIGATORIAS PARA SUBAGENTES

ANTES de ejecutar cualquier tarea:

1. CARGAR directivas base:
   - Leer @TAREA
   - Leer @CAPVED
   - Leer HERENCIA-SIMCO.md del proyecto

2. IDENTIFICAR tipo de operación:
   - DDL? → Cargar @OP_DDL, @SYNC_BD
   - Backend? → Cargar @OP_BACKEND
   - Frontend? → Cargar @OP_FRONTEND
   - Docs? → Cargar @DOC_PROYECTO

3. SIEMPRE cargar @MANTENIMIENTO_DOCS para fase de cierre

4. AL COMPLETAR tarea:
   - Ejecutar ciclo de mantenimiento (6 pasos)
   - Validar dependencias
   - Actualizar inventarios
   - Documentar cambios

5. REPORTAR al agente principal:
   - Lista de cambios en docs
   - Lista de dependencias validadas
   - Issues encontrados (si aplica)
```

### 10.4 Template de Delegación con Contexto

```yaml
DELEGACION_CON_CONTEXTO:
  tarea: "{descripción de la tarea}"
  tipo: "{ddl|backend|frontend|docs}"

  contexto_heredado:
    proyecto: "{nombre del proyecto}"
    herencia_simco: "{ruta a HERENCIA-SIMCO.md}"
    directivas_cargadas:
      - @TAREA
      - @CAPVED
      - "{directivas específicas del tipo}"
      - @MANTENIMIENTO_DOCS

  instrucciones_cierre:
    - Ejecutar ciclo mantenimiento básico
    - Actualizar frontmatter de docs modificados
    - Verificar dependencias directas
    - Reportar cambios realizados
```

---

## 11. Delegación de Mantenimiento

### 11.1 Cuándo Delegar

- Mantenimiento de múltiples directorios
- Auditoría mensual programada
- Post-refactorización mayor
- Cuando el agente principal está ocupado con implementación

### 11.2 Perfil Especializado

**Referencia:** @PERFIL_DOC_MAINT

```yaml
perfil: Documentation Maintainer
responsabilidades:
  - Ejecutar ciclo de mantenimiento
  - Validar coherencia docs ↔ código
  - Deprecar documentación obsoleta
  - Actualizar inventarios
  - Generar reportes de auditoría

limitaciones:
  - NO modifica código
  - NO modifica DDL
  - Solo documenta y audita
  - Escala problemas al agente principal
```

### 11.3 Estructura de Delegación

```yaml
delegacion_mantenimiento:
  perfil: "@PERFIL_DOC_MAINT"
  alcance: "{directorio o proyecto}"
  nivel: "{basico|completo}"

  entregables_esperados:
    - Lista de docs actualizados
    - Lista de docs deprecados
    - Inventarios actualizados
    - Reporte de auditoría
    - Issues encontrados
```

---

## 12. Checklist de Cierre

Para validar mantenimiento completo, usar:

**Referencia:** @CHK_MANTENIMIENTO

Resumen de secciones:
1. Identificación (10 items)
2. Sincronización (15 items)
3. Validación de Dependencias (15 items)
4. Deprecación (10 items)
5. Purga Gradual (10 items)
6. Verificación Final (15 items)
7. Carga de Contexto (5 items)

**Total:** ~80 items

---

## 13. Errores Comunes

| Error | Consecuencia | Prevención |
|-------|--------------|------------|
| No actualizar frontmatter | Docs parecen obsoletos | Verificar fechas siempre |
| Eliminar sin deprecar | Pérdida de contexto | Siempre período de gracia |
| No validar dependencias | Docs inconsistentes | Usar checklist |
| Purga masiva | Pérdida de información | Máximo 20% por ciclo |
| No actualizar inventarios | SSOT violado | Parte del ciclo obligatorio |
| Subagente sin contexto | Trabajo inconsistente | Template de delegación |

---

## 14. Referencias

| Alias | Directiva | Uso |
|-------|-----------|-----|
| @SYNC_BD | SIMCO-SINCRONIZACION-BD.md | Sincronización de BD |
| @CHK_MANTENIMIENTO | CHECKLIST-MANTENIMIENTO-DOCS.md | Validación completa |
| @TPL_DEPRECACION | TEMPLATE-DEPRECACION.md | Marcar deprecados |
| @PERFIL_DOC_MAINT | PERFIL-DOCUMENTATION-MAINTAINER.md | Perfil especializado |
| @DOC_PROYECTO | SIMCO-DOCUMENTACION-PROYECTO.md | Estructura de docs |
| @NOMENCLATURA | SIMCO-NOMENCLATURA.md | Nombrado de archivos |
| @INVENTARIOS | SIMCO-INVENTARIOS.md | Inventarios YAML |
| @CAPVED | PRINCIPIO-CAPVED.md | Ciclo de vida |

---

## 15. Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-01-10 | Versión inicial |

---

**Referencia rápida:**
```
Ciclo: IDENTIFICAR → SINCRONIZAR → VALIDAR → DEPRECAR → PURGAR → VERIFICAR
Triggers: Post-tarea, Post-fase, Post-DDL, Auditoría mensual
Checklist: @CHK_MANTENIMIENTO
```
