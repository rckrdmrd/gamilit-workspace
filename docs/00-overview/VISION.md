# Visión del Producto - GAMILIT Platform

**Versión:** 1.2 (Overview Executive Summary)
**Fecha:** 2025-11-29
**Última Actualización:** Clarificación alcance MVP vs Backlog
**Audiencia:** Stakeholders, nuevos desarrolladores, business team

> **Documento completo:** Ver [docs/01-requerimientos/proyecto/VISION-PRODUCTO.md](../01-requerimientos/proyecto/VISION-PRODUCTO.md) para especificaciones técnicas detalladas.

---

## 🎯 ALCANCE IMPLEMENTADO

| Componente | Estado | Ejercicios |
|-----------|--------|-----------|
| **Módulo 1 - Literal** | ✅ Implementado | 5 ejercicios |
| **Módulo 2 - Inferencial** | ✅ Implementado | 5 ejercicios |
| **Módulo 3 - Crítica** | ✅ Implementado | 5 ejercicios |
| **Módulo 4 - Digital** | ✅ Implementado | 5 ejercicios |
| **Módulo 5 - Producción** | ✅ Implementado | 3 ejercicios |
| **Portal Student** | ✅ Implementado | 10 páginas |
| **Portal Teacher** | ✅ Implementado | 10 páginas |
| **Portal Admin** | ✅ Implementado | 7 páginas |
| **Total Mecánicas** | ✅ 23 tipos | Todos funcionales |

> **Actualizado:** 2025-12-23 - Todos los módulos están implementados

---

## 1. ¿Qué es GAMILIT Platform?

GAMILIT Platform (Gamilit) es una **plataforma educativa gamificada** que revoluciona el aprendizaje de comprensión lectora mediante:

- **Contenido especializado** sobre Marie Curie (vida, descubrimientos, legado científico)
- **Gamificación cultural** con sistema de rangos inspirado en la civilización Maya
- **23 tipos de ejercicios implementados** (Módulos 1-5 completos)
- **Arquitectura multi-tenant** preparada para escalar a 100+ escuelas

**Mercado objetivo:** Estudiantes de nivel medio superior (preparatoria, 15-18 años)

**Modelo de negocio:** B2B2C - Instituciones educativas suscriben a sus estudiantes

---

## 2. Visión y Propuesta de Valor

### Declaración de Visión

> "Transformar el aprendizaje de comprensión lectora en una experiencia gamificada culturalmente relevante, donde cada estudiante progresa a través de rangos inspirados en la civilización Maya mientras descubre el legado científico de Marie Curie."

### Objetivos Estratégicos

1. **Mejorar Comprensión Lectora**
   - Desarrollar las 5 dimensiones de comprensión (literal, inferencial, crítica, digital, producción)
   - Personalizar rutas de aprendizaje según nivel
   - Medir progreso de forma objetiva y continua

2. **Aumentar Engagement Estudiantil**
   - Retención objetivo: >70% a 30 días (vs. 40% plataformas tradicionales)
   - Sesiones por semana: 2.5x más frecuentes
   - Tiempo promedio de sesión: >15 minutos

3. **Escalar a Múltiples Instituciones**
   - Soporte para 100+ escuelas simultáneas (multi-tenant)
   - Capacidad para 10,000+ usuarios concurrentes
   - Dashboard para profesores e instituciones

4. **Innovar en Pedagogía Digital**
   - Integración con IA para feedback personalizado
   - Mecánicas modernas (TikTok UI, debates digitales, fact-checking)
   - Contenido cultural relevante para LATAM

---

## 3. Estado Actual del Producto

**Calificación Global:** 7.5/10 - BETA+

### ✅ Fortalezas (85% base técnica sólida)

