# 📖 Overview - GAMILIT Platform

**Carpeta:** `docs/00-vision-general/`
**Propósito:** Punto de entrada para todos los stakeholders (desarrolladores, PM, stakeholders, nuevos miembros)
**Última actualización:** 2025-11-29

---

## 🎯 ALCANCE MVP ACTUAL

| Componente | Estado MVP |
|-----------|------------|
| **Módulos Educativos** | M1-M5 implementados ✅ (completo) |
| **Épicas MVP** | EXT-001 a EXT-006 completas ✅ |
| **Épicas Backlog** | EXT-007 a EXT-011 parciales ⏳ |
| **Portales** | Student, Teacher, Admin funcionales ✅ |

> Ver alcances detallados en [VISION.md](./VISION.md) y [Fase 4: Backlog](../04-fase-backlog/README.md)

---

## 📋 ¿Qué encontrarás aquí?

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

#### [DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md](./DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md)
**Audiencia:** Desarrolladores, PMs, diseñadores pedagógicos, QA
**Tiempo de lectura:** 60-90 minutos (documento completo de 14,500 palabras)
**Última actualización:** 2025-11-23 (v6.4)

**Qué contiene:**
- Especificación completa de mecánicas de gamificación GAMILIT
- 23 ejercicios organizados en 5 módulos (Cassany)
- Sistema de Rangos Maya (14 niveles jerárquicos)
- Sistema de ML Coins (economía del juego)
- Achievements, logros y misiones
- Flujos de usuario detallados
- Configuraciones JSONB de cada ejercicio
- Reglas de negocio y validaciones

**Cuándo leerlo:**
- Antes de desarrollar cualquier feature de gamificación
- Para entender las mecánicas de ejercicios (types, configs, validations)
- Al diseñar nuevos módulos educativos
- Durante QA para validar flujos completos

---

#### [GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md)
**Audiencia:** QA, desarrolladores frontend/backend, demos pedagógicas
**Tiempo de lectura:** 30-40 minutos (documento completo), 5-8 min por ejercicio
**Última actualización:** 2025-11-23

**Qué contiene:**
- Ejemplos detallados de respuestas para los 5 ejercicios del Módulo 1
- 40+ ejemplos clasificados en 3 niveles: EXCELENTE, ACEPTABLE, INCORRECTA
- Criterios de scoring para cada ejercicio
- Keywords para validadores automáticos
- Datos de prueba listos para usar

**Ejercicios cubiertos (Comprensión Literal - Cassany Nivel 1):**
- 1.1: Crucigrama Científico (6 palabras clave sobre Marie Curie)
- 1.2: Línea de Tiempo (7 eventos cronológicos)
- 1.3: Completar Espacios en Blanco (6 datos biográficos)
- 1.4: Verdadero o Falso (10 afirmaciones sobre hechos explícitos)
- 1.5: Sopa de Letras BONUS (10 palabras de vocabulario científico)

**Cuándo usarlo:**
- Durante testing manual de ejercicios del Módulo 1
- Para crear test data en tests automatizados
- En demos pedagógicas con stakeholders
- Para validar componentes frontend (crucigrama, drag & drop, timers)
- Al desarrollar/ajustar validadores backend

---

#### [GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md)
**Audiencia:** QA, desarrolladores frontend/backend, demos pedagógicas
**Tiempo de lectura:** 35-50 minutos (documento completo), 7-10 min por ejercicio
**Última actualización:** 2025-11-23

**Qué contiene:**
- Ejemplos detallados de respuestas para los 5 ejercicios del Módulo 2
- 50+ ejemplos clasificados en 3 niveles: EXCELENTE, ACEPTABLE, INCORRECTA
- Criterios de scoring para inferencias
- Keywords para validadores de texto libre
- Razonamiento inferencial esperado

