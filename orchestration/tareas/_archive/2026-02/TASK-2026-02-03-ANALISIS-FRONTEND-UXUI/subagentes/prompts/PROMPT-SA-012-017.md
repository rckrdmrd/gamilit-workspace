# PROMPTS DE SPRINT 3 (INTEGRACIÓN)

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-04
**Sprint:** 3 (FASE-6)

---

## SUBAGENTE SA-12: ET Files Parent Portal (ST-6.1)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.1
- **Prioridad:** P0

### Prompt Enviado

```
Define ET files needed for Parent Portal in GAMILIT.

Based on Sprint 1 findings (ST-1.8):
- Parent Portal at 35% implementation
- 4 pages exist but undocumented
- parentStore exists but undocumented
- EXT-011 epic is blocked

Create specifications for these ET files:
1. ET-PAR-001: Parent Login (auth flow)
2. ET-PAR-002: Parent Register (with child linking)
3. ET-PAR-003: Parent Dashboard (overview)
4. ET-PAR-004: Child Progress View (detailed)
5. ET-PAR-005: Parent Notifications (alerts)
6. ET-PAR-006: Parent Settings (preferences)
7. ET-PAR-007: Parent-Teacher Chat (communication)
8. ET-PAR-008: Link Child Account (association flow)
9. ET-PAR-009: Weekly Progress Report (summary)
10. ET-PAR-010: Parent Onboarding (first-time flow)

For each ET file provide:
- Title and ID
- Priority (P0/P1/P2)
- Story Points estimate
- Dependencies
- Key acceptance criteria
- Related components (if exist)
- Related API endpoints needed
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.1
fase: FASE-6
dependencia: ST-1.8 (Parent audit)
epica: EXT-011
prioridad: P0
ubicacion_destino: docs/50-requerimientos/03-fase-extensiones/EXT-011/especificaciones/
```

### Resultado Obtenido

- 10 ET files especificados
- 59 Story Points total
- Prioridades asignadas (5 P0, 5 P1)
- Dependencias mapeadas

---

## SUBAGENTE SA-13: ET Files Economía (ST-6.2)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.2
- **Prioridad:** P1

### Prompt Enviado

```
Define ET files needed for Economy features in GAMILIT.

Based on Sprint 1 findings (ST-1.3):
- Economy at 95% but 6 gaps identified
- Shop, Wallet, Inventory need documentation
- economyStore needs formal spec

Create specifications for these ET files:
1. ET-SHOP-001: Shop Overview & Categories
2. ET-SHOP-002: Purchase Flow (complete transaction)
3. ET-WALLET-001: Wallet & Transaction History
4. ET-INVENT-001: Inventory Management
5. ET-GAM-010: Economy Analytics (Admin view)
6. ET-GAM-011: Purchase Confirmation UX

For each provide:
- Title and ID
- Priority
- Story Points
- Components involved (from ST-1.3.3)
- API endpoints needed
- Store changes needed
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.2
fase: FASE-6
dependencia: ST-1.3.3 (Economy audit)
store_relacionado: economyStore
ubicacion_destino: docs/50-requerimientos/01-fase-alcance-inicial/EAI-003/especificaciones/
```

### Resultado Obtenido

- 6 ET files especificados
- 43 Story Points total
- Componentes existentes mapeados
- APIs requeridas identificadas

---

## SUBAGENTE SA-14: ET Files Social (ST-6.3)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.3
- **Prioridad:** P1

### Prompt Enviado

```
Define ET files needed for Social features in GAMILIT.

Based on Sprint 1 findings (ST-3.4):
- Social flows at 72.5% coherence
- Friends, Guilds need full documentation
- Social interactions need specification

Create specifications for these ET files:
1. ET-SOC-001: Friends System (add, remove, list)
2. ET-SOC-002: Guilds System (create, join, manage)
3. ET-SOC-003: Social Interactions (likes, comments, shares)
4. ET-SOC-004: User Follows (follow/unfollow)
5. ET-LBOARD-001: Advanced Leaderboards (filters, time ranges)

For each provide:
- Title and ID
- Priority
- Story Points
- Related database tables
- API endpoints needed
- Store changes needed
- Privacy considerations
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.3
fase: FASE-6
dependencia: ST-3.4 (Social flows)
schema_relacionado: social_features
stores_relacionados:
  - friendsStore
  - guildsStore
  - leaderboardsStore
```

### Resultado Obtenido

- 5 ET files especificados
- 102 Story Points total
- Sistema de permisos considerado
- Tablas BD mapeadas

---

## SUBAGENTE SA-15: US Parent Portal (ST-6.4)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.4
- **Prioridad:** P0

### Prompt Enviado

```
Define User Stories for Parent Portal in GAMILIT.

Based on ET files defined in ST-6.1, create User Stories:

1. US-PAR-001: "Como padre quiero ver el progreso de mi hijo"
   - Related to: ET-PAR-004

2. US-PAR-002: "Como padre quiero recibir alertas de bajo rendimiento"
   - Related to: ET-PAR-005

3. US-PAR-003: "Como padre quiero vincular mi cuenta con mi hijo"
   - Related to: ET-PAR-008

4. US-PAR-004: "Como padre quiero comunicarme con el profesor"
   - Related to: ET-PAR-007

5. US-PAR-005: "Como padre quiero ver un reporte semanal"
   - Related to: ET-PAR-009

6. US-PAR-006: "Como padre quiero configurar mis notificaciones"
   - Related to: ET-PAR-005

For each US provide:
- ID and Title
- Actor (Padre/Tutor)
- Story format (Como X, quiero Y, para Z)
- Acceptance criteria (Given/When/Then)
- Story Points
- ET file dependency
- Priority
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.4
fase: FASE-6
dependencia: ST-6.1 (ET files Parent)
epica: EXT-011
formato: Gherkin-style acceptance criteria
```

