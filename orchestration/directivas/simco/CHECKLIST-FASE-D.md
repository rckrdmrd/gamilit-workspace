# CHECKLIST-FASE-D.md - Checklist Rapido Post-Ejecucion

**Version:** 1.0.0
**Creado:** 2026-01-16
**Sistema:** SIMCO v3.8+
**Tiempo estimado:** 5-15 minutos

---

## Proposito

Checklist rapido y sin ambiguedades para ejecutar la Fase D (Documentacion) despues de completar cualquier tarea. Usar SIEMPRE despues de Fase E.

---

## Pre-requisitos

Antes de iniciar Fase D, verificar:
- [ ] Fase E completada (codigo implementado)
- [ ] Build pasa sin errores
- [ ] Lint pasa sin errores
- [ ] Tests pasan (si aplica)

---

## CHECKLIST FASE D (10 Pasos)

### Paso 1: Identificar Tipo de Cambio
```
[ ] Nuevo objeto (tabla/entity/endpoint/componente)
[ ] Modificacion de objeto existente
[ ] Eliminacion de objeto
[ ] Refactorizacion sin cambio funcional
[ ] Fix de bug
[ ] Documentacion pura
```

**Accion:** Marcar tipo para determinar pasos siguientes.

---

### Paso 2: Ejecutar Analisis de Dependencias (si aplica)
```
[ ] Si es MODIFICACION o ELIMINACION:
    - Ejecutar TRIGGER-ANALISIS-DEPENDENCIAS.md
    - Documentar lista de archivos afectados
    - Verificar que todos los dependientes fueron actualizados
```

**Referencia:** `orchestration/directivas/triggers/TRIGGER-ANALISIS-DEPENDENCIAS.md`

---

### Paso 3: Actualizar Diagramas (si aplica)
```
[ ] Diagrama ER (si cambio en BD)
    Ubicacion: docs/{epic}/diagramas/

[ ] Diagrama de arquitectura (si cambio estructural)
    Ubicacion: docs/{epic}/diagramas/

[ ] Diagrama de secuencia (si nuevo flujo)
    Ubicacion: docs/{epic}/diagramas/
```

**Nota:** Solo si el cambio afecta la estructura visual del sistema.

---

### Paso 4: Actualizar Especificaciones Tecnicas
```
[ ] Specs de BD (si nueva tabla/columna)
    Ubicacion: docs/{epic}/especificaciones/

[ ] Specs de API (si nuevo endpoint)
    Ubicacion: docs/{epic}/especificaciones/

[ ] Specs de UI (si nuevo componente)
    Ubicacion: docs/{epic}/especificaciones/
```

---

### Paso 5: Crear ADR (si Decision Arquitectonica)
```
[ ] Si hubo decision arquitectonica significativa:
    - Crear ADR en docs/97-adr/
    - Formato: ADR-{numero}-{descripcion-corta}.md
    - Usar template: orchestration/templates/TEMPLATE-ADR.md
```

**Criterios para ADR:**
- Cambio de patron o tecnologia
- Decision con trade-offs importantes
- Cambio que afecta multiples modulos

---

### Paso 6: Actualizar Inventario Correspondiente

#### 6a. Si cambio en Base de Datos:
```
[ ] Actualizar: orchestration/inventarios/DATABASE_INVENTORY.yml
    - Agregar/modificar tabla en seccion correspondiente
    - Actualizar contadores (total_tables, total_columns)
    - Actualizar version y fecha
```

#### 6b. Si cambio en Backend:
```
[ ] Actualizar: orchestration/inventarios/BACKEND_INVENTORY.yml
    - Agregar/modificar entity/dto/service/controller
    - Actualizar contadores
    - Actualizar version y fecha
```

#### 6c. Si cambio en Frontend:
```
[ ] Actualizar: orchestration/inventarios/FRONTEND_INVENTORY.yml
    - Agregar/modificar componente/hook/store/api
    - Actualizar contadores
    - Actualizar version y fecha
```

**Referencia:** `orchestration/directivas/simco/SIMCO-INVENTARIOS.md`

---

### Paso 7: Documentar Relaciones Entre Objetos
```
[ ] Si el objeto tiene dependencias:
    - Documentar en inventario seccion "relaciones:"
    - Incluir: objeto_origen, objeto_destino, tipo_relacion
    - Ver: SIMCO-RELACIONES-OBJETOS.md
```

