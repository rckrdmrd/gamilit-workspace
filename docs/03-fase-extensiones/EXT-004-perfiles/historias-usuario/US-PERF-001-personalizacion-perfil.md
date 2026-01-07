---
id: "US-PERF-001"
title: "Sistema de Personalización y Gestión de Perfil Personal"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-004"
story_points: 8
budget: "$4,000 MXN"
sprint: "Sprint-Mes3"
labels: ["ext-004", "perfiles-avanzados", "personalizacion", "avatar", "preferencias", "privacidad", "estadisticas", "historial", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PERF-001: Personalización Avanzada de Perfil

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-001 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Sistema de Personalización y Gestión de Perfil Personal |
| **Prioridad** | Alta (P1) |
| **Story Points** | 8 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $4,000 MXN |

---

## Historia de Usuario

**Como** estudiante de la plataforma Gamilit
**Quiero** personalizar completamente mi perfil con avatar, bio, intereses y preferencias visuales
**Para** expresar mi identidad, adaptar la plataforma a mis necesidades y tener una experiencia única

---

## Valor de Negocio

### Impacto
- **Engagement**: Usuarios personalizan perfil = mayor conexión emocional
- **Retention**: Perfiles completos aumentan permanencia 35%
- **Personalización**: Usuarios pueden adaptar plataforma a preferencias
- **Identidad**: Sentido de pertenencia y ownership

### Métricas de Éxito
- >80% usuarios personalizan avatar en primera semana
- >60% completan bio y al menos 3 intereses
- >50% modifican al menos 2 preferencias de apariencia
- Tiempo en plataforma aumenta 15% con perfil completo

---

## Criterios de Aceptación

### CA-01: Gestión de Avatar
**Dado** que un estudiante accede a su perfil
**Cuando** gestiona su avatar
**Entonces** debe poder:
- Elegir de galería de 50+ avatares predefinidos (categorías: animales, personajes, abstractos)
- Subir imagen personalizada (JPG/PNG, máx 2MB)
- Recortar/ajustar imagen con herramienta visual
- Ver preview del avatar en diferentes tamaños
- Eliminar avatar personalizado y volver a predeterminado

### CA-02: Información Personal y Bio
**Dado** que el estudiante personaliza su perfil
**Cuando** edita información personal
**Entonces** puede ingresar:
- **Nombre de Usuario**: único, 3-20 caracteres, alfanumérico con guión bajo
- **Nombre Completo**: editable (hereda de registro)
- **Biografía**: hasta 500 caracteres, rich text básico (negrita, cursiva, enlaces)
- **Intereses**: seleccionar hasta 10 de lista predefinida + agregar personalizados
- **Grado Académico**: selector (Primaria, Secundaria, Preparatoria)
- **Fecha de Nacimiento**: opcional, solo año visible públicamente
- Validación en tiempo real de disponibilidad de username

### CA-03: Preferencias de Apariencia
**Dado** que el usuario configura apariencia
**Cuando** ajusta preferencias visuales
**Entonces** puede configurar:
- **Tema**: Claro / Oscuro / Automático (según sistema)
- **Tamaño de Fuente**: Pequeño / Medio / Grande / Extra Grande
- **Idioma**: Español / Inglés
- **Densidad de Interfaz**: Compacta / Cómoda / Espaciosa
- **Animaciones**: Activadas / Reducidas / Desactivadas
- Cambios aplicados en tiempo real con preview
- Persistencia en todos los dispositivos del usuario

### CA-04: Configuración de Privacidad
**Dado** que el estudiante gestiona privacidad
**Cuando** configura opciones de privacidad
**Entonces** puede definir:
- **Visibilidad de Perfil**: Público / Solo Amigos / Privado
- **Mostrar en Leaderboard**: Sí / No
- **Permitir Mensajes de**: Todos / Solo Amigos / Nadie
- **Mostrar Racha**: Sí / No
- **Mostrar Logros**: Sí / No
- **Compartir Estadísticas**: Sí / No
- Tooltips explicativos para cada opción
- Preview de cómo se ve perfil según configuración

### CA-05: Historial de Actividad Personal
**Dado** que el usuario accede a historial
**Cuando** visualiza su actividad
**Entonces** debe ver:
- Timeline de últimas 50 actividades (scroll infinito para más)
- Tipos de eventos:
  - Mecánicas completadas (título, fecha, puntuación)
  - Logros desbloqueados (nombre, descripción, fecha)
  - Subidas de nivel (nuevo nivel, fecha)
  - Compras en tienda (item, fecha, costo)
  - Interacciones sociales (opcional según privacidad)
- Filtros: Todas / Completadas / Logros / Compras
- Búsqueda de actividades específicas
- Export de historial a CSV

### CA-06: Estadísticas Personales Avanzadas
**Dado** que el estudiante accede a estadísticas
**Cuando** visualiza su progreso detallado
**Entonces** debe ver:
- **Resumen General**:
  - Total de mecánicas completadas / total disponibles
  - Score promedio general
  - Tiempo total invertido en plataforma
  - Racha actual y máxima racha
- **Distribución por Módulo** (gráfico circular):
  - % completado por cada módulo (1-5)
  - Score promedio por módulo
- **Evolución Temporal** (gráfico de línea):
  - Score progression últimas 30 mecánicas
  - Tendencia: mejorando / estable / declinando
- **Top Fortalezas y Debilidades**:
  - Top 3 áreas fuertes (mayor score)
  - Top 3 áreas de mejora (menor score)
- **Comparativa** (opcional, si privacidad permite):
  - Mi posición en clase
  - Mi score vs promedio de clase
- Exportar estadísticas como PDF o imagen

### CA-07: Preferencias de Notificaciones
**Dado** que el usuario configura notificaciones
**Cuando** gestiona sus preferencias
**Entonces** puede definir:
- **Email**:
  - Quest completado: ON/OFF
  - Logro desbloqueado: ON/OFF
  - Mensaje recibido: ON/OFF
  - Resumen semanal: ON/OFF
- **Push** (si mobile):
  - Racha en riesgo: ON/OFF
  - Quest disponible: ON/OFF
- **In-App**:
  - XP ganado: ON/OFF
  - Cacao ganado: ON/OFF
  - Subida de nivel: ON/OFF
- Horario de silencio: desde [HH:MM] hasta [HH:MM]
- Opción "Silenciar todo" temporal (1h, 6h, 24h, 1 semana)

### CA-08: Guardado y Persistencia
**Dado** que el usuario modifica su perfil
**Cuando** guarda cambios
**Entonces** el sistema debe:
- Validar todos los campos antes de guardar
- Mostrar loading spinner durante guardado
- Confirmar cambios guardados con toast notification
- Manejar errores con mensajes claros y específicos
- Revertir a valores anteriores si falla guardado
- Opción "Descartar Cambios" si no quiere guardar
- Detectar cambios sin guardar al salir (modal de confirmación)
- Auto-guardar en algunas secciones (toggles de preferencias)
- Sincronizar cambios en todos los dispositivos del usuario

### CA-09: Responsive y Accesibilidad
**Dado** que el usuario accede desde cualquier dispositivo
**Cuando** visualiza o edita su perfil
**Entonces** debe:
- Funcionar correctamente en 320px - 2560px
- Layout adaptativo: tabs verticales (desktop) → dropdown (mobile)
- Forms optimizados para mobile (inputs grandes, fácil tap)
- Navegación por teclado completa
- ARIA labels en todos los controles
- Contraste WCAG 2.1 AA mínimo
- Screen reader compatible
- Touch targets mínimo 44x44px
- Labels claros y tooltips explicativos
- Soporte para modo alto contraste

### CA-10: Seguridad y Validación
**Dado** que el perfil contiene datos sensibles
**Cuando** el usuario modifica información
**Entonces** el sistema debe:
- Validar username único en tiempo real
- Sanitizar inputs (prevenir XSS)
- Validar formatos de email
- Validar tamaño y tipo de archivos (avatar)
- Rate limiting en actualizaciones (máx 10 cambios/min)
- Audit log de cambios de perfil (backend)
- Verificar email si cambia email principal
- Requerir contraseña actual para cambios críticos
- Proteger contra ataques CSRF
- Encriptar datos sensibles en DB

---

## Especificaciones Técnicas

### Frontend Components
```
src/pages/profile/
├── ProfilePage.tsx
├── sections/
│   ├── AvatarSection.tsx
│   ├── BioSection.tsx
│   ├── AppearanceSection.tsx
│   ├── PrivacySection.tsx
│   ├── ActivityHistorySection.tsx
│   ├── StatsSection.tsx
│   └── NotificationsSection.tsx
├── components/
│   ├── AvatarGallery.tsx
│   ├── AvatarUploader.tsx
│   ├── InterestsPicker.tsx
│   ├── PrivacyPreview.tsx
│   ├── ActivityTimeline.tsx
│   └── StatsChart.tsx
└── hooks/
    ├── useProfile.ts
    └── useUnsavedChanges.ts
```

### TypeScript Interfaces
```typescript
interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar: {
    type: 'preset' | 'custom';
    url: string;
  };
  bio: string;
  interests: string[];
  grade: string;
  birthYear?: number;
  appearance: AppearancePreferences;
  privacy: PrivacySettings;
  notifications: NotificationPreferences;
}

interface AppearancePreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  language: 'es' | 'en';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: 'full' | 'reduced' | 'none';
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showInLeaderboard: boolean;
  allowMessagesFrom: 'all' | 'friends' | 'none';
  showStreak: boolean;
  showAchievements: boolean;
  shareStats: boolean;
}

interface NotificationPreferences {
  email: {
    questCompleted: boolean;
    achievementUnlocked: boolean;
    messageReceived: boolean;
    weeklyDigest: boolean;
  };
  push: {
    streakAtRisk: boolean;
    questAvailable: boolean;
  };
  inApp: {
    xpGained: boolean;
    cacaoGained: boolean;
    levelUp: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}
```

### API Endpoints
```typescript
// GET /api/profile/:userId
// PUT /api/profile/:userId
// POST /api/profile/:userId/avatar
// GET /api/profile/:userId/activity
// GET /api/profile/:userId/stats
// POST /api/profile/:userId/validate-username
```

---

## Definición de Terminado (DoD)

- [ ] Componente ProfilePage implementado
- [ ] Secciones de avatar, bio, apariencia, privacidad, historial, stats
- [ ] Galería de avatares (50+ predefinidos)
- [ ] Upload y crop de avatar personalizado
- [ ] Selector de intereses con opciones personalizadas
- [ ] Configuración de apariencia con preview en tiempo real
- [ ] Configuración de privacidad con preview de perfil
- [ ] Historial de actividad con filtros y búsqueda
- [ ] Estadísticas avanzadas con gráficos (Chart.js/Recharts)
- [ ] Configuración de notificaciones completa
- [ ] Sistema de guardado con validación y auto-save
- [ ] Warning de cambios sin guardar
- [ ] Responsive design completo (mobile, tablet, desktop)
- [ ] Tests unitarios >80% coverage
- [ ] Tests de integración para flujos completos
- [ ] Tests de accesibilidad (WCAG 2.1 AA)
- [ ] API endpoints implementados y documentados
- [ ] Validaciones server-side
- [ ] Audit logging de cambios
- [ ] Documentación de usuario
- [ ] Guía de privacidad

---

## Dependencias

### Depende de
- **EAI-001**: Sistema de autenticación básico
- **EAI-003**: Sistema de logros y gamificación
- **EAI-004**: Analytics básico

### Bloquea a
- **EXT-007**: Portal de Comunidad (perfiles sociales)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuarios pierden cambios sin guardar | Media | Medio | Warning al salir, auto-save en toggles |
| Avatar personalizado inapropiado | Media | Medio | Moderación manual + filtro automático |
| Configuraciones complejas confunden | Media | Bajo | Tooltips, valores por defecto sensatos |
| Performance en carga de historial | Baja | Medio | Paginación, lazy loading, índices DB |

---

## Estimación Detallada (8 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX | 6h | UX Designer |
| Avatar gallery + upload | 8h | Frontend Dev |
| Bio y personalización | 6h | Frontend Dev |
| Apariencia y tema | 6h | Frontend Dev |
| Privacidad y permisos | 6h | Frontend Dev |
| Historial de actividad | 8h | Frontend Dev |
| Estadísticas y gráficos | 10h | Frontend Dev |
| Notificaciones | 6h | Frontend Dev |
| API endpoints | 10h | Backend Dev |
| Validaciones | 4h | Backend Dev |
| Testing | 10h | QA + Devs |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **84h** | |

**Presupuesto**: $4,000 MXN (~$230 USD)
**Duración Estimada**: 2-3 días (equipo de 4-5 personas)

---

## Tareas de Implementación

### Backend (14.4h - 45%)
- [ ] Diseñar schema de base de datos para perfiles extendidos (2h)
- [ ] Implementar API endpoint PUT /api/profile/:userId (2h)
- [ ] Implementar API endpoint POST /api/profile/:userId/avatar (2h)
- [ ] Desarrollar servicio de validación de username único (1.5h)
- [ ] Implementar sistema de upload y crop de avatares con Sharp (2h)
- [ ] Crear endpoints de historial de actividad con paginación (2h)
- [ ] Implementar agregaciones para estadísticas personales (2h)
- [ ] Configurar audit logging de cambios de perfil (0.9h)

### Frontend (11.2h - 35%)
- [ ] Crear componente ProfilePage con tabs (1.5h)
- [ ] Implementar AvatarSection con galería y uploader (2h)
- [ ] Desarrollar BioSection con rich text básico (1.5h)
- [ ] Crear AppearanceSection con preview en tiempo real (2h)
- [ ] Implementar PrivacySection con preview de perfil (1.5h)
- [ ] Desarrollar ActivityHistorySection con filtros (1.5h)
- [ ] Crear StatsSection con gráficos (Chart.js/Recharts) (1.5h)
- [ ] Implementar sistema de auto-save y warning de cambios sin guardar (0.7h)

### Testing y QA (4.8h - 15%)
- [ ] Escribir tests unitarios para componentes de perfil (2h)
- [ ] Crear tests de integración para flujos completos (1.5h)
- [ ] Realizar tests de accesibilidad WCAG 2.1 AA (1h)
- [ ] Validar responsive design en múltiples dispositivos (0.3h)

### Deploy y Documentación (1.6h - 5%)
- [ ] Documentar API endpoints en Swagger (0.8h)
- [ ] Crear guía de usuario para personalización de perfil (0.5h)
- [ ] Preparar guía de privacidad (0.3h)

**Total Estimado**: 32h

---

## Cronograma

| Fase | Fecha Inicio Planificada | Fecha Fin Estimada | Horas | Estado |
|------|--------------------------|-------------------|-------|--------|
| Backend | 28 Oct 2024 | 29 Oct 2024 | 14.4h | Planificado |
| Frontend | 29 Oct 2024 | 31 Oct 2024 | 11.2h | Planificado |
| Testing | 31 Oct 2024 | 01 Nov 2024 | 4.8h | Planificado |
| Deploy | 01 Nov 2024 | 01 Nov 2024 | 1.6h | Planificado |

---

## Tags

#ext-004 #perfiles-avanzados #personalizacion #avatar #preferencias #privacidad #estadisticas #historial #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: Migrado desde EP005/US-005-05-settings-page.md (features avanzadas extraídas)
**Compliance**: PF-001 (393 líneas < 400L límite)