- **23 tipos de ejercicios implementados (M1-M5)** ✅
  - Módulo 1 (Literal): 5 ejercicios ✅
  - Módulo 2 (Inferencial): 5 ejercicios ✅
  - Módulo 3 (Crítica): 5 ejercicios ✅
  - Módulo 4 (Digital): 5 ejercicios ✅ (1 auto-calificable, 4 revisión manual)
  - Módulo 5 (Producción): 3 ejercicios ✅ (todos revisión manual, 500 XP c/u)

  > **Nota:** M4-M5 completamente implementados. M4 incluye Quiz TikTok (auto-calificable) y 4 ejercicios con revisión docente. M5 requiere revisión manual por docente.

- **Sistema de gamificación 78% completo**
  - Rangos Maya (5 niveles) ✅
  - ML Coins (economía virtual) ✅
  - Achievements (parcial, 2 activos)
  - Misiones (daily/weekly) ✅

- **Infraestructura robusta**
  - 150+ endpoints backend funcionales
  - 50+ componentes React 19
  - Base de datos PostgreSQL bien diseñada (42 tablas, 11 schemas, 208 índices)

### ⚠️ Áreas de Mejora (Sprint 0-3, estimado 5-6 semanas)

- **Seguridad:** Vulnerabilidades críticas (SQL injection, XSS) - P0
- **Funcionalidad:** Bugs en autenticación y progreso - P0
- **Performance:** Tiempo de carga 5.5s (objetivo <2s) - P1
- **Testing:** Coverage insuficiente (objetivo 70%) - P1

---

## 4. Modelo Educativo

### Cinco Dimensiones de Comprensión Lectora

| Módulo | Dimensión | Objetivo Pedagógico | Estado |
|--------|-----------|---------------------|--------|
| **M1** | Comprensión Literal | Identificar información explícita | ✅ Implementado |
| **M2** | Comprensión Inferencial | Deducir información implícita | ✅ Implementado |
| **M3** | Comprensión Crítica | Evaluar y argumentar | ✅ Implementado |
| **M4** | Lectura Digital | Navegar medios digitales, fact-checking | ✅ Implementado |
| **M5** | Producción de Textos | Crear contenido multimedia propio | ✅ Implementado |

> **M4-M5 Implementados:** M4 incluye verificación de fake news, análisis de memes, infografías interactivas, navegación hipertextual y quiz TikTok. M5 incluye diario multimedia, comic digital y video-carta.

### Sistema de Progresión

**Flujo de aprendizaje:**
1. Estudiante accede a módulo desbloqueado por su rango
2. Selecciona y completa ejercicio con mecánica específica
3. Recibe feedback inmediato y scoring
4. Gana ML Coins, XP y actualiza progreso
5. Al completar módulo, puede ascender de rango

**Requisitos:**
- Score mínimo de 70% para avanzar
- Intentos ilimitados (configurable)
- Sistema de hints con costo en ML Coins

---

## 5. Modelo de Gamificación

### Sistema de Rangos Maya

Progresión inspirada en la jerarquía de la civilización Maya:

| Rango | XP Requerido | Multiplicador | ML Coins Bonus | Significado |
|-------|--------------|---------------|----------------|-------------|
| **Ajaw** (Señor) | 0-499 XP | 1.00x | - | Iniciado en el conocimiento |
| **Nacom** (Capitán de Guerra) | 500-999 XP | 1.10x | +100 | Explorador emergente |
| **Ah K'in** (Sacerdote del Sol) | 1,000-1,499 XP | 1.15x | +250 | Analítico distinguido |
| **Halach Uinic** (Hombre Verdadero) | 1,500-1,899 XP | 1.20x | +500 | Crítico y líder |
| **K'uk'ulkan** (Serpiente Emplumada) | 1,900+ XP | 1.25x | +1,000 | Maestro supremo |

> **Nota:** K'uk'ulkan (1,900 XP) es alcanzable completando M1-M3 con excelencia. M4-M5 proporcionan XP adicional para consolidar el rango.

### Economía ML Coins

**ML Coins = Machine Learning Coins** (moneda virtual de la plataforma)

**Formas de ganar:**
- Completar ejercicio: 15 coins base
- Score perfecto (100%): +6 a +12 coins
- Primer intento exitoso: +15 coins
- Streak diario: +2 coins × días consecutivos
- Completar módulo: +50 coins
- Achievement desbloqueado: +25 a +200 coins
- Daily login: +10 coins
- Promoción de rango: +50 a +150 coins

