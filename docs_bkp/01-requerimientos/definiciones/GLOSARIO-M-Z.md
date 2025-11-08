# Glosario de Conceptos M-Z - GAMILIT Platform

**Proyecto:** Gamilit Platform
**Archivo original:** GLOSARIO-CONCEPTOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## M

### Marie Curie
Científica polaco-francesa (1867-1934), pionera en radioactividad, primera mujer en ganar Premio Nobel y única en ganar dos Nobels en diferentes categorías (Física 1903, Química 1911). Tema central de todo el contenido educativo de GAMILIT

### Mecánica Educativa
Tipo específico de interacción pedagógica implementada como componente de software. GAMILITincluye 33 mecánicas: crucigrama, línea de tiempo, detective textual, debate digital, verificador fake news, etc.

### K'uk'ulkan
Quinto y último rango en la jerarquía Maya (Serpiente Emplumada / Maestro). Requisitos: completar 5 módulos con score ≥70%. Otorga multiplicador de 2.0x y bonus de 150 ML Coins al ascender.

### Misión
Objetivo temporal con rewards específicos. Tipos:
- **Daily:** 3 simultáneas, expiran en 24h
- **Weekly:** 5 simultáneas, expiran en 7 días
- **Special:** Sin expiración, eventos únicos

### ML Coins
**Machine Learning Coins**. Moneda virtual de GAMILITque representa valor acumulado del aprendizaje. Se ganan por actividades (ejercicios, logros, streaks) y se gastan en power-ups. Todos los earnings aplican multiplicador de rango.

### Mock Data
Datos de prueba/simulados usados en desarrollo. GAMILITusa mock data para:
- Respuestas AI (hasta integración real)
- Usuarios de prueba
- Ejercicios de ejemplo
- Transcripciones de audio

### Módulo Educativo
Agrupación temática de ejercicios enfocados en una dimensión de comprensión lectora. GAMILITtiene 5 módulos planeados (4 implementados):
1. Comprensión Literal (7 mecánicas) ✅
2. Comprensión Inferencial (5 mecánicas) ✅
3. Comprensión Crítica (5 mecánicas) ✅
4. Lectura Digital (9 mecánicas) ✅
5. Producción de Textos (3 mecánicas) ❌

### Multiplier (Multiplicador)
Factor que aumenta rewards ganados. Tipos en GAMILIT
- **Rank Multiplier:** 1.0x a 2.0x según rango Maya
- **Difficulty Multiplier:** 1.0x a 1.5x según dificultad
- Aplicados a ML Coins y XP ganados

### Multi-tenant
Arquitectura donde una única instancia de software sirve a múltiples clientes (tenants/escuelas). GAMILITimplementa multi-tenancy con campo `tenant_id` en tablas principales.

### MVP (Minimum Viable Product)
Producto mínimo viable. Para GAMILIT Módulos 1-4 completos, sistema de gamificación funcional, autenticación segura. NO incluye Módulo 5, OAuth, mobile apps nativas.

---

## N

### Ajaw
Primer rango en la jerarquía Maya (Señor/Gobernante / Iniciado). Rango inicial obtenido al completar el primer módulo. Requisitos: completar 1 módulo con score ≥70%. Otorga multiplicador de 1.0x (base) y bonus de 50 ML Coins al ascender.

### NPS (Net Promoter Score)
Métrica de satisfacción del cliente basada en probabilidad de recomendar el producto. Meta de GAMILIT NPS >50 post-lanzamiento.

---

## O

### Onboarding
Proceso de introducción de nuevos usuarios a la plataforma. Incluye tutorial, configuración inicial, y primeros pasos guiados.

---

## P

### Passing Score
Puntuación mínima requerida para considerar un ejercicio como "aprobado". Default en GAMILIT 70%. Configurable por ejercicio.

### Pechblenda
Mineral de uranio del cual Marie Curie extrajo radio y polonio. Mencionado frecuentemente en contenido educativo de GAMILIT

### Penalty (Penalización)
Reducción de score por acciones específicas:
- Usar hints: -5 a -10 puntos
- Tiempo excedido: -5% por cada 30s extra
- Power-ups usados: -10% por comodín (excepto Segunda Oportunidad)

### Performance
Medida de velocidad y eficiencia de la plataforma. Métricas clave en GAMILIT load time (<2s objetivo), tiempo de query DB (<50ms), usuarios concurrentes soportados (5,000+ objetivo).

### Polonio
Elemento químico (Po) descubierto por Marie Curie en 1898, nombrado en honor a Polonia, su país natal. Concepto frecuente en contenido educativo.

### PostgreSQL
Sistema de gestión de base de datos relacional usado por GAMILIT 42 tablas, 11 schemas, 208 índices.

### Power-up (Comodín)
Item consumible que ayuda al estudiante durante ejercicios:
- **Pistas:** Revela hints (15 ML Coins)
- **Visión Lectora:** Resalta keywords (25 ML Coins)
- **Segunda Oportunidad:** Reintentar sin penalty (40 ML Coins)

