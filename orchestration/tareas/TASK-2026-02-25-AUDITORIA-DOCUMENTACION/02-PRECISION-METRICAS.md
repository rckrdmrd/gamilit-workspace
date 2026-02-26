# 02 - PRECISION DE METRICAS

**Fecha:** 2026-02-25 | **Fase:** 2 | **Subagentes:** O-METRICS-01, O-METRICS-02

---

## Inventarios vs Realidad

### Inventarios Principales (v13.1.0, 2026-02-21) — SUSTANCIALMENTE EXACTOS

22 metricas coinciden exactamente entre inventarios y censo. Solo 10 discrepancias menores.

---

## TRACEABILITY_MATRIX.yml — CRITICO

**Fecha archivo:** 2026-01-16 (39 dias stale)
**Veredicto:** SEVERAMENTE DESACTUALIZADO — regenerar o marcar DEPRECATED

| Metrica | En Archivo | Real | Delta % |
|---------|-----------|------|---------|
| Schemas | 16 | 18 | -11% |
| Tables | 137 | 173 | -21% |
| Functions | 109 | 158 | -31% |
| Triggers | 35 | 68 | -49% |
| RLS Policies | 157 | 251 | -38% |
| Indexes | 405 | 979 | -59% |
| Foreign Keys | 208 | 301 | -31% |
| Modules | 17 | 23 | -26% |
| Entities | 123 | 156 | -21% |
| Services | 104 | 172 | -40% |
| Controllers | 75 | 108 | -31% |
| Endpoints | 612 | 912 | -33% |
| Components | 474 | 577 | -18% |
| Hooks | 102 | 134 | -24% |

---

## CLAUDE.md Discrepancias

| Seccion | Metrica | CLAUDE.md | Real | Correccion |
|---------|---------|-----------|------|------------|
| RC2 | Entity classes | 159 | 157 | Actualizar a 157 |
| Backend | Tests | 833 (60 spec) | 833 (63 spec) | Actualizar a 63 |
| Frontend | Componentes | 590 | 577 | Actualizar a 577 |
| Frontend | Hooks | 127 | 134 | Actualizar a 134 |
| Frontend | API Services | 67 | 65 (INV) | Actualizar a 65 |
| Frontend | Routes | 73 | 74 | Actualizar a 74 |
| Frontend | Paginas | 70 | 67 | Actualizar a 67 |
| DB | Foreign Keys | 299 | 301 | Actualizar a 301 |
| Portales | Maestro pages | 19 | 16 | Actualizar a 16 |
| Modulos | Social % | 50% | 60% | Actualizar a 60% |
| Estructura | Directivas SIMCO | ~63 | 72 | Actualizar a 72 |
| Estructura | Inventarios | 8 | 10 | Actualizar a 10 |
| ADRs | "40 normalizados" | 40 | 47 | Actualizar a 47 |

---

## PROJECT-CONTEXT.md Discrepancias

| Metrica | En Archivo | Real | Correccion |
|---------|-----------|------|------------|
| Entity classes | 159 | 157 | Actualizar |
| Componentes | 590 | 577 | Actualizar |
| Hooks | 127 | 134 | Actualizar |
| API services | 67 | 65 | Actualizar |
| Paginas | 70 | 67 | Actualizar |
| Gamification group | Incluye mail (7 modulos) | mail es transitivo (6 modulos) | Corregir |

---

## MODULOS.md Discrepancias

| Metrica | En Archivo | Real | Delta |
|---------|-----------|------|-------|
| Endpoints total | 905 | 912 | -7 |
| Services total | 173 | 172 | +1 |
| Entities total | ~155 | 156 | -1 |
| Social module % | 50% | 60% | -10% |
| RLS count (tenants) | 227 | 251 | -24 |

**Fecha archivo:** 2026-02-07 (18 dias stale)

---

## Conflictos Cross-Documento

| Metrica | CLAUDE.md | MASTER_INV | Censo | Ganador |
|---------|-----------|------------|-------|---------|
| Entity classes | 159 | 159 | 157 | Censo: 157 |
| Components | 590 | 576 | 577 | Censo: 577 |
| Hooks | 127 | 128 | 134 | Censo: 134 |
| API services | 67 | 65 | 33 | Requiere clarificacion metodologica |
| Routes | 73 | 70 | 74 | Censo: 74 |
| Pages | 70 | 67 | - | MASTER: 67 |
| Test spec files | 60 | 61 | 63 | Censo: 63 |
| Foreign keys | 299 | 299 | 301 | Censo: 301 |
| Teacher pages | 19 | 16 | - | MASTER: 16 |

---

## Clasificacion por Severidad

### CRITICAL (>10% delta)
1. **TRACEABILITY_MATRIX.yml** — 20-59% detras de la realidad en TODAS las metricas
2. **API service files** — CLAUDE.md=67, MASTER=65, Censo=33 (metodologia no definida)

### WARNING (1-10%)
1. Entity classes (159 vs 157)
2. Test spec files (60 vs 63)
3. Frontend hooks (127 vs 134, delta 5.2%)
4. Frontend routes (73 vs 74)
5. Frontend pages (70 vs 67)
6. Type files (37 vs 49, scope diferente)
7. FK count MASTER (299 vs 301)
8. Teacher portal pages (19 vs 16)

### INFO (<1%)
1. Production .tsx (576 vs 577)
2. Pipes (2 files vs 6 classes)
3. Contexts (3 vs 4, barrel count)

### EXACT MATCH (22 metricas)
Entities, Services, Controllers, DTOs, Endpoints, Guards, Interceptors, Test cases, Module dirs, Datasources, Decorators, Stores, Schemas, Tables, Views, MVs, Functions, Triggers, RLS, ENUMs, Seeds dev, Mechanics
