# PLAN DE ACCIÓN - COHERENCIA GAMILIT

**Objetivo:** Homologar Backend con Base de Datos, sincronizar con Frontend y actualizar Documentación
**Plazo:** 3 meses (12 semanas)
**Fecha inicio:** 2025-11-08

---

## 🎯 RESUMEN EJECUTIVO

### Problemas Identificados

1. **Backend Incompleto**: 125 archivos faltantes (22% del código documentado)
2. **Documentación Obsoleta**: 78.3% de referencias inválidas (177/226 archivos)
3. **ENUMs Duplicados**: 2 versiones de `MayaRank`, confusión en Leaderboards
4. **Funciones SQL Faltantes**: 38 funciones documentadas pero no implementadas
5. **Entidades Faltantes**: 10 tablas DB sin entidades TypeORM

### Impacto Actual

- 🔴 **Bugs potenciales**: ENUMs incorrectos → datos erróneos en UI
- 🔴 **Desarrollo lento**: 78% de referencias inválidas → tiempo perdido buscando código
- 🟡 **Mantenibilidad baja**: Código sin tests (15% coverage) → riesgo de regresiones
- 🟡 **Onboarding difícil**: Nuevos devs confundidos con docs obsoletas

---

## 📅 CRONOGRAMA (12 Semanas)

### SEMANA 1-2: CRÍTICO (P0)

#### Objetivo: Resolver bloqueos críticos

**Backend Team (16 horas)**
- [ ] Implementar `AchievementService` (4h)
  - Métodos: `grantAchievement()`, `checkConditions()`, `getUserAchievements()`
  - Tests unitarios básicos

- [ ] Implementar `MLCoinsService` (4h)
  - Métodos: `award()`, `spend()`, `getBalance()`, `getTransactions()`
  - Integración con `TransactionTypeEnum`

- [ ] Implementar `RankService` (4h)
  - Métodos: `calculateRank()`, `checkPromotion()`, `getRankProgress()`
  - Usar función SQL `check_rank_promotion()`

- [ ] Crear DTOs básicos (4h)
  - `CreateAchievementDto`, `AwardMLCoinsDto`, `GrantAchievementDto`

**Frontend Team (4 horas)**
- [ ] Eliminar `MayaRank` duplicado de `leaderboard.types.ts` (1h)
- [ ] Actualizar componentes Leaderboard para usar `enums.constants.ts` (2h)
- [ ] Tests de regresión (1h)

**Database Team (8 horas)**
- [ ] Implementar función `check_rank_promotion(user_id UUID)` (2h)
- [ ] Implementar función `award_ml_coins(user_id, amount, reason)` (2h)
- [ ] Implementar función `grant_achievement(user_id, achievement_id)` (2h)
- [ ] Migration script y tests (2h)

**Entregables:**
- ✅ 3 servicios core de gamificación operativos
- ✅ MayaRank unificado en todo el sistema
- ✅ 3 funciones SQL críticas implementadas
- ✅ Tests pasando con nueva lógica

---

### SEMANA 3-4: ALTO (P1)

#### Objetivo: Completar backend crítico y corregir documentación

**Backend Team (16 horas)**
- [ ] Crear entidades faltantes (8h)
  - `LeaderboardMetadata`, `AchievementCategory`, `ActiveBoost`
  - `InventoryTransaction`, `MayaRank` (seed entity)
  - Índices y relaciones

- [ ] OAuth Strategies (8h)
  - `GoogleStrategy` (Passport.js)
  - `FacebookStrategy` (Passport.js)
  - OAuth callback controller
  - Middleware de autenticación

**Tech Writer + Script (8 horas)**
- [ ] Ejecutar script de corrección automática en top 20 docs (2h)
- [ ] Validar correcciones manualmente (3h)
- [ ] Actualizar mapeo de rutas en `GUIA-CORRECCION-REFERENCIAS.md` (1h)
- [ ] Commit y PR con correcciones (1h)
- [ ] Generar reporte de validez post-corrección (1h)

**DevOps Team (4 horas)**
- [ ] Integrar script de validación en GitHub Actions (2h)
- [ ] Configurar check en PRs (falla si validez < 50%) (1h)
- [ ] Documentar proceso en `CONTRIBUTING.md` (1h)

