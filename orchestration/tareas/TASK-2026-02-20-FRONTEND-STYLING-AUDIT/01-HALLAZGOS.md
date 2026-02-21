# 01-HALLAZGOS — Auditoria Frontend: Estilos, Temas e Integracion

**Fecha:** 2026-02-20
**Alcance:** 590 componentes, 70 paginas, 30 mecanicas de ejercicio, 4 portales
**SSOT:** MASTER_INVENTORY.yml v12.1.0 + FRONTEND_INVENTORY.yml v11.0.0

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Issues CRITICOS** | 8 |
| **Issues ALTOS** | 6 |
| **Issues MEDIOS** | 35+ |
| **Issues BAJOS** | 10+ |
| **Paginas con problemas de botones** | 25+ |
| **Componentes de ejercicio con problemas** | 12 |
| **Archivos con colores hardcodeados vs tema** | 50+ |

---

## 1. ARQUITECTURA DE ESTILOS (Estado Actual)

### 1.1 Sistema de Temas
- **Framework:** Tailwind CSS v4 + PostCSS
- **Tema principal:** Detective Theme (detective-theme.css, 653 lineas)
- **Variables CSS:** 30+ en `:root` (--detective-orange, --detective-bg, etc.)
- **Dark Mode:** Habilitado via `darkMode: 'class'` (Tailwind)
- **White-Label:** BrandingProvider con inyeccion CSS runtime
- **Utilidades:** cn() (clsx + tailwind-merge), color.utils.ts (WCAG)
- **Componentes base:** DetectiveButton, DetectiveCard, InputDetective, ProgressBar, RankBadge

### 1.2 Problema Central
**Los componentes base existen pero NO se usan consistentemente.** La mayoria de paginas usan clases Tailwind hardcodeadas en vez de:
1. Los componentes compartidos (DetectiveButton, DetectiveCard)
2. Las variables CSS del tema (--detective-orange, --detective-text)
3. Las clases CSS del tema (btn-detective, detective-card)

---

## 2. PROBLEMAS POR PORTAL

### 2.1 Portal Estudiante (21 paginas)

#### CRITICOS
| Archivo | Problema | Impacto |
|---------|----------|---------|
| `shared/components/Button.tsx:12-18` | Variantes primary/ghost/outline usan **azul** (blue-600) en vez de detective-orange | **Todos los portales** — boton primario incorrecto |
| `shared/components/Button.tsx:79` | Estado disabled solo usa `opacity-50` — texto casi invisible en fondos claros | Botones deshabilitados ilegibles |

#### MEDIOS (19 issues)
- **Tabs inactivos** con gris-sobre-gris: AssignmentsPage:256, NotificationsPage:298-320, InventoryPage:163
- **Botones de accion** con `text-gray-400` casi invisibles: NotificationsPage:490,498
- **Iconos inactivos** `text-gray-400` en fondo gris claro: StreaksMissionsSection, ModuleProgressCard:184
- **Fondos hardcodeados** en vez de tema: LeaderboardPage:82, NotificationsPage:214, EnhancedProfilePage:92
- **Badges** con contraste insuficiente: ProfileInventoryTab:35, ModuleCard:108, LegacyExercisePage:643
- **Solo 1 referencia a CSS variable** en todo el portal estudiante (ModulesSection)

#### INTEGRACION PageShell
- **Solo 4 de 21 paginas** usan StudentPageShell
- **13 paginas** usan GamifiedHeader directamente, bypaseando useStudentPageSetup
- Duplican manualmente: `const { user, logout } = useAuth(); const { gamificationData } = useUserGamification()`

---

### 2.2 Portal Maestro (19 paginas)

#### CRITICOS (2)
| Archivo | Problema |
|---------|----------|
| `teacher/components/dashboard/ClassroomCard.tsx` | 8+ lineas con `bg-gray-100`, `text-gray-700`, `bg-gray-200` — colores de tema claro hardcodeados |
| `teacher/pages/TeacherNotifications.tsx:180-189` | Header con `text-white` hardcodeado, no usa variables del tema |

