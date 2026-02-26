---
version: "1.0.0"
created: "2026-02-11"
rol: "QA"
tiempo_estimado: "30 min"
prerrequisitos:
  - Lectura de ONBOARDING-DESARROLLADORES.md
---

# Onboarding para QA

## Introduccion

Como QA en el proyecto gamilit, tu rol es asegurar la calidad de una plataforma educativa gamificada basada en cultura maya. El proyecto tiene 23 modulos, 4 portales (estudiante, maestro, administrador, padres), 2324 tests (2296 passed + 28 skipped) en 63 spec files y un objetivo de 80% de cobertura. Se usa Jest para backend/frontend y la piramide de pruebas (70% unit, 20% integration, 10% E2E).

---

## Documentacion Prioritaria

Lee estos documentos en orden para entender el contexto de QA:

1. **[ESTANDAR-TESTING.md](../40-standards/ESTANDAR-TESTING.md)** - Piramide de testing, patrones y ejemplos
2. **[CLAUDE.md](../../CLAUDE.md)** - Reglas criticas del proyecto
3. **[ESTANDAR-CODIGO.md](../40-standards/ESTANDAR-CODIGO.md)** - Estandares que debe cumplir el codigo
4. **[docs/10-requirements/](../10-requirements/)** - Requerimientos funcionales a validar
5. **[docs/00-overview/](../00-overview/)** - Vision general del proyecto

---

## Herramientas y Accesos

### Stack de Testing

