# US-PERF-006: Showcasing de Logros

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-PERF-006 |
| **Épica** | EXT-004 - Perfiles Avanzados |
| **Título** | Sistema de Exhibición y Showcasing de Logros |
| **Prioridad** | Alta (P1) |
| **Story Points** | 7 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $3,500 MXN |

---

## Historia de Usuario

**Como** estudiante de la plataforma Gamilit
**Quiero** exhibir mis logros, insignias y estadísticas destacadas en mi perfil y compartirlas
**Para** mostrar mis logros a amigos, motivarme a conseguir más y celebrar mis éxitos

---

## Valor de Negocio

### Impacto
- **Motivación**: Showcasing aumenta participación en gamificación 55%
- **Engagement**: Usuarios con logros destacados juegan 40% más
- **Social Proof**: Compartir logros genera efecto viral
- **Retention**: Coleccionistas de badges tienen 50% menos churn

### Métricas de Éxito
- >75% usuarios destacan al menos 3 insignias en perfil
- >60% comparten logros en redes sociales
- >80% interactúan con galería de logros semanalmente
- Incremento 35% en completación de logros difíciles

---

## Criterios de Aceptación

### CA-01: Galería de Logros
**Dado** que un estudiante accede a su galería
**Cuando** visualiza logros
**Entonces** debe ver:
- **Vista Grid**: Todas las insignias en cuadrícula
- **Logros Desbloqueados**: Color completo, animación sutil
- **Logros Bloqueados**: Silueta gris, candado, tooltip "¿Cómo desbloquear?"
- Información al hacer hover/tap:
  - Nombre del logro
  - Descripción
  - Fecha de desbloqueo (si aplica)
  - Criterios para desbloquear (si bloqueado)
  - Rareza: Común / Raro / Épico / Legendario
  - % de usuarios que lo tienen
- Contador: "42 de 120 logros desbloqueados (35%)"
- Barra de progreso visual de colección completa

### CA-02: Filtros y Búsqueda de Logros
**Dado** que la galería puede tener 100+ logros
**Cuando** el usuario filtra
**Entonces** puede usar:
- **Filtros por Estado**:
  - Todos
  - Desbloqueados
  - Bloqueados
  - En progreso (ej: 7/10 mecánicas completadas)
- **Filtros por Categoría**:
  - Progreso académico
  - Racha y consistencia
  - Social
  - Coleccionista
  - Especiales/Secretos
- **Filtros por Rareza**: Común, Raro, Épico, Legendario
- **Ordenar por**:
  - Fecha de desbloqueo (recientes primero)
  - Rareza (legendarios primero)
  - Nombre (A-Z)
  - Progreso (más cercanos a desbloquear)
- **Búsqueda**: Por nombre o descripción
- Filtros se combinan (AND logic)

### CA-03: Insignias Destacadas (Pinned Badges)
**Dado** que el usuario quiere exhibir sus mejores logros
**Cuando** selecciona insignias destacadas
**Entonces** puede:
- Seleccionar hasta 6 insignias para destacar
- Arrastrar para reordenar posición (1-6)
- Vista de selección: solo logros desbloqueados
- Insignias destacadas aparecen:
  - En parte superior del perfil público
  - En tarjeta de usuario en listas (ej: leaderboard)
  - En tooltips de nombre de usuario
- Tamaño extra grande con animación especial
- Cambiar selección cuando quiera (sin límite de cambios)
- Preset de "Auto-destacar más raros" (IA selecciona top 6)

### CA-04: Timeline de Logros
**Dado** que el usuario quiere ver su progresión
**Cuando** accede a timeline
**Entonces** debe ver:
- **Cronología visual** estilo timeline vertical
- Cada logro muestra:
  - Insignia animada
  - Nombre y descripción
  - Fecha y hora exacta de desbloqueo
  - Contexto: "Desbloqueado al completar Módulo 3"
  - Reacciones de amigos (si compartió)
- Filtrar por periodo:
  - Última semana
  - Último mes
  - Últimos 3 meses
  - Todo el tiempo
- Scroll infinito para cargar más
- Exportar timeline como imagen o PDF
- Estadística: "Desbloqueaste 12 logros este mes (+5 vs mes pasado)"

### CA-05: Showcase de Estadísticas Impresionantes
**Dado** que el usuario tiene estadísticas destacadas
**Cuando** configura showcase
**Entonces** puede exhibir:
- **Top Stats Calculadas Automáticamente**:
  - "Top 1% en Matemáticas a nivel nacional"
  - "Racha de 47 días (Top 5% de la plataforma)"
  - "100% de acierto en últimas 20 mecánicas"
  - "Master en Módulo 4 (primer intento)"
  - "235 logros desbloqueados (Top 10 global)"
