# 📖 Overview - GAMILIT Platform

**Carpeta:** `docs/00-overview/`
**Propósito:** Punto de entrada para todos los stakeholders (desarrolladores, PM, stakeholders, nuevos miembros)
**Última actualización:** 2025-11-07

---

## 🎯 ¿Qué encontrarás aquí?

Esta carpeta contiene documentación de **alto nivel** para entender rápidamente qué es GAMILIT Platform, su visión, arquitectura general y cómo empezar.

**Audiencia:**
- Nuevos desarrolladores (onboarding)
- Product Managers y stakeholders
- Tech Leads
- Cualquier persona que necesite entender GAMILIT Platform rápidamente

---

## 📚 Documentos Disponibles

### ✅ Documentos Completados

#### [VISION.md](./VISION.md)
**Audiencia:** Todos (stakeholders, developers, PM)
**Tiempo de lectura:** 15-20 minutos
**Última actualización:** 2025-11-07

**Qué contiene:**
- ¿Qué es GAMILIT Platform? (plataforma educativa gamificada)
- Visión y objetivos estratégicos
- Estado actual del producto (7.5/10 - BETA+)
- Modelo educativo (5 dimensiones de comprensión lectora)
- Sistema de gamificación (Rangos Maya, ML Coins)
- Stack tecnológico y arquitectura
- Métricas de éxito
- Ventajas competitivas

**Cuándo leerlo:**
- **Primer día** como nuevo miembro del equipo
- Antes de trabajar en features de gamificación
- Para entender el contexto de negocio

---

#### [ONBOARDING.md](./ONBOARDING.md)
**Audiencia:** Nuevos desarrolladores
**Tiempo de lectura:** 10 minutos (setup completo: 2-3 horas)
**Última actualización:** 2025-11-07

**Qué contiene:**
- Prerrequisitos (Node.js 18+, PostgreSQL 15+, Git)
- Guía paso a paso para configurar entorno local
- Setup de base de datos (crear DB, ejecutar DDL, seeds)
- Setup de backend (NestJS, .env, npm install, npm run dev)
- Setup de frontend (React, Vite, .env, npm run dev)
- Verificación de instalación (health checks)
- Siguientes pasos (días 1-3)
- Troubleshooting de problemas comunes
- Checklist de onboarding completo

**Cuándo leerlo:**
- **Primer día** como nuevo desarrollador
- Cuando necesites configurar un nuevo entorno de desarrollo
- Para ayudar a otro desarrollador con su setup

---

#### [_MAP.md](./_MAP.md)
**Audiencia:** Agentes IA, Tech Leads
**Tiempo de lectura:** 5 minutos
**Última actualización:** 2025-11-07

**Qué contiene:**
- Mapa de navegación de esta carpeta
- Archivos planeados vs completados
- Interdependencias con otras carpetas
- Issues conocidos y próximos pasos

**Cuándo leerlo:**
- Para agentes IA que necesitan contexto de la carpeta
- Para Tech Leads planificando próximos documentos

---

### ⏳ Documentos Planeados

Los siguientes documentos están planeados pero aún no creados:

#### GLOSARIO.md (Pendiente)
**Audiencia:** Todos
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 2-3 horas
**Líneas estimadas:** 300-400

**Contenido planeado:**
- Términos técnicos (multi-tenant, SSOT, DDL, migrations)
- Términos de gamificación (ML Coins, Rangos Maya, achievements)
- Términos educativos (comprensión literal, inferencial, crítica, digital, producción)
- Acrónimos del proyecto (GLIT, API, JWT, RLS, CRUD)
- Conceptos de arquitectura (monorepo, feature-sliced design, repository pattern)

**Cuándo será útil:**
- Para nuevos miembros que no conocen terminología
- Como referencia rápida durante code reviews
- Para documentar decisiones de naming

---

#### QUICK-START.md (Pendiente)
**Audiencia:** Desarrolladores impacientes
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 1-2 horas
**Líneas estimadas:** 100-150

**Contenido planeado:**
- Setup en 10 minutos (comandos mínimos)
- Docker Compose one-liner (cuando esté disponible)
- Script de setup automático
- Verificación rápida (1 comando)

**Diferencia con ONBOARDING.md:**
- ONBOARDING.md: Completo, explicado paso a paso (2-3 horas)
- QUICK-START.md: Mínimo, solo comandos (10 minutos)

---

#### ARQUITECTURA-ALTO-NIVEL.md (Pendiente)
**Audiencia:** Tech Leads, arquitectos, senior developers
**Prioridad:** P1 (Alta)
**Esfuerzo estimado:** 3-4 horas
**Líneas estimadas:** 200-250

**Contenido planeado:**
- Diagrama de arquitectura general (Mermaid)
- Flujo de datos Backend ↔ Frontend ↔ Database
- Decisiones arquitectónicas principales
- Patrones de diseño utilizados
- Escalabilidad y performance
- Seguridad (RLS, JWT, sanitización)

**Cuándo será útil:**
- Para entender el big picture técnico
- Antes de proponer cambios arquitectónicos
- Para onboarding de senior developers

---

## 🗺️ Navegación Rápida

### Para Nuevos Desarrolladores

1. **Día 1 - Mañana (2-3 horas):**
   - ✅ Lee [VISION.md](./VISION.md) (20 min)
   - ✅ Lee [ONBOARDING.md](./ONBOARDING.md) (10 min)
   - ✅ Configura entorno local siguiendo ONBOARDING.md (2 horas)