**Ejemplo:**
```yaml
relaciones:
  - origen: users
    destino: user_stats
    tipo: FK
    columna: user_id
```

---

### Paso 8: Actualizar Trazas
```
[ ] Actualizar traza correspondiente:
    - BD: orchestration/trazas/TRAZA-TAREAS-DDL.md
    - BE: orchestration/trazas/TRAZA-TAREAS-BACKEND.md
    - FE: orchestration/trazas/TRAZA-TAREAS-FRONTEND.md
    - FULL: orchestration/trazas/TRAZA-TAREAS-FULL.md

[ ] Formato de entrada:
    | Fecha | Tarea | Archivos | Estado | Notas |
    |-------|-------|----------|--------|-------|
    | 2026-01-16 | ETC-001 | 5 archivos | DONE | Consolidacion APIs |
```

---

### Paso 9: Actualizar PROXIMA-ACCION.md
```
[ ] Actualizar: orchestration/PROXIMA-ACCION.md
    - Marcar tarea actual como completada
    - Agregar siguiente tarea si hay continuidad
    - Incluir contexto para retomar trabajo
```

**Formato:**
```markdown
## Ultima Accion Completada
- Tarea: {descripcion}
- Fecha: {fecha}
- Archivos: {lista}

## Proxima Accion Sugerida
- Tarea: {siguiente}
- Prioridad: {alta|media|baja}
- Contexto: {notas para retomar}
```

---

### Paso 10: Registrar Lecciones Aprendidas (si aplica)
```
[ ] Si hubo aprendizaje significativo:
    - Registrar en: orchestration/retrospectivas/LECCIONES-{tipo}.md
    - Incluir: que funciono, que mejorar, recomendaciones
    - Ver: LECCIONES-APRENDIDAS-CONSOLIDACION.md
```

---

## VALIDACION FINAL

```
[ ] 1. Build pasa sin errores
[ ] 2. Lint pasa sin errores
[ ] 3. Tests pasan (si existen)
[ ] 4. Inventarios tienen formato YAML valido
[ ] 5. Trazas tienen formato markdown valido
[ ] 6. PROXIMA-ACCION.md actualizado
```

---

## Checklist por Tipo de Cambio (Resumen Rapido)

### Nueva Tabla/Entity
```
[1] [2] [3-ER] [4-BD] [5-si] [6a] [6b] [7] [8] [9] [10]
```

### Nuevo Endpoint
```
[1] [3-no] [4-API] [5-no] [6b] [7] [8] [9] [10]
```

### Nuevo Componente
```
[1] [3-no] [4-UI] [5-no] [6c] [7] [8] [9] [10]
```

### Modificacion Existente
```
[1] [2-SI] [3-si] [4-si] [5-si] [6-correspondiente] [7] [8] [9] [10]
```

### Eliminacion
```
[1] [2-SI] [3-si] [4-si] [5-no] [6-remover] [7-remover] [8] [9] [10]
```

### Fix de Bug
```
[1] [2-si] [3-no] [4-no] [5-no] [6-no] [7-no] [8] [9] [10-si]
```

---

## Tiempo Estimado por Tipo

| Tipo de Cambio | Tiempo Fase D |
|----------------|---------------|
| Nueva tabla + entity | 10-15 min |
| Nuevo endpoint | 5-10 min |
| Nuevo componente | 5-10 min |
| Modificacion menor | 5 min |
| Eliminacion | 5-10 min |
| Fix de bug | 3-5 min |
| Documentacion pura | 2-3 min |

---

## Referencias Rapidas

| Directiva | Cuando Usar |
|-----------|-------------|
| SIMCO-DOCUMENTAR.md | Detalle completo Fase D |
| SIMCO-INVENTARIOS.md | Formato de inventarios |
| SIMCO-RELACIONES-OBJETOS.md | Documentar dependencias |
| TRIGGER-ANALISIS-DEPENDENCIAS.md | Antes de modificar |
| LECCIONES-APRENDIDAS-CONSOLIDACION.md | Registrar aprendizajes |

---

**Sistema:** SIMCO v3.8+ con SAAD
**Ultima actualizacion:** 2026-01-16