| Herramienta | Tipo de Test | Documentacion |
|-------------|--------------|---------------|
| Jest | Unit + Integration | [jestjs.io](https://jestjs.io) |
| React Testing Library | Componentes | [testing-library.com](https://testing-library.com) |
| Supertest | API Integration | NestJS integration |

### Cobertura Minima Requerida

| Metrica | Minimo | Objetivo |
|---------|--------|----------|
| Statements | 75% | 80% |
| Branches | 70% | 75% |
| Functions | 80% | 85% |
| Lines | 75% | 80% |

### Accesos Requeridos

| Sistema | Proposito | Como Obtener |
|---------|-----------|--------------|
| GitHub | Ver PRs, ejecutar checks | Solicitar acceso a repo rckrdmrd/gamilit-workspace |
| Ambiente de desarrollo | Ejecutar tests localmente | Ver [ONBOARDING-DESARROLLADORES.md](./ONBOARDING-DESARROLLADORES.md) |
| Base de datos | Verificar datos | PostgreSQL: gamilit_platform / gamilit_user / puerto 5432 |
| Servidor produccion | Pruebas manuales | 74.208.126.102 (Backend:3006, Frontend:3005) |

---

## Contexto del Proyecto

### Modulos a Probar (23 modulos)

| Categoria | Modulos | Estado |
|-----------|---------|--------|
| Core (7) | auth, users, tenants, core, health, settings, notifications | 90-100% |
| Educativo (5) | modules, exercises, content, classrooms, students | 90-95% |
| Gamificacion (7) | gamification, leaderboard, missions, store, achievements, social | 50-95% |
| Soporte (4) | teachers, parents, analytics, reports | 75-100% |

### Portales a Validar (4)

| Portal | Paginas | Estado | Prioridad QA |
|--------|---------|--------|-------------|
| Estudiante | Dashboard, ejercicios, gamificacion | ~100% | Alta |
| Maestro | Gestion aulas, asignaciones (19 pags) | ~95% | Alta |
| Administrador | Contenido, sistema, analytics (18 pags) | ~90% | Media |
| Padres | Vinculacion, progreso, notificaciones | 100% | Media |

### Metricas Actuales

| Metrica | Valor |
|---------|-------|
| Tests passing | 2324 (2296 passed + 28 skipped) |
| Endpoints | 912 |
| Entities | 156 files (157 classes) |
| Tablas DB | 173 |
| Componentes frontend | 577 |

---

## Flujos de Trabajo Relevantes

### Creacion de Test Plans

1. Revisar user story y criterios de aceptacion en `docs/10-requirements/epics/`
2. Identificar escenarios positivos (happy path)
3. Identificar escenarios negativos (edge cases, errores)
4. Definir datos de prueba necesarios
5. Documentar casos de prueba en formato estandar

### Ejecucion de Pruebas

```bash
# Unit tests backend (2324 tests in 63 spec files)
cd apps/backend
npm run test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests de un archivo especifico
npm run test -- path/to/file.spec.ts

# Frontend - typecheck
cd apps/frontend
npm run typecheck

# Frontend - lint
npm run lint
```

### Reporte de Bugs

Incluir en cada reporte:
- **Titulo:** Descripcion concisa del defecto
- **Pasos para reproducir:** Secuencia exacta de acciones
- **Resultado esperado:** Comportamiento correcto segun requerimiento
- **Resultado actual:** Comportamiento observado
- **Evidencia:** Screenshots, logs, videos
- **Ambiente:** Dev (localhost:3005/3006) o Prod (74.208.126.102)
- **Portal afectado:** Estudiante / Maestro / Admin / Padres
- **Severidad:** Critico / Alto / Medio / Bajo

### Validacion de PRs

Antes de aprobar un PR, verificar:
- [ ] Tests nuevos cubren la funcionalidad
- [ ] Tests existentes siguen pasando (2324 tests, 2296 passed + 28 skipped)
- [ ] Cobertura cumple umbrales minimos
- [ ] Codigo sigue estandares del proyecto
- [ ] Build pasa en backend y frontend

---

## Escenarios Criticos a Cubrir

### Autenticacion y Autorizacion
```
- Login exitoso / fallido (JWT + Passport)
- Logout
- Recuperacion de password
- RBAC: Validacion de roles (estudiante, maestro, admin, padre)
- Multi-tenancy: Aislamiento de datos entre tenants (RLS)
```

### Flujos Educativos
```
- Completar ejercicio (23 tipos en 5 modulos)
- Calculo de XP y progreso
- Avance entre modulos (literal → critica)
- Asignacion de ejercicios por maestro
- Revision manual de ejercicios
```

### Gamificacion
```
- Obtencion de XP y subida de rango maya
- Desbloqueo de logros/badges
- Economia virtual (ML Coins)
- Compras en tienda virtual
- Leaderboards y rankings
```

### Portales
```
- Dashboard de estudiante con estadisticas
- Gestion de aulas (maestro)
- Configuracion del sistema (admin)
- Vinculacion padre-estudiante
- Notificaciones cross-portal
```

---

## Tareas Iniciales Recomendadas

1. **[ ] Leer ESTANDAR-TESTING.md** - Entender piramide de testing y patrones
2. **[ ] Configurar ambiente local** - Ver [ONBOARDING-DESARROLLADORES.md](./ONBOARDING-DESARROLLADORES.md)
3. **[ ] Ejecutar suite de tests existente** - `cd apps/backend && npm run test` (2324 tests, 2296 passed + 28 skipped, 63 spec files)
4. **[ ] Revisar cobertura actual** - `npm run test:cov`
5. **[ ] Identificar gaps de testing** - Documentar areas sin cobertura
6. **[ ] Revisar requerimientos funcionales** - `docs/10-requirements/`
7. **[ ] Crear primer test case** - Practicar con un caso simple en un modulo core

---

## Contactos y Recursos

### Recursos de Aprendizaje

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [React Testing Best Practices](https://react.dev/learn/testing)

### Documentacion Interna

- [ESTANDAR-TESTING.md](../40-standards/ESTANDAR-TESTING.md) - Estandar de testing
- [ESTANDAR-CODIGO.md](../40-standards/ESTANDAR-CODIGO.md) - Estandar de codigo
- [docs/90-adr/](../90-adr/) - 39 decisiones arquitectonicas
- [CLAUDE.md](../../CLAUDE.md) - Punto de entrada para agentes IA

---

## Checklist de Onboarding

- [ ] Lei ONBOARDING-DESARROLLADORES.md y configure ambiente local
- [ ] Lei ESTANDAR-TESTING.md y entiendo la piramide de testing
- [ ] Puedo ejecutar `npm run test` exitosamente (2324 tests, 2296 passed + 28 skipped)
- [ ] Puedo ejecutar `npm run test:cov` y ver reportes de cobertura
- [ ] Tengo acceso a GitHub para ver PRs y checks
- [ ] Conozco los 4 portales y 23 modulos del proyecto
- [ ] Revise los requerimientos funcionales en docs/10-requirements/
- [ ] Identifique gaps de cobertura en al menos un modulo
- [ ] Entiendo el flujo DDL -> Entity -> Endpoints -> Frontend -> Tests
- [ ] Conozco las reglas criticas de CLAUDE.md

---

*Proyecto gamilit - Sistema SIMCO v4.0.0*