2. **Día 1 - Tarde (2-3 horas):**
   - Lee [apps/backend/_MAP.md](../../apps/backend/_MAP.md) (10 min)
   - Lee [apps/frontend/_MAP.md](../../apps/frontend/_MAP.md) (10 min)
   - Explora codebase (`tree -L 2 apps/`)

3. **Día 2 (4-6 horas):**
   - Lee [docs/03-desarrollo/](../03-desarrollo/) (guías de desarrollo)
   - Lee [docs/standards/CODING-STANDARDS.md](../standards/CODING-STANDARDS.md)
   - Lee [docs/standards/GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md)
   - Ejecuta tests (`npm test` en backend y frontend)

4. **Día 3 (4-6 horas):**
   - Toma primera tarea (good-first-issue)
   - Crea branch, haz cambios, abre PR
   - Participa en code review

---

### Para Stakeholders No-Técnicos

1. ✅ **Entender el producto:** [VISION.md](./VISION.md)
2. **Ver roadmap:** [docs/04-planificacion/ROADMAP.md](../04-planificacion/ROADMAP.md)
3. **Ver métricas:** [artifacts/reports/](../../artifacts/reports/)

---

### Para Tech Leads

1. ✅ **Visión del producto:** [VISION.md](./VISION.md)
2. **Arquitectura técnica:** [docs/02-especificaciones-tecnicas/arquitectura/](../02-especificaciones-tecnicas/arquitectura/)
3. **Decisiones arquitectónicas:** [docs/adr/](../adr/)
4. **Estándares de código:** [docs/standards/](../standards/)

---

## 🔗 Enlaces Relacionados

### Dentro de este Monorepo

**Documentación técnica:**
- [docs/01-requerimientos/](../01-requerimientos/) - Requerimientos funcionales
- [docs/02-especificaciones-tecnicas/](../02-especificaciones-tecnicas/) - Especificaciones técnicas
- [docs/03-desarrollo/](../03-desarrollo/) - Guías de desarrollo
- [docs/QUICK-REFERENCE/](../QUICK-REFERENCE/) - Guías rápidas (cheatsheets)

**Código:**
- [apps/backend/_MAP.md](../../apps/backend/_MAP.md) - Backend (NestJS)
- [apps/frontend/_MAP.md](../../apps/frontend/_MAP.md) - Frontend (React)
- [apps/database/_MAP.md](../../apps/database/_MAP.md) - Database (PostgreSQL)

**Planificación:**
- [docs/04-planificacion/](../04-planificacion/) - Sprints, épicas, roadmap

---

### Externos

**Tecnologías principales:**
- [NestJS Documentation](https://docs.nestjs.com/) - Backend framework
- [React Documentation](https://react.dev/) - Frontend library
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database

**Herramientas:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📋 Checklist: ¿Qué documento leer?

**Soy nuevo en el proyecto y quiero entender el producto:**
- ✅ [VISION.md](./VISION.md)

**Soy nuevo desarrollador y necesito configurar mi entorno:**
- ✅ [ONBOARDING.md](./ONBOARDING.md)

**Soy Tech Lead y necesito entender la arquitectura:**
- ✅ [VISION.md](./VISION.md) (contexto de negocio)
- ⏳ ARQUITECTURA-ALTO-NIVEL.md (pendiente)
- [docs/02-especificaciones-tecnicas/arquitectura/](../02-especificaciones-tecnicas/arquitectura/)

**Soy PM/PO y quiero ver el roadmap:**
- ✅ [VISION.md](./VISION.md) (contexto y métricas)
- [docs/04-planificacion/ROADMAP.md](../04-planificacion/ROADMAP.md)

**Quiero contribuir al proyecto (developer externo):**
- ✅ [VISION.md](./VISION.md)
- ✅ [ONBOARDING.md](./ONBOARDING.md)
- [docs/standards/CODING-STANDARDS.md](../standards/CODING-STANDARDS.md)
- [docs/standards/GIT-WORKFLOW.md](../standards/GIT-WORKFLOW.md)

**No conozco un término técnico:**
- ⏳ GLOSARIO.md (pendiente)
- [docs/QUICK-REFERENCE/](../QUICK-REFERENCE/)

---

## 🚨 Issues Conocidos

### P0 (Crítico)

Ninguno en esta carpeta actualmente.

### P1 (Alto)

- **P1-001:** Falta GLOSARIO.md con terminología del proyecto
  - **Esfuerzo:** 2-3 horas
  - **Impacto:** Nuevos miembros no entienden términos específicos

- **P1-002:** Falta QUICK-START.md para setup rápido
  - **Esfuerzo:** 1-2 horas
  - **Impacto:** Developers impacientes se frustran con ONBOARDING.md largo

- **P1-003:** Falta ARQUITECTURA-ALTO-NIVEL.md con diagrama general
  - **Esfuerzo:** 3-4 horas
  - **Impacto:** Tech Leads no tienen big picture visual

---

## 🎯 Próximos Pasos

### Fase 1 (Esta Semana - 6-8 horas)

1. ✅ README.md creado (este archivo)
2. ⬜ Crear GLOSARIO.md (2-3 horas)
3. ⬜ Crear QUICK-START.md (1-2 horas)
4. ⬜ Crear ARQUITECTURA-ALTO-NIVEL.md (3-4 horas)

**Owner:** @tech-lead
**Deadline:** 2025-11-14

---

## 📞 Contacto

**Preguntas sobre documentación:**
- Slack: #gamilit-docs
- Email: docs@gamilit.com
- Owner: @tech-writer

**Preguntas técnicas:**
- Slack: #gamilit-help
- Owner: @tech-lead

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Método:** Sistema SIMCO - Fase 3 (Option A - Complete Content)
