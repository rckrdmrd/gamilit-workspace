# TEMPLATE: Modulo Estandar

**Version:** 1.0.0
**Proposito:** Template para documentar modulos de proyecto
**Referencia:** SIMCO-ESTRUCTURA-DOCS.md
**Creado:** 2026-01-10

---

## Instrucciones de Uso

1. Copiar este template al directorio del modulo
2. Nombrar archivo: `{PREFIJO}-{NNN}-{nombre}.md` (ej: MGN-001-auth.md)
3. Reemplazar todos los placeholders `{...}`
4. Eliminar secciones opcionales que no apliquen
5. Mantener actualizado con cada cambio

---

## Template

```markdown
# {ID}: {Nombre del Modulo}

## Metadata

| Campo | Valor |
|-------|-------|
| **Codigo** | {MGN-001|SAAS-001|MCH-001} |
| **Modulo** | {Nombre descriptivo} |
| **Fase** | {N} - {Nombre de la Fase} |
| **Prioridad** | {P0|P1|P2|P3} |
| **Estado** | {Completado|Implementado|En Desarrollo|Documentado|Pendiente} |
| **Story Points** | {N} |
| **Porcentaje** | {N}% |

---

## 1. Descripcion

{Parrafo descriptivo del proposito del modulo, que problema resuelve
y como se integra con el resto del sistema.}

---

## 2. Objetivos

1. {Objetivo principal del modulo}
2. {Objetivo secundario}
3. {Objetivo terciario}

---

## 3. Alcance

### 3.1 Incluido

- {Feature o funcionalidad incluida}
- {Feature o funcionalidad incluida}
- {Feature o funcionalidad incluida}

### 3.2 Excluido

- {Feature o funcionalidad NO incluida}
- {Feature delegada a otro modulo}

### 3.3 Supuestos

- {Supuesto sobre el sistema}
- {Supuesto sobre usuarios}

---

## 4. Modelo de Datos

### 4.1 Diagrama ER (ASCII)

```
┌────────────────┐       ┌────────────────┐
│   {tabla_1}    │       │   {tabla_2}    │
├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │
│ tenant_id (FK) │──────>│ tabla1_id (FK) │
│ {campo}        │       │ {campo}        │
│ created_at     │       │ created_at     │
│ updated_at     │       │ updated_at     │
└────────────────┘       └────────────────┘
```

### 4.2 Tablas (Schema: {schema_name})

**{nombre_tabla}**

| Columna | Tipo | Constraints | Descripcion |
|---------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador unico |
| tenant_id | UUID | FK tenants(id), NOT NULL | Tenant owner |
| {campo} | {tipo} | {constraints} | {descripcion} |
| is_active | BOOLEAN | DEFAULT true | Estado del registro |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha creacion |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Fecha actualizacion |

**Indices:**
- `idx_{tabla}_tenant` ON (tenant_id)
- `idx_{tabla}_{campo}` ON ({campo})

**RLS Policy:**
```sql
CREATE POLICY {tabla}_tenant_isolation ON {schema}.{tabla}
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

---

## 5. Endpoints API

### 5.1 Resumen de Endpoints

| Metodo | Endpoint | Descripcion | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/{recurso}` | Crear {recurso} | SI | admin, {rol} |
| GET | `/api/v1/{recurso}` | Listar {recursos} | SI | * |
| GET | `/api/v1/{recurso}/:id` | Obtener {recurso} | SI | * |
| PUT | `/api/v1/{recurso}/:id` | Actualizar {recurso} | SI | admin, {rol} |
| DELETE | `/api/v1/{recurso}/:id` | Eliminar {recurso} | SI | admin |

### 5.2 Detalle de Endpoints

#### POST /api/v1/{recurso}

**Request:**
```json
{
  "{campo1}": "{valor}",
  "{campo2}": "{valor}"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "{campo1}": "{valor}",
  "{campo2}": "{valor}",
  "createdAt": "2026-01-10T00:00:00Z"
}
```

**Errores:**
- 400: Validacion fallida
- 401: No autenticado
- 403: Sin permisos
- 409: {recurso} ya existe

---

## 6. Configuracion

### 6.1 Variables de Entorno

```env
# {Nombre Modulo}
{MODULO}_FEATURE_ENABLED=true
{MODULO}_MAX_ITEMS=100
{MODULO}_TIMEOUT_MS=5000
```

### 6.2 Valores por Defecto

| Variable | Default | Descripcion |
|----------|---------|-------------|
| {MODULO}_FEATURE_ENABLED | true | Habilitar feature |
| {MODULO}_MAX_ITEMS | 100 | Maximo de items por pagina |

---

## 7. Dependencias

### 7.1 Depende de

| Modulo | Tipo | Descripcion |
|--------|------|-------------|
| {MGN-000-core} | Requerido | Funcionalidades base |
| {MGN-001-auth} | Requerido | Autenticacion |
| {MGN-002-tenants} | Requerido | Multi-tenancy |

### 7.2 Bloquea a

| Modulo | Descripcion |
|--------|-------------|
| {MGN-010-reports} | Requiere datos de este modulo |

---

## 8. Roadmap / Estado

### 8.1 Features Implementadas

| Feature | Estado | Sprint | Notas |
|---------|--------|--------|-------|
| {Feature 1} | Completado | S1 | |
| {Feature 2} | Completado | S1 | |
| {Feature 3} | En progreso | S2 | 80% |

### 8.2 Features Pendientes

| Feature | Prioridad | Sprint Est. | Bloqueadores |
|---------|-----------|-------------|--------------|
| {Feature 4} | P1 | S3 | Ninguno |
| {Feature 5} | P2 | S4 | Depende de {otro} |

---

## 9. Testing

### 9.1 Cobertura

| Tipo | Archivos | Cobertura |
|------|----------|-----------|
| Unit | {N} | {N}% |
| Integration | {N} | {N}% |

### 9.2 Casos de Test Principales

- [ ] Crear {recurso} con datos validos
- [ ] Crear {recurso} con datos invalidos (400)
- [ ] Listar {recursos} con paginacion
- [ ] Obtener {recurso} por ID
- [ ] Actualizar {recurso}
- [ ] Eliminar {recurso}
- [ ] Verificar RLS entre tenants

---

## 10. Historias de Usuario Relacionadas

| ID | Titulo | Estado | SP |
|----|--------|--------|-----|
| `US-{XXX}-001` | {Titulo} | {Estado} | {N} |
| `US-{XXX}-002` | {Titulo} | {Estado} | {N} |

---

## 11. Notas Tecnicas

{Consideraciones tecnicas importantes, decisiones de arquitectura,
limitaciones conocidas o aspectos a tener en cuenta.}

---

## 12. Referencias

- Especificacion Tecnica: `./ET-{TIPO}-{MODULO}.md`
- Requerimientos: `./RF-{MODULO}-001.md`
- ADR Relacionado: `../../../docs/90-adr/ADR-{NNNN}.md`

---

**Ultima actualizacion:** {YYYY-MM-DD}
**Version:** {SEMVER}
```

---

**Referencia:** SIMCO-ESTRUCTURA-DOCS.md
