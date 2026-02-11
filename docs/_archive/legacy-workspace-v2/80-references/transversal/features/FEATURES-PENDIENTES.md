# FEATURES PENDIENTES - GAMILITPLATFORM
## Funcionalidades por Implementar (Priorizado)

**Versión:** 2.0
**Fecha:** 27 de Octubre, 2025
**Estado:** ROADMAP ACTIVO

---

## CATEGORIZACIÓN DE FEATURES

### Por Prioridad
- **P0 (Bloqueadores):** 7 features - Deben completarse antes de producción
- **P1 (Críticos):** 12 features - Necesarios para MVP completo
- **P2 (Importantes):** 18 features - Mejoran experiencia significativamente
- **P3 (Backlog):** 25+ features - Post-lanzamiento

### Por Módulo
- **Educación:** 14 mecánicas pendientes
- **Gamificación:** 8 features pendientes
- **Social:** 6 features pendientes
- **Admin/Teacher:** 12 features pendientes
- **Sistema:** 15 features pendientes

---

## FEATURES P0 - BLOQUEADORES CRÍTICOS

### F-P0-001: Tablas Social Features
**Módulo:** Social
**User Story:**
```
Como sistema backend,
Necesito las tablas social_features en la base de datos
Para que los endpoints de amigos, equipos y guilds funcionen
```

**Estado:** 🔴 Bloqueador total del módulo social
**Esfuerzo:** 0.5 horas
**Prioridad:** P0 (Máxima urgencia)
**Sprint:** 0

**Acceptance Criteria:**
- [ ] Tabla `friendships` creada
- [ ] Tabla `team_members` creada
- [ ] Tabla `team_challenges` creada
- [ ] Índices de performance creados
- [ ] Permisos otorgados

**Impacto de NO implementar:**
- 25+ endpoints de social features retornan 500
- 0% de funcionalidad social disponible
- Retención de usuarios -60%

**Dependencias:** Ninguna
**Bloqueado por:** Ninguno
**Bloquea a:** Todo el módulo social

---

### F-P0-002: Fix SQL Injection (RLS Middleware)
**Módulo:** Seguridad
**User Story:**
```
Como administrador de seguridad,
Necesito que las queries SQL usen parametrización
Para prevenir inyección SQL que comprometa la base de datos
```

**Estado:** 🔴 Vulnerabilidad crítica (CVSS 8.2)
**Esfuerzo:** 2 horas
**Prioridad:** P0
**Sprint:** 0

**Acceptance Criteria:**
- [ ] Queries usan $1, $2 (no string interpolation)
- [ ] Tests de SQL injection pasan
- [ ] Security scan aprobado

**Impacto de NO implementar:**
- Hackeo potencial de toda la base de datos
- Exposición de datos de 500+ usuarios
- Multas GDPR/LGPD: $50,000-$500,000

**Dependencias:** Ninguna
**ROI:** 5,000% (evita $200,000 en pérdidas)

---

### F-P0-003: IDOR Prevention (15+ Endpoints)
**Módulo:** Seguridad
**User Story:**
```
Como estudiante,
Quiero que solo yo pueda ver mis datos
Para proteger mi privacidad
```

**Estado:** 🔴 Vulnerabilidad alta (CVSS 7.8)
**Esfuerzo:** 8 horas
**Prioridad:** P0
**Sprint:** 0

**Acceptance Criteria:**
- [ ] Middleware de ownership implementado
- [ ] 15 endpoints protegidos
- [ ] Tests de IDOR pasan (20+ casos)

**Endpoints afectados:**
1. `/api/progress/user/:userId`
2. `/api/gamification/stats/:userId`
3. `/api/teacher/students/:studentId`
4. `/api/educational/submissions/:submissionId`
5. ... (11 más)

**Impacto de NO implementar:**
- Usuario A puede ver datos de Usuario B
- Profesores pueden acceder a estudiantes de otros
- Violación de privacidad masiva

---

### F-P0-004: Maya Ranks Case Mismatch
**Módulo:** Gamificación
**User Story:**
```
Como sistema de gamificación,
Necesito que los rangos Maya sean consistentes
Para que multiplicadores y comparaciones funcionen
```

**Estado:** 🔴 Rompe progresión de módulos
**Esfuerzo:** 4 horas
**Prioridad:** P0
**Sprint:** 0

**Problema:**
- Backend: `'nacom'` (lowercase)
- Frontend: `'Ajaw'` (uppercase)
- Resultado: Comparaciones fallan, multiplicadores no aplican

**Acceptance Criteria:**
- [ ] Backend retorna UPPERCASE
- [ ] Multiplicadores funcionan
- [ ] UI muestra ranks correctamente

**Impacto de NO implementar:**
- Sistema de progresión roto
- Estudiantes no avanzan de módulo
- Engagement -40%

---