- Seleccionar hasta 4 stats para mostrar en perfil
- Stats actualizadas en tiempo real
- Diseño visual llamativo (tarjetas coloridas)
- Comparativa con promedio de plataforma
- Tooltip con explicación de cómo se calcula

### CA-06: Colecciones de Insignias
**Dado** que algunos logros forman sets
**Cuando** visualiza colecciones
**Entonces** debe ver:
- **Sets Temáticos**:
  - "Maestro Maya" (todas las insignias culturales)
  - "Polímata" (excelencia en todos los módulos)
  - "Social Butterfly" (todas las sociales)
  - "Speedrunner" (completar bajo tiempo récord)
- Progreso de cada colección: "4/7 insignias"
- Recompensa al completar set:
  - Meta-insignia especial
  - Bonus de Cacao (500-2000 según rareza)
  - Título especial en perfil
- Vista de galería por colecciones
- Insignias faltantes con pistas de cómo obtener

### CA-07: Compartir Logros en Redes Sociales
**Dado** que el usuario quiere compartir un logro
**Cuando** comparte en redes
**Entonces** debe poder:
- Botón "Compartir" en cada logro
- Generar imagen Open Graph atractiva:
  - Insignia grande centrada
  - Nombre del logro
  - Fecha de desbloqueo
  - Estadística relevante (ej: "Solo 5% lo tiene")
  - Branding de Gamilit
  - Username del jugador
- Compartir en:
  - Facebook
  - Twitter
  - WhatsApp
  - Copiar enlace directo
- Preview antes de compartir
- Landing page pública del logro (si usuario permite)
- Trackear shares (analytics)

### CA-08: Comparación de Logros con Amigos
**Dado** que el usuario tiene amigos (US-PERF-004)
**Cuando** compara logros
**Entonces** puede ver:
- Vista comparativa lado a lado:
  - Mis logros vs Amigo
  - Logros en común (verde)
  - Logros únicos míos (azul)
  - Logros únicos del amigo (gris)
- Estadísticas comparativas:
  - "Tienes 12 logros más que Juan"
  - "María tiene 3 logros épicos que no tienes"
- Filtrar por: Todos / En común / Únicos
- "Desafiar amigo": sugerir quest para empatar logros
- Leaderboard de logros entre amigos

### CA-09: Logros Secretos
**Dado** que algunos logros deben ser sorpresa
**Cuando** visualiza logros secretos
**Entonces** debe:
- Aparecer en galería como "???" (sin pistas)
- Al desbloquear, animación especial "¡Logro Secreto!"
- No revelar criterios hasta desbloquear
- Aumentan engagement por curiosidad
- Ejemplos:
  - "Easter Egg Hunter" (encontrar huevo de pascua oculto)
  - "Night Owl" (estudiar después de medianoche)
  - "Perfectionist" (100% en 10 módulos consecutivos)
- Lista de logros secretos existentes (sin detalles)

### CA-10: Progreso en Tiempo Real
**Dado** que algunos logros tienen progreso parcial
**Cuando** trabaja hacia un logro
**Entonces** debe ver:
- Barra de progreso: "7/10 mecánicas completadas"
- % de avance: "70% hacia 'Experto en Módulo 2'"
- Estimación de tiempo: "~2 días al ritmo actual"
- Notificación al alcanzar hitos: "¡Mitad del camino!"
- Vista de "Más cercanos a completar" (top 5)
- Tooltip con pasos restantes específicos

### CA-11: Gamificación del Showcasing
**Dado** que mostrar logros debe ser rewarding
**Cuando** el usuario interactúa con sistema
**Entonces** recibe:
- **Recompensas por Exhibir**:
  - Primera insignia destacada: 50 Cacao
  - Completar showcase completo (6 badges): Badge "Showman"
  - Primer share en redes: 100 Cacao
  - Compartir 10 logros: Badge "Embajador"
- **Recompensas por Coleccionar**:
  - Desbloquear 25 logros: Badge "Coleccionista Novato"
  - Desbloquear 50 logros: Badge "Coleccionista Experto"
  - Desbloquear 100 logros: Badge "Maestro Coleccionista" + 1000 Cacao
- Quest semanal: "Desbloquea 3 logros nuevos" (300 Cacao)

### CA-12: Exportación de Galería
**Dado** que el usuario quiere preservar logros
**Cuando** exporta galería
**Entonces** puede:
- Exportar como imagen de mosaico (todos los logros)
- Exportar como PDF detallado (con fechas, descripciones)
- Exportar como JSON (data para portfolio)
- Generar certificado digital de logros
- Imprimir galería física (formato optimizado)
- Compartir galería completa con enlace público

### CA-13: Responsive y Accesibilidad
**Dado** que la galería debe ser accesible
**Cuando** usuarios visualizan
**Entonces** debe:
- Grid responsive: 6 columnas (desktop) → 3 (tablet) → 2 (mobile)
- Insignias táctiles grandes en mobile (min 80x80px)
- Navegación por teclado en galería
- Screen reader describe logros:
  - Estado (desbloqueado/bloqueado)
  - Nombre y descripción
  - Rareza y fecha
