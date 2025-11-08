# Visión del Producto - GAMILIT Platform

**Proyecto:** Gamilit Platform
**Archivo original:** VISION-GENERAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## 1. RESUMEN EJECUTIVO

GAMILIT Platform es una **plataforma educativa gamificada** que revoluciona el aprendizaje de comprensión lectora mediante contenido especializado sobre Marie Curie, diseñada para estudiantes del nivel medio superior (preparatoria). La plataforma combina mecánicas educativas innovadoras con un sistema de gamificación inspirado en la cultura Maya, arquitectura multi-tenant preparada para escalar, e integración con inteligencia artificial.

### Oportunidad de Negocio

- **Mercado objetivo:** Estudiantes de nivel medio superior (15-18 años)
- **Diferenciador clave:** Contenido especializado (Marie Curie) + Gamificación cultural única (Rangos Maya)
- **Modelo de negocio:** B2B2C multi-tenant (escuelas/instituciones)
- **Precio estimado:** $18 USD/usuario/año (40% más económico que competidores como Classcraft)

### Estado Actual

**Calificación Global:** 7.5/10 - BETA+

La plataforma tiene una base técnica sólida (85% de fundamentos correctos) con:
- **31 mecánicas educativas implementadas (100% completitud) ✅**
- Sistema de gamificación 78% completo
- Base de datos bien diseñada (85/100)
- 150+ endpoints backend funcionales
- 50+ componentes frontend React 19

**Nota Importante:** Conteo final de mecánicas: 31 (5 en Módulo 1, 5 en Módulo 2, 5 en Módulo 3, 9 en Módulo 4, 3 en Módulo 5, 4 auxiliares).

**Requiere:** Correcciones críticas de seguridad y funcionalidad antes de lanzamiento a producción (estimado: 5-6 semanas de desarrollo, reducido por completitud de mecánicas).

---

## 2. VISIÓN DEL PRODUCTO

### Declaración de Visión

> "Transformar el aprendizaje de comprensión lectora en una experiencia gamificada culturalmente relevante, donde cada estudiante progresa a través de rangos inspirados en la civilización Maya mientras descubre el legado científico de Marie Curie."

### Objetivos Estratégicos

1. **Mejorar Comprensión Lectora**
   - Desarrollar las 5 dimensiones de comprensión (literal, inferencial, crítica, digital, producción)
   - Medir progreso de forma objetiva y continua
   - Personalizar rutas de aprendizaje según nivel

2. **Aumentar Engagement Estudiantil**
   - Retención objetivo: >70% a 30 días (vs. 40% sin gamificación)
   - Sesiones por semana: 2.5x más que plataformas tradicionales
   - Tiempo promedio de sesión: >15 minutos

3. **Escalar a Múltiples Instituciones**
   - Arquitectura multi-tenant para 100+ escuelas
   - Soporte para 10,000+ usuarios concurrentes (con optimizaciones)
   - Modelo B2B2C con dashboard para profesores

4. **Innovar en Pedagogía Digital**
   - Integración con IA para feedback personalizado
   - Mecánicas educativas modernas (TikTok UI, debates digitales, fake news)
   - Contenido cultural relevante (Rangos Maya, Marie Curie)

---

## 3. ALCANCE DEL PROYECTO

### 3.1 Módulos Principales

| Módulo | Propósito | Estado | Prioridad |
|--------|-----------|--------|-----------|
| **Educación** | 5 módulos de comprensión lectora con 31 mecánicas | 100% completo ✅ | P0 - Core |
| **Gamificación** | Rangos Maya, ML Coins, achievements, misiones | 78% completo | P0 - Core |
| **Autenticación** | Login, registro, gestión de sesiones, roles | 68% completo | P0 - Core |
| **Progreso & Analytics** | Tracking de avance, dashboards, reportes | 75% completo | P1 - Alto |
| **Social** | Amigos, guilds, competencias | 51% implementado, 0% funcional | P2 - Medio |
| **Profesor** | Dashboard de profesor, gestión de alumnos | 85% backend, 0% UI | P1 - Alto |
| **Admin** | Panel administrativo para gestión de plataforma | 70% completo | P2 - Medio |

