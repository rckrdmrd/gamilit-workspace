# TEMPLATE: HISTORIA DE USUARIO

**Versión:** 1.1.0
**Fecha:** 2025-12-08
**Uso:** Definición de historias de usuario

---

## VERIFICACIÓN DE CATÁLOGO (ANTES DE CREAR)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OBLIGATORIO: Verificar si la funcionalidad ya existe en el catálogo        │
│                                                                             │
│ 1. Consultar @CATALOG_INDEX con keywords de esta historia                  │
│ 2. Si existe → referenciar en "Notas Técnicas" y usar implementación       │
│ 3. Si NO existe → proceder normalmente                                     │
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

**Resultado verificación:** {✅ No aplica catálogo | ✅ Usar @CATALOG_XXX | ⚠️ Pendiente verificar}

---

## US-{MODULO}-{NNN}: {Título de la Historia}

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-{MODULO}-{NNN} |
| **Épica** | {EPIC-ID} - {Nombre Épica} |
| **Módulo** | {módulo} |
| **Prioridad** | {P0 / P1 / P2 / P3} |
| **Story Points** | {1 / 2 / 3 / 5 / 8 / 13} |
| **Sprint** | {Sprint N} |
| **Estado** | {Backlog / Ready / In Progress / Review / Done} |
| **Asignado a** | {agente/desarrollador} |

---

### Historia de Usuario

**Como** {rol/persona},
**quiero** {acción/funcionalidad},
**para** {beneficio/valor de negocio}.

### Descripción Detallada

{Contexto adicional, explicación del comportamiento esperado, ejemplos de uso}

### Mockups/Wireframes

{Referencias a diseños si existen}
- Figma: {link}
- Wireframe: {ruta archivo}

---

### Criterios de Aceptación

**Escenario 1: {nombre del escenario}**
```gherkin
DADO {contexto/precondición}
CUANDO {acción del usuario}
ENTONCES {resultado esperado}
```

**Escenario 2: {nombre del escenario}**
```gherkin
DADO {contexto/precondición}
CUANDO {acción del usuario}
ENTONCES {resultado esperado}
```

**Escenario 3: {caso de error/edge case}**
```gherkin
DADO {contexto/precondición}
CUANDO {acción del usuario}
ENTONCES {manejo de error esperado}
```

### Criterios Adicionales

- [ ] {Criterio de UI/UX}
- [ ] {Criterio de validación}
- [ ] {Criterio de performance}
- [ ] {Criterio de accesibilidad}

---

### Tareas Técnicas

**Database:**
- [ ] DB-{NNN}: {descripción tarea DB}

**Backend:**
- [ ] BE-{NNN}: {descripción tarea Backend}
- [ ] BE-{NNN}: {descripción tarea Backend}

**Frontend:**
- [ ] FE-{NNN}: {descripción tarea Frontend}
- [ ] FE-{NNN}: {descripción tarea Frontend}

**Tests:**
- [ ] TEST-{NNN}: {descripción test}

---

### Dependencias

**Depende de:**
- [ ] US-{MOD}-{NNN}: {descripción} - Estado: {estado}

**Bloquea:**
- [ ] US-{MOD}-{NNN}: {descripción}

---

### Notas Técnicas

**Endpoints involucrados:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/{resource} | {descripción} |
| POST | /api/{resource} | {descripción} |

**Entidades/Tablas:**
- `{schema}.{tabla}`: {descripción}

**Componentes UI:**
- `{ComponentName}`: {descripción}

---

### Definition of Ready (DoR)

- [ ] Historia claramente escrita (quién, qué, por qué)
- [ ] Criterios de aceptación definidos
- [ ] Story points estimados
- [ ] Dependencias identificadas
- [ ] Sin bloqueadores
- [ ] Diseño/mockup disponible (si aplica)
- [ ] API spec disponible (si aplica)

### Definition of Done (DoD)

- [ ] Código implementado según criterios
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integración pasando
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Inventarios actualizados (MASTER_INVENTORY.yml)
- [ ] Traza registrada (TRAZA-TAREAS-{GRUPO}.md)
- [ ] QA aprobado
- [ ] Desplegado en ambiente de pruebas

---

### Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| {YYYY-MM-DD} | Creación | {nombre} |
| {YYYY-MM-DD} | {cambio} | {nombre} |

---

### Notas de Implementación

{Notas del desarrollador durante la implementación}

### Notas de QA

{Notas del tester durante la validación}

---

**Creada por:** {nombre-agente}
**Fecha:** {YYYY-MM-DD}
**Última actualización:** {YYYY-MM-DD}