- Alto contraste en logros bloqueados
- Animaciones respetan prefers-reduced-motion
- ARIA labels en filtros y botones

### CA-14: Performance y Optimización
**Dado** que puede haber 200+ insignias
**Cuando** carga galería
**Entonces** debe:
- Virtual scrolling para grandes cantidades
- Lazy loading de imágenes de insignias
- Sprites para iconos (reducir requests)
- Cache de galería en localStorage
- Galería completa carga en <1 segundo
- Filtros aplican en <100ms
- Animaciones smooth 60 FPS

### CA-15: Analytics e Insights
**Dado** que se quiere mejorar sistema de logros
**Cuando** usuarios interactúan
**Entonces** trackear:
- Logros más compartidos
- Logros más destacados
- Tiempo promedio para desbloquear cada logro
- % de usuarios que completan colecciones
- Logros más difíciles (menos desbloqueados)
- Correlación entre showcasing y engagement
- Heatmap de filtros más usados

---

## Especificaciones Técnicas

### Frontend Components
```
src/features/achievements/
├── pages/
│   ├── AchievementsGalleryPage.tsx
│   ├── AchievementDetailPage.tsx
│   └── CollectionsPage.tsx
├── components/
│   ├── AchievementGrid.tsx
│   ├── AchievementCard.tsx
│   ├── PinnedBadges.tsx
│   ├── AchievementTimeline.tsx
│   ├── StatsShowcase.tsx
│   ├── CollectionProgress.tsx
│   ├── ShareModal.tsx
│   ├── ComparisonView.tsx
│   ├── AchievementFilters.tsx
│   └── ProgressTracker.tsx
├── hooks/
│   ├── useAchievements.ts
│   ├── usePinnedBadges.ts
│   ├── useCollections.ts
│   └── useAchievementProgress.ts
└── utils/
    ├── achievementCalculator.ts
    ├── socialShareGenerator.ts
    └── rarityCalculator.ts
```

### TypeScript Interfaces
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isSecret: boolean;
  criteria: AchievementCriteria;
  rewards: {
    cacao: number;
    xp: number;
    items?: string[];
  };
  metadata: {
    totalUsersUnlocked: number;
    percentageUnlocked: number;
    averageTimeToUnlock: number; // days
  };
}

interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  isPinned: boolean;
  pinnedPosition?: number; // 1-6
  isShared: boolean;
  shareCount: number;
}

interface AchievementCollection {
  id: string;
  name: string;
  description: string;
  achievements: string[]; // achievement IDs
  reward: {
    metaBadge: string;
    cacao: number;
    title?: string;
  };
  progress: {
    unlocked: number;
    total: number;
    percentage: number;
  };
}

interface ShowcaseStat {
  id: string;
  label: string;
  value: string;
  comparison: string; // "Top 1% nationally"
  color: string;
  icon: string;
}

interface ShareableAchievement {
  achievement: Achievement;
  user: {
    username: string;
    avatar: string;
  };
  unlockedAt: Date;
  imageUrl: string; // generated Open Graph image
  shareUrl: string;
}
```

### API Endpoints
```typescript
// Achievements
GET    /api/achievements
GET    /api/achievements/:id
GET    /api/users/:userId/achievements
POST   /api/users/:userId/achievements/:id/pin
DELETE /api/users/:userId/achievements/:id/unpin
PUT    /api/users/:userId/achievements/reorder-pins

// Collections
GET    /api/achievements/collections
GET    /api/users/:userId/collections

// Sharing
POST   /api/achievements/:id/share
GET    /api/achievements/:id/share-image
GET    /api/achievements/shared/:shareId (public)

// Stats
GET    /api/users/:userId/showcase-stats
GET    /api/users/:userId/achievements/timeline
GET    /api/users/:userId/achievements/compare/:friendId

// Export
GET    /api/users/:userId/achievements/export/pdf
GET    /api/users/:userId/achievements/export/image
GET    /api/users/:userId/achievements/export/json
```

### Technology Stack
```
Frontend:
- framer-motion para animaciones de insignias
- react-grid-layout para reordenar pinned badges
- html-to-image para exportación de galería
- react-share para compartir en redes sociales
- recharts para timeline visual

Backend:
- Puppeteer/Playwright para generar Open Graph images
- Sharp para procesamiento de imágenes
- Canvas API para generar certificados
- PostgreSQL para almacenar achievements y progreso
- Redis para cache de estadísticas
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI)
- **EP004**: Sistema básico de logros y badges
- Logros se desbloquean y aparecen en perfil
- Sin galería, sin showcasing, sin compartir

