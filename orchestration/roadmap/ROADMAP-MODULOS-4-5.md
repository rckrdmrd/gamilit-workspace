# ROADMAP: MÓDULOS 4-5 (FASE 2)

**Estado:** DRAFT
**Fecha:** 2025-11-23
**Responsable:** Product Owner
**Aprobación requerida:** Product Owner, Tech Lead
**Versión:** 1.0

---

## 📍 ESTADO ACTUAL (2025-11-23)

### Módulo 4: Lectura Digital y Multimodal

**Estado Base de Datos:**
- `status='published'`, `is_published=true`
- **5 ejercicios con placeholders:** `is_active=false`
- Seeds creados: `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

**Estado UX/UI:**
- ✅ Visible en navegación principal
- ✅ Componente `UnderConstructionExercise` implementado
- ✅ Mensaje "En Construcción" al clickear

**Estado Diseño:**
- ✅ Documentado completo en DocumentoDeDiseño v6.4 (líneas 791-1063)
- ✅ Mecánicas definidas con detalle
- ✅ Validaciones especificadas

**Ejercicios definidos:**

| ID | Código | Título | Objetivo |
|----|--------|--------|----------|
| 4.1 | `verificador_fake_news` | Verificador de Fake News | Evaluar veracidad de titulares sobre Marie Curie |
| 4.2 | `infografia_interactiva` | Creación de Infografía Interactiva | Diseñar infografía digital sobre logros de Curie |
| 4.3 | `quiz_tiktok` | Quiz Estilo TikTok | 10 preguntas rápidas en formato vertical (60s) |
| 4.4 | `navegacion_hipertextual` | Navegación Hipertextual | Navegar artículo con enlaces (decisiones) |
| 4.5 | `analisis_memes` | Análisis de Memes Educativos | Evaluar contenido educativo vs superficial |

**XP y Recompensas:**
- XP por ejercicio: 100 XP
- XP total módulo: 500 XP
- Rango obtenido: **HALACH UINIC**
- ML Coins por módulo: 50 ML base + 30 ML bonus sin comodines

---

### Módulo 5: Producción y Expresión Lectora

**Estado Base de Datos:**
- `status='published'`, `is_published=true`
- **3 ejercicios con placeholders:** `is_active=false`
- Seeds creados: `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

**Estado UX/UI:**
- ✅ Visible en navegación principal
- ✅ Componente `UnderConstructionExercise` implementado
- ✅ Mensaje "En Construcción" al clickear

**Estado Diseño:**
- ✅ Documentado completo en DocumentoDeDiseño v6.4 (líneas 1066-1314)
- ✅ Mecánicas definidas con detalle
- ✅ Templates, prompts y rúbricas especificadas

**Opciones definidas (estudiante elige 1 de 3):**

| ID | Código | Título | Duración | Formato |
|----|--------|--------|----------|---------|
| 5A | `diario_multimedia` | Diario Interactivo de Marie | 8-10 páginas | Texto + imagen + audio |
| 5B | `comic_digital` | Resumen Visual Progresivo / Cómic Digital | 6-8 viñetas | Cómic digital |
| 5C | `video_carta` | Cápsula del Tiempo Digital | 3 minutos | Video |

**XP y Recompensas:**
- XP por ejercicio: 500 XP (uno solo elegido)
- XP total módulo: 500 XP
- Rango obtenido: **K'UK'ULKAN** (certificación final)
- ML Coins: Bonus de rango +1,000 ML (Halach Uinic → K'uk'ulkan)

---

## 🎯 ALCANCE FASE 2

### Objetivos Principales

1. **Implementar funcionalidad completa de 8 ejercicios**
   - 5 ejercicios Módulo 4
   - 3 opciones Módulo 5

2. **Activar ejercicios en producción**
   - Cambiar `is_active=false` → `is_active=true` tras implementación
   - Remover componente `UnderConstructionExercise`

3. **Completar progresión educativa**
   - Alcanzar 100% del sistema educativo diseñado
   - Permitir certificación final K'UK'ULKAN