**Entregables:**
- ✅ 5 entidades nuevas con tests
- ✅ OAuth básico funcional (Google + Facebook)
- ✅ Top 20 documentos actualizados (80%+ validez esperada)
- ✅ CI/CD validando referencias en cada PR

---

### SEMANA 5-8: MEDIO (P2)

#### Objetivo: Completar funcionalidades y mejorar validación

**Backend Team (32 horas)**
- [ ] Implementar validadores de ejercicios (16h)
  - `ExerciseValidatorService` base
  - Validadores por tipo (priorizar top 10 ejercicios más usados)
  - `TaxonomyBloomValidator`
  - `ExerciseConfigValidator`
  - Tests unitarios completos

- [ ] Analytics básicos (16h)
  - `AnalyticsService` (getClassroomStats, getStudentProgress)
  - `ProgressAnalyticsService`
  - DTOs de response
  - Endpoints REST

**Database Team (16 horas)**
- [ ] Implementar funciones SQL restantes (12h)
  - Priorizar funciones de analytics
  - Funciones de validación
  - Funciones de cálculo de progreso

- [ ] Migrations y seeds (4h)
  - Crear migrations para despliegue
  - Seeds de datos de prueba para analytics

**Frontend Team (8 horas)**
- [ ] Deprecar `exercise.types.ts` (2h)
  - Migrar componentes a `educational.types.ts`
  - Actualizar imports

- [ ] Implementar componentes de Analytics (6h)
  - Dashboard de profesor (ClassroomAnalytics)
  - Gráficos de progreso individual

**DevOps Team (4 horas)**
- [ ] Dashboard de coherencia en README (2h)
  - Badges de validez de docs
  - Métricas de cobertura de entidades

- [ ] Alertas automáticas en PRs (2h)
  - Detectar nuevos ENUMs sin sincronizar
  - Sugerir actualización de docs cuando se modifican archivos

**Entregables:**
- ✅ Validadores de ejercicios operativos
- ✅ 38 funciones SQL implementadas
- ✅ Analytics básicos disponibles para profesores
- ✅ Sistema de alertas automáticas en PRs

---

### SEMANA 9-12: MEJORAS (P3)

#### Objetivo: Documentación viva y funcionalidades avanzadas

**Backend Team (24 horas)**
- [ ] Dificultad adaptativa (16h)
  - `AdaptiveDifficultyService`
  - Algoritmos de ajuste basados en rendimiento
  - Funciones SQL de análisis
  - Tests completos

- [ ] Completar Analytics (8h)
  - Reportes avanzados
  - Exportación a PDF/Excel
  - Comparativas entre estudiantes

**Frontend Team (16 horas)**
- [ ] Dashboard de Analytics completo (12h)
  - Gráficos interactivos (Chart.js / Recharts)
  - Filtros avanzados
  - Exportación de reportes

- [ ] Tests end-to-end (4h)
  - Flows críticos con Cypress
  - Gamificación, progreso, ejercicios

**DevOps Team (16 horas)**
- [ ] Documentación viva (12h)
  - TypeDoc para generar docs de Backend
  - Storybook para Frontend
  - Automatización de generación en CI/CD

- [ ] Dashboard de sincronización (4h)
  - Comparar ENUMs Backend vs Frontend vs DB
  - Visualización de cobertura de entidades
  - Alertas proactivas

**Tech Writer (8 horas)**
- [ ] Actualizar guías de desarrollo (4h)
  - Nueva estructura de módulos
  - Patrones de diseño aplicados
  - Ejemplos de código actualizados

- [ ] Crear documentación de APIs (4h)
  - Swagger/OpenAPI actualizado
  - Ejemplos de uso
  - Postman collections

**Entregables:**
- ✅ Dificultad adaptativa operativa
- ✅ Analytics completos con exportación
- ✅ Documentación auto-generada
- ✅ Dashboard de sincronización en tiempo real
- ✅ Tests E2E cubriendo flows críticos

---

## 📊 MÉTRICAS Y KPIS

### Semana 1-2 (P0)
- ✅ 3 servicios implementados
- ✅ 0 ENUMs duplicados
- ✅ 3 funciones SQL operativas

