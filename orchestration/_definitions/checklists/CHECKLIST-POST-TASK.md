# CHECKLIST: POST-TASK

**Versión:** 1.1.0
**Alias:** @DEF_CHK_POST
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0

---

## PROPÓSITO

Verificaciones obligatorias DESPUÉS de completar cualquier tarea, antes de marcarla como terminada.

---

## SECUENCIA OBLIGATORIA

```
TAREA FINALIZA EJECUCIÓN
         │
         ▼
┌─────────────────────────────┐
│ 0. GOBERNANZA               │  ← PRIMERO (BLOQUEANTE)
│ (@DEF_CHK_GOB)              │
└─────────────┬───────────────┘
         ¿Pasa?
         /    \
       No      Sí
       │       │
    BLOQUEAR   ▼
              ┌─────────────────────────────┐
              │ 1-7. VALIDACIONES TÉCNICAS  │
              │ (este checklist)             │
              └─────────────────────────────┘
```

---

## CHECKLIST

### 0. Gobernanza de Tarea (BLOQUEANTE - EJECUTAR PRIMERO)

> **OBLIGATORIO:** Ejecutar @DEF_CHK_GOB antes de continuar.

```markdown
[ ] CHECKLIST-GOBERNANZA-TAREA.md ejecutado y PASADO
    - Carpeta de tarea existe
    - METADATA.yml completo
    - Fases C, E, D documentadas
    - _INDEX.yml actualizado

SI NO PASA: DETENER. Completar gobernanza primero.
```

---

### 1. Validaciones Técnicas

#### Backend (si aplica)
```markdown
[ ] npm run build - PASA
[ ] npm run lint - PASA
[ ] npm run test - PASA (si existen tests)
[ ] Servidor inicia sin errores
```

#### Frontend (si aplica)
```markdown
[ ] npm run build - PASA
[ ] npm run lint - PASA
[ ] npm run typecheck - PASA
[ ] Aplicación renderiza sin errores
```

#### Database (si aplica)
```markdown
[ ] DDL ejecuta sin errores
[ ] Datos de prueba cargan correctamente
[ ] Constraints funcionan como esperado
```

### 2. Coherencia Entre Capas (TRIGGER-COHERENCIA-CAPAS)

```markdown
## DDL ↔ Backend
[ ] Toda tabla DDL tiene entity correspondiente (o excepción documentada)
[ ] Toda entity tiene tabla DDL correspondiente (o es View/Embeddable)
[ ] Campos de entity coinciden exactamente con columnas de tabla
[ ] Tipos TypeScript son compatibles con tipos PostgreSQL
[ ] Todo schema tiene al menos un módulo backend (o está marcado PLANNED)

## Backend ↔ Frontend (si aplica)
[ ] Todo endpoint consumido tiene implementación en backend
[ ] Si hay nuevo endpoint: está documentado en Swagger
[ ] Si hay nuevo componente: está integrado donde corresponde

## Verificación de Excepciones
[ ] Tablas M:N sin entity están documentadas en ENTITIES-CATALOG sección "Relaciones"
[ ] View entities (@ViewEntity) están documentadas como tal
[ ] Schemas PLANNED tienen fecha estimada de implementación
```

### 3. Actualización de Inventarios (TRIGGER-INVENTARIOS-SINCRONIZADOS)

```markdown
## Sincronización Obligatoria
[ ] DATABASE_INVENTORY.yml actualizado (si cambió BD)
    - Conteo de schemas correcto
    - Conteo de tablas correcto
    - Nuevos objetos agregados
[ ] BACKEND_INVENTORY.yml actualizado (si cambió BE)
    - Conteo de módulos correcto
    - Conteo de entities correcto
    - Conteo de services correcto
[ ] FRONTEND_INVENTORY.yml actualizado (si cambió FE)
    - Conteo de componentes correcto
    - Conteo de páginas correcto
[ ] MASTER_INVENTORY.yml actualizado con totales

## Verificación de Cobertura
[ ] Cobertura de inventarios = 100%
[ ] Timestamp de actualización = fecha de hoy
[ ] sync_status = "SYNCED"
```

### 4. Actualización de Trazas

```markdown
[ ] Traza de tarea actualizada
[ ] Traza de agente actualizada
[ ] PROXIMA-ACCION.md actualizado
[ ] Commits con mensajes descriptivos
```

### 5. Documentación

```markdown
[ ] README actualizado (si cambió significativamente)
[ ] Documentación técnica actualizada (si aplica)
[ ] ADR creado (si fue decisión arquitectural)
[ ] Comentarios en código donde la lógica no es obvia
```

### 6. Sistema de Gobernanza

```markdown
[ ] Carpeta de tarea creada: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completado
[ ] Fases mínimas documentadas (C, E, D)
[ ] _INDEX.yml de tareas actualizado
[ ] Traza de agente actualizada
```

### 7. Evaluación de Propagación

```markdown
[ ] ¿Cambio debe propagarse a otros proyectos?
[ ] Si es erp-core: ¿propagar a verticales?
[ ] Si es shared/catalog: ¿notificar proyectos que lo usan?
[ ] Si es security fix: ¿propagar inmediatamente?
```

---

## CRITERIOS DE COMPLETITUD

### Tarea Completada SI:

```yaml
obligatorio:
  - Todas las validaciones técnicas pasan
  - Inventarios actualizados
  - Trazas actualizadas
  - Documentación de gobernanza creada

recomendado:
  - Documentación técnica actualizada
  - Tests agregados/actualizados
  - Propagación evaluada
```

### Tarea NO Completada SI:

```yaml
bloqueantes:
  - Build falla
  - Lint falla
  - Tests fallan
  - Inventarios no actualizados
  - Sin documentación de gobernanza
```

---

## DECISIÓN

```yaml
SI_PASA_TODO:
  accion: "Marcar tarea como COMPLETADA"
  documentar: "Resumen en METADATA.yml"
  actualizar: "_INDEX.yml con estado COMPLETADO"

SI_FALLA_VALIDACION:
  accion: "MANTENER como EN_PROGRESO"
  corregir: "Resolver validaciones fallidas"
  reintentar: "Ejecutar checklist de nuevo"

SI_FALTA_DOCUMENTACION:
  accion: "MANTENER como EN_PROGRESO"
  completar: "Documentación faltante"
  nota: "Tarea no está completa sin documentación"
```

---

## USO

```yaml
# En cualquier perfil de agente:
al_completar_tarea:
  - Cargar: "@DEF_CHK_POST"
  - Ejecutar: "Checklist completo"
  - Si pasa: "Marcar tarea como completada"
  - Si falla: "Resolver antes de marcar completada"
```

---

## INTEGRACIÓN CON TRIGGER-DOC

Este checklist se activa junto con `TRIGGER-DOCUMENTACION-OBLIGATORIA.md` al intentar completar una tarea.

```yaml
secuencia:
  1: "Agente intenta marcar tarea como completada"
  2: "TRIGGER-DOC se activa"
  3: "Se ejecuta CHECKLIST-POST-TASK"
  4: "Si pasa: tarea se marca completada"
  5: "Si falla: tarea permanece en progreso"
```

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist
