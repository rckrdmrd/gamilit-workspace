# PROMPTS DE SPRINT 1 (AUDITORÍAS)

**Tarea:** TASK-2026-02-03-ANALISIS-FRONTEND-UXUI
**Fecha:** 2026-02-03
**Sprint:** 1 (FASE-1, FASE-2, FASE-3)

---

## SUBAGENTE SA-1: Auditar Parent Portal (ST-1.8)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-1.8
- **Prioridad:** P0 (Crítico)

### Prompt Enviado

```
Audit the Parent Portal implementation in GAMILIT.

Location: apps/frontend/src/apps/parent/

Tasks:
1. Count all components in parent/components/
2. List all pages in parent/pages/ (expected: 4)
3. Identify parentAPI service and its functions
4. Analyze parentStore structure and state
5. Map parent-specific hooks
6. Compare against documented specs (if any ET-PAR-* files exist)

Return:
- Component inventory with documentation status
- Page inventory with route mapping
- API coverage percentage
- Store structure analysis
- List of missing ET files needed
- List of missing US needed

This is the CRITICAL gap area - Parent Portal is at 40% implementation.
```

### Contexto Proporcionado

```yaml
subtask_id: ST-1.8
fase: FASE-1
prioridad: P0
area: apps/parent
estado_esperado: 40% implementado
epica_relacionada: EXT-011
referencias:
  - FRONTEND_INVENTORY.yml
  - docs/50-requerimientos/03-fase-extensiones/EXT-011/
```

### Resultado Obtenido

- 35% implementación real
- 10 ET files faltantes identificados
- 4 páginas mapeadas
- parentStore parcialmente documentado
- Lista de US faltantes para EXT-011

---

## SUBAGENTE SA-2: Auditar Economy/Gamification (ST-1.3)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-1.3
- **Prioridad:** P1

### Prompt Enviado

```
Audit the Gamification/Economy feature in GAMILIT.

Location: apps/frontend/src/features/gamification/

Focus areas:
1. gamification/achievements/ - count components
2. gamification/battles/ - count components
3. gamification/economy/ - CRITICAL: Shop, Wallet, Inventory
4. gamification/leaderboard/ - count components
5. gamification/missions/ - count components
6. gamification/ranks/ - count components
7. gamification/social/ - count components

For economy specifically:
- List all Shop components
- List all Wallet components
- List all Inventory components
- Identify economyStore structure
- Map economy API endpoints

Return gaps against ET-GAM-* specifications.
```

### Contexto Proporcionado

```yaml
subtask_id: ST-1.3
fase: FASE-1
area: features/gamification
componentes_esperados: 74+
stores_relacionados:
  - economyStore
  - ranksStore
  - achievementsStore
  - missionsStore
  - leaderboardsStore
```

### Resultado Obtenido

- 95% completo
- 6 gaps identificados en economía
- economyStore bien estructurado
- 74+ componentes verificados

---

## SUBAGENTE SA-3: Auditar Student Portal (ST-1.6)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-1.6
- **Prioridad:** P1

### Prompt Enviado

```
Audit the Student Portal implementation in GAMILIT.

Location: apps/frontend/src/apps/student/

Tasks:
1. Count components in student/components/ by category:
   - dashboard/
   - exercise/
   - gamification/
   - achievements/
   - progress/
2. List all pages (expected: 28)
3. Map each page to its route
4. Check documentation coverage (JSDoc)
5. Check test coverage (*.test.tsx files)

Compare against:
- FRONTEND_INVENTORY.yml entries
- ET-STU-* specifications (if exist)
- EAI-005 epic requirements

Return:
- Component inventory by category
- Page → Route mapping
- Documentation %
- Test coverage %
- Gaps list
```

### Contexto Proporcionado

```yaml
subtask_id: ST-1.6
fase: FASE-1
area: apps/student
componentes_esperados: 80+
paginas_esperadas: 28
epica_relacionada: EAI-005
```

### Resultado Obtenido

- 100% documentación
- 13% test coverage
- 28 páginas verificadas
- 80+ componentes catalogados