4. **Habilitar XP total del sistema**
   - XP actual alcanzable: 1,500 XP (Módulos 1-3)
   - XP objetivo: 2,500 XP (Módulos 1-5)
   - Aumento: +1,000 XP (+66%)

### Impacto Esperado

**Para Usuarios:**
- ✅ Completar progresión educativa completa (5 módulos)
- ✅ Alcanzar rango máximo K'UK'ULKAN
- ✅ Obtener certificación final
- ✅ Experiencia educativa completa (100% contenido)

**Para Producto:**
- ✅ MVP educativo completo según DocumentoDeDiseño v6.4
- ✅ Diferenciación competitiva (lectura digital y producción creativa)
- ✅ Cumplimiento de promesa a stakeholders

**Para Negocio:**
- ✅ Producto comercializable al 100%
- ✅ Argumento de venta completo
- ✅ Capacidad de certificación formal

---

## 📅 TIMELINE PROPUESTO

### Q1 2026: Diseño Detallado (3 meses)

**Mes 1 - Enero 2026:**
- [ ] Diseño UX/UI Módulo 4 (ejercicios 4.1-4.3)
- [ ] Wireframes de Verificador Fake News
- [ ] Wireframes de Infografía Interactiva
- [ ] Wireframes de Quiz TikTok
- [ ] Prototipos interactivos de baja fidelidad

**Mes 2 - Febrero 2026:**
- [ ] Diseño UX/UI Módulo 4 (ejercicios 4.4-4.5)
- [ ] Diseño UX/UI Módulo 5 (3 opciones completas)
- [ ] Prototipos interactivos de alta fidelidad
- [ ] Sistema de componentes reutilizables

**Mes 3 - Marzo 2026:**
- [ ] Validación con usuarios (5-10 estudiantes)
- [ ] Iteración de diseños según feedback
- [ ] Especificación técnica detallada
- [ ] Definición de assets (imágenes, iconos, videos)

**Entregables Q1:**
- 📐 Diseños finales Figma (8 ejercicios)
- 📝 Especificación técnica completa
- 🎨 Biblioteca de componentes UI
- 📊 Reporte de validación con usuarios

---

### Q2 2026: Desarrollo Backend (3 meses)

**Mes 4 - Abril 2026:**
- [ ] Backend ejercicios 4.1-4.3
  - [ ] Validadores Verificador Fake News
  - [ ] Lógica Infografía Interactiva
  - [ ] Timer y scoring Quiz TikTok
- [ ] Tests unitarios (coverage ≥ 88%)
- [ ] Documentación API

**Mes 5 - Mayo 2026:**
- [ ] Backend ejercicios 4.4-4.5
  - [ ] Validadores Navegación Hipertextual
  - [ ] Sistema scoring Análisis Memes
- [ ] Backend ejercicio 5A (Diario Multimedia)
  - [ ] Upload de archivos multimedia
  - [ ] Sistema de rúbricas automáticas
- [ ] Tests unitarios (coverage ≥ 88%)

**Mes 6 - Junio 2026:**
- [ ] Backend ejercicios 5B-5C
  - [ ] Sistema de cómic digital
  - [ ] Upload y procesamiento de video
  - [ ] Validación de rúbricas
- [ ] Integración completa gamificación
  - [ ] Cálculo XP final (2,500 XP)
  - [ ] Otorgamiento rango K'UK'ULKAN
  - [ ] Generación de certificación
- [ ] Tests de integración E2E

**Entregables Q2:**
- ⚙️ Backend completo 8 ejercicios
- ✅ Tests coverage ≥ 88%
- 📚 Documentación API completa
- 🔌 Endpoints REST funcionales

---

### Q3 2026: Desarrollo Frontend + Testing (3 meses)

**Mes 7 - Julio 2026:**
- [ ] Frontend ejercicios 4.1-4.3
  - [ ] Componentes React de mecánicas
  - [ ] Integración con backend
  - [ ] Animaciones y efectos
- [ ] Tests unitarios frontend (coverage ≥ 88%)

**Mes 8 - Agosto 2026:**
- [ ] Frontend ejercicios 4.4-4.5 + 5A-5C
  - [ ] Componentes avanzados (upload, video, cómic)
  - [ ] Sistema de preview
  - [ ] Feedback visual en tiempo real