**Formas de gastar:**
- Power-up "Pistas": 15 coins
- Power-up "Visión Lectora": 25 coins
- Power-up "Segunda Oportunidad": 40 coins

**Multiplicadores:** Todos los earnings se multiplican por el multiplicador del rango actual.

**Ejemplo:** Estudiante en rango Nacom (1.25x) completa ejercicio perfecto:
27 coins × 1.25 = **33 coins**

### Achievements y Misiones

**Achievements (6 categorías):**
- Progress, Streak, Completion, Mastery, Exploration, Special
- Rareza: Common (25 coins) → Legendary (200 coins)

**Misiones:**
- Daily: 3 misiones, expiran en 24h
- Weekly: 5 misiones, expiran en 7 días
- Special: Sin expiración, eventos especiales

---

## 6. Arquitectura y Stack Tecnológico

### Stack Principal

**Frontend:**
- React 19 + TypeScript 5.9
- Vite (build tool)
- Tailwind CSS 4 (estilos)
- Framer Motion 12 (animaciones)
- Zustand (estado global)
- Zod 4 (validación)

**Backend:**
- Node.js + Express.js + TypeScript
- PostgreSQL 15+ (base de datos)
- JWT (autenticación)
- WebSockets (real-time)

**Infraestructura:**
- API RESTful (150+ endpoints)
- PostgreSQL: 42 tablas, 11 schemas, 208 índices
- Multi-tenant architecture (tenant_id en todas las tablas)

### Capacidad y Escalabilidad

**Capacidad actual:**
- 500 usuarios concurrentes
- Tiempo de carga: 5.5 segundos
- Bundle frontend: 855 KB

**Capacidad objetivo (con optimizaciones Sprint 2-3):**
- 5,000+ usuarios concurrentes
- Tiempo de carga: <2 segundos
- Bundle frontend: <300 KB

**Optimizaciones planificadas:**
- Redis cache
- Code splitting frontend
- Índices DB adicionales
- CDN para assets estáticos

---

## 7. Roles de Usuario

### Estudiante (Rol Principal)
- Completar ejercicios de comprensión lectora
- Ganar ML Coins y XP
- Progresar a través de Rangos Maya
- Desbloquear achievements y misiones
- Competir en leaderboards
- Comprar power-ups

### Profesor
- Ver dashboard de progreso de alumnos
- Asignar ejercicios y módulos
- Revisar intentos y calificaciones
- Generar reportes de clase
- Identificar estudiantes con dificultades

### Administrador
- Gestionar usuarios y roles
- Configurar contenido educativo
- Monitorear estadísticas de plataforma
- Gestionar tenants (escuelas)

---

## 8. Métricas de Éxito

### KPIs Técnicos (Post Sprint 0-3)
- Uptime: >99.5%
- Load time: <2s (p95)
- Error rate: <0.5%
- Security incidents: 0 críticos
- Usuarios concurrentes: 2,000-5,000

### KPIs de Negocio (Primeros 3 meses)
- Usuarios registrados: 2,000
- Retention (30 días): >70%
- Churn mensual: <10%
- NPS: >50

### KPIs Educativos
- Módulos completados promedio: >2 por estudiante
- Score promedio: >75%
- Tiempo de sesión: >15 minutos
- Ejercicios completados/semana: >5

---

## 9. Ventajas Competitivas

### Diferenciadores vs. Competencia

1. **Gamificación Cultural Única**
   - Rangos Maya con significado histórico real
   - Narrativa cultural relevante para LATAM

2. **Contenido Especializado**
   - Marie Curie como hilo conductor (único en el mercado)
   - Narrativa coherente a través de 5 módulos

3. **Mecánicas Innovadoras**
   - Quiz estilo TikTok (UI moderna)
   - Debates con IA en tiempo real
   - Verificador de fake news
   - Análisis de memes educativos

