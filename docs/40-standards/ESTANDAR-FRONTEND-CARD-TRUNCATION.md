---
titulo: Estándar de Truncación de Texto en Cards
version: 1.0.0
fecha: 2026-02-28
estado: Vigente
area: Frontend
tags: [card, truncation, line-clamp, tooltip, ux, accessibility]
---

# ESTANDAR-FRONTEND-CARD-TRUNCATION — Truncación de Texto en Cards

**Version:** 1.0.0 | **Fecha:** 2026-02-28 | **Estado:** Vigente
**Basado en:** Auditoría de 19 componentes Card (2026-02-28), referencia canónica MissionCard.tsx

---

## 1. Objetivo

Garantizar que todo texto truncado visualmente mediante CSS `line-clamp` tenga un tooltip nativo (`title=`) que permita al usuario ver el contenido completo, sin necesidad de interacción adicional.

Este estándar aplica a todos los componentes de tipo Card en el portal estudiante, maestro, administrador y padres. El incumplimiento degrada la accesibilidad y la experiencia de usuario al ocultar información sin mecanismo de recuperación.

---

## 2. Regla 1 — Todo `line-clamp-*` DEBE tener `title=`

Todo elemento con clase `line-clamp-N` debe incluir el atributo `title` con el texto completo sin truncar. Este tooltip nativo es compatible con todos los navegadores modernos y no requiere dependencias adicionales.

### Correcto — Referencia canónica (MissionCard.tsx, líneas 241-248)

```tsx
{/* Title — line-clamp-2 con title para tooltip nativo */}
<h3 className="mb-1 line-clamp-2 text-base font-bold text-gray-800" title={mission.title || 'Sin título'}>
  {mission.title || 'Sin título'}
</h3>

{/* Description — line-clamp-3 con title para tooltip nativo */}
<p className="line-clamp-3 text-sm text-gray-600" title={mission.description || 'Sin descripción'}>
  {mission.description || 'Sin descripción'}
</p>
```

### Incorrecto

```tsx
{/* INCORRECTO — texto truncado sin forma de ver el contenido completo */}
<p className="line-clamp-2">{description}</p>
```

---

## 3. Regla 2 — Valores recomendados de `line-clamp` por tipo de elemento

| Elemento | line-clamp recomendado | Contexto |
|----------|----------------------|----------|
| Titulo card (h3/h4) | `line-clamp-1` o `line-clamp-2` | Segun espacio disponible |
| Subtitulo | `line-clamp-1` | Siempre una linea |
| Descripcion | `line-clamp-2` o `line-clamp-3` | Segun importancia del contenido |
| Cards compactas (sidebar) | `line-clamp-1` | Espacio limitado |

**Nota:** No usar valores mayores a `line-clamp-3` en cards. Si el contenido requiere mas lineas, considerar un componente expandible (accordion, modal de detalle).

---

## 4. Regla 3 — El `title` DEBE contener el texto completo sin truncar

El valor del atributo `title` debe ser la propiedad original del objeto de datos, nunca una variable que ya haya sido truncada manualmente.

```tsx
// CORRECTO — propiedad original del objeto
<h3 className="line-clamp-2" title={module.description}>
  {module.description}
</h3>

// INCORRECTO — variable truncada usada como tooltip
const truncatedDescription = module.description.substring(0, 80) + '...';
<h3 className="line-clamp-2" title={truncatedDescription}>
  {truncatedDescription}
</h3>
```

---

## 5. Regla 4 — Substring manual es redundante con `line-clamp`

Preferir truncamiento CSS puro (`line-clamp-N`) sobre truncamiento JavaScript (`text.substring(0, N)`). La combinacion de ambos es codigo redundante y propensa a errores.

```tsx
// CORRECTO — CSS puro, sin JS
<p className="line-clamp-2" title={item.description}>
  {item.description}
</p>

// INCORRECTO — truncamiento JS duplica logica del CSS
<p className="line-clamp-2" title={item.description}>
  {item.description.substring(0, 120) + '...'}
</p>
```

**Excepcion:** Si se requiere truncamiento en contextos sin CSS (ej. valores de atributos `aria-label`, logs, metadatos), el truncamiento JS es valido pero debe ser documentado con un comentario.

---

## 6. Regla 5 — Componentes nuevos DEBEN cumplir este estandar desde su creacion

Todo componente Card nuevo que introduzca `line-clamp` sin su correspondiente `title=` debe ser rechazado en code review. Esta regla aplica desde la fecha de publicacion de este estandar (2026-02-28).

**Checklist de code review para componentes Card:**

- [ ] Cada `line-clamp-N` tiene un `title=` con el valor completo original
- [ ] El `title` usa la propiedad del objeto, no una variable truncada
- [ ] No hay truncamiento JS (`substring`, `slice`) coexistiendo con `line-clamp` sobre el mismo texto
- [ ] Los valores de `line-clamp` siguen la tabla de Regla 2

---

## 7. Inventario de Componentes Card (28 total)

Estado al 2026-02-28. Componentes verificados tras auditoria y remediacion extendida (cross-cutting review).