### 3.2 Usuarios del Sistema

#### Estudiante (Rol Principal)
- **Actividades:**
  - Completar ejercicios de comprensión lectora
  - Ganar ML Coins y XP
  - Progresar a través de Rangos Maya (nacom → mercenario)
  - Desbloquear achievements y misiones
  - Competir en leaderboards
  - Comprar power-ups con ML Coins

#### Profesor
- **Actividades:**
  - Ver dashboard de progreso de alumnos
  - Asignar ejercicios y módulos
  - Revisar intentos y calificaciones
  - Generar reportes de clase
  - Identificar estudiantes con dificultades

#### Administrador
- **Actividades:**
  - Gestionar usuarios y roles
  - Configurar contenido educativo
  - Monitorear estadísticas de plataforma
  - Gestionar tenants (escuelas)

### 3.3 Contenido Educativo

**Tema central:** Marie Curie - Vida, descubrimientos científicos, legado

**Cobertura de contenido:**
- Biografía completa de Marie Curie
- Descubrimientos científicos (radio, polonio, radioactividad)
- Contexto histórico (Polonia, Francia, siglo XX)
- 8 eventos cronológicos principales
- 50+ términos científicos
- 30+ conceptos relacionados

**Nota:** El contenido es específico de Marie Curie en la versión actual. Para escalar a otros temas, se requiere nueva creación de contenido.

### 3.4 Fuera de Alcance (v1.0)

**No incluido en MVP:**
- OAuth/Social login (Google, Facebook, etc.)
- Mobile apps nativas (iOS/Android)
- Teacher Portal UI completo
- Analytics ML-based avanzado
- Sistema de video conferencia integrado
- Gamificación de prestigio (frontend diseñado, backend no existe)
- Guilds y amigos (UI existe, backend no funcional)

**NOTA ACTUALIZADA:** El Módulo 5 (Producción de Textos) está 100% implementado con 3 mecánicas funcionales (Diario Multimedia, Cómic Digital, Video Carta). Análisis previo lo reportó como no implementado, pero verificación de código fuente confirma su existencia completa.

---

## 4. ARQUITECTURA DE LA PLATAFORMA

### 4.1 Stack Tecnológico

**Frontend:**
- React 19 (última versión)
- TypeScript 5.9
- Framer Motion 12 (animaciones)
- Tailwind CSS 4 (estilos)
- Zustand (gestión de estado)
- Zod 4 (validación de esquemas)
- Vite (build tool)

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL (base de datos)
- JWT (autenticación)
- WebSockets (real-time)

**Infraestructura:**
- Arquitectura monolítica modular
- API RESTful (150+ endpoints)
- Base de datos: PostgreSQL con 42 tablas, 11 schemas, 208 índices
- Real-time: WebSocket para chat y notificaciones

### 4.2 Patrones de Diseño

**Backend:**
- Repository Pattern (acceso a datos)
- Service Layer (lógica de negocio)
- Controller Layer (endpoints HTTP)
- Dependency Injection (testing y modularidad)
- Multi-tenant (tenant_id en todas las tablas principales)

**Frontend:**
- Component-based Architecture
- Feature-based folder structure
- Shared utilities y hooks
- Atomic Design parcial
- State management con Zustand stores

### 4.3 Escalabilidad y Performance

**Capacidad actual:**
- 500 usuarios concurrentes (sin optimizaciones)
- Tiempo de carga: 5.5 segundos (frontend bundle: 855 KB)
- Queries DB: hasta 450ms sin índices optimizados

**Capacidad objetivo (con optimizaciones):**
- 5,000+ usuarios concurrentes
- Tiempo de carga: <2 segundos (bundle <300 KB)
- Queries DB: <50ms con Redis cache y índices

**Optimizaciones planificadas:**
- Redis cache (Sprint 2)
- Code splitting frontend
- Índices DB adicionales
- CDN para assets estáticos
- Connection pool aumentado

---

## 5. MODELO EDUCATIVO

