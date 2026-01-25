# TEMPLATE: TAREA TÉCNICA

**Versión:** 1.1.0
**Fecha:** 2025-12-08
**Uso:** Definición de tareas técnicas atómicas

---

## 🆕 VERIFICACIÓN DE CATÁLOGO (ANTES DE CREAR TAREA)

> **OBLIGATORIO verificar si la funcionalidad ya existe en el catálogo global:**

```bash
grep -i "{funcionalidad}" shared/catalog/CATALOG-INDEX.yml
```

**Si existe:** Usar `@REUTILIZAR` en lugar de crear desde cero.
**Funcionalidades catalogadas:** auth, session, rate-limiting, notifications, multi-tenancy, feature-flags, websocket, payments

---

## {GRUPO}-{NNN}: {Título de la Tarea}

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | {DB/BE/FE/TEST}-{NNN} |
| **Tipo** | {Database / Backend / Frontend / Testing / DevOps} |
| **Historia** | US-{MOD}-{NNN} |
| **Épica** | {EPIC-ID} |
| **Prioridad** | {P0 / P1 / P2 / P3} |
| **Estimación** | {horas} |
| **Estado** | {Backlog / In Progress / Review / Done / Blocked} |
| **Asignado a** | {NEXUS-DATABASE / NEXUS-BACKEND / NEXUS-FRONTEND} |

---

### Descripción

{Descripción clara y concisa de lo que debe hacer esta tarea}

### Objetivo

{Qué se logra al completar esta tarea}

---

### Especificación Técnica

#### Para Database (DB-XXX):

**Schema:** `{schema_name}`

**Objeto a crear/modificar:**
```sql
-- Tipo: {TABLE / FUNCTION / TRIGGER / INDEX / VIEW}
-- Archivo: apps/{proyecto}/database/ddl/schemas/{schema}/{tipo}/{archivo}.sql

{Especificación SQL o pseudocódigo}
```

**Columnas (si es tabla):**
| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | PK |
| {col} | {tipo} | {YES/NO} | {default} | {descripción} |

**Índices requeridos:**
- `idx_{tabla}_{columna}`: {propósito}

**RLS Policy:**
```sql
CREATE POLICY {policy_name} ON {schema}.{tabla}
    USING ({condición});
```

---

#### Para Backend (BE-XXX):

**Módulo:** `apps/{proyecto}/backend/src/modules/{modulo}/`

**Archivo a crear/modificar:**
- `{archivo}.ts`

**Tipo de artefacto:** {Entity / DTO / Service / Controller / Middleware}

**Especificación:**
```typescript
// Estructura esperada
{código o pseudocódigo}
```

**Endpoints (si es Controller):**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/{resource} | {descripción} |

**Validaciones requeridas:**
- {validación 1}
- {validación 2}

---

#### Para Frontend (FE-XXX):

**Ubicación:** `apps/{proyecto}/frontend/src/{tipo}/{archivo}.tsx`

**Tipo de artefacto:** {Page / Component / Store / Hook / Service}

**Props/Interface:**
```typescript
interface {Name}Props {
    {prop}: {tipo};
}
```

**Comportamiento esperado:**
- {comportamiento 1}
- {comportamiento 2}

**Estados:**
- Loading: {descripción}
- Error: {descripción}
- Success: {descripción}

---

### Criterios de Aceptación Técnicos

- [ ] {Criterio 1}
- [ ] {Criterio 2}
- [ ] {Criterio 3}

### Validación

**Comandos de validación:**
```bash
# Database
psql -d {db} -c "SELECT * FROM {schema}.{tabla} LIMIT 1;"

# Backend
npm run build
npm run test -- --grep "{pattern}"

# Frontend
npm run build
npm run test -- --grep "{pattern}"
```

**Resultado esperado:**
- {resultado esperado}

---

### Dependencias

**Requiere completadas:**
- [ ] {GRUPO}-{NNN}: {descripción}

**Bloquea:**
- [ ] {GRUPO}-{NNN}: {descripción}

---

### Archivos a Crear/Modificar

**Crear:**
- `{ruta/archivo}` - {descripción}

**Modificar:**
- `{ruta/archivo}` - {cambios}

---

### Definition of Done

- [ ] 🆕 Verificó @CATALOG antes de implementar
- [ ] 🆕 Si usó catálogo: siguió SIMCO-REUTILIZAR.md
- [ ] Código implementado
- [ ] Compilación sin errores
- [ ] Tests pasando
- [ ] Comentarios/documentación agregados
- [ ] Code review (si aplica)
- [ ] Inventario actualizado
- [ ] Traza registrada

---

### Notas

{Consideraciones especiales, decisiones técnicas, referencias}

---

### Log de Ejecución

| Fecha/Hora | Acción | Resultado |
|------------|--------|-----------|
| {timestamp} | Inicio | - |
| {timestamp} | {acción} | {resultado} |
| {timestamp} | Fin | {PASS/FAIL} |

---

**Asignada por:** {nombre-agente}
**Fecha asignación:** {YYYY-MM-DD}
**Fecha completada:** {YYYY-MM-DD}
**Duración real:** {horas}