### Resultado Obtenido

- 6 User Stories definidas
- 36 Story Points total
- ~158 horas estimadas
- Criterios de aceptación en formato Gherkin

---

## SUBAGENTE SA-16: US Social/Economy (ST-6.5)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.5
- **Prioridad:** P1

### Prompt Enviado

```
Define User Stories for Social and Economy features in GAMILIT.

Social US (based on ST-6.3):
1. US-SOC-005: "Como estudiante quiero buscar y agregar amigos"
2. US-SOC-006: "Como estudiante quiero crear un guild"
3. US-SOC-007: "Como estudiante quiero retar a un amigo"
4. US-SOC-008: "Como estudiante quiero seguir a otros estudiantes"

Economy US (based on ST-6.2):
1. US-SHOP-001: "Como estudiante quiero comprar items en la tienda"
2. US-SHOP-002: "Como estudiante quiero ver mi historial de transacciones"
3. US-SHOP-003: "Como estudiante quiero usar items de mi inventario"

For each provide:
- Full US format
- Acceptance criteria
- Story Points
- ET file dependency
- Priority
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.5
fase: FASE-6
dependencias:
  - ST-6.2 (ET Economy)
  - ST-6.3 (ET Social)
actor_principal: Estudiante
```

### Resultado Obtenido

- 4 Social US + 3 Economy US = 7 total
- 60 Story Points total
- Prioridades asignadas
- Dependencias mapeadas

---

## SUBAGENTE SA-17: ROADMAP Ejecución (ST-6.9)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-6.9
- **Prioridad:** P0

### Prompt Enviado

```
Create execution ROADMAP for GAMILIT frontend improvements.

Based on all Sprint 1-3 findings, create a prioritized roadmap:

PHASE 1 - IMMEDIATE (Sprint 4-5):
- P0 tasks from gaps identified
- ETL/ML/Visualization services (0% coverage)
- Parent Portal foundation (EXT-011)
- educationalContentStore creation

PHASE 2 - SHORT TERM (Sprint 6-8):
- P1 tasks from gaps
- Social features completion
- Content management UI
- LTI integration

PHASE 3 - MEDIUM TERM (Sprint 9-12):
- P2 tasks
- Testing coverage increase
- Performance optimization
- Advanced features

Include:
- Sprint allocation
- Story Points per sprint
- Dependencies between tasks
- Success metrics targets
- Resource recommendations
```

### Contexto Proporcionado

```yaml
subtask_id: ST-6.9
fase: FASE-6
dependencias_todas: ST-6.1 a ST-6.8
metricas_actuales:
  coherencia_fe_docs: 85%
  coherencia_fe_bd: 79%
  api_coverage: 64%
  test_coverage: 13%
metricas_objetivo:
  coherencia_fe_docs: 95%
  coherencia_fe_bd: 90%
  api_coverage: 85%
  test_coverage: 40%
```

### Resultado Obtenido

- ROADMAP Sprint 4-12
- 404 Story Points totales
- 18 semanas de trabajo
- Métricas objetivo definidas por sprint

---

## MÉTRICAS DE SPRINT 3

| Subagente | Subtask | Tiempo | Éxito |
|-----------|---------|--------|-------|
| SA-12 | ST-6.1 | ~5 min | ✅ |
| SA-13 | ST-6.2 | ~4 min | ✅ |
| SA-14 | ST-6.3 | ~5 min | ✅ |
| SA-15 | ST-6.4 | ~4 min | ✅ |
| SA-16 | ST-6.5 | ~4 min | ✅ |
| SA-17 | ST-6.9 | ~6 min | ✅ |

**Total tiempo paralelo:** ~6 minutos (6 en paralelo)

---

## RESUMEN DE PROMPTS

### Patrones Identificados

1. **Estructura consistente:**
   - Contexto (ubicación, dependencias)
   - Tareas específicas numeradas
   - Entregables esperados claramente definidos

2. **Referencias explícitas:**
   - Subtask ID siempre incluido
   - Dependencias de otras subtasks
   - Inventarios y archivos de referencia

3. **Salidas estructuradas:**
   - Listas y conteos
   - Porcentajes y métricas
   - Recomendaciones priorizadas

### Tokens Utilizados

| Sprint | Subagentes | Tokens Prompts | Tokens Outputs |
|--------|------------|----------------|----------------|
| Exploración | 4 | ~2,000 | ~15,000 |
| Sprint 1 | 6 | ~4,500 | ~25,000 |
| Sprint 2 | 5 | ~4,000 | ~22,000 |
| Sprint 3 | 6 | ~4,500 | ~28,000 |
| **TOTAL** | **17** | **~15,000** | **~90,000** |

---

**Documentado:** 2026-02-04
**Sistema:** SIMCO v4.3.0