**Ejercicios cubiertos (Comprensión Inferencial - Cassany Nivel 2):**
- 2.1: Detective Textual (4 preguntas inferenciales: causa-efecto, contexto, motivación)
- 2.2: Relaciones Causa-Efecto (emparejamiento de causas con múltiples consecuencias)
- 2.3: Predicción Narrativa (predicción histórica con 4 filtros de validación)
- 2.4: Puzzle de Contexto (ordenar 4 fragmentos sintácticamente)
- 2.5: Rueda de Inferencias (respuestas abiertas en 4 categorías: literal, inferencial, crítico, creativo)

**Cuándo usarlo:**
- Durante testing manual de ejercicios del Módulo 2
- Para validar evaluación de respuestas abiertas (NLP básico)
- En demos pedagógicas para mostrar pensamiento inferencial
- Para entrenar maestros en evaluación de inferencias estudiantiles
- Al desarrollar validadores de texto libre con keywords

---

#### [GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md)
**Audiencia:** QA, desarrolladores frontend/backend, demos pedagógicas
**Tiempo de lectura:** 30-45 minutos (documento completo), 5-10 min por ejercicio
**Última actualización:** 2025-11-23

**Qué contiene:**
- Ejemplos detallados de respuestas para los 5 ejercicios del Módulo 3
- 50+ ejemplos clasificados en 3 niveles: EXCELENTE, ACEPTABLE, INCORRECTA
- Criterios de scoring para cada ejercicio
- Keywords para validadores automáticos
- Datos de prueba listos para usar

**Ejercicios cubiertos (Comprensión Crítica - Cassany Nivel 3):**
- 3.1: Tribunal de Opiniones (8 afirmaciones FACT/OPINION/INTERPRETATION)
- 3.2: Debate Digital (argumentos pro/contra con evidencia)
- 3.3: Análisis de Fuentes (evaluación CRAAP de 5 fuentes)
- 3.4: Podcast Argumentativo (script completo 2 minutos)
- 3.5: Matriz de Perspectivas (6 perspectivas históricas)

**Cuándo usarlo:**
- Durante testing manual de ejercicios del Módulo 3
- Para crear test data en tests automatizados
- En demos pedagógicas con stakeholders
- Para validar componentes frontend (forms, timers, validations)
- Al desarrollar/ajustar validadores backend

---

#### [GLOSARIO.md](./GLOSARIO.md)
**Audiencia:** Todos (desarrolladores, PMs, stakeholders)
**Tiempo de lectura:** 10-15 minutos
**Última actualización:** 2025-11-29

**Qué contiene:**
- Términos de gamificación (ML Coins, Rangos Maya, achievements, comodines)
- Términos educativos (modelo Cassany, comprensión literal/inferencial/crítica)
- Términos técnicos (SSOT, DDL, RLS, schemas, triggers)
- Acrónimos del proyecto (GLIT, API, JWT, CRUD, ADR)
- Roles de usuario y portales
- Schemas de base de datos

**Cuándo leerlo:**
- Para nuevos miembros que no conocen terminología
- Como referencia rápida durante code reviews
- Para entender nomenclatura de BD y arquitectura

---

### ⏳ Documentos Planeados

Los siguientes documentos están planeados pero aún no creados:

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
   - Lee [docs/95-guias-desarrollo/](../95-guias-desarrollo/) (guías de desarrollo)
   - Lee [docs/98-standards/](../98-standards/) (estándares de código)
   - Ejecuta tests (`npm test` en backend y frontend)

4. **Día 3 (4-6 horas):**
   - Toma primera tarea (good-first-issue)
   - Crea branch, haz cambios, abre PR
   - Participa en code review

---

### Para Stakeholders No-Técnicos

1. ✅ **Entender el producto:** [VISION.md](./VISION.md)
2. **Ver roadmap:** [docs/90-transversal/roadmap/](../90-transversal/roadmap/)
3. **Ver métricas:** [docs/90-transversal/metricas/](../90-transversal/metricas/)

---

### Para Tech Leads