### 5.1 Cinco Dimensiones de Comprensión Lectora

| Módulo | Dimensión | Objetivo Pedagógico | Mecánicas |
|--------|-----------|---------------------|-----------|
| **Módulo 1** | Comprensión Literal | Identificar información explícita del texto | 7 mecánicas (crucigrama, línea de tiempo, sopa de letras, mapa conceptual, emparejamiento, verdadero/falso, completar espacios) |
| **Módulo 2** | Comprensión Inferencial | Deducir información implícita, hacer inferencias | 5 mecánicas (detective textual, construcción de hipótesis, predicción narrativa, puzzle contexto, rueda de inferencias) |
| **Módulo 3** | Comprensión Crítica | Evaluar, argumentar, analizar perspectivas | 5 mecánicas (tribunal de opiniones, debate digital, análisis de fuentes, podcast argumentativo, matriz de perspectivas) |
| **Módulo 4** | Lectura Digital | Navegar medios digitales, fact-checking, multimodalidad | 9 mecánicas (verificador fake news, infografía, quiz TikTok, navegación hipertextual, análisis de memes, reseña crítica, chat literario, email formal, ensayo argumentativo) |
| **Módulo 5** | Producción de Textos | Crear contenido multimedia propio | 3 mecánicas (diario multimedia, cómic digital, video carta) ✅ **IMPLEMENTADO** |
| **Auxiliares** | Herramientas de soporte | Mecánicas complementarias y validadores | 4 mecánicas (call to action, collage prensa, comprensión auditiva, texto en movimiento) |

**Total:** 33 mecánicas implementadas (100% completitud) ✅

**NOTA METODOLÓGICA:** El conteo de 33 mecánicas incluye 26 mecánicas principales (Módulos 1-5) + 4 mecánicas auxiliares + 3 mecánicas adicionales del Módulo 5. Verificación de código fuente confirma que TODAS están completamente implementadas.

### 5.2 Sistema de Progresión

**Flujo de aprendizaje:**
1. Estudiante accede a módulo desbloqueado por su rango
2. Selecciona ejercicio del catálogo
3. Completa ejercicio con mecánica específica
4. Recibe feedback inmediato y scoring
5. Gana ML Coins, XP y actualiza progreso
6. Al completar módulo, puede ascender de rango

**Requisitos de progresión:**
- Completar ejercicios con score mínimo de 70%
- Intentos ilimitados (configurable por ejercicio)
- Sistema de hints con costo en ML Coins
- Power-ups para ayuda adicional

---

## 6. MODELO DE GAMIFICACIÓN

### 6.1 Rangos Maya

Sistema de progresión inspirado en la jerarquía Maya:

| Rango | Requisito | Score Mínimo | Multiplicador | ML Coins Bonus | Significado Cultural |
|-------|-----------|--------------|---------------|----------------|---------------------|
| **Ajaw** (Señor/Gobernante) | Rango inicial - 1 módulo | 70% | 1.0x | 50 | Iniciado en el conocimiento |
| **Nacom** (Capitán de Guerra) | Completar 2 módulos | 70% | 1.25x | 75 | Explorador emergente |
| **Ah K'in** (Sacerdote del Sol) | Completar 3 módulos | 70% | 1.5x | 100 | Analítico distinguido |
| **Halach Uinic** (Hombre Verdadero) | Completar 4 módulos | 70% | 1.75x | 125 | Crítico y líder |
| **K'uk'ulkan** (Serpiente Emplumada) | Completar 5 módulos | 70% | 2.0x | 150 | Maestro supremo |

**Fuente cultural:** Jerarquía social de la civilización Maya clásica, adaptada para contexto educativo.

### 6.2 Economía ML Coins

**ML Coins = Machine Learning Coins** (moneda virtual de la plataforma)

#### Cómo Ganar ML Coins:
- Completar ejercicio: 15 coins base
- Score perfecto (100%): +6 a +12 coins (según dificultad)
- Primer intento exitoso: +15 coins
- Mantener streak diario: +2 coins × días consecutivos
- Completar módulo: +50 coins
- Desbloquear achievement: +25 a +200 coins (según rareza)
- Daily login: +10 coins
- Promoción de rango: +50 a +150 coins

