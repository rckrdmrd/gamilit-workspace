# Documentación de Casos de Uso - GAMILIT Platform

**Proyecto:** Gamilit Platform
**Archivo original:** RESUMEN-EJECUTIVO.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## 📋 Índice de Documentación

Este directorio contiene toda la documentación de casos de uso de GAMILIT Platform, modularizada en dos archivos para mejor navegación:

### [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)
**Síntesis de hallazgos y recomendaciones** (~290 líneas)

Contiene:
- Resumen del trabajo realizado
- Casos de uso documentados (3 completamente especificados)
- Hallazgos clave del análisis
- Debilidades críticas identificadas
- Reglas de negocio consolidadas (37 totales)
- Recomendaciones estratégicas
- Próximos pasos

**Ideal para:** Ejecutivos, Product Managers, Decision Makers

### [METRICAS-DETALLADAS.md](./METRICAS-DETALLADAS.md)
**Detalles técnicos y análisis expandido** (~350 líneas)

Contiene:
- Trazabilidad detallada por caso de uso (endpoints, componentes, tablas)
- Estadísticas de documentación
- Estimación de esfuerzo
- Análisis de riesgos
- Dependencias entre casos de uso
- Roadmap de completitud
- Desglose técnico por módulo

**Ideal para:** Desarrolladores, Arquitectos, Tech Leads

### [STUDENT-USE-CASES.md](./STUDENT-USE-CASES.md)
**Especificación completa de 3 casos de uso** (2,238 líneas)

Contiene:
- UC-STU-001: Registro de nuevo estudiante (~750 líneas)
- UC-STU-002: Onboarding y tutorial inicial (~650 líneas)
- UC-STU-003: Seleccionar y resolver ejercicio (~900 líneas)

Cada caso incluye:
- Descripción general y actores
- Flujo principal detallado
- Flujos alternativos
- Flujos de excepción
- Diagramas de secuencia
- Reglas de negocio
- Criterios de aceptación
- Matriz de trazabilidad

**Ideal para:** Developers, QA Engineers, Product Specialists

---

## 🎯 Cobertura de Casos de Uso

### Status Global
| Métrica | Valor |
|---------|-------|
| **Casos documentados** | 3/26 (11.5%) |
| **Rol Student** | 3/12 (25%) ✅ |
| **Rol Teacher** | 0/8 (0%) ⏳ |
| **Rol Admin** | 0/6 (0%) ⏳ |
| **Total líneas** | 2,607 |
| **Total endpoints trazados** | 14/270 (5%) |
| **Total componentes trazados** | 32/112+ (29%) |

### Casos de Uso Planificados

#### Student (12 casos)
- ✅ UC-STU-001: Registro de nuevo estudiante
- ✅ UC-STU-002: Onboarding y tutorial inicial
- ✅ UC-STU-003: Seleccionar y resolver ejercicio
- ⏳ UC-STU-004: Usar power-up durante ejercicio
- ⏳ UC-STU-005: Ver progreso y logros personales
- ⏳ UC-STU-006: Ascender de rango Maya
- ⏳ UC-STU-007: Participar en leaderboard
- ⏳ UC-STU-008: Unirse a aula con código de invitación
- ⏳ UC-STU-009: Ver assignments asignados por teacher
- ⏳ UC-STU-010: Enviar submission de tarea
- ⏳ UC-STU-011: Comprar power-up con ML Coins
- ⏳ UC-STU-012: Mantener streak diario

#### Teacher (8 casos)
- ⏳ UC-TEACH-001: Crear aula virtual
- ⏳ UC-TEACH-002: Invitar estudiantes a aula
- ⏳ UC-TEACH-003: Asignar tarea a estudiantes
- ⏳ UC-TEACH-004: Calificar submission manual
- ⏳ UC-TEACH-005: Ver dashboard de progreso del aula
- ⏳ UC-TEACH-006: Exportar reporte de notas
- ⏳ UC-TEACH-007: Configurar assignment
- ⏳ UC-TEACH-008: Analizar rendimiento por ejercicio

#### Admin (6 casos)
- ⏳ UC-ADMIN-001: Gestionar usuarios (CRUD)
- ⏳ UC-ADMIN-002: Moderar contenido reportado
- ⏳ UC-ADMIN-003: Configurar feature flags
- ⏳ UC-ADMIN-004: Exportar datos de sistema
- ⏳ UC-ADMIN-005: Gestionar organizations (multi-tenancy)
- ⏳ UC-ADMIN-006: Monitorear salud del sistema

