# CHECKLIST: POST-TASK

**Version:** 1.1.0
**Alias:** @DEF_CHK_POST
**Fecha:** 2026-01-18
**Sistema:** SIMCO v4.0.0 (adaptado para gamilit)
**Propagado desde:** workspace-v2/orchestration/_definitions/checklists/CHECKLIST-POST-TASK.md

---

## PROPOSITO

Verificaciones obligatorias DESPUES de completar cualquier tarea, antes de marcarla como terminada.

---

## SECUENCIA OBLIGATORIA

```
TAREA FINALIZA EJECUCION
         |
         v
+-----------------------------+
| 0. GOBERNANZA               |  <- PRIMERO (BLOQUEANTE)
| (@DEF_CHK_GOB)              |
+-------------+---------------+
         Pasa?
         /    \
       No      Si
       |       |
    BLOQUEAR   v
              +-----------------------------+
              | 1-7. VALIDACIONES TECNICAS  |
              | (este checklist)             |
              +-----------------------------+
```

---

## CHECKLIST

### 0. Gobernanza de Tarea (BLOQUEANTE - EJECUTAR PRIMERO)

> **OBLIGATORIO:** Ejecutar @DEF_CHK_GOB antes de continuar.

```markdown
[ ] CHECKLIST-GOBERNANZA.md ejecutado y PASADO
    - Carpeta de tarea existe
    - METADATA.yml completo
    - Fases C, E, D documentadas
    - _INDEX.yml actualizado

SI NO PASA: DETENER. Completar gobernanza primero.
```

---

### 1. Validaciones Tecnicas

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
[ ] Aplicacion renderiza sin errores
```

#### Database (si aplica)
```markdown
[ ] DDL ejecuta sin errores
[ ] Datos de prueba cargan correctamente
[ ] Constraints funcionan como esperado
```

### 2. Coherencia Entre Capas

```markdown
## DDL <-> Backend
[ ] Toda tabla DDL tiene entity correspondiente (o excepcion documentada)
[ ] Toda entity tiene tabla DDL correspondiente (o es View/Embeddable)
[ ] Campos de entity coinciden exactamente con columnas de tabla
[ ] Tipos TypeScript son compatibles con tipos PostgreSQL

## Backend <-> Frontend (si aplica)
[ ] Todo endpoint consumido tiene implementacion en backend
[ ] Si hay nuevo endpoint: esta documentado en Swagger
[ ] Si hay nuevo componente: esta integrado donde corresponde
```

### 3. Actualizacion de Inventarios

```markdown
## Sincronizacion Obligatoria
[ ] DATABASE_INVENTORY.yml actualizado (si cambio BD)
    - Conteo de schemas correcto
    - Conteo de tablas correcto
    - Nuevos objetos agregados
[ ] BACKEND_INVENTORY.yml actualizado (si cambio BE)
    - Conteo de modulos correcto
    - Conteo de entities correcto
    - Conteo de services correcto
[ ] FRONTEND_INVENTORY.yml actualizado (si cambio FE)
    - Conteo de componentes correcto
    - Conteo de paginas correcto
[ ] MASTER_INVENTORY.yml actualizado con totales
```

### 4. Actualizacion de Trazas

```markdown
[ ] Traza de tarea actualizada
[ ] PROXIMA-ACCION.md actualizado
[ ] Commits con mensajes descriptivos
```

### 5. Documentacion

```markdown
[ ] README actualizado (si cambio significativamente)
[ ] Documentacion tecnica actualizada (si aplica)
[ ] Comentarios en codigo donde la logica no es obvia
```

### 6. Sistema de Gobernanza

```markdown
[ ] Carpeta de tarea creada: orchestration/tareas/TASK-{ID}/
[ ] METADATA.yml completado
[ ] Fases minimas documentadas (C, E, D)
[ ] _INDEX.yml de tareas actualizado
```

### 7. Git y Control de Versiones

```markdown
[ ] Todos los cambios commiteados
[ ] Push realizado a remote
[ ] git status muestra "working tree clean"
```

---

## CRITERIOS DE COMPLETITUD

### Tarea Completada SI:

```yaml
obligatorio:
  - Todas las validaciones tecnicas pasan
  - Inventarios actualizados
  - Trazas actualizadas
  - Documentacion de gobernanza creada
  - Cambios pusheados

recomendado:
  - Documentacion tecnica actualizada
  - Tests agregados/actualizados
```

### Tarea NO Completada SI:

```yaml
bloqueantes:
  - Build falla
  - Lint falla
  - Tests fallan
  - Inventarios no actualizados
  - Sin documentacion de gobernanza
  - Sin push a remote
```

---

## DECISION

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
  completar: "Documentacion faltante"
  nota: "Tarea no esta completa sin documentacion"
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

## REFERENCIAS

| Alias | Descripcion |
|-------|-------------|
| @DEF_CHK_POST | Este checklist |
| @DEF_CHK_GOB | Checklist de gobernanza (ejecutar primero) |
| @DEF_VAL_BE | Validaciones backend |
| @DEF_VAL_FE | Validaciones frontend |
| @DEF_VAL_DDL | Validaciones DDL |

---

**Version:** 1.1.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Checklist
**Propagado desde:** workspace-v2
