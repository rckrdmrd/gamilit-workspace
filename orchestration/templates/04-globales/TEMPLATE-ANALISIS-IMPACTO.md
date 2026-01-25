# ANALISIS DE IMPACTO: {TAREA-ID}

**Tarea:** {Descripcion breve de la tarea}
**Fecha:** {YYYY-MM-DD}
**Analista:** {Agente que realiza el analisis}
**Fase CAPVED:** A (Analisis)

---

## 1. RESUMEN DE CAMBIO PROPUESTO

```yaml
tipo_cambio: "{CREAR | MODIFICAR | ELIMINAR}"
capa_origen: "{DATABASE | BACKEND | FRONTEND | MULTIPLE}"
descripcion: "{Descripcion del cambio a realizar}"
```

---

## 2. OBJETOS DIRECTAMENTE AFECTADOS

### 2.1 Database (DDL)

| Objeto | Tipo | Accion | Archivo |
|--------|------|--------|---------|
| {schema.tabla} | TABLE | {CREATE/ALTER/DROP} | `ddl/schemas/{schema}/tables/{archivo}.sql` |
| {schema.indice} | INDEX | {CREATE/DROP} | `ddl/schemas/{schema}/indexes/{archivo}.sql` |
| {schema.funcion} | FUNCTION | {CREATE/ALTER} | `ddl/schemas/{schema}/functions/{archivo}.sql` |

**Cambios en columnas (si aplica):**

| Columna | Cambio | Tipo Anterior | Tipo Nuevo | Nullable |
|---------|--------|---------------|------------|----------|
| {columna} | {ADD/MODIFY/DROP} | {tipo} | {tipo} | {YES/NO} |

---

### 2.2 Backend

| Objeto | Tipo | Accion | Archivo |
|--------|------|--------|---------|
| {NombreEntity} | Entity | {CREATE/MODIFY} | `src/modules/{mod}/entities/{archivo}.ts` |
| {NombreDto} | DTO | {CREATE/MODIFY} | `src/modules/{mod}/dto/{archivo}.ts` |
| {NombreService} | Service | {CREATE/MODIFY} | `src/modules/{mod}/services/{archivo}.ts` |
| {NombreController} | Controller | {CREATE/MODIFY} | `src/modules/{mod}/controllers/{archivo}.ts` |

**Endpoints afectados:**

| Metodo | Path | Accion | Cambio |
|--------|------|--------|--------|
| {GET/POST/PUT/DELETE} | `/api/{path}` | {CREATE/MODIFY} | {descripcion} |

---

### 2.3 Frontend

| Objeto | Tipo | Accion | Archivo |
|--------|------|--------|---------|
| {NombreType} | Type/Interface | {CREATE/MODIFY} | `src/types/{archivo}.ts` |
| {NombreSchema} | Zod Schema | {CREATE/MODIFY} | `src/schemas/{archivo}.ts` |
| {NombreHook} | Hook | {CREATE/MODIFY} | `src/hooks/{archivo}.ts` |
| {NombreComponent} | Component | {CREATE/MODIFY} | `src/components/{archivo}.tsx` |

---

## 3. CASCADA DE IMPACTO

### 3.1 Diagrama de Propagacion

```
{OBJETO_ORIGEN}
    |
    +---> {OBJETO_DEPENDIENTE_1}
    |         |
    |         +---> {SUB_DEPENDIENTE_1}
    |         +---> {SUB_DEPENDIENTE_2}
    |
    +---> {OBJETO_DEPENDIENTE_2}
    |
    +---> {OBJETO_DEPENDIENTE_3}
```

### 3.2 Matriz de Dependencias

| Objeto Modificado | Depende de | Es Dependencia de | Requiere Actualizacion |
|-------------------|------------|-------------------|------------------------|
| {objeto_1} | {dependencias} | {dependientes} | SI/NO |
| {objeto_2} | {dependencias} | {dependientes} | SI/NO |

---

## 4. ANALISIS POR CAPA (Consultar IMPACTO-CAMBIOS-*.md)

### 4.1 Si es cambio en DDL

Referencia: `core/orchestration/impactos/IMPACTO-CAMBIOS-DDL.md`

