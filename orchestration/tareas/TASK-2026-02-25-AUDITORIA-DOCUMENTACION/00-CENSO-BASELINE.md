# 00 - CENSO BASELINE

**Fecha:** 2026-02-25 | **Fase:** 0 | **Subagentes:** H-CENSUS-01, H-CENSUS-02, H-CENSUS-03

---

## Backend

| Metrica | Valor Real | CLAUDE.md | MASTER_INV | Delta |
|---------|-----------|-----------|------------|-------|
| Entity files | 156 | 156 | 156 | 0 |
| Entity classes | 157 | 159 | 159 | -2 |
| Services | 172 | 172 | 172 | 0 |
| Controllers | 108 | 108 | 108 | 0 |
| DTOs | 401 | 401 | 401 | 0 |
| Endpoints | 912 | 912 | 912 | 0 |
| GET | 494 | - | - | - |
| POST | 253 | - | - | - |
| PUT | 25 | - | - | - |
| PATCH | 80 | - | - | - |
| DELETE | 60 | - | - | - |
| Guards | 15 | 15 | 15 | 0 |
| Interceptors | 6 | - | 6 | 0 |
| Pipes | 2 files (6 classes) | - | 6 | Unit mismatch |
| Test files | 63 | 60 | 61 | +2/+3 |
| Test cases | 833 | 833 | 833 | 0 |
| Module dirs | 23 | 23 | 23 | 0 |
| Modules imported | 18 | 18 | 18 | 0 |
| Datasources | 11 | 11 | 11 | 0 |
| Decorators | 18 | 18 | 18 | 0 |

### Modulos Importados (18)
AuthModule, ProfileModule, EducationalModule, ProgressModule, SocialModule, ContentModule, GamificationModule, AdminModule, TeacherModule, NotificationsModule, WebSocketModule, TasksModule, AuditModule, AssignmentsModule, HealthModule, ParentsModule, CommunicationModule, LtiModule

### No Importados (4)
etl, ml, visualization (requieren datasource data_warehouse), mail (transitivo via 5 modulos)

---

## Frontend

| Metrica | Valor Real | CLAUDE.md | MASTER_INV | Delta |
|---------|-----------|-----------|------------|-------|
| Production .tsx | 577 | 590 | 576 | -13/+1 |
| Hook files | 134 | 127 | 128 | +7/+6 |
| Zustand stores | 13 | 13 | 13 | 0 |
| API service files | 33 | 67 | 65 | Metodologia diferente |
| Routes | 74 | 73 | 70 | +1/+4 |
| Context/Provider | 3 | - | 4 | -1 (barrel) |
| Type files | 37 | - | 49 | -12 (scope) |
| Pages | 67-78 | 70 | 67 | Variable |

### Zustand Stores (13)
authStore, battleStore, economyStore, ranksStore, achievementsStore, friendsStore, guildsStore, leaderboardsStore, newLeaderboardsStore, powerUpsStore, notificationsStore, parentStore, studentAssignmentsStore

---

## Database

| Metrica | Valor Real | CLAUDE.md | MASTER_INV | Delta |
|---------|-----------|-----------|------------|-------|
| Schemas | 18 (16+2) | 18 | 18 | 0 |
| Tables | 173 | 173 | 173 | 0 |
| Views | 18 | 18 | 18 | 0 |
| Materialized Views | 7 | 7 | 7 | 0 |
| Functions (DDL) | 158 | 158 | 158 | 0 |
| Triggers | 68 | 68 | 68 | 0 |
| RLS Policies (DDL) | 251 | 251 | 251 | 0 |
| Foreign Keys | 301 | 299 | 299 | +2 |
| ENUMs | 42 | 42 | 42 | 0 |
| Seeds (dev) | 93 | - | 93 | 0 |
| DDL files total | 234 | - | - | - |

---

## Documentacion

| Seccion | Archivos |
|---------|----------|
| 00-overview | 24 |
| 10-requirements | ~500+ (23 EPICs, 144 US, 279 tasks) |
| 20-architecture | 13 + schema-reference (23) |
| 30-ux-ui | 79 (46 flujos + meta) |
| 40-api | 7 |
| 40-standards | 27 |
| 50-guides | 103 |
| 60-portals | 3+ subdirs |
| 70-onboarding | 6 |
| 80-references | 9 |
| 90-adr | 49 (47 ADRs + _INDEX + _MAP + README) |
| 99-delivery | 2 |
| **Total docs/** | **315+** |

---

## Orquestacion

| Metrica | Valor Real | CLAUDE.md | MEMORY.md |
|---------|-----------|-----------|-----------|
| SIMCO activas | 72 | ~63 | 70 |
| SIMCO archivadas | 15 | 13 | 15 |
| Agent profiles (full) | 28+ | 28 | 28 |
| Agent profiles (compact) | 15 | - | 15 |
| Inventarios YAML | 10 | 8 | 9 |
| EPICs (F1-F4) | 23 | - | - |
| EPICs (incl Wave 3) | 34 | - | 34 |

---

## Discrepancias Clave del Censo

1. **Entity classes:** Real=157, Documentado=159 (diferencia de 2 clases)
2. **Test files:** Real=63, CLAUDE.md=60, BACKEND_INV=61
3. **Components .tsx:** Real=577, CLAUDE.md=590, MASTER_INV=576
4. **Hooks:** Real=134, CLAUDE.md=127, MASTER_INV=128
5. **API services:** Real=33 (conteo directo), Inventarios=65 (metodologia amplia)
6. **Foreign keys:** Real=301, CLAUDE.md/MASTER=299
7. **SIMCO activas:** Real=72, _INDEX.md=70, CLAUDE.md=~63
8. **ADRs:** Real=47, _INDEX.md=43, CLAUDE.md=43 (frase "40 normalizados")
9. **Inventarios YAML:** Real=10, CLAUDE.md=8, MEMORY.md=9