---

## SUBAGENTE SA-4: Validar Social Flows (ST-3.4)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-3.4
- **Prioridad:** P1

### Prompt Enviado

```
Validate Social UX flows in GAMILIT frontend.

Flows to validate:
1. Add Friend flow - Is there UI? What steps?
2. Create Guild flow - Is there UI? What steps?
3. Join Guild flow - Is there UI? What steps?
4. Peer Challenge flow - Is there UI? What steps?
5. Social Leaderboard flow - Is there UI? What steps?

For each flow:
- Check if components exist
- Check if route exists
- Check if API service exists
- Check if store handles state
- Check if ET file documents it

Search in:
- features/gamification/social/
- apps/student/pages/ (social routes)
- services/api/ (social endpoints)

Return coherence percentage and list of gaps.
```

### Contexto Proporcionado

```yaml
subtask_id: ST-3.4
fase: FASE-3
area: social_features
flujos_esperados: 5
epica_relacionada: EAI-004
```

### Resultado Obtenido

- 72.5% coherencia
- Flujos parcialmente implementados
- ET files faltantes para social
- 5 gaps documentados

---

## SUBAGENTE SA-5: Auditar Shared Components (ST-1.1)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-1.1
- **Prioridad:** P2

### Prompt Enviado

```
Audit shared components in GAMILIT.

Location: apps/frontend/src/shared/components/

Audit by subfolder:
1. base/ - Button, Input, etc.
2. layout/ - Header, Footer, Sidebar
3. common/ - Cards, Modals, etc.
4. feedback/ - Alerts, Toasts, etc.
5. loading/ - Spinners, Skeletons
6. mechanics/ - Shared mechanic components

For each component:
- Check props interface exists
- Check JSDoc documentation
- Check if exported in index
- Check test file exists

Return:
- Total component count
- JSDoc coverage %
- Test coverage %
- List of undocumented components
```

### Contexto Proporcionado

```yaml
subtask_id: ST-1.1
fase: FASE-1
area: shared/components
componentes_esperados: 69
```

### Resultado Obtenido

- 57 componentes en shared
- 21% JSDoc coverage
- Lista de componentes sin documentar

---

## SUBAGENTE SA-6: Auditar Student Routes (ST-2.2)

### Perfil Utilizado
- **Tipo:** Explore
- **Subtask:** ST-2.2
- **Prioridad:** P1

### Prompt Enviado

```
Audit student routes in GAMILIT App.tsx router configuration.

Location: apps/frontend/src/App.tsx

Tasks:
1. Find all routes under /student or student-accessible routes
2. Map each route to its page component
3. Check if route is documented in FRONTEND_INVENTORY
4. Identify protected routes (AuthGuard, RoleGuard)
5. Find routes without documentation

Expected routes (~28):
- /dashboard
- /progress
- /exercises/:id
- /achievements
- /leaderboard
- /missions
- /shop
- /inventory
- /guilds
- /friends
- /settings/*
- etc.

Return:
- Complete route list
- Routes without documentation
- Route → Page → Component mapping
```

### Contexto Proporcionado

```yaml
subtask_id: ST-2.2
fase: FASE-2
area: routing
rutas_esperadas: 28
archivo_principal: App.tsx
```

### Resultado Obtenido

- 28 rutas identificadas
- 6 rutas sin documentación
- Mapeo completo route → page

---

## MÉTRICAS DE SPRINT 1

| Subagente | Subtask | Tiempo | Éxito |
|-----------|---------|--------|-------|
| SA-1 | ST-1.8 | ~5 min | ✅ |
| SA-2 | ST-1.3 | ~4 min | ✅ |
| SA-3 | ST-1.6 | ~4 min | ✅ |
| SA-4 | ST-3.4 | ~4 min | ✅ |
| SA-5 | ST-1.1 | ~3 min | ✅ |
| SA-6 | ST-2.2 | ~3 min | ✅ |

**Total tiempo paralelo:** ~5 minutos (6 en paralelo)

---

**Documentado:** 2026-02-04
**Sistema:** SIMCO v4.3.0