### F-P0-005: JWT Token Hashing
**Módulo:** Seguridad
**User Story:**
```
Como administrador de seguridad,
Necesito tokens hasheados en la base de datos
Para que un breach de DB no exponga todas las sesiones
```

**Estado:** 🔴 Vulnerabilidad alta (CVSS 8.1)
**Esfuerzo:** 8 horas
**Prioridad:** P0
**Sprint:** 0

**Acceptance Criteria:**
- [ ] Tokens hasheados con SHA-256
- [ ] Validación usa hash comparison
- [ ] Migration ejecutada correctamente

**Impacto de NO implementar:**
- DB comprometida = 500+ cuentas hackeadas
- Exposición masiva de sesiones activas
- Pérdida total de confianza

**Nota:** Invalidará sesiones activas (comunicar a usuarios)

---

### F-P0-006: XSS Prevention (Content Editor)
**Módulo:** Seguridad
**User Story:**
```
Como usuario,
Necesito que el contenido HTML esté sanitizado
Para prevenir ataques XSS
```

**Estado:** 🔴 Vulnerabilidad media (CVSS 6.9)
**Esfuerzo:** 4 horas
**Prioridad:** P0
**Sprint:** 0

**Acceptance Criteria:**
- [ ] DOMPurify implementado
- [ ] Todos los `dangerouslySetInnerHTML` sanitizados
- [ ] Tests de XSS pasan

**Impacto de NO implementar:**
- Atacantes pueden ejecutar código malicioso
- Robo de sesiones vía XSS
- Defacement de contenido

---

### ~~F-P0-007: Email Verification Decision~~ ✅ COMPLETADO

**Estado:** ✅ Decidido y removido según ADR-001 (28/Oct/2025)
**Decisión:** Email verification REMOVIDA del sistema

**Nuevo flujo:**
- Registro directo sin verificación de email
- Control institucional por Admin/Teacher Portal
- CAPTCHA + Rate limiting para protección anti-spam

**Ver:** [ADR-001: Email Verification Removal](../../02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md)

---

## FEATURES P1 - CRÍTICOS (MVP)

### ~~F-P1-001: Email Verification System~~ ❌ DESCARTADO

**Estado:** ❌ Descartado según ADR-001 (28/Oct/2025)
**Razón:** Email verification removida, reemplazada por control institucional

**Alternativa implementada:**
- CAPTCHA + Rate limiting (P1-002, 8h)
- Control Admin/Teacher para bloqueo/activación usuarios
- Password policy enforcement (P1-003, 7h)

---

### F-P1-002: Rate Limiting System
**Módulo:** Seguridad
**Esfuerzo:** 8 horas
**Sprint:** 1
**ROI:** 2,500%

**User Story:**
```
Como sistema,
Necesito rate limiting en todos los endpoints
Para prevenir abuse y DDoS
```

**Configuración:**
- Registro: 3 intentos/hora/IP
- Login: 10 intentos/hora/IP
- API general: 100 requests/min/user

**Impacto de NO implementar:**
- Vulnerable a ataques DDoS
- Abuse de recursos (CPU, DB)
- Downtime por sobrecarga

---

### F-P1-003: Password Policy Enhancement
**Módulo:** Autenticación
**Esfuerzo:** 7 horas
**Sprint:** 1

**Requirements:**
- Mínimo 8 caracteres
- 1 mayúscula, 1 minúscula, 1 número
- Password strength meter en UI
- Validación frontend + backend

---

### F-P1-004: httpOnly Cookies for JWT
**Módulo:** Seguridad
**Esfuerzo:** 14 horas
**Sprint:** 1

**Cambio:**
- De: `localStorage` (vulnerable a XSS)
- A: `httpOnly cookies` (seguro)

**Features:**
- Secure flag (HTTPS only)
- SameSite=Strict (anti-CSRF)
- Refresh token mechanism

---

### F-P1-005: Audit Logging System
**Módulo:** Compliance
**Esfuerzo:** 20 horas
**Sprint:** 2

**Logs a registrar:**
- Autenticación (login, logout, cambio password)
- Acceso a datos sensibles
- Cambios administrativos
- Retención 90 días

---

### F-P1-006: Redis Cache Layer
**Módulo:** Performance
**Esfuerzo:** 27 horas
**Sprint:** 3
**ROI:** 1,425%

**User Story:**
```
Como usuario,
Necesito que las páginas carguen <2 segundos
Para no abandonar por lentitud
```

**Cachear:**
- Leaderboards (TTL 30s)
- User stats (TTL 5min)
- Rankings (TTL 1min)
- Achievements (TTL 10min)

**Impacto:**
- Load time: 5.5s → <2s (64% mejora)
- API calls: -90%
- Usuarios soportados: 500 → 5,000

---

### F-P1-007: Database Query Optimization
**Módulo:** Performance
**Esfuerzo:** 12 horas
**Sprint:** 3