| Capa Dependiente | Requiere Actualizacion | Prioridad |
|------------------|------------------------|-----------|
| Entity | {SI/NO} | 1 |
| CreateDto | {SI/NO} | 2 |
| UpdateDto | {AUTO} | 2 |
| ResponseDto | {SI/NO} | 2 |
| Service | {POSIBLE} | 3 |
| Frontend Types | {SI/NO} | 4 |
| Frontend Schema | {SI/NO} | 4 |
| Tests | {POSIBLE} | 5 |
| DATABASE_INVENTORY | {SI} | 6 |

### 4.2 Si es cambio en Entity

Referencia: `core/orchestration/impactos/IMPACTO-CAMBIOS-ENTITY.md`

| Capa Dependiente | Requiere Actualizacion | Prioridad |
|------------------|------------------------|-----------|
| DTOs | {SI/NO} | 1 |
| Service | {POSIBLE} | 2 |
| Controller | {POSIBLE} | 3 |
| Frontend Types | {SI/NO} | 4 |
| Tests | {POSIBLE} | 5 |
| BACKEND_INVENTORY | {SI} | 6 |

### 4.3 Si es cambio en API

Referencia: `core/orchestration/impactos/IMPACTO-CAMBIOS-API.md`

| Capa Dependiente | Requiere Actualizacion | Prioridad |
|------------------|------------------------|-----------|
| Swagger/OpenAPI | {AUTO} | - |
| Frontend Types | {SI/NO} | 1 |
| Frontend API Service | {SI/NO} | 2 |
| Frontend Components | {POSIBLE} | 3 |
| Tests E2E | {POSIBLE} | 4 |

---

## 5. RIESGOS IDENTIFICADOS

| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|--------------|---------|------------|
| R1 | {descripcion} | {ALTA/MEDIA/BAJA} | {ALTO/MEDIO/BAJO} | {accion} |
| R2 | {descripcion} | {ALTA/MEDIA/BAJA} | {ALTO/MEDIO/BAJO} | {accion} |

---

## 6. DEPENDENCIAS CON OTRAS TAREAS/HUs

### 6.1 Esta tarea BLOQUEA:

| Tarea | Descripcion | Razon |
|-------|-------------|-------|
| {TAREA-XXX} | {descripcion} | {por que bloquea} |

### 6.2 Esta tarea ES BLOQUEADA POR:

| Tarea | Descripcion | Estado |
|-------|-------------|--------|
| {TAREA-YYY} | {descripcion} | {COMPLETADA/EN_PROGRESO/PENDIENTE} |

---

## 7. VERIFICACION DE CATALOGO

Referencia: `shared/catalog/CATALOG-INDEX.yml`

| Funcionalidad Requerida | Existe en Catalogo | Accion |
|-------------------------|-------------------|--------|
| {auth/session/etc} | {SI/NO} | {REUTILIZAR / IMPLEMENTAR} |

---

## 8. SCOPE CREEP DETECTADO

| Item | En Alcance Original | Accion |
|------|---------------------|--------|
| {item_1} | {SI/NO} | {INCLUIR / HU_DERIVADA} |
| {item_2} | {SI/NO} | {INCLUIR / HU_DERIVADA} |

**HUs Derivadas a Crear:**

```yaml
- id: "DERIVED-{TAREA-ID}-001"
  descripcion: "{descripcion}"
  prioridad: "{P0/P1/P2/P3}"
  razon: "{por que se genera}"
```

---

## 9. ORDEN DE EJECUCION RECOMENDADO

```
1. [ ] {CAPA} - {accion} - {objeto}
2. [ ] {CAPA} - {accion} - {objeto}
3. [ ] {CAPA} - {accion} - {objeto}
...
N. [ ] Actualizar inventarios y trazas
```

---

## 10. CHECKLIST DE VALIDACION (Fase V)

```yaml
Analisis_completo:
  - [ ] Todos los objetos afectados identificados
  - [ ] Cascada de impacto documentada
  - [ ] Riesgos identificados y mitigados
  - [ ] Dependencias con otras tareas verificadas
  - [ ] Catalogo consultado
  - [ ] Scope creep detectado y registrado
  - [ ] Orden de ejecucion definido

Listo_para_Fase_P:
  - [ ] Este analisis esta completo
  - [ ] Puede procederse a planificacion
```

---

## 11. APROBACION

| Rol | Nombre/Agente | Fecha | Estado |
|-----|---------------|-------|--------|
| Analista | {agente} | {fecha} | COMPLETADO |
| Revisor (si aplica) | {Architecture-Analyst} | {fecha} | {APROBADO/OBSERVACIONES} |

---

**Template Version:** 1.0.0 | **Sistema:** SIMCO + CAPVED