- [ ] Tests E2E completos (Cypress)
- [ ] Validación pedagógica con expertos

**Mes 9 - Septiembre 2026:**
- [ ] Beta testing con usuarios reales (20-30 estudiantes)
- [ ] Ajustes basados en feedback
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Preparación para release

**Entregables Q3:**
- 💻 Frontend completo 8 ejercicios
- ✅ Tests E2E completos
- 📊 Reporte validación pedagógica
- 🐛 Bugs críticos resueltos
- 🎯 Sistema listo para producción

---

### Q4 2026: Release y Optimización (3 meses)

**Mes 10 - Octubre 2026:**
- [ ] Ajustes post-beta testing
- [ ] Documentación de usuario final
- [ ] Materiales de marketing
- [ ] Capacitación a equipo de soporte

**Mes 11 - Noviembre 2026:**
- [ ] **Release a producción (Módulos 4-5)**
- [ ] Cambio `is_active=false` → `is_active=true`
- [ ] Monitoreo intensivo primera semana
- [ ] Soporte 24/7 durante lanzamiento

**Mes 12 - Diciembre 2026:**
- [ ] Análisis de métricas de adopción
- [ ] Optimización basada en uso real
- [ ] Iteración de contenido si necesario
- [ ] Planificación contenido adicional (expansiones)

**Entregables Q4:**
- 🚀 Módulos 4-5 en producción
- 📊 Dashboard de métricas
- 📈 Reporte de adopción Q4
- 🎓 Sistema educativo 100% completo

---

## 💰 PRESUPUESTO ESTIMADO

**⚠️ A DEFINIR POR PRODUCT OWNER**

### Estimación Preliminar

| Fase | Rol | Meses | Costo Estimado |
|------|-----|-------|----------------|
| **Q1: Diseño** | | | |
| UX/UI Designer | 3 meses dedicación | [TBD] |
| Pedagogo Consultor | 1 mes consultoría | [TBD] |
| **Q2: Desarrollo Backend** | | | |
| Backend Developer | 3 meses dedicación | [TBD] |
| QA Engineer | 1 mes testing | [TBD] |
| **Q3: Desarrollo Frontend** | | | |
| Frontend Developer | 3 meses dedicación | [TBD] |
| QA Engineer | 2 meses E2E testing | [TBD] |
| Beta Testers | 30 estudiantes | [TBD] |
| **Q4: Release** | | | |
| DevOps Engineer | 1 mes | [TBD] |
| Tech Lead (supervisión) | 0.5 meses | [TBD] |
| **TOTAL ESTIMADO** | **12 meses** | **[TBD]** |

### Consideraciones Adicionales

- Infraestructura: Almacenamiento video/multimedia (+storage)
- Licencias: Herramientas de diseño (Figma, Adobe)
- Contingencia: 15-20% del presupuesto total
- Marketing: Materiales de lanzamiento

---

## 📊 DEPENDENCIAS

### Dependencias Técnicas

**✅ Ya Resueltas:**
- Seeds placeholder creados (05-exercises-module4.sql, 06-exercises-module5.sql)
- Frontend `UnderConstructionExercise` implementado
- Sistema de detección `is_active` funcionando
- Estructura de base de datos lista

**⏳ Por Implementar:**
- Validadores específicos M4/M5 (backend)
- Componentes React M4/M5 (frontend)
- Sistema de upload multimedia (backend + frontend)
- Sistema de rúbricas automáticas (backend)
- Componente de video player (frontend)
- Componente de editor de cómic (frontend)

### Dependencias de Recursos

**Requeridos:**
- [ ] Frontend Developer (6 meses dedicación) - Q2-Q3
- [ ] Backend Developer (4 meses dedicación) - Q2-Q3
- [ ] UX Designer (3 meses dedicación) - Q1
- [ ] QA Engineer (3 meses dedicación) - Q2-Q4
- [ ] Pedagogo validador (1 mes consultoría) - Q1
- [ ] DevOps Engineer (1 mes dedicación) - Q4

