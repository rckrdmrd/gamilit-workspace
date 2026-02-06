# TEMPLATE: ÉPICA

**Versión:** 1.1.0
**Fecha:** 2025-12-08
**Uso:** Definición de épicas del proyecto

---

## VERIFICACIÓN DE CATÁLOGO (ANTES DE CREAR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OBLIGATORIO: Verificar si funcionalidades de esta épica existen en catálogo│
│                                                                             │
│ 1. Revisar historias de usuario vs keywords de @CATALOG_INDEX              │
│ 2. Si match → referenciar en "Notas Técnicas" de cada US y usar código     │
│ 3. Si NO match → proceder con implementación nueva                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades del Catálogo a Considerar:**
- [ ] auth / login / registro → `@CATALOG_AUTH`
- [ ] sesiones / logout → `@CATALOG_SESSION`
- [ ] rate-limit / throttle → `@CATALOG_RATELIMIT`
- [ ] notificaciones / email / push → `@CATALOG_NOTIFY`
- [ ] multi-tenant / organización → `@CATALOG_TENANT`
- [ ] feature-flag / toggle → `@CATALOG_FLAGS`
- [ ] websocket / realtime → `@CATALOG_WS`
- [ ] pagos / stripe / suscripción → `@CATALOG_PAYMENTS`

**Resultado verificación:** {✅ No aplica catálogo | ✅ Usar @CATALOG_XXX para US-{NNN} | ⚠️ Pendiente verificar}

---

## ÉPICA: {EPIC-ID} - {Nombre de la Épica}

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | {EPIC-ID} (ej: EAI-001, EXT-005) |
| **Nombre** | {nombre descriptivo} |
| **Módulo** | {módulo principal} |
| **Fase** | {Fase 1 - Alcance Inicial / Fase 2 - Robustecimiento / Fase 3 - Extensiones} |
| **Prioridad** | {P0 / P1 / P2 / P3} |
| **Estado** | {Backlog / Ready / In Progress / Done} |
| **Story Points** | {estimación total} |
| **Sprint(s)** | {sprint(s) asignados} |

### Descripción

{Descripción de alto nivel de la épica. Qué problema resuelve, por qué es importante para el negocio.}

### Objetivo de Negocio

{Qué valor aporta esta épica al producto/negocio}

### Stakeholders

| Rol | Nombre/Equipo | Responsabilidad |
|-----|---------------|-----------------|
| Product Owner | {nombre} | Aprobación de criterios |
| Tech Lead | {nombre} | Validación técnica |
| Usuarios | {tipo} | Feedback |

---

### Historias de Usuario

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| US-{MOD}-001 | Como {rol}, quiero {acción} para {beneficio} | P0 | 5 | Backlog |
| US-{MOD}-002 | Como {rol}, quiero {acción} para {beneficio} | P0 | 3 | Backlog |
| US-{MOD}-003 | Como {rol}, quiero {acción} para {beneficio} | P1 | 8 | Backlog |

**Total Story Points:** {suma}

---

### Criterios de Aceptación de la Épica

**Funcionales:**
- [ ] {Criterio funcional 1}
- [ ] {Criterio funcional 2}
- [ ] {Criterio funcional 3}

**No Funcionales:**
- [ ] Performance: {criterio de rendimiento}
- [ ] Seguridad: {criterio de seguridad}
- [ ] Usabilidad: {criterio de UX}

**Técnicos:**
- [ ] Cobertura de tests > 80%
- [ ] Documentación completa
- [ ] Integración DB-Backend-Frontend verificada

---

### Dependencias

**Esta épica depende de:**
| Épica/Módulo | Estado | Bloqueante |
|--------------|--------|------------|
| {EPIC-XXX} | Done | Sí |
| {Módulo Y} | In Progress | No |

**Esta épica bloquea:**
| Épica/Módulo | Razón |
|--------------|-------|
| {EPIC-YYY} | Requiere API de esta épica |

---

### Desglose Técnico

**Database:**
- [ ] Schema: {schema_name}
- [ ] Tablas: {cantidad} ({lista})
- [ ] Funciones: {cantidad}
- [ ] RLS Policies: Sí/No

**Backend:**
- [ ] Módulo: {module_name}
- [ ] Entities: {cantidad}
- [ ] Endpoints: {cantidad}
- [ ] Tests: {cantidad esperada}

**Frontend:**
- [ ] Páginas: {cantidad} ({lista})
- [ ] Componentes: {cantidad}
- [ ] Stores: {cantidad}

---

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| {Riesgo 1} | Alta/Media/Baja | Alto/Medio/Bajo | {Estrategia} |

---

### Definition of Ready (DoR)

- [ ] Historias de usuario definidas
- [ ] Criterios de aceptación claros
- [ ] Dependencias identificadas
- [ ] Estimación completada
- [ ] Diseño técnico aprobado
- [ ] Sin bloqueadores activos

### Definition of Done (DoD)

- [ ] Código implementado y revisado
- [ ] Tests pasando (unit, integration, e2e)
- [ ] Documentación actualizada
- [ ] Inventarios actualizados
- [ ] Trazas registradas
- [ ] Demo realizada
- [ ] Product Owner aprobó

---

### Documentación Relacionada

- Requerimientos: `docs/03-requerimientos/RF-{modulo}/`
- Especificaciones: `docs/04-modelado/especificaciones-tecnicas/`
- User Stories: `docs/05-user-stories/US-{modulo}/`
- ADR: `docs/90-adr/ADR-{NNN}-{nombre}.md`

---

### Historial

| Fecha | Cambio | Autor |
|-------|--------|-------|
| {YYYY-MM-DD} | Creación de épica | {nombre} |

---

**Creada por:** {nombre-agente}
**Fecha:** {YYYY-MM-DD}
**Última actualización:** {YYYY-MM-DD}