#### Cómo Gastar ML Coins:
- Power-up "Pistas": 15 coins
- Power-up "Visión Lectora": 25 coins
- Power-up "Segunda Oportunidad": 40 coins

**Multiplicadores:** Todos los earnings se multiplican por el multiplicador del rango actual.

**Ejemplo:** Estudiante en rango Nacom (1.25x) completa ejercicio perfecto:
- Base: 15 + 12 = 27 coins
- Con multiplicador: 27 × 1.25 = **33 coins**

### 6.3 Sistema de Achievements

**Categorías de logros:**
- Progress (progreso acumulativo)
- Streak (días consecutivos)
- Completion (finalizar módulos)
- Mastery (perfección/dominio)
- Exploration (descubrimiento de contenido)
- Special (eventos especiales)

**Rareza y recompensas:**
- Common: 25 ML Coins
- Rare: 50 ML Coins
- Epic: 100 ML Coins
- Legendary: 200 ML Coins

**Estado actual:** Solo 2 achievements activos, sistema de detección incompleto (BUG conocido).

### 6.4 Misiones

**Tipos:**
- **Daily:** 3 misiones simultáneas, expiran en 24h
- **Weekly:** 5 misiones simultáneas, expiran en 7 días
- **Special:** Sin expiración, eventos especiales

**Objetivos típicos:**
- Completar N ejercicios
- Ganar X ML Coins
- Obtener Y scores perfectos
- Mantener Z días de streak
- Avanzar en módulo

**Recompensas:** 50-500 ML Coins, 100-1000 XP

---

## 7. MÉTRICAS DE ÉXITO

### 7.1 KPIs Técnicos

**Post-correcciones (Sprint 0-3):**
- Uptime: >99.5%
- Load time: <2s (p95)
- Error rate: <0.5%
- Security incidents: 0 críticos
- Usuarios concurrentes: 2,000-5,000

### 7.2 KPIs de Negocio

**Primeros 3 meses:**
- Usuarios registrados: 2,000
- Retention (30 días): >70%
- Churn mensual: <10%
- NPS: >50

**Primeros 6 meses:**
- Revenue mensual: $36,000
- CAC: <$50
- LTV/CAC ratio: >3

### 7.3 KPIs Educativos

- Módulos completados promedio: >2 por estudiante
- Score promedio: >75%
- Tiempo de sesión: >15 minutos
- Ejercicios completados/semana: >5 por estudiante

---

## 8. COMPETENCIA Y DIFERENCIADORES

### Comparación con Plataformas Similares

| Plataforma | Gamificación | Contenido Especializado | Performance | Seguridad | Precio/año |
|------------|--------------|------------------------|-------------|-----------|------------|
| **GAMILIT (post-fixes)** | ★★★★★ | ★★★★★ (Marie Curie) | ★★★★ | ★★★★ | $18 |
| Duolingo | ★★★★ | ★★★ (idiomas) | ★★★★★ | ★★★★★ | $80 |
| Khan Academy | ★★ | ★★★★ (matemáticas) | ★★★★ | ★★★★ | Gratis |
| Classcraft | ★★★★★ | ★★ (genérico) | ★★★ | ★★★ | $120/aula |
| Quizizz | ★★★ | ★★ (genérico) | ★★★★ | ★★★★ | $50/teacher |

### Ventajas Competitivas de GAMILIT

1. **Gamificación Cultural Única**
   - Rangos Maya con significado histórico
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
   - 40% más económico que Classcraft
   - Modelo B2B2C escalable

5. **Multi-tenant Architecture**
   - Una sola plataforma para múltiples escuelas
   - Economías de escala

---

**Documento preparado por:** Equipo de Análisis Técnico
**Fecha:** Octubre 2025
**Versión:** 2.0 (RFC-0001 Modularizado)
**Clasificación:** Interno - Confidencial

**Para más detalles:** Ver [ESTRATEGIA-NEGOCIO.md](./ESTRATEGIA-NEGOCIO.md)