**Optimizaciones:**
- Crear 30+ índices faltantes
- Eliminar N+1 queries
- Optimizar joins pesados
- Query time: 450ms → <100ms

---

### F-P1-008: Code Splitting (Frontend)
**Módulo:** Performance
**Esfuerzo:** 13 horas
**Sprint:** 4

**Objetivo:**
- Bundle inicial: 855KB → <150KB (82% reducción)
- Time to Interactive: 8s → <3s

**Estrategia:**
- React.lazy() por rutas
- Lazy load de módulos educativos
- Suspense boundaries

---

### F-P1-009: Bundle Size Reduction
**Módulo:** Performance
**Esfuerzo:** 8 horas
**Sprint:** 4

**Tácticas:**
- Tree shaking
- Remover dependencias no usadas
- Optimizar imports (lodash → lodash-es)
- Minificación avanzada

---

### F-P1-010: React Optimization
**Módulo:** Performance
**Esfuerzo:** 10 horas
**Sprint:** 4

**Técnicas:**
- React.memo en componentes pesados
- useMemo para cálculos costosos
- useCallback para funciones
- Re-renders reducidos 60%

---

### F-P1-011: CDN Configuration
**Módulo:** Infrastructure
**Esfuerzo:** 7 horas
**Sprint:** 4

**Setup:**
- CloudFlare CDN
- Imágenes en WebP
- Lazy loading de imágenes
- Reducción 70% en peso de assets

---

### F-P1-012: Security Audit External
**Módulo:** Compliance
**Esfuerzo:** 21 horas + $2,000
**Sprint:** 2

**Deliverables:**
- Penetration test ejecutado
- OWASP Top 10 validado
- Reporte de auditoría
- Certificado de seguridad

---

## FEATURES P2 - IMPORTANTES (DIFERENCIADORES)

### F-P2-001: Achievements Auto-Detection
**Módulo:** Gamificación
**Esfuerzo:** 25 horas
**Sprint:** 5
**ROI:** 720%

**User Story:**
```
Como estudiante,
Quiero que mis logros se desbloqueen automáticamente
Para sentir motivación continua
```

**Logros a implementar (20+):**
1. Primera Racha de 3 días
2. 10 ejercicios perfectos
3. 100% en módulo completo
4. Primeros 1,000 ML Coins
5. Alcanzar rango Ajaw
6. ... (15 más)

**Impacto:**
- Retención +20%
- Engagement +35%
- Sessions/week: 2.5x

**Estado actual:** Solo 2/20 logros funcionan

---

### F-P2-002: Real-time Leaderboards
**Módulo:** Gamificación
**Esfuerzo:** 17 horas
**Sprint:** 5

**Features:**
- Leaderboard global (XP)
- Leaderboard global (ML Coins)
- Leaderboard por classroom
- Top 100 + posición del usuario
- Actualización <3 segundos

**Tech:**
- Redis para cache
- WebSocket para updates en tiempo real

---

### F-P2-003: Missions System
**Módulo:** Gamificación
**Esfuerzo:** 16 horas
**Sprint:** 5

**Tipos de misiones:**
- **Diarias:** 3 misiones/día (fáciles)
- **Semanales:** 3 misiones/semana (desafiantes)
- **Especiales:** Eventos temporales

**Recompensas:**
- Diarias: 100-300 ML Coins
- Semanales: 500-1,000 ML Coins
- Especiales: Badges únicos

---

### F-P2-004: Educational Validators (27 Mecánicas)
**Módulo:** Educación
**Esfuerzo:** 40 horas
**Sprint:** 6

**Validadores por módulo:**
- Módulo 1 (5 mecánicas): 8h
- Módulo 2 (5 mecánicas): 8h
- Módulo 3 (5 mecánicas): 8h
- Módulo 4 (9 mecánicas): 12h
- Sistema de scoring: 4h

**Features:**
- Validación automática de respuestas
- Feedback inmediato
- Scoring consistente
- Anti-cheating measures

---

### F-P2-005: Digital Certificates System
**Módulo:** Gamificación
**Esfuerzo:** 15 horas
**Sprint:** 6