### Esta Historia (EXT-004)
- **Galería completa de logros** con 200+ insignias
- **Sistema de destacado** (6 badges pinnados)
- **Colecciones y sets** de logros
- **Timeline de progresión**
- **Estadísticas impresionantes** (Top %)
- **Compartir en redes sociales** con OG images
- **Comparación con amigos**
- **Exportación y certificados**
- Esto es **extensión premium del sistema de logros**

---

## Dependencias

### Depende de
- **EAI-003**: Sistema de gamificación y logros base
- **US-PERF-001**: Sistema de perfiles
- **US-PERF-004**: Amigos (para comparación)

### Bloquea a
- **EXT-007**: Portal de Comunidad (usa showcasing)

---

## Definición de Terminado (DoD)

- [ ] Galería de logros con grid responsive
- [ ] Sistema de filtros y búsqueda
- [ ] 6 insignias destacadas configurables
- [ ] Timeline de logros con scroll infinito
- [ ] Showcase de estadísticas impresionantes
- [ ] Sistema de colecciones (5+ sets)
- [ ] Compartir en redes sociales (FB, Twitter, WhatsApp)
- [ ] Generación de Open Graph images
- [ ] Comparación con amigos
- [ ] Logros secretos (10+ implementados)
- [ ] Progreso en tiempo real
- [ ] Exportación (PDF, imagen, JSON)
- [ ] Gamificación del showcasing
- [ ] Tests unitarios >80% coverage
- [ ] Tests de integración
- [ ] Performance: galería <1s
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] API endpoints documentados
- [ ] Guía de usuario
- [ ] Video tutorial

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con 200+ insignias | Media | Alto | Virtual scrolling, lazy loading, sprites |
| Generación de OG images lenta | Media | Medio | Queue con workers, cache de imágenes |
| Usuarios comparten contenido inapropiado | Baja | Medio | Moderación de shares, reportes |
| Colecciones muy difíciles desmotivan | Media | Medio | Balance testing, adjust rewards |

---

## Estimación Detallada (7 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño UI/UX | 8h | UX Designer |
| Galería de logros | 10h | Frontend Dev |
| Sistema de filtros | 6h | Frontend Dev |
| Pinned badges | 6h | Frontend Dev |
| Timeline | 8h | Frontend Dev |
| Showcase stats | 6h | Frontend Dev |
| Colecciones | 8h | Frontend Dev |
| Social sharing + OG images | 10h | Frontend Dev |
| Comparación amigos | 6h | Frontend Dev |
| Exportación | 8h | Backend Dev |
| API endpoints | 8h | Backend Dev |
| Puppeteer OG generator | 6h | Backend Dev |
| Testing | 10h | QA + Devs |
| Documentación | 4h | Tech Lead |
| **TOTAL** | **104h** | |

**Presupuesto**: $3,500 MXN (~$200 USD)
**Duración Estimada**: 2-3 días (equipo de 5-6 personas)

---

## Tareas de Implementación

### Backend (12.6h - 45%)
- [ ] Diseñar schema para achievements, user_achievements y collections (2h)
- [ ] Implementar API de galería de logros con filtros (2h)
- [ ] Crear sistema de pinned badges (destacar 6 insignias) (1.5h)
- [ ] Desarrollar motor de colecciones de logros (2h)
- [ ] Implementar generación de Open Graph images con Puppeteer (2.5h)
- [ ] Crear API de sharing en redes sociales (1.5h)
- [ ] Desarrollar sistema de exportación (PDF, imagen, JSON) (1.1h)

### Frontend (9.8h - 35%)
- [ ] Crear AchievementsGalleryPage con grid responsive (2h)
- [ ] Implementar sistema de filtros y búsqueda de logros (1.5h)
- [ ] Desarrollar componente de pinned badges con drag & drop (1.5h)
- [ ] Crear AchievementTimeline con scroll infinito (1.5h)
- [ ] Implementar ShareModal para compartir en redes sociales (1.5h)
- [ ] Desarrollar ComparisonView para comparar con amigos (1h)
- [ ] Crear sistema de progreso en tiempo real para logros (0.8h)

### Testing y QA (4.2h - 15%)
- [ ] Escribir tests unitarios para galería y logros (2h)
- [ ] Crear tests de integración para showcasing (1.5h)
- [ ] Validar performance con 200+ insignias (<1s) (0.5h)
- [ ] Testing de accesibilidad (0.2h)

### Deploy y Documentación (1.4h - 5%)
- [ ] Documentar API de achievements (0.6h)
- [ ] Crear guía de usuario para showcasing (0.5h)
- [ ] Producir video tutorial de logros (0.3h)

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

#ext-004 #logros #achievements #gamificacion #showcasing #social-sharing #colecciones #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: EP004-gamification + EP008-social-features
**Compliance**: PF-001 (XXX líneas)