**Opcionales:**
- [ ] Motion Designer (animaciones complejas)
- [ ] Content Creator (videos de ejemplo)
- [ ] Ilustrador (cómics de muestra)

### Dependencias de Stakeholders

- **Product Owner:** Aprobación de diseños (Q1) y release (Q4)
- **Tech Lead:** Revisión arquitectura (Q2) y code review (Q2-Q3)
- **Pedagogo:** Validación pedagógica (Q1, Q3)
- **Marketing:** Materiales lanzamiento (Q4)

---

## 🎓 CRITERIOS DE ACEPTACIÓN

### Módulo 4: Lectura Digital y Multimodal

**Funcionalidad:**
- [ ] 5 ejercicios funcionales con validación completa
- [ ] Todos los ejercicios `is_active=true`
- [ ] Navegación fluida entre ejercicios
- [ ] Feedback inmediato en cada interacción

**Gamificación:**
- [ ] Integración con sistema de XP/ML Coins
- [ ] Otorgamiento correcto de rango HALACH UINIC
- [ ] Multiplicadores de XP aplicados
- [ ] Comodines funcionando correctamente

**Calidad:**
- [ ] Tests coverage ≥ 88% (backend + frontend)
- [ ] Zero bugs críticos en producción
- [ ] Performance: carga ejercicios < 2 segundos
- [ ] Accessibility: WCAG 2.1 AA

**Documentación:**
- [ ] Documentación técnica completa (API, componentes)
- [ ] Documentación de usuario (guías de uso)
- [ ] TRACEABILITY.yml actualizado
- [ ] ADR creado si cambios arquitectónicos

**Validación Pedagógica:**
- [ ] Aprobación de pedagogo experto
- [ ] Validación con usuarios reales (≥ 20 estudiantes)
- [ ] Satisfacción ≥ 4.0/5.0 en encuestas

---

### Módulo 5: Producción y Expresión Lectora

**Funcionalidad:**
- [ ] 3 opciones funcionales (5A, 5B, 5C)
- [ ] Sistema de selección de opción (estudiante elige 1)
- [ ] Templates completos para cada opción
- [ ] Sistema de rúbricas implementado
- [ ] Generación de certificación final K'UK'ULKAN

**Gamificación:**
- [ ] XP final: 2,500 XP alcanzable
- [ ] Rango K'UK'ULKAN otorgado correctamente
- [ ] Bonus de +1,000 ML al alcanzar K'UK'ULKAN
- [ ] Dashboard de progreso 100% completo

**Calidad:**
- [ ] Tests coverage ≥ 88% (backend + frontend)
- [ ] Zero bugs críticos en producción
- [ ] Performance: upload multimedia funcional
- [ ] Sistema de preview funcional

**Documentación:**
- [ ] Documentación técnica completa
- [ ] Documentación pedagógica (rúbricas, criterios)
- [ ] TRACEABILITY.yml actualizado
- [ ] Certificación final diseñada y generada

**Validación Pedagógica:**
- [ ] Aprobación de pedagogo experto
- [ ] Validación con usuarios reales (≥ 20 estudiantes)
- [ ] Satisfacción ≥ 4.5/5.0 (certificación final)

---

## 📈 MÉTRICAS DE ÉXITO

### Métricas de Adopción (Q4 2026)

- **Completion rate Módulo 4:** ≥ 70% de usuarios que inician lo completan
- **Completion rate Módulo 5:** ≥ 60% de usuarios que inician lo completan
- **Time on task M4:** Dentro de estimado DocumentoDeDiseño
- **Time on task M5:** Dentro de estimado DocumentoDeDiseño
- **Certificaciones K'UK'ULKAN:** ≥ 50% de usuarios completan progresión completa

### Métricas de Calidad

- **User satisfaction:** ≥ 4.0/5.0 en encuestas (M4), ≥ 4.5/5.0 (M5)
- **Bug rate:** < 5 bugs críticos en primer mes
- **Performance:** Carga ejercicios < 2 segundos (P95)
- **Uptime:** ≥ 99.5% disponibilidad

### Métricas de Negocio