#### ALTOS (2)
| Archivo | Problema |
|---------|----------|
| `teacher/pages/TeacherAnalytics.tsx:402` | Bordes de tabla `border-gray-700` hardcodeados, no `detective-border` |
| `teacher/pages/TeacherReports.tsx:277-502` | Cards de error/info con `bg-red-50`, `bg-blue-50` — rompen en dark mode |

#### MEDIOS (7)
- **CreateAssignmentModal.tsx:400** — Boton cancel con colores hardcodeados, no usa DetectiveButton
- **ChartJS config** en TeacherAnalytics.tsx:138-166 con colores hex hardcodeados
- **Tablas inconsistentes** — TeacherAnalytics usa `text-gray-400`, TeacherProgress usa `text-detective-text-secondary`
- **TeacherMonitoring.tsx:85-102** — Status badges con colores de tema claro
- **Placeholders** con `placeholder-gray-500` que desaparecen en dark mode

#### INTEGRACION PageShell: 19/19 paginas ✓ (100%)

---

### 2.3 Portal Administrador (19 paginas)

#### CRITICOS (3)
| Archivo | Problema |
|---------|----------|
| `admin/components/users/UserDetailModal.tsx:232-450` | **Modal completamente en tema claro** — `bg-white`, `text-gray-900`, `border-gray-200/300`, tabs con `border-orange-500 text-orange-600` hardcodeados |
| `admin/components/roles/RoleEditor.tsx:70,127` | Gradiente `from-blue-500 to-blue-600` (deberia ser detective-orange). Footer `bg-gray-50` tema claro |
| `admin/pages/AdminRolesPage.tsx:146-149` | Header con `text-gray-900` (tema claro) dentro de PageShell detective (tema oscuro) |

#### ALTOS (2)
| Archivo | Problema |
|---------|----------|
| `admin/components/users/UsersTable.tsx:160-186` | Botones de accion con colores hardcodeados: `text-blue-400`, `text-red-400`, `text-green-400` |
| `admin/components/roles/RolesTable.tsx:62-64` | Seleccion con `border-blue-500 bg-blue-50 text-blue-600` — tema claro |

#### MEDIOS (8)
- **CreateUserModal.tsx** — Inputs con `bg-gray-800 border-gray-600` hardcodeados
- **SystemHealthCard.tsx:31-34** — Status badges `bg-green-100 text-green-700` tema claro
- **GeneralSettings.tsx:176-185** — Boton save/reset sin DetectiveButton
- **FeatureFlagsPanel.tsx:174-203** — Filtros con colores mixtos
- **DashboardStatsGrid.tsx** — Iconos con colores hardcodeados
- **AlertsNotificationsCard.tsx:42-46** — Severidad con colores tema claro

#### INTEGRACION PageShell: 19/19 paginas ✓ (100%)

---

### 2.4 Portal Padres
No auditado en detalle (4 paginas, backend 100%, frontend 57%). Prioridad baja vs los 3 portales principales.

---

## 3. PROBLEMAS EN MECANICAS DE EJERCICIO (30 tipos)

### BLOQUEANTES (2)
| Archivo | Problema |
|---------|----------|
| `mechanics/module1/Timeline/TimelineEvent.tsx:26` | **Anio del evento tiene `className="hidden"`** — invisible, derrota el proposito del timeline |
| `mechanics/module2/ConstruccionHipotesis/CausaEfectoExercise.tsx:339` | **Boton eliminar con `opacity-0 group-hover:opacity-100`** — invisible por defecto, inaccesible en movil |

### ALTOS (1)
| Archivo | Problema |
|---------|----------|
| `mechanics/module4/AnalisisMemes/AnnotationMarker.tsx:17` | Tooltip solo visible en hover (`hidden group-hover:block`) — inaccesible en movil |

### MEDIOS (8)
| Archivo | Problema |
|---------|----------|
| VerdaderoFalsoExercise.tsx:258-277 | Respuestas post-submit con `opacity-75` — dificil de leer |
| CompletarEspaciosExercise.tsx:371-373 | Palabras no seleccionadas se mezclan con fondo |
| DraggableCard.tsx:29-31 | Drag usa `opacity: 0.5` — no se ve lo arrastrado |
| CausaEfectoExercise.tsx:388-392 | Consecuencias al arrastrar con `scale-95 opacity-50` |
| CrucigramaGrid.tsx:84-87 | Seleccion solo con `ring-2 ring-blue-500` — sin cambio de fondo |
| SopaLetrasGrid.tsx:28 | Letras encontradas `bg-blue-200 text-blue-900` — contraste marginal |
| MatchingCard.tsx:11-12 | Cartas emparejadas con `opacity-50` — dificil releer |
| UnifiedExerciseLayout | Barra de progreso con `bg-white/30` (30% opacidad) |

