# EPICA: P2-QUALITY - Calidad y Testing

**Version:** 1.0.0
**Fecha:** 2025-12-05
**Uso:** Definicion de epica P2 para Testing

---

## EPICA: P2-QUALITY - Calidad y Testing

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | P2-QUALITY |
| **Nombre** | Calidad y Testing - Incremento Coverage |
| **Modulo** | testing |
| **Fase** | Fase P2 - Post-Sprint P1 |
| **Prioridad** | P2 |
| **Estado** | Ready |
| **Story Points** | 34 SP |
| **Sprint(s)** | P2-B, P2-C |

### Descripcion

Incrementar la cobertura de tests del backend del 18% actual al 50% objetivo, y crear tests E2E para los flujos criticos de los 3 portales (Student, Teacher, Admin). Esta epica es fundamental para garantizar la estabilidad del sistema antes de nuevas releases.

### Objetivo de Negocio

Reducir regresiones y bugs en produccion, aumentar la confianza en los deploys, y establecer una base solida para desarrollo futuro con tests automatizados.

### Stakeholders

| Rol | Nombre/Equipo | Responsabilidad |
|-----|---------------|-----------------|
| Product Owner | Equipo GAMILIT | Aprobacion de criterios |
| Tech Lead | QA-Agent | Validacion tecnica |
| Usuarios | Equipo Dev | Mantenimiento tests |

---

### Historias de Usuario

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| US-TEST-P2-001 | Como desarrollador, quiero tests unitarios en servicios criticos para prevenir regresiones | P2 | 21 | Ready |
| US-TEST-P2-002 | Como QA, quiero tests E2E para validar flujos completos de usuario | P2 | 13 | Ready |

**Total Story Points:** 34 SP

---

### Criterios de Aceptacion de la Epica

**Funcionales:**
- [ ] Tests unitarios para MLCoinsService
- [ ] Tests unitarios para MissionsService
- [ ] Tests unitarios para ShopService
- [ ] Tests unitarios para GradingService
- [ ] Tests unitarios para BulkOperationsService
- [ ] E2E Student: Login -> Ejercicio -> Gamificacion -> Leaderboard
- [ ] E2E Teacher: Login -> Dashboard -> Aulas -> Calificacion
- [ ] E2E Admin: Login -> Usuarios -> Instituciones -> Config

**No Funcionales:**
- [ ] Performance: Suite completa < 5 minutos
- [ ] Fiabilidad: 0 tests flaky

**Tecnicos:**
- [ ] Coverage backend >= 50%
- [ ] E2E con Playwright o Cypress
- [ ] CI/CD integrado

---

### Dependencias

**Esta epica depende de:**
| Epica/Modulo | Estado | Bloqueante |
|--------------|--------|------------|
| P2-TEACHER-EXT | In Progress | Si (para E2E) |
| P2-ADMIN-EXT | In Progress | Si (para E2E) |

**Esta epica bloquea:**
| Epica/Modulo | Razon |
|--------------|-------|
| Release Production | Tests deben pasar |

---

### Desglose Tecnico

**Backend Tests (21 SP):**

| Servicio | Prioridad | Tests Estimados |
|----------|-----------|-----------------|
| ml-coins.service.ts | Alta | 15+ tests |
| missions.service.ts | Alta | 20+ tests |
| shop.service.ts | Media | 12+ tests |
| grading.service.ts | Alta | 10+ tests |
| bulk-operations.service.ts | Media | 8+ tests |

**E2E Tests (13 SP):**

| Flujo | Portal | Pasos |
|-------|--------|-------|
| Ejercicio completo | Student | Login -> Modulo -> Ejercicio -> Submit -> XP/ML |
| Calificacion | Teacher | Login -> Dashboard -> Submissions -> Grade -> Feedback |
| Gestion usuarios | Admin | Login -> Users -> Create -> Suspend -> Delete |

---

### Metricas de Exito

| Metrica | Actual | Objetivo | Metodo |
|---------|--------|----------|--------|
| Backend Coverage | 18% | 50% | Jest --coverage |
| E2E Flujos | 0 | 3 | Playwright/Cypress |
| Tests Totales | ~20 | 100+ | npm test |
| Tiempo Suite | N/A | < 5min | CI/CD |

---

### Definition of Ready (DoR)

- [x] Historias de usuario definidas
- [x] Criterios de aceptacion claros
- [x] Servicios criticos identificados
- [x] Flujos E2E definidos
- [ ] Herramientas E2E seleccionadas

### Definition of Done (DoD)

- [ ] Coverage >= 50%
- [ ] 3 flujos E2E pasando
- [ ] CI/CD ejecutando tests
- [ ] Documentacion de tests
- [ ] Zero tests flaky

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Ultima actualizacion:** 2025-12-05