### Semana 3-4 (P1)
- ✅ 5 entidades nuevas
- ✅ OAuth funcional
- ✅ Validez de docs: 50% → 80%

### Semana 5-8 (P2)
- ✅ Cobertura entidades: 81% → 95%
- ✅ 38 funciones SQL completas
- ✅ Test coverage Backend: 15% → 40%

### Semana 9-12 (P3)
- ✅ Docs auto-generadas
- ✅ Test coverage Backend: 40% → 70%
- ✅ Test coverage Frontend: 13% → 50%
- ✅ Dashboard de sincronización operativo

---

## 🚦 CRITERIOS DE ÉXITO

### Fase 1 Exitosa (Semana 2)
- [ ] MayaRank unificado en todo el codebase
- [ ] Servicios de gamificación respondiendo correctamente
- [ ] Funciones SQL ejecutándose sin errores
- [ ] Tests unitarios pasando (100%)

### Fase 2 Exitosa (Semana 4)
- [ ] OAuth con Google funcional (login exitoso)
- [ ] Validez de docs ≥ 80%
- [ ] CI/CD validando referencias en cada PR
- [ ] Entidades nuevas con relaciones correctas

### Fase 3 Exitosa (Semana 8)
- [ ] Validadores de ejercicios en producción
- [ ] Analytics accesibles para profesores
- [ ] Cobertura de entidades ≥ 95%
- [ ] Test coverage Backend ≥ 40%

### Fase 4 Exitosa (Semana 12)
- [ ] Documentación auto-generada desplegada
- [ ] Dashboard de sincronización en README
- [ ] Test coverage Backend ≥ 70%
- [ ] Dificultad adaptativa funcionando en 5+ ejercicios

---

## 👥 ASIGNACIÓN DE RESPONSABLES

### Backend Team
**Tech Lead:** @backend-lead
**Developers:** @dev1, @dev2, @dev3

**Responsabilidades:**
- Servicios, entidades, DTOs
- Validadores de ejercicios
- OAuth strategies
- Analytics backend

**Horas estimadas:** 88 horas (22h por semana durante 4 semanas)

---

### Frontend Team
**Tech Lead:** @frontend-lead
**Developers:** @dev4, @dev5

**Responsabilidades:**
- Corregir ENUMs duplicados
- Componentes de Analytics
- Tests E2E
- Integración con nuevos endpoints

**Horas estimadas:** 28 horas (7h por semana durante 4 semanas)

---

### Database Team
**DBA:** @dba-lead
**Developer:** @dev6

**Responsabilidades:**
- Funciones SQL
- Migrations
- Optimización de queries
- Seeds de datos de prueba

**Horas estimadas:** 24 horas (6h por semana durante 4 semanas)

---

### DevOps Team
**DevOps Lead:** @devops-lead

**Responsabilidades:**
- CI/CD checks
- Scripts de validación
- Dashboard de coherencia
- Automatización de documentación

**Horas estimadas:** 24 horas (6h por semana durante 4 semanas)

---

### Tech Writer
**Writer:** @tech-writer

**Responsabilidades:**
- Actualizar documentación top 20
- Generar reportes de validez
- Swagger/OpenAPI
- Guías de desarrollo

**Horas estimadas:** 16 horas (4h por semana durante 4 semanas)

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Preparación (Pre-Semana 1)
- [ ] Reunión de kickoff con todos los equipos
- [ ] Asignar tareas en Jira/Linear
- [ ] Configurar branch `feat/coherencia-homologacion`
- [ ] Crear PRs iniciales vacíos para tracking

### Durante Ejecución
- [ ] Daily standups (Backend, Frontend, Database)
- [ ] Weekly sync entre equipos
- [ ] Code reviews cruzados
- [ ] Actualizar métricas semanalmente

### Al Final de Cada Fase
- [ ] Demo de funcionalidades completadas
- [ ] Retrospectiva del equipo
- [ ] Actualizar roadmap si hay cambios
- [ ] Merge a `main` tras aprobación

---

## 🔧 HERRAMIENTAS Y RECURSOS