- **Retención:** ≥ 80% usuarios activos después de 30 días
- **Engagement:** ≥ 3 sesiones/semana promedio
- **Recomendación:** NPS ≥ 50
- **Certificaciones emitidas:** ≥ 100 en Q4 2026

---

## 🔄 PROCESO DE REVISIÓN

### Frecuencia

- **Mensual:** Revisión de progreso vs timeline
- **Trimestral:** Revisión de presupuesto y recursos
- **Hitos:** Revisión al final de cada fase (Q1-Q4)

### Responsables

- **Product Owner:** Decisiones de alcance y prioridades
- **Tech Lead:** Decisiones técnicas y arquitectura
- **Pedagogo:** Validación de contenido educativo

### Documentar en

Este archivo (sección Changelog al final)

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Retraso en diseño UX/UI** | Media | Alto | Buffer de 2 semanas en Q1 |
| **Complejidad upload multimedia** | Alta | Alto | Prototipo técnico en Q2 mes 1 |
| **Validación pedagógica negativa** | Baja | Alto | Consultas tempranas con pedagogo (Q1) |
| **Performance sistema video** | Media | Medio | Tests de carga en Q3 mes 2 |
| **Recursos insuficientes** | Media | Alto | Contratación anticipada (Q1 inicio) |
| **Cambios de alcance** | Alta | Alto | Change control board (Product Owner) |

### Plan de Contingencia

**Si se retrasa Q1 (Diseño):**
- Priorizar diseños Módulo 4 (más crítico)
- Diferir Módulo 5 a fase posterior

**Si se retrasa Q2-Q3 (Desarrollo):**
- Release incremental: Módulo 4 primero, luego Módulo 5
- Ajustar timeline a 15 meses (Q1 2027)

**Si validación pedagógica falla:**
- Iteración adicional de diseño (1 mes)
- Nueva validación con grupo diferente

---

## 📎 REFERENCIAS

### Documentación Diseño

- **DocumentoDeDiseño v6.4:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` (líneas 791-1314)
- **ADR-010:** DocumentoDeDiseño como Fuente de Verdad

### Documentación Técnica

- **Seeds Módulo 4:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
- **Seeds Módulo 5:** `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`
- **Componente UnderConstruction:** `apps/frontend/src/features/exercises/components/UnderConstructionExercise.tsx`

### Documentación de Estrategia

- **Estrategia actual:** `docs/00-vision-general/ESTRATEGIA-MODULOS-4-5-EN-CONSTRUCCION.md`
- **Propuesta correcciones:** `orchestration/agentes/architecture-analyst/validation/PROPUESTA-ACTUALIZACIONES-DOCUMENTACION-2025-11-23.md`

---

## 🔄 CHANGELOG

### [1.0] - 2025-11-23

**Creado por:** Architecture-Analyst

**Contenido inicial:**
- Estado actual Módulos 4-5 documentado
- Timeline propuesto (Q1-Q4 2026, 12 meses)
- Presupuesto preliminar (TBD por Product Owner)
- Dependencias técnicas y de recursos identificadas
- Criterios de aceptación definidos
- Métricas de éxito establecidas
- Riesgos identificados con mitigaciones

**Referencias:**
- DocumentoDeDiseño v6.4 (fuente de verdad)
- REPORTE-COHERENCIA-DOCUMENTACION-CODIGO-2025-11-23.md
- PROPUESTA-ACTUALIZACIONES-DOCUMENTACION-2025-11-23.md

**Estado:** DRAFT - Pendiente de aprobación por Product Owner

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **Product Owner:** Revisar y aprobar roadmap
2. **Product Owner:** Definir presupuesto ([TBD])
3. **Product Owner + Tech Lead:** Priorizar vs otros proyectos
4. **Tech Lead:** Asignar recursos iniciales (Q1 2026)
5. **Architecture-Analyst:** Actualizar estado a "APROBADO" tras confirmación

---

**Versión:** 1.0 DRAFT
**Próxima revisión:** Tras aprobación de Product Owner
**Aprobación pendiente:** Product Owner, Tech Lead

---

**FIN DEL ROADMAP**