---

## 4. PROBLEMAS TRANSVERSALES

### 4.1 Button.tsx Compartido — Desalineado del Tema
```
primary: 'bg-blue-600 text-white hover:bg-blue-700'     ← Deberia ser detective-orange
secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300' ← Bajo contraste
outline: 'border border-blue-600 text-blue-600'          ← Deberia ser detective-orange
ghost: 'text-blue-600 hover:bg-blue-50'                  ← Deberia ser detective-orange
```
**Impacto:** TODOS los botones de la app que usan el componente compartido tienen colores incorrectos.

### 4.2 CSS Variables Sub-utilizadas
- detective-theme.css define 30+ variables y clases
- Solo 1 referencia CSS variable encontrada en portal estudiante
- La mayoria de componentes usan clases Tailwind hardcodeadas

### 4.3 useApiError Sub-adoptado
- Solo 8 componentes usan el hook
- La mayoria implementa error handling custom inline

### 4.4 ErrorBoundary No Desplegado
- Componente definido pero solo usado en tests
- Paginas usan manejo de errores inline

### 4.5 Loading States Inconsistentes
- LoadingSpinner y SkeletonCard disponibles
- 102 paginas usan condicionales inline en vez de componentes

---

## 5. RESUMEN DE INTEGRACION DE ESTANDARIZACIONES PREVIAS

| Aspecto | Admin | Teacher | Student | Estado |
|---------|-------|---------|---------|--------|
| PageShell | 19/19 | 19/19 | 4/21 | ⚠️ Student incompleto |
| usePageSetup | 19/19 | 19/19 | 4/21 | ⚠️ Student incompleto |
| DetectiveButton uso | Parcial | Parcial | Parcial | ⚠️ Muchos botones custom |
| DetectiveCard uso | Parcial | Parcial | Parcial | ⚠️ Muchos cards custom |
| CSS Variables | Minimo | Mixto | ~0 | ❌ Sub-utilizado |
| Dark Mode | Parcial | Parcial | Parcial | ⚠️ Inconsistente |
| Ejercicios refactored | N/A | N/A | ✓ (34 lineas) | ✓ Exitoso |
| cn() utility | ✓ | ✓ | ✓ | ✓ Bien adoptado |
| TailwindCSS | 11,928 | usos | en total | ✓ Dominante |

---

## 6. ARCHIVOS PRIORITARIOS PARA CORRECCION

### Fase 1 — Criticos (Impacto Global)
1. `shared/components/Button.tsx` — Cambiar variantes de blue a detective-orange
2. `admin/components/users/UserDetailModal.tsx` — Migrar a tema detective
3. `admin/components/roles/RoleEditor.tsx` — Migrar gradientes y footer
4. `mechanics/module1/Timeline/TimelineEvent.tsx` — Hacer visible el anio
5. `mechanics/module2/.../CausaEfectoExercise.tsx` — Hacer visible boton eliminar

### Fase 2 — Altos (Visibilidad de Botones)
6. 13 paginas student: Migrar de GamifiedHeader a StudentPageShell
7. `admin/pages/AdminRolesPage.tsx` — Colores de header
8. `admin/components/users/UsersTable.tsx` — Botones de accion
9. `teacher/components/dashboard/ClassroomCard.tsx` — Colores hardcodeados
10. `teacher/pages/TeacherNotifications.tsx` — Header text-white

### Fase 3 — Medios (Contraste y Consistencia)
11-25. Tabs inactivos, badges, iconos, forms en 15+ archivos
26-33. 8 mecanicas de ejercicio con problemas de opacidad/visibilidad

### Fase 4 — Mejoras (Estandarizacion)
34+. Adopcion de CSS variables, useApiError, ErrorBoundary, LoadingSpinner consistente