**Features:**
- Generador de PDF profesional
- Datos personalizados (nombre, fecha, módulo)
- QR code de verificación
- Diseño atractivo (branding GAMILIT
- Share en redes sociales

**Triggers:**
- Completar módulo al 100%
- Obtener 95%+ en evaluaciones
- Alcanzar rank Ah K'in o superior

---

### F-P2-006: Module Progress Tracking
**Módulo:** Educación
**Esfuerzo:** 10 horas
**Sprint:** 6

**UI Components:**
- Progress bars por módulo
- Porcentaje de completitud
- Tiempo estimado restante
- Próximas tareas sugeridas
- Dashboard consolidado

---

### F-P2-007: Mecánicas Módulo 2 (5 pendientes)
**Módulo:** Educación - Comprensión Inferencial
**Esfuerzo:** 60 horas (12h cada mecánica)
**Sprint:** Post-launch (v1.1)

**Mecánicas:**
1. Detective Textual
2. Construcción de Hipótesis
3. Predicción Narrativa
4. Puzzle de Contexto
5. Rueda de Inferencias

---

### F-P2-008: Mecánicas Módulo 3 (5 pendientes)
**Módulo:** Educación - Comprensión Crítica
**Esfuerzo:** 75 horas (15h cada mecánica)
**Sprint:** Post-launch (v1.1)

**Mecánicas:**
1. Tribunal de Opiniones
2. Debate Digital Estructurado
3. Análisis de Fuentes
4. Creación de Podcast Argumentativo
5. Matriz de Perspectivas

---

### F-P2-009: Mecánicas Módulo 4 (5 pendientes)
**Módulo:** Educación - Lectura Digital
**Esfuerzo:** 60 horas (12h cada mecánica)
**Sprint:** Post-launch (v1.2)

**Mecánicas:**
1. Verificador de Fake News
2. Creación de Infografía Interactiva
3. Quiz Estilo TikTok
4. Navegación Hipertextual
5. Análisis de Memes Educativos

---

### F-P2-010: Teacher Analytics Dashboard
**Módulo:** Teacher Portal
**Esfuerzo:** 30 horas
**Sprint:** Post-launch (v1.3)

**Features:**
- Dashboard de métricas (estudiantes, progreso, engagement)
- Reportes PDF automatizados
- Gráficos de rendimiento
- Alertas de estudiantes en riesgo
- Comparación entre classrooms

---

### F-P2-011: Parent Notifications
**Módulo:** Comunicación
**Esfuerzo:** 20 horas
**Sprint:** Post-launch (v1.3)

**Notificaciones:**
- Progreso semanal del hijo
- Logros obtenidos
- Alertas de bajo rendimiento
- Certificados generados

**Canales:**
- Email
- SMS (opcional)
- WhatsApp (opcional)

---

### F-P2-012: Classroom Management UI
**Módulo:** Teacher Portal
**Esfuerzo:** 35 horas
**Sprint:** Post-launch (v1.3)

**Features:**
- Crear/editar classrooms
- Asignar estudiantes
- Asignar ejercicios masivamente
- Calificar submissions
- Exportar reportes

---

### F-P2-013: Adaptive Learning (AI)
**Módulo:** Educación
**Esfuerzo:** 80 horas
**Sprint:** Post-launch (v2.0)

**Features:**
- Detección de fortalezas/debilidades
- Recomendaciones personalizadas
- Ajuste de dificultad automático
- Learning paths adaptativos

---

### F-P2-014: Peer Challenges
**Módulo:** Social
**Esfuerzo:** 25 horas
**Sprint:** Post-launch (v1.2)

**Features:**
- Desafiar a amigos (1v1)
- Duelos de ejercicios
- Leaderboards de duelos
- Recompensas por victorias

---

### F-P2-015: Guild/Team System
**Módulo:** Social
**Esfuerzo:** 40 horas
**Sprint:** Post-launch (v1.2)

**Features:**
- Crear guilds (equipos)
- Invitar miembros
- Desafíos de guild
- Leaderboard de guilds
- Chat de guild

---

### F-P2-016: Voice Notes (Ejercicios)
**Módulo:** Educación
**Esfuerzo:** 20 horas
**Sprint:** Post-launch (v1.4)

**Features:**
- Grabar notas de voz
- Transcripción automática (Speech-to-Text)
- Validación de respuestas orales
- Ejercicios de comprensión auditiva

---

### F-P2-017: Offline Mode (Mobile)
**Módulo:** Mobile App
**Esfuerzo:** 50 horas
**Sprint:** Post-launch (v2.0)

**Features:**
- Descargar módulos para offline
- Sincronización automática
- Progreso guardado localmente
- Ejercicios disponibles sin conexión

---

### F-P2-018: Gamification Store
**Módulo:** Gamificación
**Esfuerzo:** 35 horas
**Sprint:** Post-launch (v1.5)

**Features:**
- Tienda de power-ups
- Compra de avatares
- Compra de badges especiales
- Economía ML Coins

---

### F-P2-019: LTI Integration (Learning Tools Interoperability)
**Módulo:** Integraciones
**Esfuerzo:** 40 horas
**Sprint:** v1.3
**ROI:** 850%
**Prioridad:** P2 (Alta) ⬆️ Promovida desde P3

**User Story:**
```
Como institución educativa,
Necesito integrar GAMILITcon nuestro LMS existente (Canvas/Moodle/Blackboard)
Para que estudiantes accedan desde el LMS y calificaciones sincronicen automáticamente
```

**Features principales:**
- **LTI 1.3 Launch:** OIDC login flow con JWT validation
- **SSO Automático:** Usuarios autenticados desde LMS sin re-login
- **Deep Linking:** Profesores seleccionan contenido GAMILITdesde LMS
- **Grade Passback (AGS):** Calificaciones automáticas a LMS gradebook
- **Multi-tenant support:** Diferentes escuelas, diferentes LMS

**Plataformas soportadas:**
- Canvas (35% cuota mercado K-12) - 12h
- Moodle (25% cuota mercado) - 10h
- Blackboard (20% Higher Ed) - 10h
- Google Classroom (60% K-12) - 8h

**Impacto:**
- B2B adoption +60% (facilita decisión compra institucional)
- Reducción fricción onboarding 60%
- Ahorro tiempo profesores: 3h/semana (grade sync manual eliminado)
- ARR incremental: +$30,000/año (+15 instituciones × $2,000 MRR)

**Especificación técnica completa:**
Ver [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md#1-lti-integration)

---

### F-P2-020: White-label System (Tier 1 - Branding Básico)
**Módulo:** Multi-tenancy
**Esfuerzo:** 20 horas (Tier 1), 120h (completo)
**Sprint:** v1.5
**ROI:** 400% (Tier 1)
**Prioridad:** P2 (Alta) ⬆️ Promovida desde P3

**User Story:**
```
Como institución educativa enterprise,
Necesito que GAMILITmuestre nuestra marca (logo, colores, nombre)
Para que estudiantes perciban la plataforma como parte de nuestra institución
```

**Tier 1: Branding Básico (20h) - Incluido en plan:**
- Logo personalizado (S3 upload)
- Colores primario y secundario (custom CSS variables)
- Nombre de plataforma personalizado
- Favicon custom
- Admin UI para configuración branding

**Tier 2: Branding Avanzado (40h adicionales) - Post v1.5:**
- Custom domain (glit.universidad.edu)
- Email templates personalizados
- Login page customizado
- Footer con links institucionales
- Certificados PDF con branding

**Tier 3: White-label Completo (60h adicionales) - Post v2.0:**
- Fuentes (fonts) custom
- Imágenes de fondo personalizadas
- CSS overrides avanzados
- Contenido educativo custom
- Hide "Powered by GAMILIT

**Modelo de pricing:**
- Pro ($1,500/mes): Tier 1 branding
- Enterprise ($5,000/mes): Tier 2 + custom domain
- White-label ($10,000+/mes): Tier 3 completo

**Impacto:**
- Enterprise adoption +30%
- Pricing premium: 3-5x vs Basic tier
- Reducción churn institucional: -15%
- ARR incremental: +$12,000/año (Tier 1)

**Especificación técnica completa:**
Ver [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md#2-white-label-system)

---

### F-P2-021: Peer Challenges (Duelos 1v1)
**Módulo:** Social Features
**Esfuerzo:** 25 horas
**Sprint:** v1.2
**ROI:** 560%
**Prioridad:** P2 (Alta) ⬆️ Promovida desde P3

**User Story:**
```
Como estudiante,
Quiero desafiar a mis amigos a duelos de ejercicios
Para competir y ganar ML Coins adicionales
```

**Features:**
- Desafiar amigo a ejercicio específico (1v1)
- Apuesta en ML Coins (configurable, 10-100 coins)
- Notificaciones de desafío (in-app + email)
- Comparación de scores en tiempo real
- Ganador recibe apuesta × 2, perdedor pierde apuesta
- Leaderboard de duelos ganados
- Achievement: "Vencedor de Duelos" (10 victorias)

**Flow:**
1. Estudiante A desafía a Estudiante B (apuesta 50 ML Coins)
2. B recibe notificación, acepta desafío
3. Ambos completan mismo ejercicio
4. Sistema compara scores automáticamente
5. Ganador (mayor score) recibe 100 ML Coins
6. Perdedor pierde 50 ML Coins

**Impacto:**
- Engagement +40% (interacciones sociales diarias)
- Retención +25% (motivación competitiva)
- Sessions/week: +1.5x (vuelven para retar/aceptar desafíos)
- ARR impacto indirecto: Retención → Reduce churn 15%

**Especificación técnica completa:**
Ver [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md#311-peer-challenges-25h--incluir)

---

### F-P2-022: Parent Notifications (Notificaciones a Padres)
**Módulo:** Comunicación
**Esfuerzo:** 15 horas (versión básica email)
**Sprint:** v1.3
**ROI:** 380%
**Prioridad:** P2 (Alta) ⬆️ Promovida desde P3

**User Story:**
```
Como padre de familia,
Quiero recibir actualizaciones del progreso de mi hijo
Para estar informado y apoyar su aprendizaje
```

**Notificaciones implementadas:**
1. **Email semanal de progreso** (Lunes 9am)
   - Ejercicios completados esta semana
   - XP y ML Coins ganados
   - Rango actual y progreso a siguiente rango
   - Achievements desbloqueados
   - Score promedio

2. **Alerta de bajo rendimiento**
   - Se envía si score promedio <60% en últimos 5 ejercicios
   - Módulos donde está teniendo dificultades
   - Sugerencias de apoyo

3. **Notificación de achievements**
   - Cuando hijo desbloquea achievement importante (Rare+)

4. **Certificado completado**
   - Cuando hijo completa módulo al 100%

**Configuración:**
- Padre registra email en perfil estudiante
- Puede pausar/reactivar notificaciones
- Preferencias de frecuencia (semanal, mensual)

**Impacto:**
- Engagement parental +50%
- NPS (Net Promoter Score) +15 puntos
- Satisfacción institucional +20% (padres informados = menos quejas)
- Renovación suscripciones institucionales +10%

**Especificación técnica completa:**
Ver [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md#312-parent-notifications-15h--incluir)

---

## FEATURES P3 - BACKLOG POST-LANZAMIENTO

**Nota:** Features P3 están divididas en:
- ⏸️ **POSPUESTAS** (v2.0+): Tienen valor pero no son prioritarias para MVP/v1.x
- ❌ **DESCARTADAS**: No alineadas con visión de producto, descartadas permanentemente

Ver análisis completo en [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md)

---

### ⏸️ POSPUESTAS (Post v2.0)

### F-P3-001: Módulo 5 - Producción de Textos ⏸️
**Esfuerzo:** 90 horas
**Sprint:** ⏸️ Pospuesto a v1.6+
**Prioridad:** P3
**Razón:** Contenido avanzado, requiere validación humana (profesor). Priorizar Módulos 2-3-4 primero.

**Mecánicas planeadas:**
1. Diario Multimedia Interactivo (30h)
2. Cómic Digital de 6 Viñetas (30h)
3. Video-Carta al Futuro (30h)

**Decisión:** Implementar después de completar Módulos 2-3-4 (195h).

---

### F-P3-002: OAuth / Social Login ⏸️
**Esfuerzo:** 25 horas
**Sprint:** ⏸️ Pospuesto a v2.0+
**Prioridad:** P3
**Razón:** Con ADR-001 (email verification removida), registro ya es simple. No crítico para contexto B2B institucional.

**Providers considerados:**
- Google
- Facebook
- Microsoft
- Apple (para iOS)

**Decisión:** Posponer hasta tener usuarios B2C (no institucionales). Contexto actual: 95%+ usuarios vía instituciones.

---

### F-P3-003: SCORM Compliance ⏸️
**Esfuerzo:** 60 horas
**Sprint:** ⏸️ Pospuesto a v1.4+
**Prioridad:** P3
**Razón:** Nicho muy específico. LTI 1.3 (F-P2-019) cubre 90%+ casos de uso de integración LMS.

**Features:**
- Exportar módulos en SCORM 1.2
- Importar en cualquier LMS
- Tracking de progreso (SCORM API)

**Decisión:** LTI 1.3 es estándar moderno y prioritario. SCORM es legacy, posponer hasta demanda específica.

---

### F-P3-004: Mobile Apps Nativas ⏸️
**Esfuerzo:** 200 horas
**Sprint:** ⏸️ Pospuesto a v2.0+
**Prioridad:** P3
**Razón:** Web-first strategy. PWA responsive cubre 80%+ casos de uso móvil. Costo muy alto.

**Plataformas:**
- iOS (React Native) - 100h
- Android (React Native) - 100h

**Features planeadas:**
- Offline mode
- Push notifications
- Biometric login
- Native performance

**Decisión:** Posponer. Alternativa v1.5: PWA (Progressive Web App) optimization (15h) para installable experience.

---

### F-P3-005: Analytics ML-based ⏸️
**Esfuerzo:** 100 horas
**Sprint:** ⏸️ Pospuesto a v2.0+ (Q3 2026)
**Prioridad:** P3
**Razón:** Requiere 6+ meses de datos históricos para entrenar modelos ML. Necesita 10,000+ ejercicios completados mínimo.

**Features planeadas:**
- Predicción de churn (ML model)
- Recomendaciones de intervención
- Análisis de patrones de aprendizaje
- ROI por estudiante

**Decisión:** Posponer hasta tener dataset suficiente. Alternativa v1.5: Analytics avanzado (sin ML) usando queries SQL complejas (50h).

---

### F-P3-006: Multi-language Support (i18n) ⏸️
**Esfuerzo:** 80 horas
**Sprint:** ⏸️ Pospuesto a v1.7+ (Q2 2026)
**Prioridad:** P3
**Razón:** Mercado LATAM objetivo es 95% español. Inglés/Portugués no son prioritarios para MVP/v1.x.

**Idiomas considerados:**
- Español (MX) - ✅ Actual
- Inglés (US) - 30h
- Portugués (BR) - 30h
- Francés - 20h

**Decisión:** Posponer hasta expansión internacional. Prioridad: Brasil (portugués) o USA (inglés) según estrategia de mercado.

---

### ❌ DESCARTADAS PERMANENTEMENTE

Las siguientes features fueron evaluadas y **descartadas permanentemente** por no estar alineadas con la visión del producto, tener ROI bajo o complejidad injustificada.

Ver análisis detallado en [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](./ANALISIS-FEATURES-P3-ESTRATEGICAS.md#33-features-a-descartar-permanentemente)

---

### F-P3-DISC-001: Voice Notes en Ejercicios ❌
**Esfuerzo estimado:** 35 horas
**Razón de descarte:**
- Complejidad alta: Speech-to-text, storage audio S3, validación transcripciones
- ROI bajo: <10% usuarios usarían la feature
- Costo hosting: +$500/mes en S3 storage para archivos audio (5-10 MB cada uno)
- No alineado con core value proposition (comprensión lectora, no oral)

**Decisión:** ❌ DESCARTADA. No implementar.

---

### F-P3-DISC-002: Offline Mode Mobile ❌
**Esfuerzo estimado:** 50 horas
**Razón de descarte:**
- Requiere mobile app nativa primero (F-P3-004, 200h pospuesta)
- Sincronización de conflictos muy compleja (+30h adicionales)
- Storage local limitado en móviles (<50 MB disponible típicamente)
- Contexto educativo: 90%+ ejercicios se hacen en casa/escuela con WiFi disponible

**Decisión:** ❌ DESCARTADA. Enfoque online-first.

---

### F-P3-DISC-003: Gamification Store (Compras Reales) ❌
**Esfuerzo estimado:** 60 horas
**Razón de descarte:**
- Monetización prematura, no es modelo freemium
- Modelo B2B2C: Instituciones pagan, estudiantes NO gastan dinero real
- Complejidad: Payment gateway, inventory management, fraud detection
- Legal: Regulaciones sobre menores de edad y pagos digitales (México LFPDPPP)
- Alternativa ya implementada: ML Coins store para power-ups (moneda virtual)

**Decisión:** ❌ DESCARTADA. Modelo de negocio es B2B institucional, no microtransacciones.

---

## RESUMEN CONSOLIDADO

### Por Prioridad

| Prioridad | Cantidad | Esfuerzo Total | Costo Estimado | Timeline | Notas |
|-----------|----------|----------------|----------------|----------|-------|
| **P0** (Bloqueadores) | 6 | 26.5h | $3,975 | Sprint 0 (1 sem) | ✅ -1 feature (F-P0-007 eliminada) |
| **P1** (Críticos MVP) | 11 | 147h | $22,050 | Sprints 1-4 (3.5 sem) | ✅ -1 feature (F-P1-001 eliminada) |
| **P2** (Diferenciadores) | 22 | 603h | $90,450 | Sprints 5-6 + v1.x (15 sem) | ⬆️ +4 features (LTI, White-label, Peer, Parent) |
| **P3** (Pospuestas) | 6 | 555h | $83,250 | v2.0+ (14+ sem) | ⏸️ Pospuestas hasta v2.0 |
| **DESCARTADAS** | 3 | 145h | $21,750 | N/A | ❌ Permanentemente descartadas |
| **TOTAL PENDIENTE** | **45** | **1,331.5h** | **$199,725** | **33.5+ semanas** | Sin descartadas |
| **TOTAL ORIGINAL** | **48** | **1,476.5h** | **$221,475** | | Incluyendo descartadas |

**Ajuste vs versión anterior:**
- Esfuerzo reducido: -184h (eliminación email verification + descarte de features)
- Features estratégicas priorizadas: +4 en P2 (ROI alto)
- Total features descartadas: 3 (145h, $21,750)

---

### MVP Mínimo (P0 + P1)
- **Features:** 17 (vs 19 original)
- **Esfuerzo:** 173.5 horas (vs 217.5h original)
- **Costo:** $26,025 (vs $32,625 original)
- **Timeline:** 4.5 semanas (vs 5 semanas original)
- **Ahorro:** -44h (-$6,600) por eliminación email verification

### MVP Completo (P0 + P1 + P2 Estratégicas)
- **Features:** 29 (17 base + 12 P2 críticas)
- **Esfuerzo:** 476.5 horas
- **Costo:** $71,475
- **Timeline:** 12 semanas
- **Incluye:**
  - Todos P0 y P1
  - Achievements auto-detection
  - Real-time leaderboards
  - Missions system
  - Educational validators
  - Mecánicas Módulo 2
  - Digital certificates
  - **✅ LTI Integration** (40h) ⬆️ Promovida
  - **✅ White-label Tier 1** (20h) ⬆️ Promovida
  - **✅ Peer Challenges** (25h) ⬆️ Promovida
  - **✅ Parent Notifications** (15h) ⬆️ Promovida

### Producto v1.x Completo (MVP + Extensiones)
- **Features:** 39 (todas P0, P1, P2)
- **Esfuerzo:** 776.5 horas
- **Costo:** $116,475
- **Timeline:** 19.5 semanas
- **ROI incremental features P2 estratégicas:** +$42,000 ARR año 1

---

## PRIORIZACIÓN SUGERIDA (ACTUALIZADA)

### Must-Have (Producción - Sprint 0-4)
**P0 + P1 - 173.5 horas, 4.5 semanas**
- ✅ Todos los P0 (bloqueadores de seguridad)
- ~~❌ Email verification~~ (ELIMINADA según ADR-001)
- ✅ Rate limiting + CAPTCHA
- ✅ Password policy
- ✅ Redis cache
- ✅ Code splitting
- ✅ DB optimization
- ✅ Audit logging

### Should-Have (v1.1-v1.2 - Sprints 5-12)
**P2 Críticas - 303 horas, 7.5 semanas**
- ✅ Achievements auto-detection (25h) - ROI 720%
- ✅ Real-time leaderboards (17h)
- ✅ Missions system (16h)
- ✅ Educational validators (40h)
- ✅ Mecánicas Módulo 2 (60h)
- ✅ Digital certificates (15h)
- **✅ Peer Challenges (25h) - ROI 560%** ⬆️ Nueva
- **✅ Parent Notifications (15h) - ROI 380%** ⬆️ Nueva

### Could-Have (v1.3-v1.5 - Sprints 13-24)
**P2 Extensiones - 300 horas, 7.5 semanas**
- **✅ LTI Integration (40h) - ROI 850%** ⬆️ Nueva
- **✅ White-label Tier 1 (20h) - ROI 400%** ⬆️ Nueva
- ✅ Teacher analytics dashboard (30h)
- ✅ Mecánicas Módulo 3 (75h)
- ✅ Portal maestros completo (75h)
- ✅ Classroom management UI (35h)
- ✅ Adaptive Learning basic (no ML) (25h)

### Nice-to-Have (v2.0+ - Post-lanzamiento)
**P3 Pospuestas - 555 horas, 14+ semanas**
- ⏸️ Módulo 5: Producción textos (90h) - Pospuesto
- ⏸️ OAuth/Social Login (25h) - Pospuesto
- ⏸️ SCORM Compliance (60h) - Pospuesto
- ⏸️ Mobile Apps Nativas (200h) - Pospuesto
- ⏸️ Analytics ML-based (100h) - Pospuesto
- ⏸️ Multi-language Support (80h) - Pospuesto

### Won't-Have (DESCARTADAS)
**Permanentemente eliminadas - 145 horas**
- ❌ Voice Notes ejercicios (35h) - ROI bajo, complejidad alta
- ❌ Offline Mode mobile (50h) - Requiere app nativa
- ❌ Gamification Store compras reales (60h) - No B2B2C

---

---

## 📊 MÉTRICAS DE IMPACTO

### Features P2 Estratégicas (Promovidas desde P3)

| Feature | Esfuerzo | Costo | ROI | ARR Incremental | Impacto Clave |
|---------|----------|-------|-----|-----------------|---------------|
| **LTI Integration** | 40h | $6,000 | 850% | +$30,000 | B2B adoption +60%, ahorro 3h/semana profesores |
| **White-label Tier 1** | 20h | $3,000 | 400% | +$12,000 | Enterprise pricing 3-5x, churn -15% |
| **Peer Challenges** | 25h | $3,750 | 560% | Retención | Engagement +40%, retención +25% |
| **Parent Notifications** | 15h | $2,250 | 380% | NPS | NPS +15 puntos, engagement parental +50% |
| **TOTAL** | **100h** | **$15,000** | **643%** | **+$42,000/año** | **ROI compounding años siguientes** |

### Comparación con Features Descartadas

| Feature Descartada | Esfuerzo Ahorrado | Razón Principal |
|-------------------|-------------------|-----------------|
| Voice Notes ejercicios | 35h ($5,250) | ROI bajo <10% usuarios, costo hosting +$500/mes |
| Offline Mode mobile | 50h ($7,500) | 90%+ ejercicios con WiFi, requiere app nativa primero |
| Gamification Store | 60h ($9,000) | Modelo B2B no microtransacciones, legal menores |
| **TOTAL AHORRADO** | **145h ($21,750)** | **Reinvertir en features estratégicas ROI alto** |

**Net Impact:**
- Ahorro: -145h features descartadas
- Inversión: +100h features estratégicas
- **Net efficiency:** -45h (-$6,750) con +$42,000 ARR incremental

---

**Preparado por:** Tech Lead + Product Owner
**Contacto:** @tech-lead
**Última actualización:** 2025-11-07
**Versión:** 3.0 - FEATURES ROADMAP (Post email verification removal + P3 strategic analysis)