4. **Precio Competitivo**
   - **$18 USD/usuario/año** (40% más económico que Classcraft $120/aula)
   - Modelo B2B2C escalable

5. **Multi-tenant Architecture**
   - Una sola plataforma para múltiples escuelas
   - Economías de escala

### Comparación Rápida

| Plataforma | Precio/año | Gamificación | Contenido Especializado |
|------------|------------|--------------|------------------------|
| **GLIT** | $18 | ★★★★★ | ★★★★★ (Marie Curie) |
| Duolingo | $80 | ★★★★ | ★★★ (idiomas) |
| Khan Academy | Gratis | ★★ | ★★★★ (matemáticas) |
| Classcraft | $120/aula | ★★★★★ | ★★ (genérico) |
| Quizizz | $50/teacher | ★★★ | ★★ (genérico) |

---

## 10. Alcance del Proyecto

### Incluido en v1.0
- 33 mecánicas educativas completas ✅
- Sistema de gamificación (Rangos Maya, ML Coins, misiones)
- Autenticación (JWT, roles, sesiones)
- Dashboard de progreso para estudiantes
- Backend completo (150+ endpoints)
- Frontend React completo (50+ componentes)

### Fuera de Alcance v1.0 (Futuras versiones)
- OAuth/Social login (Google, Facebook)
- Mobile apps nativas (iOS/Android)
- Teacher Portal UI completo
- Analytics ML-based avanzado
- Sistema de video conferencia
- Gamificación de prestigio avanzada
- Guilds y sistema de amigos completo

---

## 11. Próximos Pasos

### Sprint 0-3 (5-6 semanas) - Correcciones Críticas

**P0 (Crítico):**
1. Corregir vulnerabilidades de seguridad (SQL injection, XSS)
2. Resolver bugs en autenticación y progreso
3. Completar sistema de achievements
4. Testing completo (coverage >70%)

**P1 (Alto):**
5. Optimizar performance (tiempo de carga <2s)
6. Implementar Redis cache
7. Code splitting frontend
8. Completar dashboard de profesor

### Post-Launch (3-6 meses)

- Onboarding de primeras 5 escuelas piloto
- Iteración basada en feedback de usuarios
- Expansión de contenido (más temas educativos)
- Features sociales avanzados (guilds, competencias)

---

## 📚 Documentación Relacionada

**Para profundizar:**
- [VISION-PRODUCTO.md completo](../01-requerimientos/proyecto/VISION-PRODUCTO.md) - Especificaciones técnicas detalladas
- [ESTRATEGIA-NEGOCIO.md](../01-requerimientos/proyecto/ESTRATEGIA-NEGOCIO.md) - Modelo de negocio y financials
- [ONBOARDING.md](./ONBOARDING.md) - Guía de setup para nuevos desarrolladores
- ARQUITECTURA-ALTO-NIVEL.md - Diagrama de arquitectura del sistema (⏳ Planeado - ver [docs/02-especificaciones-tecnicas/arquitectura/](../02-especificaciones-tecnicas/arquitectura/))

**Para desarrollo:**
- [docs/03-desarrollo/](../03-desarrollo/) - Guías técnicas de desarrollo
- [apps/backend/_MAP.md](../../apps/backend/_MAP.md) - Estructura del backend
- [apps/frontend/_MAP.md](../../apps/frontend/_MAP.md) - Estructura del frontend

**Para requerimientos detallados:**
- [Casos de Uso - Estudiante](../01-requerimientos/casos-uso/student/) - UC-STU-001 a UC-STU-003
- [Sistema de Gamificación](../01-requerimientos/gamificacion/README.md) - Rangos Maya, ML Coins, Achievements
- [Módulos Educativos](../01-requerimientos/modulos/README-MODULOS-EDUCATIVOS.md) - 5 módulos, 31 mecánicas

---

**Documento preparado por:** Tech Lead
**Fecha:** 2025-11-07
**Versión:** 1.0 (Executive Summary)
**Clasificación:** Interno

**Última actualización:** 2025-11-07
