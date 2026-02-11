---
id: "US-PERF-003"
title: "Configuración de Accesibilidad, Audio y Preferencias de Gamificación"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-004"
story_points: 5
budget: "$2,500 MXN"
sprint: "Sprint-Mes3"
labels: ["ext-004", "accesibilidad", "wcag", "audio", "gamificacion", "personalizacion", "inclusividad", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PERF-003: Accesibilidad y Gamificación Personalizada

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-003 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Configuración de Accesibilidad, Audio y Preferencias de Gamificación |
| **Prioridad** | Media (P2) |
| **Story Points** | 5 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $2,500 MXN |

---

## Historia de Usuario

**Como** usuario con necesidades específicas de accesibilidad o preferencias de experiencia gamificada
**Quiero** configurar opciones de accesibilidad (alto contraste, lector de pantalla, movimiento reducido) y personalizar mi experiencia de gamificación (rankings, notificaciones de XP, celebraciones)
**Para** adaptar la plataforma a mis capacidades y disfrutar de una experiencia cómoda y motivadora

---

## Valor de Negocio

### Impacto
- **Inclusión**: Accesible para usuarios con discapacidades visuales, motoras, cognitivas
- **Compliance**: Cumplimiento WCAG 2.1 AA (legal requirement)
- **Personalización**: Usuarios controlan nivel de gamificación
- **Experiencia**: Flexibilidad mejora satisfacción 25%

### Métricas de Éxito
- >15% usuarios activan al menos 1 opción de accesibilidad
- >30% usuarios ajustan preferencias de gamificación
- Tiempo de carga con alto contraste < 2s
- 100% compatibilidad screen readers (JAWS, NVDA, VoiceOver)

---

## Criterios de Aceptación

### CA-01: Configuración de Accesibilidad
**Dado** que el usuario configura accesibilidad
**Cuando** accede a la sección
**Entonces** puede activar:
- **Alto Contraste**: aumenta contraste de texto/fondo a ratio 7:1 mínimo
- **Movimiento Reducido**: desactiva animaciones y transiciones (respeta prefers-reduced-motion)
- **Navegación por Teclado**: indicadores de foco visibles mejorados
- **Lector de Pantalla**: optimizaciones adicionales para ARIA labels
- **Subtítulos**: activar para todos los videos
- **Descripción de Imágenes**: mostrar alt text siempre visible
- **Focus Visible**: indicadores de foco extra visibles (3px border)
- Link a guía completa de accesibilidad
- Explicación de beneficios de cada opción

### CA-02: Configuración de Audio y Sonido
**Dado** que la plataforma tiene efectos de audio
**Cuando** el usuario configura audio
**Entonces** puede ajustar:
- **Efectos de Sonido**: ON/OFF (clicks, notificaciones, logros)
- **Música de Fondo**: ON/OFF (si aplicable)
- **Volumen General**: slider 0-100%
- **Volumen de Efectos**: slider 0-100%
- **Volumen de Música**: slider 0-100%
- **Sonidos de Notificación**: ON/OFF
- Preview de sonidos al ajustar (reproducir muestra)
- Guardar preferencias localmente (localStorage)
- Mute rápido con botón global

### CA-03: Preferencias de Gamificación
**Dado** que el usuario personaliza su experiencia gamificada
**Cuando** ajusta preferencias de gamificación
**Entonces** puede configurar:
- **Mostrar en Rankings**: Sí / No (ocultar de leaderboards públicos)
- **Comparaciones Sociales**: Activadas / Solo Amigos / Desactivadas
- **Notificaciones de XP/Cacao**: Siempre / Solo grandes cantidades (>50) / Nunca
- **Celebraciones Animadas**: Todas / Solo importantes (logros, level up) / Ninguna
- **Showcasear Logros**: Público / Solo Amigos / Privado
- **Multiplicadores Visibles**: Sí / No (mostrar bonos activos)
- Mantener motivación sin presión social
- Efectos reflejados inmediatamente en interfaz

### CA-04: Modo de Lectura Optimizado
**Dado** que el usuario prefiere lectura clara
**Cuando** activa modo de lectura
**Entonces** se aplica:
- Fuente optimizada para dislexia (OpenDyslexic opcional)
- Espaciado de línea aumentado (1.5x)
- Ancho máximo de párrafo (70 caracteres)
- Reducción de distracciones visuales
- Fondo crema en lugar de blanco puro
- Resaltado de línea actual al leer

### CA-05: Configuración de Navegación
**Dado** que el usuario necesita navegación adaptada
**Cuando** configura navegación
**Entonces** puede:
- Activar **Breadcrumbs** siempre visibles
- Tamaño de botones: Normal / Grande / Extra Grande (touch targets 44px+)
- Posición de menú: Lateral / Superior / Inferior
- Mostrar **Tooltips** siempre / Al pasar mouse / Nunca
- Confirmaciones extra: Siempre pedir confirmación antes de acciones importantes

### CA-06: Atajos de Teclado Personalizados
**Dado** que el usuario usa navegación por teclado
**Cuando** accede a atajos
**Entonces** puede:
- Ver lista completa de atajos disponibles (modal con Tab)
- Atajos predefinidos:
  - `Ctrl+K`: Búsqueda rápida
  - `Ctrl+H`: Ir a Home/Dashboard
  - `Ctrl+P`: Perfil
  - `Ctrl+N`: Notificaciones
  - `G+M`: Ir a Mis Mecánicas
  - `G+L`: Ir a Leaderboard
  - `?`: Mostrar ayuda
- Personalizar atajos (opcional)
- Export/import de configuración de atajos

### CA-07: Experiencia Sensorial Reducida
**Dado** que el usuario tiene sensibilidad sensorial
**Cuando** activa modo reducido
**Entonces** se aplica:
- Desactivar todas las animaciones
- Eliminar efectos de parallax
- Reducir colores vibrantes a paleta suave
- Eliminar videos auto-play
- Desactivar efectos de hover complejos
- Mantener funcionalidad completa sin estética distractora

### CA-08: Idioma y Localización
**Dado** que el usuario configura idioma
**Cuando** selecciona preferencias
**Entonces** puede:
- **Idioma de Interfaz**: Español / Inglés
- **Formato de Fecha**: DD/MM/YYYY / MM/DD/YYYY / YYYY-MM-DD
- **Formato de Hora**: 12h (AM/PM) / 24h
- **Zona Horaria**: Auto-detectar / Seleccionar manualmente
- **Moneda**: MXN / USD (para referencia de costos)
- Cambios aplicados inmediatamente
- Persistencia en backend para sincronizar dispositivos

### CA-09: Configuración de Densidad Visual
**Dado** que el usuario ajusta densidad de interfaz
**Cuando** cambia la configuración
**Entonces** puede elegir:
- **Compacta**: máxima información en pantalla, espaciado mínimo
- **Cómoda**: balance entre información y espacio (default)
- **Espaciosa**: máximo espacio, ideal para touch y accesibilidad
- Preview en tiempo real del cambio
- Afecta: padding de cards, tamaño de fuente, espaciado entre elementos

### CA-10: Persistencia y Sincronización
**Dado** que el usuario configura preferencias
**Cuando** guarda cambios
**Entonces** el sistema debe:
- Guardar en base de datos (backend)
- Sincronizar entre todos los dispositivos del usuario
- Aplicar cambios inmediatamente sin reload
- Cache en localStorage para carga rápida inicial
- Detectar conflictos entre dispositivos (usar más reciente)
- Export de configuración como archivo JSON
- Import de configuración desde archivo

---

## Especificaciones Técnicas

### Frontend Components
```
src/pages/preferences/
├── AccessibilitySection.tsx
├── AudioSection.tsx
├── GamificationSection.tsx
├── NavigationSection.tsx
├── KeyboardShortcutsSection.tsx
├── LocalizationSection.tsx
└── components/
    ├── VolumeSlider.tsx
    ├── ShortcutKeyBinder.tsx
    ├── DensityPreview.tsx
    └── AccessibilityChecker.tsx
```

### TypeScript Interfaces
```typescript
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimizations: boolean;
  alwaysShowCaptions: boolean;
  alwaysShowAltText: boolean;
  enhancedFocus: boolean;
  dyslexiaFont: boolean;
  readingMode: boolean;
}

interface AudioSettings {
  soundEffects: boolean;
  backgroundMusic: boolean;
  masterVolume: number; // 0-100
  effectsVolume: number;
  musicVolume: number;
  notificationSounds: boolean;
}

interface GamificationSettings {
  showInRankings: boolean;
  socialComparisons: 'all' | 'friends' | 'none';
  rewardNotifications: 'always' | 'large' | 'never';
  celebrations: 'all' | 'important' | 'none';
  showcaseVisibility: 'public' | 'friends' | 'private';
  showMultipliers: boolean;
}

interface NavigationSettings {
  breadcrumbsAlwaysVisible: boolean;
  buttonSize: 'normal' | 'large' | 'xlarge';
  menuPosition: 'side' | 'top' | 'bottom';
  tooltipBehavior: 'always' | 'hover' | 'never';
  extraConfirmations: boolean;
}
```

### API Endpoints
```typescript
// PUT /api/preferences/:userId/accessibility
// PUT /api/preferences/:userId/audio
// PUT /api/preferences/:userId/gamification
// GET /api/preferences/:userId/export
// POST /api/preferences/:userId/import
```

---

## Definición de Terminado (DoD)

- [ ] Sección de accesibilidad implementada
- [ ] Alto contraste funcional (ratio 7:1)
- [ ] Reduced motion respeta prefers-reduced-motion
- [ ] Screen reader compatible (ARIA completo)
- [ ] Configuración de audio con sliders
- [ ] Preview de sonidos funcional
- [ ] Preferencias de gamificación
- [ ] Modo de lectura optimizado
- [ ] Fuente para dislexia disponible
- [ ] Atajos de teclado documentados
- [ ] Configuración de navegación
- [ ] Idioma y localización
- [ ] Densidad visual con preview
- [ ] Persistencia en backend
- [ ] Sincronización multi-dispositivo
- [ ] Export/import de configuración
- [ ] Tests de accesibilidad (axe-core, WAVE)
- [ ] Compliance WCAG 2.1 AA verificado
- [ ] Tests con screen readers
- [ ] Documentación de accesibilidad

---

## Dependencias

### Depende de
- **US-PERF-001**: Sistema de preferencias de usuario
- **EAI-003**: Sistema de gamificación

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Alto contraste rompe diseño | Media | Medio | Testing exhaustivo, CSS variables |
| Reduced motion elimina feedback visual | Media | Bajo | Alternativas visuales estáticas |
| Screen readers no funcionan | Baja | Alto | Testing con JAWS, NVDA, VoiceOver |
| Sincronización falla entre dispositivos | Media | Bajo | Fallback a localStorage, retry logic |

---

## Estimación Detallada (5 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UX/UX accesible | 6h | UX Designer |
| Implementar alto contraste | 5h | Frontend Dev |
| Reduced motion | 4h | Frontend Dev |
| Screen reader optimizations | 6h | Frontend Dev |
| Audio controls | 5h | Frontend Dev |
| Gamificación preferences | 5h | Frontend Dev |
| Modo lectura | 4h | Frontend Dev |
| Atajos de teclado | 5h | Frontend Dev |
| Navegación y densidad | 4h | Frontend Dev |
| Idioma y localización | 6h | Frontend Dev |
| Backend API | 4h | Backend Dev |
| Sincronización | 4h | Backend Dev |
| Testing accesibilidad | 8h | QA + Accessibility Specialist |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **70h** | |

**Presupuesto**: $2,500 MXN (~$145 USD)
**Duración Estimada**: 2 días (equipo de 4-5 personas)

---

## Tareas de Implementación

### Backend (9h - 45%)
- [ ] Diseñar schema para preferencias de accesibilidad y gamificación (1.5h)
- [ ] Implementar endpoints PUT /api/preferences/:userId/accessibility (2h)
- [ ] Crear endpoints para configuración de audio y gamificación (2h)
- [ ] Desarrollar sistema de sincronización multi-dispositivo (2h)
- [ ] Implementar export/import de configuración como JSON (1.5h)

### Frontend (7h - 35%)
- [ ] Crear AccessibilitySection con toggles (1.5h)
- [ ] Implementar AudioSection con sliders de volumen (1h)
- [ ] Desarrollar GamificationSection con previews (1.5h)
- [ ] Crear modo de lectura optimizado con fuente para dislexia (1h)
- [ ] Implementar atajos de teclado personalizados (1h)
- [ ] Desarrollar configuración de densidad visual con preview (1h)

### Testing y QA (3h - 15%)
- [ ] Realizar tests de accesibilidad con axe-core y WAVE (1.5h)
- [ ] Testing con screen readers (JAWS, NVDA, VoiceOver) (1h)
- [ ] Verificar compliance WCAG 2.1 AA (0.5h)

### Deploy y Documentación (1h - 5%)
- [ ] Documentar API de preferencias (0.5h)
- [ ] Crear documentación de accesibilidad para usuarios (0.5h)

**Total Estimado**: 20h

---

## Cronograma

| Fase | Fecha Inicio Planificada | Fecha Fin Estimada | Horas | Estado |
|------|--------------------------|-------------------|-------|--------|
| Backend | 28 Oct 2024 | 29 Oct 2024 | 9h | Planificado |
| Frontend | 29 Oct 2024 | 30 Oct 2024 | 7h | Planificado |
| Testing | 30 Oct 2024 | 31 Oct 2024 | 3h | Planificado |
| Deploy | 31 Oct 2024 | 31 Oct 2024 | 1h | Planificado |

---

## Tags

#ext-004 #accesibilidad #wcag #audio #gamificacion #personalizacion #inclusividad #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: Migrado desde EP005/US-005-05-settings-page.md (secciones accesibilidad/audio/gamificación extraídas)
**Compliance**: PF-001 (383 líneas < 400L límite)