### Progreso
Avance del estudiante en módulos y ejercicios. Tracked en tres niveles:
1. **Overall:** Progreso general de plataforma
2. **Module:** Progreso en módulo específico
3. **Exercise:** Intentos individuales de ejercicios

---

## R

### Radio
Elemento químico (Ra) descubierto por Marie Curie en 1898. Primer elemento radiactivo aislado. Concepto central en contenido educativo de GAMILIT

### Radioactividad
Fenómeno físico estudiado por Marie Curie donde núcleos atómicos inestables emiten radiación. Tema recurrente en ejercicios científicos de GAMILIT

### Rango Maya
Sistema de progresión de cinco niveles inspirado en jerarquía de la civilización Maya:
1. Ajaw (Señor/Gobernante - Iniciado) - 1.0x - Rango inicial
2. Nacom (Capitán de Guerra - Explorador) - 1.25x - 2 módulos
3. Ah K'in (Sacerdote del Sol - Analítico) - 1.5x - 3 módulos
4. Halach Uinic (Hombre Verdadero - Crítico) - 1.75x - 4 módulos
5. K'uk'ulkan (Serpiente Emplumada - Maestro) - 2.0x - 5 módulos (máximo)

Cada rango otorga multiplicador creciente para ML Coins y XP.

### Rate Limiting
Mecanismo de seguridad que limita el número de requests que un usuario puede hacer en un período de tiempo. Recomendado para GAMILIT 10 req/min en endpoints de submission (Sprint 1).

### React
Librería JavaScript para construir interfaces de usuario. GAMILITusa React 19 (última versión) con TypeScript.

### Redis
Sistema de base de datos en memoria usado para caching de alto performance. Planeado para GAMILITen Sprint 2 para leaderboards y user stats.

### Repository Pattern
Patrón de diseño que abstrae acceso a datos. GAMILITimplementa `*.repository.ts` files que encapsulan queries SQL.

### RESTful API
Estilo de arquitectura de API basado en HTTP con operaciones CRUD. GAMILITimplementa API RESTful con 150+ endpoints.

### Retention (Retención)
Porcentaje de usuarios que siguen activos después de un período. Meta de GAMILIT >70% retention a 30 días.

### ROI (Return on Investment)
Retorno de inversión. Análisis de GAMILIT inversión de $42,550 genera ROI de 1,535% en año 1.

### RLS (Row Level Security)
Mecanismo de seguridad de PostgreSQL que filtra rows de tablas según políticas. GAMILITimplementa RLS con middleware, pero tiene vulnerabilidad SQL injection detectada (Sprint 0).

---

## S

### Sanitización
Proceso de remover información sensible (ej: respuestas correctas) de ejercicios antes de enviarlos al frontend. Implementado en `sanitizeExercise()` utility.

### Schema
Organización lógica de base de datos. GAMILITusa 11 schemas:
- `educational_content`: Módulos y ejercicios
- `progress_tracking`: Avance de estudiantes
- `gamification_system`: Rangos, coins, achievements
- `auth_management`: Usuarios y sesiones
- `social_features`: Amigos y guilds (parcial)
- Y otros 6...

### Score (Puntuación)
Resultado numérico (0-100) que mide desempeño en un ejercicio. Componentes:
- **Base Score:** Precisión de respuestas
- **Time Bonus:** Por velocidad
- **Accuracy Bonus:** Por alta precisión (>90%)
- **Penalties:** Por hints, tiempo extra, etc.
- **Total Score:** Suma de componentes

### Scoring Service
Servicio backend que calcula puntuaciones finales aplicando multiplicadores, bonuses y penalties. Core del sistema de rewards de GAMILIT

### Sprint
Período de desarrollo intensivo (1-2 semanas) con objetivos específicos. Roadmap de GAMILITincluye 5 sprints (Sprint 0 a Sprint 4) para llegar a production-ready.

### SQL Injection
Vulnerabilidad de seguridad donde código SQL malicioso se inyecta en queries. Detectado en RLS middleware de GAMILIT(CVSS 8.2); corrección urgente requerida (Sprint 0).

### Stack Tecnológico
Conjunto de tecnologías usadas en la plataforma:
- **Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Tools:** Zod, Zustand, Vite

### Streak (Racha)
Días consecutivos de actividad en la plataforma. Rewards: +2 ML Coins × streak days. Métricas: `current_streak`, `longest_streak`.

### Supabase
Plataforma backend-as-a-service mencionada 200+ veces en documentación legacy pero **NO usada** en GAMILIT Causa confusión; documentación debe actualizarse (Sprint post-producción).

---

## T

### Tailwind CSS
Framework de CSS utility-first usado para estilos en GAMILIT Versión 4.

### Tenant
Cliente de una plataforma multi-tenant. En GAMILIT cada escuela/institución es un tenant con datos aislados vía `tenant_id`.

### TikTok UI
Interfaz de usuario inspirada en TikTok con scroll/swipe vertical entre contenidos. Implementado en mecánica "Quiz TikTok" del Módulo 4.

### Trigger (Disparador)
Función de base de datos que se ejecuta automáticamente en respuesta a eventos (INSERT, UPDATE, DELETE). GAMILITusa trigger `trg_update_user_stats_on_exercise` para actualizar ML Coins y XP, pero NO está documentado en código (BUG crítico).