### Scripts Disponibles
- `devops/scripts/sync-enums.ts` - Sincronizar ENUMs
- `devops/scripts/validate-constants-usage.ts` - Detectar hardcoding
- `GUIA-CORRECCION-REFERENCIAS.md` - Script Python de validación
- `RESUMEN-ANALISIS-REFERENCIAS.md` - Métricas actuales

### Documentación Generada
- `REPORTE-COHERENCIA-GAMILIT.md` - Análisis completo (este documento padre)
- `BACKEND_ENTITIES_SUMMARY.md` - Resumen de entidades
- `INVENTARIO-REFERENCIAS-DOCS-CODIGO.md` - Referencias de docs
- CSVs procesables en raíz del proyecto

### Branches y PRs
- `feat/coherencia-homologacion` - Branch principal del plan
- Sub-branches por fase:
  - `feat/coherencia-p0-critical`
  - `feat/coherencia-p1-high`
  - `feat/coherencia-p2-medium`
  - `feat/coherencia-p3-improvements`

---

## 🎯 QUICK WINS (Primeras 48 Horas)

Para generar momentum y mostrar progreso rápido:

### Quick Win #1: MayaRank Unificado (2 horas)
**Impacto:** Alto - Elimina bugs en Leaderboards
**Esfuerzo:** Bajo

**Pasos:**
1. Eliminar archivo `frontend/src/shared/types/leaderboard.types.ts` líneas 5-12
2. Actualizar imports en `LeaderboardCard.tsx`, `LeaderboardList.tsx`
3. Run tests: `npm test -- leaderboard`
4. Commit + PR

**Owner:** @frontend-lead

---

### Quick Win #2: Función SQL `award_ml_coins()` (3 horas)
**Impacto:** Alto - Requerida por MLCoinsService
**Esfuerzo:** Bajo

**Pasos:**
1. Crear `/apps/database/ddl/schemas/gamification_system/functions/award_ml_coins.sql`
2. Implementar lógica:
   - Actualizar `user_stats.ml_coins`
   - Insertar en `ml_coins_transactions`
   - Retornar nuevo balance
3. Migration script
4. Test con psql

**Owner:** @dba-lead

---

### Quick Win #3: CI Check de Referencias (2 horas)
**Impacto:** Medio - Previene regresiones futuras
**Esfuerzo:** Bajo

**Pasos:**
1. Copiar script Python de `GUIA-CORRECCION-REFERENCIAS.md`
2. Crear `.github/workflows/validate-docs.yml`
3. Configurar para correr en PRs
4. Test en PR de prueba

**Owner:** @devops-lead

---

## 📞 COMUNICACIÓN Y REPORTES

### Daily Standups (15 min)
- **Hora:** 9:00 AM
- **Formato:** Async en Slack #coherencia-gamilit
- **Responder:**
  - ¿Qué hice ayer?
  - ¿Qué haré hoy?
  - ¿Algún blocker?

### Weekly Sync (30 min)
- **Día:** Viernes 4:00 PM
- **Formato:** Zoom call
- **Agenda:**
  - Review de métricas
  - Demos de lo completado
  - Ajustes al plan si necesario

### Reportes
- **Semanales:** Tech Lead envía update a stakeholders
- **Mensuales:** Demo completa de fase con C-level

---

## 🚀 SIGUIENTES PASOS INMEDIATOS

### Hoy (Día 1)
1. [ ] Tech Lead: Convocar kickoff meeting (30 min)
2. [ ] Todos: Leer `REPORTE-COHERENCIA-GAMILIT.md` completo
3. [ ] Todos: Asignarse tareas en Jira

### Mañana (Día 2)
1. [ ] Frontend: Iniciar Quick Win #1 (MayaRank)
2. [ ] Database: Iniciar Quick Win #2 (award_ml_coins)
3. [ ] DevOps: Iniciar Quick Win #3 (CI check)

### Semana 1
1. [ ] Completar todos los Quick Wins
2. [ ] Backend: Implementar AchievementService
3. [ ] Database: Implementar funciones críticas
4. [ ] Daily standups diarios

---

**Aprobado por:** Tech Lead
**Fecha de inicio:** 2025-11-08
**Fecha estimada de finalización:** 2026-02-08 (12 semanas)
**Próxima revisión:** 2025-11-15 (post Quick Wins)