### 2.6. Nota de Accesibilidad

El atributo `title=` produce un tooltip nativo visible al hacer hover con mouse/trackpad. **Limitaciones conocidas:**

- **Dispositivos táctiles (móvil/tablet):** El tooltip no se muestra (no hay evento hover en pantallas táctiles)
- **Lectores de pantalla:** Algunos lectores (NVDA, VoiceOver) no anuncian consistentemente el atributo `title` en elementos no interactivos (`<p>`, `<h3>`)

Para cards interactivas con `role="button"` o `onClick`, el `aria-label` del contenedor provee naming accesible. Para contenido de solo lectura, el `title=` es un trade-off aceptado — el texto completo permanece en el DOM y es accesible via selección de texto.

---

## 7. Inventario de Componentes Card (28 total)

### 7.1 Componentes con truncamiento

| # | Componente | Truncamiento | Tooltip (title=) | Estado |
|---|-----------|-------------|-----------------|--------|
| 1 | `MissionCard.tsx` | title: `line-clamp-2`, desc: `line-clamp-3` | SI | Compliant |
| 2 | `ActiveMissionTracker.tsx` | title: `line-clamp-1` | SI | Compliant (remediado) |
| 3 | `ModuleGridCard.tsx` | title: `line-clamp-2`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 4 | `ModuleGridCardEnhanced.tsx` | title: `line-clamp-2`, subtitle: `line-clamp-1`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 5 | `ExerciseCard.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 6 | `ExerciseAttemptCard.tsx` | title: `line-clamp-1`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 7 | `ProgressCard.tsx` | title: `line-clamp-2`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 8 | `ShopItemCard.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 9 | `InventoryItemCard.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 10 | `AlertCard.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 11 | `SystemAlertsPanel.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 12 | `ExerciseTypeSelector.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 13 | `StudentActivitiesPage.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 14 | `MissionsPanel.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 15 | `ModulesSection.tsx` | title: `line-clamp-1`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 16 | `DiscoverGuildsTab.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 17 | `AssignmentsPage.tsx` | title: `line-clamp-2`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 18 | `InventoryItem.tsx` | desc: `line-clamp-1` | SI | Compliant (remediado) |
| 19 | `ShopItem.tsx` | desc: `line-clamp-2` | SI | Compliant (remediado) |
| 20 | `AchievementsGrid.tsx` | name: `line-clamp-1`, desc: `line-clamp-2` | SI | Compliant (remediado) |
| 21 | `ModuleCard.tsx` (_legacy) | desc: `line-clamp-2` | NO | N/A (legacy, no se modifica) |

**Rutas de referencia:**

| Componente | Ruta |
|-----------|------|
| `MissionCard.tsx` | `apps/frontend/src/features/gamification/missions/components/` |
| `ActiveMissionTracker.tsx` | `apps/frontend/src/features/gamification/missions/components/` |
| `ModuleGridCard.tsx` | `apps/frontend/src/apps/student/components/dashboard/` |
| `ModuleGridCardEnhanced.tsx` | `apps/frontend/src/apps/student/components/dashboard/` |
| `ExerciseCard.tsx` | `apps/frontend/src/apps/student/components/module/` |
| `ExerciseAttemptCard.tsx` | `apps/frontend/src/shared/components/` |
| `ProgressCard.tsx` | `apps/frontend/src/shared/components/` |
| `ShopItemCard.tsx` | `apps/frontend/src/apps/student/components/shop/` |
| `InventoryItemCard.tsx` | `apps/frontend/src/apps/student/components/inventory/` |
| `AlertCard.tsx` | `apps/frontend/src/apps/admin/components/alerts/` |
| `SystemAlertsPanel.tsx` | `apps/frontend/src/apps/admin/components/dashboard/` |
| `ExerciseTypeSelector.tsx` | `apps/frontend/src/features/mechanics/components/` |
| `StudentActivitiesPage.tsx` | `apps/frontend/src/apps/student/pages/` |
| `MissionsPanel.tsx` | `apps/frontend/src/apps/student/components/dashboard/` |
| `ModulesSection.tsx` | `apps/frontend/src/apps/student/components/modules/` |
| `DiscoverGuildsTab.tsx` | `apps/frontend/src/features/gamification/social/components/` |
| `AssignmentsPage.tsx` | `apps/frontend/src/apps/teacher/pages/` |
| `InventoryItem.tsx` | `apps/frontend/src/apps/student/components/inventory/` |
| `ShopItem.tsx` | `apps/frontend/src/apps/student/components/shop/` |
| `AchievementsGrid.tsx` | `apps/frontend/src/apps/student/components/achievements/` |
| `ModuleCard.tsx` (_legacy) | `apps/frontend/src/components/_legacy/dashboard-migration-sprint/` |

### 7.2 Excepciones justificadas (line-clamp sin title= permitido)

Los siguientes 6 componentes tienen una implementacion de `line-clamp` sin `title=` que es justificada por su contexto especifico. Estas excepciones son documentadas y excluidas de la remediacion obligatoria.

| # | Componente | Justificacion | Contexto |
|---|-----------|-------------|---------|
| 22 | `AssignmentsTable.tsx` | Tabla administrativa; texto secundario sin interactividad | Admin dashboard tabla de asignaciones |
| 23 | `RecentActivityPanel.tsx` | Panel resumen con navegacion a detalle | Student dashboard actividad reciente |
| 24 | `ShoppingCart.tsx` | Item en carrito; usuario puede expandir carrito entero | Carrito de compras contexto |
| 25 | `DiarioMultimediaExercise.tsx` | Entrada creada por usuario; contenido multimedia | Ejercicio diario multimedia |
| 26 | `ExerciseContentRenderer.tsx` | Vista decorativa de contenido educativo | Renderizado generativo |
| 27 | `ModuleCard.tsx` (_legacy) | Codigo legacy pendiente de eliminacion | Excluido por politica no-modificacion |
| 28 | `UserStatsCard.tsx` | Estadisticas numericas sin texto largo | Card estadisticas |

### 7.3 Componentes sin truncamiento (no aplica este estandar)

Los siguientes componentes Card no utilizan `line-clamp` en su implementacion actual. No requieren remediacion pero deben cumplir este estandar si en el futuro se agrega truncamiento.

| # | Componente | Razon sin truncamiento |
|---|-----------|----------------------|
| -- | `DetectiveCard.tsx` | Contenido estatico o controlado en longitud |
| -- | `AchievementCard.tsx` | Nombres de logro acotados por diseno |
| -- | `AchievementCard.tsx` (social) | Variante social; iconos y titulos cortos |
| -- | `UserPositionCard.tsx` | Solo muestra nombre de usuario y posicion numerica |
| -- | `PowerUpCard.tsx` | Nombres de power-up son cadenas cortas |
| -- | `QuickActionsCard.tsx` | Acciones rapidas con etiquetas de 1-3 palabras |
| -- | `ModuleProgressCard.tsx` | Muestra porcentaje y nombre de modulo (sin wrap) |

---

## 8. Historial de Migracion

### 8.1 Remediacion inicial — 2026-02-28

En la sesion del 2026-02-28 se realizo una auditoria de todos los componentes Card del frontend y se remediaron 9 componentes que usaban `line-clamp` sin `title=`.

**Componentes remediados (primera ola):**

1. `ActiveMissionTracker.tsx` — agregado `title={mission.title}` en `h4`
2. `ModuleGridCard.tsx` — agregados `title` en titulo y descripcion
3. `ModuleGridCardEnhanced.tsx` — agregados `title` en titulo, subtitulo y descripcion
4. `ExerciseCard.tsx` — agregado `title` en descripcion
5. `ExerciseAttemptCard.tsx` — agregados `title` en titulo y descripcion
6. `ProgressCard.tsx` — agregados `title` en titulo y descripcion
7. `ShopItemCard.tsx` — agregado `title` en descripcion
8. `InventoryItemCard.tsx` — agregado `title` en descripcion
9. `AlertCard.tsx` — agregado `title` en descripcion

### 8.2 Remediacion extendida (Cross-Cutting Review) — 2026-02-28

En un segundo pase de revision se identificaron 9 componentes adicionales que requerían remediacion, expandiendo el alcance total a 18 componentes remediados.

**Componentes remediados (segunda ola):**

10. `SystemAlertsPanel.tsx` — agregado `title` en descripcion (line-clamp-2)
11. `ExerciseTypeSelector.tsx` — agregado `title` en descripcion (line-clamp-2)
12. `StudentActivitiesPage.tsx` — agregado `title` en descripcion (line-clamp-2)
13. `MissionsPanel.tsx` — agregado `title` en descripcion (line-clamp-2)
14. `ModulesSection.tsx` — agregados `title` en titulo (line-clamp-1) y descripcion (line-clamp-2)
15. `DiscoverGuildsTab.tsx` — agregado `title` en descripcion (line-clamp-2)
16. `AssignmentsPage.tsx` — agregados `title` en titulo y descripcion (line-clamp-2)
17. `InventoryItem.tsx` — agregado `title` en descripcion (line-clamp-1)
18. `ShopItem.tsx` — agregado `title` en descripcion (line-clamp-2)
19. `AchievementsGrid.tsx` — agregados `title` en nombre (line-clamp-1) y descripcion (line-clamp-2)

**Referencia:** `orchestration/tareas/TASK-2026-02-28-CARD-TRUNCATION-STANDARD/`

**Componentes excluidos:**
- `ModuleCard.tsx` en `_legacy/` no fue remediado por politica de no-modificacion de codigo legacy pendiente de eliminacion.
- 6 componentes con excepciones justificadas (ver seccion 7.2).

### 8.2 Componente canonico establecido

`MissionCard.tsx` fue identificado como la implementacion de referencia por ser el unico componente que ya cumplia el estandar antes de la auditoria. Su patron de `line-clamp-N` + `title={valor_original}` es el modelo a seguir en todos los componentes nuevos.