### TypeScript
Superset de JavaScript con tipado estático. Usado en 100% del código frontend y backend de GAMILIT Versión 5.9.

---

## U

### User Stats
Tabla central `gamification_system.user_stats` que almacena métricas agregadas de cada estudiante:
- `ml_coins`, `total_xp`
- `current_rank`, `current_streak`
- `modules_completed`, `average_score`
- `achievements_earned`, `exercises_completed`

---

## V

### Validación Server-side
Principio de seguridad donde todas las respuestas de ejercicios se validan en el backend, no en el frontend. Implementado en GAMILITcon `validateAnswers()` en `exercises.service.ts`.

### Vista Materializada
Tabla de base de datos que almacena resultados de una query compleja para mejorar performance. GAMILITusa vistas materializadas para leaderboards (30x más rápido).

---

## W

### WebSocket
Protocolo de comunicación bidireccional en tiempo real. GAMILITusa WebSocket para chat en vivo (Debate Digital) y notificaciones push.

### Whisper
Modelo de AI de OpenAI para transcripción de audio. Planeado para integración en mecánica "Podcast Argumentativo" (actualmente mock).

---

## X

### XP (Experience Points)
Ver **Experience Points**.

### XSS (Cross-Site Scripting)
Vulnerabilidad de seguridad donde código JavaScript malicioso se inyecta en páginas web. Detectado en Content Editor de GAMILIT(CVSS 6.9); requiere sanitización con DOMPurify (Sprint 0).

---

## Z

### Zod
Librería de validación de esquemas TypeScript-first. Usada en GAMILITpara validar estructuras de contenido de ejercicios (`*Schemas.ts` files).

### Zustand
Librería de gestión de estado para React. GAMILITusa 10+ stores Zustand para economía, rangos, achievements, leaderboards, etc. Más ligero que Redux.

---

## SÍMBOLOS Y ACRÓNIMOS

### API
Application Programming Interface

### B2B2C
Business-to-Business-to-Consumer (modelo de negocio multi-tenant)

### CRON
Comando/servicio de Unix para ejecutar tareas programadas (ej: reset de streaks diarios)

### CRUD
Create, Read, Update, Delete

### CVSS
Common Vulnerability Scoring System (escala 0-10 para severidad de vulnerabilidades)

### DDL
Data Definition Language (SQL para crear tablas, schemas)

### E2E
End-to-End (testing de flujo completo de usuario)

### GDPR
General Data Protection Regulation (regulación europea de protección de datos)

### HTTP
Hypertext Transfer Protocol

### HTTPS
HTTP Secure

### IDOR
Insecure Direct Object Reference

### JWT
JSON Web Token

### LATAM
Latinoamérica

### LGPD
Lei Geral de Proteção de Dados (ley brasileña de protección de datos)

### ML
Machine Learning (en contexto de "ML Coins")

### MVC
Model-View-Controller (patrón de arquitectura)

### MVP
Minimum Viable Product

### NPS
Net Promoter Score

### OWASP
Open Web Application Security Project

### P0, P1, P2, P3
Niveles de prioridad (P0 = crítico, P3 = bajo)

### REST
Representational State Transfer

### ROI
Return on Investment

### RLS
Row Level Security

### SQL
Structured Query Language

### STEM
Science, Technology, Engineering, Mathematics

### TTL
Time To Live (tiempo de expiración de cache)

### UI
User Interface

### URL
Uniform Resource Locator

### UX
User Experience

### WCAG
Web Content Accessibility Guidelines

### WebSocket
Protocolo de comunicación bidireccional

### XP
Experience Points

### XSS
Cross-Site Scripting

---

## TÉRMINOS CULTURALES Y EDUCATIVOS

### Civilización Maya
Civilización mesoamericana precolombina conocida por avances en matemáticas, astronomía, arquitectura y sistema de escritura jeroglífica. Base cultural para sistema de rangos de GAMILIT

### Comprensión Lectora
Habilidad de entender, interpretar, analizar y evaluar textos escritos. GAMILITtrabaja 5 dimensiones: literal, inferencial, crítica, digital, producción.

### Gamificación Educativa
Aplicación de mecánicas de juego en contextos educativos para aumentar motivación, engagement y aprendizaje. GAMILITgamifica mediante rangos, economía virtual, logros y competencias.

### Pedagogía Digital
Ciencia de enseñar y aprender usando tecnologías digitales. GAMILITimplementa pedagogía digital mediante mecánicas interactivas, feedback inmediato, y personalización por nivel.

### Pensamiento Crítico
Habilidad de analizar, evaluar y sintetizar información de manera objetiva. Objetivo central del Módulo 3 de GAMILIT

---

**Documento preparado por:** Equipo de Documentación Técnica
**Fecha:** Octubre 2025
**Total de términos (M-Z + Acrónimos + Términos Culturales):** 75+

**Fuentes:**
- Análisis técnicos ciclos 1-3
- Documentación de módulos educativos
- Documentación de sistema de gamificación
- Código fuente backend y frontend
- Estándares de industria (OWASP, WCAG, etc.)
