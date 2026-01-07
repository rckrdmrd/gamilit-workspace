---
id: "US-PERF-005"
title: "Dashboard Personalizable con Widgets y Layouts"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-004"
story_points: 7
budget: "$3,500 MXN"
sprint: "Sprint-Mes3"
labels: ["ext-004", "dashboard", "personalizacion", "widgets", "drag-drop", "layouts", "ux", "mes-3"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-PERF-005: Personalización de Dashboard

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-005 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Dashboard Personalizable con Widgets y Layouts |
| **Prioridad** | Media (P2) |
| **Story Points** | 7 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $3,500 MXN |

---

## Historia de Usuario

**Como** estudiante de la plataforma Gamilit
**Quiero** personalizar mi dashboard con widgets configurables, layouts y métricas favoritas
**Para** tener acceso rápido a la información que más me importa y adaptar la interfaz a mi flujo de trabajo

---

## Valor de Negocio

### Impacto
- **User Experience**: Dashboard personalizado aumenta satisfacción 40%
- **Efficiency**: Usuarios encuentran información 60% más rápido
- **Engagement**: Personalización aumenta tiempo en plataforma 25%
- **Diferenciación**: Pocas LMS ofrecen dashboards configurables

### Métricas de Éxito
- >65% usuarios personalizan su dashboard en primera semana
- >80% mantienen configuración personalizada (no regresan a default)
- >50% crean múltiples layouts para diferentes contextos
- Tiempo promedio para encontrar info disminuye 40%

---

## Criterios de Aceptación

### CA-01: Sistema de Widgets
**Dado** que el usuario accede a su dashboard
**Cuando** configura widgets
**Entonces** debe tener disponibles:
- **Widget de Progreso**: Barra de avance por módulo con % completado
- **Widget de Racha**: Días consecutivos, meta, calendario visual
- **Widget de Leaderboard**: Top 10 en clase/global (configurable)
- **Widget de Logros Recientes**: Últimas 5 insignias desbloqueadas
- **Widget de Tareas Pendientes**: Mecánicas asignadas no completadas
- **Widget de Calendario**: Próximos deadlines y eventos
- **Widget de Estadísticas**: Gráfico de score vs tiempo
- **Widget de Amigos Online**: Lista de amigos activos (si tiene US-PERF-004)
- **Widget de Recomendaciones**: Sugerencias de mecánicas basado en performance
- **Widget de ML Coins**: Balance, gastos recientes, items destacados
- Cada widget debe tener:
  - Título personalizable
  - Configuración específica (ej: mostrar top 5 o top 10)
  - Opción de ocultar/mostrar

### CA-02: Editor de Layout Drag & Drop
**Dado** que el usuario personaliza layout
**Cuando** entra en modo edición
**Entonces** debe poder:
- Activar "Modo Edición" con botón prominente
- Arrastrar widgets de panel lateral al dashboard
- Soltar widgets en grid responsivo (auto-ajuste)
- Reordenar widgets arrastrando dentro del grid
- Redimensionar widgets (pequeño, mediano, grande, extra grande)
- Eliminar widgets arrastrando a "zona de eliminación" o con botón X
- Ver preview en tiempo real mientras arrastra
- Sistema de snap-to-grid para alineación automática
- Indicadores visuales de zonas válidas para soltar
- Deshacer/Rehacer últimos 10 cambios
- Guardar cambios o descartar con confirmación

### CA-03: Layouts Predefinidos
**Dado** que el usuario quiere empezar rápido
**Cuando** selecciona templates
**Entonces** debe tener:
- **Layout por Defecto**: Balance de widgets esenciales
- **Layout Enfocado en Estudio**:
  - Tareas pendientes (grande)
  - Progreso por módulo (grande)
  - Calendario (mediano)
  - Estadísticas mínimas
- **Layout Competitivo**:
  - Leaderboard (extra grande)
  - Racha (grande)
  - Logros recientes (mediano)
  - Amigos online (pequeño)
- **Layout Minimalista**:
  - Solo 3-4 widgets esenciales
  - Mucho espacio en blanco
- **Layout Completo**:
  - Todos los widgets disponibles
  - Grid denso, máxima información
- Aplicar template con confirmación (reemplaza layout actual)
- Vista previa de template antes de aplicar

### CA-04: Múltiples Layouts Guardados
**Dado** que el usuario tiene diferentes contextos de uso
**Cuando** gestiona layouts
**Entonces** debe poder:
- Crear hasta 5 layouts personalizados
- Nombrar cada layout (ej: "Vista Examen", "Descanso", "Estudio Intenso")
- Cambiar entre layouts con selector rápido (dropdown)
- Duplicar layout existente como base
- Eliminar layouts personalizados (con confirmación)
- Layout activo se guarda automáticamente
- Atajo de teclado: Ctrl+1/2/3/4/5 para cambiar layout
- Indicador visual de layout activo

### CA-05: Personalización de Tema por Dashboard
**Dado** que el usuario configura apariencia
**Cuando** personaliza tema
**Entonces** puede definir:
- **Color de Acento**: 12 opciones predefinidas + selector personalizado
- **Color de Fondo**: Sólido / Gradiente / Patrón sutil
- **Estilo de Widgets**:
  - Bordes: Redondeados / Cuadrados / Sin bordes
  - Sombras: Pronunciadas / Suaves / Ninguna
  - Espaciado: Compacto / Normal / Amplio
- **Tipografía**:
  - Fuente de encabezados (4 opciones)
  - Tamaño base (heredado de US-PERF-001 o custom)
- Preview en tiempo real de cambios
- Reset a tema por defecto con un clic
- Temas no afectan resto de plataforma (solo dashboard)

### CA-06: Shortcuts Personalizados
**Dado** que el usuario quiere acceso rápido
**Cuando** configura shortcuts
**Entonces** puede crear:
- Barra de shortcuts fija en top/lado
- Agregar hasta 10 shortcuts a:
  - Módulos específicos (ej: "Módulo 3")
  - Tipos de mecánicas (ej: "Mis cuestionarios")
  - Secciones (ej: "Mi tienda", "Leaderboard")
  - URLs externas (ej: "Google Classroom")
- Iconos predefinidos para cada shortcut (20+ opciones)
- Reordenar shortcuts por drag & drop
- Atajos de teclado: Ctrl+Shift+[número]
- Tooltips descriptivos en hover

### CA-07: Configuración de Widgets Individuales
**Dado** que cada widget tiene opciones
**Cuando** el usuario configura un widget
**Entonces** debe poder:
- Acceder a configuración con icono de engranaje
- **Widget de Progreso**:
  - Mostrar: Todos los módulos / Solo en curso / Solo incompletos
  - Ordenar por: Nombre / Progreso / Fecha
- **Widget de Leaderboard**:
  - Ámbito: Mi clase / Toda la escuela / Global
  - Top N: 5, 10, 20, 50
- **Widget de Estadísticas**:
  - Métrica: Score / Tiempo / Mecánicas completadas
  - Periodo: Última semana / Último mes / Últimos 3 meses
  - Tipo de gráfico: Línea / Barras / Área
- **Widget de Calendario**:
  - Mostrar: Solo deadlines / Todos los eventos
  - Vista: Lista / Calendario mensual
- Aplicar cambios con preview
- Reset a configuración por defecto

### CA-08: Responsive Design
**Dado** que el usuario accede desde diferentes dispositivos
**Cuando** visualiza dashboard personalizado
**Entonces** debe:
- **Desktop (>1200px)**: Grid de hasta 4 columnas
- **Tablet (768px-1199px)**: Grid de 2 columnas, widgets se reorganizan
- **Mobile (<768px)**: 1 columna, widgets apilados verticalmente
- Modo edición simplificado en mobile (lista reordenable vs drag & drop)
- Widgets mantienen funcionalidad completa en todos los tamaños
- Configuraciones se sincronizan entre dispositivos
- Layout se adapta automáticamente según viewport

### CA-09: Exportación e Importación de Configuración
**Dado** que el usuario quiere compartir o respaldar
**Cuando** exporta/importa configuración
**Entonces** puede:
- Exportar layout actual como JSON
- Importar layout desde archivo JSON
- Compartir layout con otros usuarios (genera código de 6 caracteres)
- Otros usuarios aplican layout compartido con código
- Validación de configuración importada (previene errores)
- Opción de aplicar parcialmente (solo widgets, solo tema, etc.)

### CA-10: Analytics de Uso de Dashboard
**Dado** que se quiere mejorar UX
**Cuando** el usuario usa dashboard
**Entonces** el sistema debe trackear (anonimizado):
- Widgets más usados (clicks, tiempo visible)
- Layouts más populares
- Combinaciones de widgets frecuentes
- Tiempo promedio en dashboard
- Frecuencia de cambios de layout
- Heatmap de interacciones
- Datos agregados para mejorar defaults

### CA-11: Onboarding Interactivo
**Dado** que un nuevo usuario accede por primera vez
**Cuando** ve su dashboard
**Entonces** debe recibir:
- Tour guiado (opcional): "Personaliza tu dashboard"
- Tooltips contextuales:
  - "Arrastra widgets aquí para agregar"
  - "Redimensiona tocando las esquinas"
  - "Crea múltiples layouts para diferentes tareas"
- Opción de "Omitir tour" o "Mostrar más tarde"
- Checklist de personalización:
  - [ ] Agregar al menos 3 widgets
  - [ ] Cambiar color de acento
  - [ ] Crear un layout personalizado
- Recompensa al completar: 100 Cacao + Badge "Diseñador"

### CA-12: Performance y Optimización
**Dado** que dashboards pueden tener muchos widgets
**Cuando** el sistema renderiza
**Entonces** debe:
- Widgets en viewport se renderizan primero (lazy load)
- Widgets fuera de vista se cargan al hacer scroll
- Polling de datos solo para widgets visibles
- Refresh rate configurable por widget (30s, 1min, 5min, manual)
- Cache de datos de widgets (invalidar cada N minutos)
- Dashboard completo carga en <1 segundo
- Drag & drop smooth 60 FPS
- Optimización de re-renders (React.memo, useMemo)

### CA-13: Accesibilidad
**Dado** que todos los usuarios deben poder personalizar
**Cuando** usan features de dashboard
**Entonces** debe:
- Modo edición accesible por teclado:
  - Tab para navegar widgets
  - Enter para seleccionar
  - Flechas para mover
  - Escape para salir de modo edición
- ARIA labels descriptivos en cada widget
- Screen reader anuncia cambios de layout
- Alto contraste en modo edición
- Indicadores visuales claros de drag & drop
- Focus visible en todos los elementos interactivos

### CA-14: Límites y Validaciones
**Dado** que se necesita evitar configuraciones extremas
**Cuando** el usuario personaliza
**Entonces** el sistema debe:
- Limitar a máximo 12 widgets simultáneos
- Prevenir layouts vacíos (mínimo 2 widgets)
- Validar que shortcuts tengan destinos válidos
- Alertar si layout es muy denso (UX warning)
- Prevenir widgets duplicados en mismo layout
- Máximo 5 layouts guardados por usuario
- Nombres de layouts: 3-50 caracteres

### CA-15: Integración con Gamificación
**Dado** que personalización es parte de la experiencia
**Cuando** el usuario personaliza dashboard
**Entonces** debe recibir:
- **Primera personalización**: 50 Cacao
- **Crear primer layout personalizado**: 100 Cacao + Badge "Organizador"
- **Usar 5 layouts diferentes**: Badge "Versátil"
- **Tener dashboard >80% optimizado** (según AI): Badge "Power User"
- Quest semanal: "Personaliza tu dashboard" (200 Cacao)

---

## Especificaciones Técnicas

### Frontend Components
```
src/features/dashboard/
├── pages/
│   └── DashboardPage.tsx
├── components/
│   ├── WidgetGrid.tsx
│   ├── WidgetLibrary.tsx
│   ├── DragDropContext.tsx
│   ├── LayoutSelector.tsx
│   ├── ThemeCustomizer.tsx
│   ├── ShortcutBar.tsx
│   └── DashboardOnboarding.tsx
├── widgets/
│   ├── ProgressWidget.tsx
│   ├── StreakWidget.tsx
│   ├── LeaderboardWidget.tsx
│   ├── AchievementsWidget.tsx
│   ├── TodoWidget.tsx
│   ├── CalendarWidget.tsx
│   ├── StatsWidget.tsx
│   ├── FriendsWidget.tsx
│   ├── RecommendationsWidget.tsx
│   └── CoinsWidget.tsx
├── hooks/
│   ├── useDashboardLayout.ts
│   ├── useWidgetConfig.ts
│   └── useDragDrop.ts
└── layouts/
    └── layoutTemplates.ts
```

### TypeScript Interfaces
```typescript
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: WidgetConfig;
  visible: boolean;
}

type WidgetType =
  | 'progress'
  | 'streak'
  | 'leaderboard'
  | 'achievements'
  | 'todo'
  | 'calendar'
  | 'stats'
  | 'friends'
  | 'recommendations'
  | 'coins';

interface WidgetConfig {
  refreshRate?: number; // seconds
  [key: string]: any; // widget-specific config
}

interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  widgets: Widget[];
  theme: DashboardTheme;
  shortcuts: Shortcut[];
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardTheme {
  accentColor: string;
  backgroundColor: string;
  widgetStyle: {
    borderRadius: 'rounded' | 'square' | 'none';
    shadows: 'strong' | 'soft' | 'none';
    spacing: 'compact' | 'normal' | 'spacious';
  };
  typography: {
    headingFont: string;
    baseSize: number;
  };
}

interface Shortcut {
  id: string;
  label: string;
  icon: string;
  target: string; // URL or internal route
  order: number;
  keyboardShortcut?: string;
}
```

### API Endpoints
```typescript
// Layouts
GET    /api/dashboard/layouts
POST   /api/dashboard/layouts
PUT    /api/dashboard/layouts/:id
DELETE /api/dashboard/layouts/:id
PUT    /api/dashboard/layouts/:id/activate

// Layout Sharing
POST   /api/dashboard/layouts/:id/share (returns code)
POST   /api/dashboard/layouts/import/:code

// Widget Data
GET    /api/dashboard/widgets/:type/data

// Analytics
POST   /api/dashboard/analytics/track
```

### Technology Stack
```
Frontend:
- react-grid-layout para drag & drop grid
- react-dnd como alternativa
- recharts para widgets de estadísticas
- react-color para color picker
- framer-motion para animaciones

Backend:
- NestJS endpoints
- PostgreSQL para layouts persistentes
- Redis para cache de widget data
- WebSockets para updates en tiempo real (opcional)
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI)
- **EP002/US-002-02**: Dashboard estático, no personalizable
- Vista fija de progreso, racha, leaderboard
- Sin opciones de layout o widgets

### Esta Historia (EXT-004)
- **Dashboard 100% personalizable**
- 10+ widgets configurables
- Drag & drop editor
- Múltiples layouts guardados
- Temas personalizados
- Shortcuts configurables
- Esto es **extensión avanzada de dashboard**

---

## Dependencias

### Depende de
- **EAI-002**: Dashboard básico existente (base a extender)
- **US-PERF-001**: Sistema de preferencias de usuario
- **EAI-003**: Datos de gamificación (para widgets)
- **US-PERF-004**: Amigos online (para widget opcional)

### Bloquea a
- Ninguna (feature independiente)

---

## Definición de Terminado (DoD)

- [ ] 10 widgets implementados y funcionales
- [ ] Sistema drag & drop con react-grid-layout
- [ ] Editor de layout con modo edición/vista
- [ ] 5 templates predefinidos
- [ ] Sistema de múltiples layouts (máx 5 por usuario)
- [ ] Selector rápido de layouts
- [ ] Personalización de tema por dashboard
- [ ] Barra de shortcuts configurables
- [ ] Configuración individual por widget
- [ ] Responsive design completo
- [ ] Exportación/importación de layouts
- [ ] Sistema de compartir layouts (códigos)
- [ ] Onboarding interactivo
- [ ] Performance optimizada (<1s carga)
- [ ] Tests unitarios >80% coverage
- [ ] Tests de integración para drag & drop
- [ ] Tests de accesibilidad
- [ ] API endpoints implementados
- [ ] Documentación de usuario
- [ ] Video tutorial de personalización

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad UI confunde usuarios | Media | Medio | Onboarding claro, templates predefinidos |
| Performance con muchos widgets | Media | Alto | Lazy loading, virtual scrolling, cache |
| Layouts rotos en diferentes tamaños | Media | Medio | Responsive testing exhaustivo |
| Usuarios pierden configuración | Baja | Alto | Auto-save, confirmación antes de eliminar |

---

## Estimación Detallada (7 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX | 8h | UX Designer |
| Sistema de widgets (10 widgets) | 16h | Frontend Dev |
| Drag & drop grid | 10h | Frontend Dev |
| Layouts y templates | 8h | Frontend Dev |
| Personalización de tema | 6h | Frontend Dev |
| Shortcuts bar | 4h | Frontend Dev |
| Widget configuration | 8h | Frontend Dev |
| Onboarding | 4h | Frontend Dev |
| API endpoints | 8h | Backend Dev |
| Optimización performance | 6h | Frontend Dev |
| Testing | 10h | QA + Devs |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **92h** | |

**Presupuesto**: $3,500 MXN (~$200 USD)
**Duración Estimada**: 2-3 días (equipo de 4-5 personas)

---

## Tareas de Implementación

### Backend (12.6h - 45%)
- [ ] Diseñar schema para layouts de dashboard y widgets (2h)
- [ ] Implementar API de gestión de layouts (CRUD) (2.5h)
- [ ] Crear endpoints de sharing de layouts (códigos de 6 caracteres) (2h)
- [ ] Desarrollar API para obtener datos de widgets en tiempo real (2.5h)
- [ ] Implementar sistema de cache de widget data con Redis (2h)
- [ ] Configurar validación de layouts y límites (1.6h)

### Frontend (9.8h - 35%)
- [ ] Implementar react-grid-layout para drag & drop de widgets (3h)
- [ ] Crear 10 widgets funcionales (ProgressWidget, StreakWidget, etc.) (3h)
- [ ] Desarrollar LayoutSelector con templates predefinidos (1.5h)
- [ ] Implementar ThemeCustomizer para personalización de tema (1.5h)
- [ ] Crear ShortcutBar configurable (0.8h)

### Testing y QA (4.2h - 15%)
- [ ] Escribir tests unitarios para widgets y layouts (2h)
- [ ] Crear tests de integración para drag & drop (1.5h)
- [ ] Realizar tests de performance (<1s carga) (0.5h)
- [ ] Validar accesibilidad de dashboard (0.2h)

### Deploy y Documentación (1.4h - 5%)
- [ ] Documentar API de dashboard (0.6h)
- [ ] Crear guía de usuario para personalización (0.5h)
- [ ] Producir video tutorial de personalización (0.3h)

**Total Estimado**: 28h

---

## Cronograma

| Fase | Fecha Inicio Planificada | Fecha Fin Estimada | Horas | Estado |
|------|--------------------------|-------------------|-------|--------|
| Backend | 01 Nov 2024 | 02 Nov 2024 | 12.6h | Planificado |
| Frontend | 02 Nov 2024 | 03 Nov 2024 | 9.8h | Planificado |
| Testing | 03 Nov 2024 | 04 Nov 2024 | 4.2h | Planificado |
| Deploy | 04 Nov 2024 | 04 Nov 2024 | 1.4h | Planificado |

---

## Tags

#ext-004 #dashboard #personalizacion #widgets #drag-drop #layouts #ux #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: Nuevo (basado en necesidades de UX avanzada)
**Compliance**: PF-001 (XXX líneas)