1. ✅ **Visión del producto:** [VISION.md](./VISION.md)
2. **Arquitectura técnica:** [docs/90-transversal/arquitectura/](../90-transversal/arquitectura/)
3. **Decisiones arquitectónicas:** [docs/97-adr/](../97-adr/)
4. **Estándares de código:** [docs/98-standards/](../98-standards/)

---

## 🔗 Enlaces Relacionados

### Dentro de este Monorepo

**Documentación por Fases:**
- [docs/01-fase-alcance-inicial/](../01-fase-alcance-inicial/) - Fase 1: Fundamentos MVP
- [docs/02-fase-robustecimiento/](../02-fase-robustecimiento/) - Fase 2: BD Modular
- [docs/03-fase-extensiones/](../03-fase-extensiones/) - Fase 3: Extensions MVP
- [docs/04-fase-backlog/](../04-fase-backlog/) - Fase 4: Backlog Futuro

**Documentación Técnica:**
- [docs/95-guias-desarrollo/](../95-guias-desarrollo/) - Guías de desarrollo
- [docs/96-quick-reference/](../96-quick-reference/) - Referencias rápidas
- [docs/97-adr/](../97-adr/) - Architecture Decision Records
- [docs/98-standards/](../98-standards/) - Estándares del proyecto

**Código:**
- [apps/backend/_MAP.md](../../apps/backend/_MAP.md) - Backend (NestJS)
- [apps/frontend/_MAP.md](../../apps/frontend/_MAP.md) - Frontend (React)
- [apps/database/](../../apps/database/) - Database (PostgreSQL)

**Planificación:**
- [docs/90-transversal/roadmap/](../90-transversal/roadmap/) - Roadmap general
- [docs/90-transversal/sprints/](../90-transversal/sprints/) - Sprints históricos

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
- [docs/90-transversal/arquitectura/](../90-transversal/arquitectura/)

**Soy PM/PO y quiero ver el roadmap:**
- ✅ [VISION.md](./VISION.md) (contexto y métricas)
- [docs/90-transversal/roadmap/](../90-transversal/roadmap/)

**Quiero contribuir al proyecto (developer externo):**
- ✅ [VISION.md](./VISION.md)
- ✅ [ONBOARDING.md](./ONBOARDING.md)
- [docs/98-standards/](../98-standards/)

**No conozco un término técnico:**
- ✅ [GLOSARIO.md](./GLOSARIO.md)
- [docs/96-quick-reference/](../96-quick-reference/)

**Voy a desarrollar ejercicios o gamificación:**
- ✅ [DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md](./DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md)

**Voy a hacer QA/testing de ejercicios:**
- ✅ Módulo 1: [GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md)
- ✅ Módulo 2: [GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md)
- ✅ Módulo 3: [GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md)

**Necesito datos de prueba para ejercicios:**
- ✅ Módulo 1: [GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md)
- ✅ Módulo 2: [GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md)
- ✅ Módulo 3: [GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md)

---

## 🚨 Issues Conocidos

### P0 (Crítico)

Ninguno en esta carpeta actualmente.

### P1 (Alto)

- **P1-001:** ~~Falta GLOSARIO.md con terminología del proyecto~~ ✅ RESUELTO (2026-01-07)

- **P1-002:** Falta QUICK-START.md para setup rápido
  - **Esfuerzo:** 1-2 horas
  - **Impacto:** Developers impacientes se frustran con ONBOARDING.md largo

- **P1-003:** Falta ARQUITECTURA-ALTO-NIVEL.md con diagrama general
  - **Esfuerzo:** 3-4 horas
  - **Impacto:** Tech Leads no tienen big picture visual

---

## 🎯 Próximos Pasos

### Fase 1 (Completada)

1. ✅ README.md creado (este archivo)
2. ✅ GLOSARIO.md creado (2025-11-29)
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

**Última actualización:** 2026-01-07
**Versión:** 1.2
**Método:** Sistema SIMCO - Fase 3 (Option A - Complete Content)
**Cambios v1.2:** Actualizado estado de GLOSARIO.md (ahora completado), sincronización documental