---

## 🔗 Cómo Navegar Esta Documentación

### Para Entender el Proyecto Rápidamente
1. Lee **RESUMEN-EJECUTIVO.md** (5-10 min)
2. Revisa secciones de "Hallazgos Clave" y "Recomendaciones"
3. Consulta "Casos de Uso Documentados" para resumen de 3 casos

### Para Implementar Features
1. Localiza el caso de uso relevante en STUDENT-USE-CASES.md
2. Revisa criterios de aceptación (línea final de cada caso)
3. Consulta trazabilidad (endpoints, componentes, tablas)
4. Usa reglas de negocio para lógica de implementación

### Para Testing y QA
1. Lee el caso de uso relevante
2. Revisa flujos alternativos y excepciones
3. Valida contra criterios de aceptación
4. Prueba diagramas de secuencia como checklist

### Para Análisis Técnico
1. Abre METRICAS-DETALLADAS.md
2. Revisa estadísticas de completitud por módulo
3. Analiza dependencias y risks
4. Consulta roadmap de completitud

---

## 📊 Hallazgos Clave Resumidos

### Fortalezas
✅ Arquitectura bien estructurada (capas separadas)
✅ Gamificación robusta (rangos Maya, coins, achievements)
✅ Trazabilidad verificada con código fuente
✅ 33 mecánicas educativas implementadas

### Crítico (Blocker Producción)
❌ Email verification NO implementada
❌ Password reset flow no existe
❌ Captcha insuficiente (solo después de 3 intentos)

### Alto (Recomendado pre-lanzamiento)
⚠️ Performance bajo carga (needs load testing)
⚠️ Achievements incompletos (solo 2 activos de 30)
⚠️ Test coverage bajo (<70%, objetivo >80%)
⚠️ Leaderboards sin cache (450ms latencia)

---

## 🎓 Glosario de Términos

| Término | Definición |
|---------|-----------|
| **IEEE 830** | Estándar de especificación de requisitos de software |
| **ML Coins** | Moneda virtual ganada completando ejercicios |
| **Rango Maya** | Sistema de progresión con 5 niveles (Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan) |
| **Power-up** | Item consumible que ayuda durante ejercicios |
| **Achievement** | Logro desbloqueable por completar objetivos |
| **Streak** | Racha de días consecutivos de actividad |
| **UC-STU-XXX** | Código de caso de uso para rol Student |
| **RN-XXX** | Código de regla de negocio |

---

## 📈 Estimación de Esfuerzo

### Para Completar Documentación
- Student (UC-004 a 012): **3-4 días**
- Teacher (UC-001 a 008): **3-4 días**
- Admin (UC-001 a 006): **2-3 días**
- **Total:** ~10-13 días

### Para Implementar Críticos
- Email verification: **2 días**
- Password reset: **1 día**
- Captcha: **4 horas**
- **Total:** ~3.5 días (BLOCKER)

---

## 📝 Cambios en v2.0 (RFC-0001)

**Modularización:** Documento original (585 líneas) dividido en:
- RESUMEN-EJECUTIVO.md (~290 líneas)
- METRICAS-DETALLADAS.md (~350 líneas)
- README.md (este archivo)

**Beneficios:**
- Mejor navegación
- Acceso rápido a información relevante
- Ambos archivos < 400 líneas
- Índice centralizado

---

## 👥 Contribuyentes

**Documento original:** Equipo de Documentación Técnica (Oct 2025)
**Modularización:** RFC-0001 Micro-Microciclo 1-2-2 (Nov 2025)

---

## 🔄 Próximos Pasos

**Corto Plazo (2 semanas):**
1. Completar UC-STU-004 a UC-STU-012
2. Implementar email verification
3. Aumentar captcha coverage

**Mediano Plazo (4 semanas):**
1. Documentar Teacher cases (UC-TEACH-001 a 008)
2. Implementar achievements auto-detection
3. Agregar Redis cache a leaderboards

**Largo Plazo (2-3 meses):**
1. Documentar Admin cases
2. Matriz de trazabilidad completa
3. Diagramas UML consolidados

---

**Estado:** ✅ Modularizado (RFC-0001)
**Última actualización:** 2025-11-01
**Próxima revisión:** Post-implementación de críticos (Sprint 0-1)
